import { EventEmitter } from "node:events";
import crypto from "node:crypto";
import type { DatabaseInstance } from "@admission-engine/database";
import { examSubmissions, submissionAnswers, exams } from "@admission-engine/database";
import { eq } from "drizzle-orm";
import type { IRedisClient } from "../auth/redis.service";
import { defaultRedisClient } from "../auth/redis.service";
import type { ExamCacheService } from "./exam-cache.service";
import type { SubmitExamAnswer } from "./exams.dto";

export interface ExamSubmissionJob {
  ticketId: string;
  examId: string;
  userId: string;
  answers: SubmitExamAnswer[];
  clientSubmittedAt: string;
}

export interface TopicBreakdownItem {
  topicId: number;
  attempted: number;
  correct: number;
  incorrect: number;
}

export interface EvaluatedExamResult {
  submissionId: string;
  ticketId: string;
  examId: string;
  userId: string;
  rawScore: number;
  compositeScore: number;
  totalCorrect: number;
  totalWrong: number;
  totalUnanswered: number;
  timeTakenSeconds: number;
  missedQuestionIds: string[];
  topicBreakdown?: TopicBreakdownItem[];
}

// Global Event Emitter for EXAM_EVALUATED events
export const examEvents = new EventEmitter();

export class ExamWorker {
  constructor(
    private db: DatabaseInstance,
    private redis: IRedisClient = defaultRedisClient,
    private cacheService: ExamCacheService
  ) {}

  /**
   * Evaluates student submission asynchronously:
   * 1. Grades against pre-warmed answer keys in memory (zero DB queries).
   * 2. Calculates raw score and applies tie-breaker formula.
   * 3. Atomically updates Redis ZSET leaderboard with composite score.
   * 4. Batch inserts into PostgreSQL exam_submissions and submission_answers.
   * 5. Emits EXAM_EVALUATED event.
   */
  async processSubmission(job: ExamSubmissionJob): Promise<EvaluatedExamResult> {
    const { ticketId, examId, userId, answers, clientSubmittedAt } = job;

    // 1. Retrieve answer keys from L1 memory
    const answerKeys = await this.cacheService.getAnswerKeys(examId);

    // Fetch exam duration for tie-breaker divisor
    let durationMinutes = 60;
    const [examRecord] = await this.db
      .select({ durationMinutes: exams.durationMinutes })
      .from(exams)
      .where(eq(exams.id, examId))
      .limit(1);

    if (examRecord) {
      durationMinutes = examRecord.durationMinutes;
    }

    const maxDurationSeconds = Math.max(60, durationMinutes * 60);

    let rawScore = 0;
    let totalCorrect = 0;
    let totalWrong = 0;
    let totalTimeSpent = 0;
    const missedQuestionIds: string[] = [];

    const submissionId = crypto.randomUUID();
    const answersRecordsToInsert: Array<{
      id: string;
      submissionId: string;
      questionId: string;
      selectedOptionId: string;
      isCorrect: boolean;
      marksAwarded: string;
      timeSpentSeconds: number;
    }> = [];

    // Map submitted answers
    const submittedMap = new Map<string, SubmitExamAnswer>();
    for (const ans of answers) {
      submittedMap.set(ans.questionId, ans);
      totalTimeSpent += ans.timeSpentSeconds || 0;
    }

    // Grade each question in exam
    const topicStatsMap = new Map<number, { attempted: number; correct: number; incorrect: number }>();

    for (const [questionId, keyData] of answerKeys.entries()) {
      const userAns = submittedMap.get(questionId);

      if (keyData.topicId) {
        if (!topicStatsMap.has(keyData.topicId)) {
          topicStatsMap.set(keyData.topicId, { attempted: 0, correct: 0, incorrect: 0 });
        }
      }

      if (!userAns || !userAns.selectedOption) {
        missedQuestionIds.push(questionId);
        continue;
      }

      const isCorrect = userAns.selectedOption === keyData.correctOptionId;
      let marksAwarded = 0;

      if (keyData.topicId) {
        const tStat = topicStatsMap.get(keyData.topicId)!;
        tStat.attempted++;
        if (isCorrect) {
          tStat.correct++;
        } else {
          tStat.incorrect++;
        }
      }

      if (isCorrect) {
        totalCorrect++;
        marksAwarded = keyData.marks;
        rawScore += marksAwarded;
      } else {
        totalWrong++;
        marksAwarded = -keyData.negativeMarks;
        rawScore += marksAwarded;
        missedQuestionIds.push(questionId);
      }

      answersRecordsToInsert.push({
        id: crypto.randomUUID(),
        submissionId,
        questionId,
        selectedOptionId: userAns.selectedOption,
        isCorrect,
        marksAwarded: marksAwarded.toFixed(2),
        timeSpentSeconds: userAns.timeSpentSeconds || 0,
      });
    }

    const topicBreakdown: TopicBreakdownItem[] = Array.from(topicStatsMap.entries()).map(
      ([topicId, stats]) => ({
        topicId,
        attempted: stats.attempted,
        correct: stats.correct,
        incorrect: stats.incorrect,
      })
    );

    const totalQuestions = answerKeys.size;
    const totalUnanswered = Math.max(0, totalQuestions - (totalCorrect + totalWrong));
    const timeTakenSeconds = Math.min(maxDurationSeconds, Math.max(1, totalTimeSpent));

    // 2. Tie-Breaker Score Formula:
    // compositeScore = rawScore + (1 - (timeTakenSeconds / maxDurationSeconds))
    // Ensures lower completion times rank higher in ZSET for identical raw scores
    const timeBonus = 1 - timeTakenSeconds / maxDurationSeconds;
    const compositeScore = Number((rawScore + timeBonus).toFixed(6));

    // 3. Atomically update Redis ZSET Leaderboard (Upstash command budgeted)
    const leaderboardKey = `exam:${examId}:leaderboard`;
    await this.redis.zadd(leaderboardKey, compositeScore, userId);

    // 4. Batch insert into PostgreSQL if userId is a valid UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    if (isUuid) {
      const totalAttempted = totalCorrect + totalWrong;
      const accuracyRate =
        totalAttempted > 0 ? ((totalCorrect / totalAttempted) * 100).toFixed(2) : "0.00";

      try {
        await this.db.insert(examSubmissions).values({
          id: submissionId,
          examId,
          userId,
          totalScore: rawScore.toFixed(2),
          totalAttempted,
          totalCorrect,
          totalWrong,
          totalUnanswered,
          accuracyRate,
          timeTakenSeconds,
          status: "EVALUATED",
          submittedAt: new Date(clientSubmittedAt),
        });

        if (answersRecordsToInsert.length > 0) {
          await this.db.insert(submissionAnswers).values(answersRecordsToInsert);
        }
      } catch (err) {
        console.warn(`[ExamWorker] Failed to persist submission to database:`, err);
      }
    }

    const result: EvaluatedExamResult = {
      submissionId,
      ticketId,
      examId,
      userId,
      rawScore,
      compositeScore,
      totalCorrect,
      totalWrong,
      totalUnanswered,
      timeTakenSeconds,
      missedQuestionIds,
      topicBreakdown,
    };

    // 5. Emit EXAM_EVALUATED internal event
    examEvents.emit("EXAM_EVALUATED", result);

    return result;
  }
}
