import type { DatabaseInstance } from "@admission-engine/database";
import { mistakeBook, questions } from "@admission-engine/database";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import type { AnalyticsService, TopicMetricItem } from "./analytics.service";

export interface MistakeQueryOptions {
  isMastered?: boolean | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

export interface SanitizedRetestQuestion {
  id: string;
  topicId: number | null;
  subjectId: number | null;
  chapterId: number | null;
  questionText: string;
  questionType: string;
  options: any;
  marks: number;
  negativeMarks: number;
  difficulty: string;
  mistakeCount: number;
  consecutiveCorrectCount: number;
}

export interface DynamicRetestResult {
  success: boolean;
  message: string;
  count: number;
  questions: SanitizedRetestQuestion[];
}

export interface SubmitRetestAnswer {
  questionId: string;
  selectedOption: string;
}

export interface RetestEvaluationResultItem {
  questionId: string;
  selectedOption: string;
  correctOptionId: string;
  isCorrect: boolean;
  consecutiveCorrectCount: number;
  isMastered: boolean;
  mistakeCount: number;
  explanation: string | null;
}

export interface RetestEvaluationSummary {
  success: boolean;
  totalQuestions: number;
  totalCorrect: number;
  totalIncorrect: number;
  newlyMasteredCount: number;
  results: RetestEvaluationResultItem[];
}

export class MistakeBookService {
  constructor(
    private db: DatabaseInstance,
    private analyticsService?: AnalyticsService
  ) {}

  /**
   * Ingests incorrect/skipped questions from an exam into the mistake book.
   * Atomically resets consecutiveCorrectCount to 0 and marks isMastered = false.
   * Batches in chunks of 50 to prevent memory spikes on free tier nodes.
   */
  async ingestExamMistakes(userId: string, missedQuestionIds: string[]): Promise<void> {
    if (!missedQuestionIds || missedQuestionIds.length === 0) return;

    const uniqueIds = Array.from(new Set(missedQuestionIds));
    const BATCH_SIZE = 50;

    for (let i = 0; i < uniqueIds.length; i += BATCH_SIZE) {
      const chunk = uniqueIds.slice(i, i + BATCH_SIZE);
      const now = new Date();

      await Promise.all(
        chunk.map((questionId) =>
          this.db
            .insert(mistakeBook)
            .values({
              userId,
              questionId,
              mistakeCount: 1,
              consecutiveCorrectCount: 0,
              isMastered: false,
              lastAttemptedAt: now,
              updatedAt: now,
            })
            .onConflictDoUpdate({
              target: [mistakeBook.userId, mistakeBook.questionId],
              set: {
                mistakeCount: sql`${mistakeBook.mistakeCount} + 1`,
                consecutiveCorrectCount: 0,
                isMastered: false,
                lastAttemptedAt: now,
                updatedAt: now,
              },
            })
        )
      );
    }
  }

  /**
   * Fetches the user's mistake book entries with associated question metadata.
   */
  async getMistakes(userId: string, options?: MistakeQueryOptions) {
    const conditions = [eq(mistakeBook.userId, userId)];

    if (typeof options?.isMastered === "boolean") {
      conditions.push(eq(mistakeBook.isMastered, options.isMastered));
    }

    const limit = Math.min(100, Math.max(1, options?.limit ?? 50));
    const offset = Math.max(0, options?.offset ?? 0);

    const rows = await this.db
      .select({
        id: mistakeBook.id,
        userId: mistakeBook.userId,
        questionId: mistakeBook.questionId,
        mistakeCount: mistakeBook.mistakeCount,
        consecutiveCorrectCount: mistakeBook.consecutiveCorrectCount,
        isMastered: mistakeBook.isMastered,
        lastAttemptedAt: mistakeBook.lastAttemptedAt,
        notes: mistakeBook.notes,
        question: {
          id: questions.id,
          topicId: questions.topicId,
          subjectId: questions.subjectId,
          chapterId: questions.chapterId,
          questionText: questions.questionText,
          questionType: questions.questionType,
          options: questions.options,
          difficulty: questions.difficulty,
          marks: questions.marks,
          negativeMarks: questions.negativeMarks,
        },
      })
      .from(mistakeBook)
      .innerJoin(questions, eq(mistakeBook.questionId, questions.id))
      .where(and(...conditions))
      .orderBy(desc(mistakeBook.mistakeCount), desc(mistakeBook.lastAttemptedAt))
      .limit(limit)
      .offset(offset);

    return rows;
  }

  /**
   * Generates a dynamic retest of 20-30 unmastered questions prioritizing highest failure counts.
   * Questions are sanitized (correctOptionId and explanation stripped).
   * Returns HTTP 200 with friendly message when 0 unmastered questions exist.
   */
  async generateDynamicRetest(userId: string, limit: number = 20): Promise<DynamicRetestResult> {
    const safeLimit = Math.min(30, Math.max(1, limit));

    const unmastered = await this.db
      .select({
        mistakeId: mistakeBook.id,
        questionId: mistakeBook.questionId,
        mistakeCount: mistakeBook.mistakeCount,
        consecutiveCorrectCount: mistakeBook.consecutiveCorrectCount,
        question: {
          id: questions.id,
          topicId: questions.topicId,
          subjectId: questions.subjectId,
          chapterId: questions.chapterId,
          questionText: questions.questionText,
          questionType: questions.questionType,
          options: questions.options,
          marks: questions.marks,
          negativeMarks: questions.negativeMarks,
          difficulty: questions.difficulty,
        },
      })
      .from(mistakeBook)
      .innerJoin(questions, eq(mistakeBook.questionId, questions.id))
      .where(and(eq(mistakeBook.userId, userId), eq(mistakeBook.isMastered, false)))
      .orderBy(desc(mistakeBook.mistakeCount), desc(mistakeBook.lastAttemptedAt))
      .limit(safeLimit);

    if (unmastered.length === 0) {
      return {
        success: true,
        message: "All mistakes mastered! Take a fresh model test.",
        count: 0,
        questions: [],
      };
    }

    const sanitizedQuestions: SanitizedRetestQuestion[] = unmastered.map((item) => ({
      id: item.question.id,
      topicId: item.question.topicId,
      subjectId: item.question.subjectId,
      chapterId: item.question.chapterId,
      questionText: item.question.questionText,
      questionType: item.question.questionType,
      options: item.question.options,
      marks: Number(item.question.marks),
      negativeMarks: Number(item.question.negativeMarks),
      difficulty: item.question.difficulty,
      mistakeCount: item.mistakeCount,
      consecutiveCorrectCount: item.consecutiveCorrectCount,
    }));

    return {
      success: true,
      message: `Generated retest with ${sanitizedQuestions.length} questions`,
      count: sanitizedQuestions.length,
      questions: sanitizedQuestions,
    };
  }

  /**
   * Evaluates student answers for a retest session enforcing the Two-Strike Mastery Rule:
   * - Correct answer: increments consecutiveCorrectCount. If consecutiveCorrectCount >= 2, isMastered = true.
   * - Incorrect answer: increments mistakeCount, resets consecutiveCorrectCount = 0, isMastered = false.
   * Recalculates user progression metrics and topic health dynamically.
   */
  async evaluateRetest(
    userId: string,
    answers: SubmitRetestAnswer[]
  ): Promise<RetestEvaluationSummary> {
    if (!answers || answers.length === 0) {
      return {
        success: true,
        totalQuestions: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        newlyMasteredCount: 0,
        results: [],
      };
    }

    const questionIds = answers.map((a) => a.questionId);
    const questionRecords = await this.db
      .select({
        id: questions.id,
        correctOptionId: questions.correctOptionId,
        explanation: questions.explanation,
        topicId: questions.topicId,
        marks: questions.marks,
      })
      .from(questions)
      .where(inArray(questions.id, questionIds));

    const questionMap = new Map(questionRecords.map((q) => [q.id, q]));
    const results: RetestEvaluationResultItem[] = [];
    const topicMetricsMap = new Map<number, { attempted: number; correct: number }>();

    let totalCorrect = 0;
    let totalIncorrect = 0;
    let newlyMasteredCount = 0;

    for (const ans of answers) {
      const qRecord = questionMap.get(ans.questionId);
      if (!qRecord) continue;

      const isCorrect = ans.selectedOption === qRecord.correctOptionId;
      const now = new Date();

      if (isCorrect) {
        totalCorrect++;
        const [updated] = await this.db
          .insert(mistakeBook)
          .values({
            userId,
            questionId: ans.questionId,
            mistakeCount: 1,
            consecutiveCorrectCount: 1,
            isMastered: false,
            lastAttemptedAt: now,
            updatedAt: now,
          })
          .onConflictDoUpdate({
            target: [mistakeBook.userId, mistakeBook.questionId],
            set: {
              consecutiveCorrectCount: sql`${mistakeBook.consecutiveCorrectCount} + 1`,
              isMastered: sql`CASE WHEN ${mistakeBook.consecutiveCorrectCount} + 1 >= 2 THEN true ELSE false END`,
              lastAttemptedAt: now,
              updatedAt: now,
            },
          })
          .returning();

        if (!updated) continue;

        if (updated.isMastered) {
          newlyMasteredCount++;
        }

        results.push({
          questionId: ans.questionId,
          selectedOption: ans.selectedOption,
          correctOptionId: qRecord.correctOptionId,
          isCorrect: true,
          consecutiveCorrectCount: updated.consecutiveCorrectCount,
          isMastered: updated.isMastered,
          mistakeCount: updated.mistakeCount,
          explanation: qRecord.explanation,
        });
      } else {
        totalIncorrect++;
        const [updated] = await this.db
          .insert(mistakeBook)
          .values({
            userId,
            questionId: ans.questionId,
            mistakeCount: 1,
            consecutiveCorrectCount: 0,
            isMastered: false,
            lastAttemptedAt: now,
            updatedAt: now,
          })
          .onConflictDoUpdate({
            target: [mistakeBook.userId, mistakeBook.questionId],
            set: {
              mistakeCount: sql`${mistakeBook.mistakeCount} + 1`,
              consecutiveCorrectCount: 0,
              isMastered: false,
              lastAttemptedAt: now,
              updatedAt: now,
            },
          })
          .returning();

        if (!updated) continue;

        results.push({
          questionId: ans.questionId,
          selectedOption: ans.selectedOption,
          correctOptionId: qRecord.correctOptionId,
          isCorrect: false,
          consecutiveCorrectCount: 0,
          isMastered: false,
          mistakeCount: updated.mistakeCount,
          explanation: qRecord.explanation,
        });
      }

      // Track topic health
      if (qRecord.topicId) {
        const current = topicMetricsMap.get(qRecord.topicId) || { attempted: 0, correct: 0 };
        current.attempted++;
        if (isCorrect) current.correct++;
        topicMetricsMap.set(qRecord.topicId, current);
      }
    }

    // Recalculate dynamic user analytics and topic progression asynchronously
    if (this.analyticsService) {
      try {
        await this.analyticsService.updateUserMetrics(userId, {
          examsTakenIncrement: 0,
          questionsAttempted: answers.length,
          questionsCorrect: totalCorrect,
        });

        const topicItems: TopicMetricItem[] = Array.from(topicMetricsMap.entries()).map(
          ([topicId, data]) => ({
            topicId,
            attempted: data.attempted,
            correct: data.correct,
          })
        );

        if (topicItems.length > 0) {
          await this.analyticsService.updateTopicBreakdown(userId, topicItems);
        }
      } catch (err) {
        console.warn("[MistakeBookService] Failed to update dynamic analytics from retest:", err);
      }
    }

    return {
      success: true,
      totalQuestions: answers.length,
      totalCorrect,
      totalIncorrect,
      newlyMasteredCount,
      results,
    };
  }
}
