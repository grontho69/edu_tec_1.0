import type { DatabaseInstance } from "@admission-engine/database";
import { exams, questions } from "@admission-engine/database";
import { eq } from "drizzle-orm";
import type { IRedisClient } from "../auth/redis.service";
import { defaultRedisClient } from "../auth/redis.service";

export interface CachedQuestionItem {
  id: string;
  topicId?: number | null | undefined;
  questionText: string;
  questionType: string;
  options: any;
  marks: number;
  negativeMarks: number;
  difficulty: string;
  correctOptionId: string;
  explanation?: string | null | undefined;
}

export interface CachedExamPaper {
  examId: string;
  title: string;
  durationMinutes: number;
  totalMarks: number;
  passMarks: number;
  negativeMarkingRate: number;
  startTime: string | null;
  endTime: string | null;
  questions: CachedQuestionItem[];
}

export interface SanitizedQuestionItem {
  id: string;
  topicId?: number | null | undefined;
  questionText: string;
  questionType: string;
  options: any;
  marks: number;
  negativeMarks: number;
  difficulty: string;
}

export interface SanitizedExamPaper {
  examId: string;
  title: string;
  durationMinutes: number;
  totalMarks: number;
  passMarks: number;
  negativeMarkingRate: number;
  startTime: string | null;
  endTime: string | null;
  questions: SanitizedQuestionItem[];
}

export interface AnswerKeyData {
  correctOptionId: string;
  marks: number;
  negativeMarks: number;
  topicId?: number | null | undefined;
}

export class ExamCacheService {
  // L1 In-Memory Cache to strictly budget Upstash Redis command quotas (10k/day limit)
  private memoryCache = new Map<string, CachedExamPaper>();
  private answerKeysCache = new Map<string, Map<string, AnswerKeyData>>();

  constructor(
    private db: DatabaseInstance,
    private redis: IRedisClient = defaultRedisClient
  ) {}

  /**
   * Pre-warms exam papers and answer keys into Node.js server memory (L1)
   * and Redis key `exam:paper:{examId}` 15 minutes before exam start.
   */
  async prewarmExam(examId: string, customPaper?: CachedExamPaper): Promise<CachedExamPaper> {
    let paper: CachedExamPaper;

    if (customPaper) {
      paper = customPaper;
    } else {
      // 1. Fetch exam metadata from database
      const [examRecord] = await this.db
        .select()
        .from(exams)
        .where(eq(exams.id, examId))
        .limit(1);

      if (!examRecord) {
        throw new Error(`Exam with ID ${examId} not found in database.`);
      }

      // 2. Fetch associated questions
      const examQuestions = await this.db
        .select()
        .from(questions)
        .limit(10); // default active pool

      paper = {
        examId: examRecord.id,
        title: examRecord.title,
        durationMinutes: examRecord.durationMinutes,
        totalMarks: parseFloat(examRecord.totalMarks),
        passMarks: parseFloat(examRecord.passMarks),
        negativeMarkingRate: parseFloat(examRecord.negativeMarkingRate),
        startTime: examRecord.startTime ? examRecord.startTime.toISOString() : null,
        endTime: examRecord.endTime ? examRecord.endTime.toISOString() : null,
        questions: examQuestions.map((q) => ({
          id: q.id,
          topicId: q.topicId,
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options,
          marks: parseFloat(q.marks),
          negativeMarks: parseFloat(q.negativeMarks),
          difficulty: q.difficulty,
          correctOptionId: q.correctOptionId,
          explanation: q.explanation,
        })),
      };
    }

    // Store in L1 Node.js memory
    this.memoryCache.set(examId, paper);

    // Build fast lookup Map for worker grading
    const keysMap = new Map<string, AnswerKeyData>();
    for (const q of paper.questions) {
      keysMap.set(q.id, {
        correctOptionId: q.correctOptionId,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        topicId: q.topicId,
      });
    }
    this.answerKeysCache.set(examId, keysMap);

    // Store in Redis L2 Cache: exam:paper:{examId} (TTL: 24h)
    // Upstash command budgeted: single SET command
    await this.redis.set(`exam:paper:${examId}`, JSON.stringify(paper), "EX", 86400);

    return paper;
  }

  /**
   * Retrieves sanitized question paper for students without leaking correct options or explanations.
   * Leverages Node.js in-memory cache first to avoid consuming Upstash Redis command quotas.
   */
  async getSanitizedExamPaper(examId: string): Promise<SanitizedExamPaper> {
    // 1. Try L1 server memory
    let paper = this.memoryCache.get(examId);

    // 2. Try Redis L2 cache if not in memory
    if (!paper) {
      const redisData = await this.redis.get(`exam:paper:${examId}`);
      if (redisData) {
        paper = JSON.parse(redisData) as CachedExamPaper;
        this.memoryCache.set(examId, paper);
      } else {
        // Fallback: warm from database
        paper = await this.prewarmExam(examId);
      }
    }

    // 3. Sanitize payload: strip correctOptionId and explanation
    return {
      examId: paper.examId,
      title: paper.title,
      durationMinutes: paper.durationMinutes,
      totalMarks: paper.totalMarks,
      passMarks: paper.passMarks,
      negativeMarkingRate: paper.negativeMarkingRate,
      startTime: paper.startTime,
      endTime: paper.endTime,
      questions: paper.questions.map((q) => ({
        id: q.id,
        topicId: q.topicId,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        difficulty: q.difficulty,
      })),
    };
  }

  /**
   * Retrieves cached answer keys map for scoring in O(1) memory lookup.
   */
  async getAnswerKeys(examId: string): Promise<Map<string, AnswerKeyData>> {
    let keys = this.answerKeysCache.get(examId);
    if (keys) return keys;

    // Pre-warm if missing
    await this.prewarmExam(examId);
    return this.answerKeysCache.get(examId) || new Map();
  }

  /**
   * Clears in-memory caches (useful in tests).
   */
  clearMemory(): void {
    this.memoryCache.clear();
    this.answerKeysCache.clear();
  }
}
