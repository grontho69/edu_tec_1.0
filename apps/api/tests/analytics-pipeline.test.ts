import crypto from "node:crypto";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { eq, and } from "drizzle-orm";
import {
  createDatabaseContext,
  closeDatabaseConnections,
  type DatabaseContext,
  seed,
  users,
  questions,
  userAnalytics,
  userTopicMetrics,
  mistakeBook,
} from "@admission-engine/database";
import { buildApp } from "../src/app";
import { InMemoryRedisClient } from "../src/modules/auth/redis.service";
import { defaultJwtService } from "../src/modules/auth/jwt.service";
import { examEvents } from "../src/modules/exams/exam-worker";
import { initAnalyticsSubscriber } from "../src/modules/analytics/analytics.subscriber";

describe("Dynamic Analytics and Automated Mistake Book Pipeline Test Suite", () => {
  let app: FastifyInstance;
  let ctx: DatabaseContext;
  let redisClient: InMemoryRedisClient;
  let unsubscribe: () => void;

  const studentId = "44444444-4444-4444-4444-444444444444";
  let studentToken: string;
  let seededQuestions: Array<{
    id: string;
    correctOptionId: string;
    topicId: number | null;
  }>;

  beforeAll(async () => {
    // 1. Initialize isolated in-memory Postgres WASM database and seed standard taxonomy & questions
    ctx = createDatabaseContext({ usePglite: true });
    await seed(ctx);

    // 2. Insert test Student User
    await ctx.db
      .insert(users)
      .values({
        id: studentId,
        tenantId: "DIRECT_B2C",
        role: "STUDENT",
        email: "analytics.student@test.com",
        fullName: "Analytics Test Student",
      })
      .onConflictDoNothing();

    // 3. Generate authenticated JWT
    studentToken = defaultJwtService.sign({
      userId: studentId,
      role: "STUDENT",
      email: "analytics.student@test.com",
    });

    // 4. Fetch 10 seeded questions
    const dbQuestions = await ctx.db.select().from(questions).limit(10);
    seededQuestions = dbQuestions.map((q) => ({
      id: q.id,
      correctOptionId: q.correctOptionId,
      topicId: q.topicId,
    }));

    redisClient = new InMemoryRedisClient();

    // 5. Initialize API app and subscriber
    app = await buildApp({
      db: ctx.db,
      redisClient,
      enableAnalyticsSubscriber: false, // will initialize explicitly with unregister hook
    });
    await app.ready();

    unsubscribe = initAnalyticsSubscriber(ctx.db);
  });

  afterAll(async () => {
    if (unsubscribe) unsubscribe();
    await app.close();
    await closeDatabaseConnections();
  });

  it("Test 1: Event-driven dynamic calculation on EXAM_EVALUATED event", async () => {
    // Simulate an evaluated exam with 10 questions: 2 correct, 8 wrong
    const correctQuestions = seededQuestions.slice(0, 2);
    const missedQuestions = seededQuestions.slice(2, 10);
    const missedQuestionIds = missedQuestions.map((q) => q.id);
    const targetTopicId = seededQuestions[0]?.topicId || 1;

    examEvents.emit("EXAM_EVALUATED", {
      submissionId: crypto.randomUUID(),
      ticketId: "TICKET-ANALYTICS-01",
      examId: crypto.randomUUID(),
      userId: studentId,
      rawScore: 0.0,
      compositeScore: 1000.0,
      totalCorrect: 2,
      totalWrong: 8,
      totalUnanswered: 0,
      timeTakenSeconds: 300,
      missedQuestionIds,
      topicBreakdown: [
        {
          topicId: targetTopicId,
          attempted: 10,
          correct: 2,
          incorrect: 8,
        },
      ],
    });

    // Await non-blocking background event execution
    await new Promise((resolve) => setTimeout(resolve, 80));

    // 1. Verify user_analytics was updated atomically
    const [analytics] = await ctx.db
      .select()
      .from(userAnalytics)
      .where(eq(userAnalytics.userId, studentId));

    expect(analytics).toBeDefined();
    expect(analytics?.totalExamsTaken).toBe(1);
    expect(analytics?.totalQuestionsAttempted).toBe(10);
    expect(analytics?.totalQuestionsCorrect).toBe(2);
    expect(analytics?.overallAccuracy).toBe("20.00");
    expect(analytics?.totalStudyTimeSeconds).toBe(300);

    // 2. Verify user_topic_metrics was updated atomically
    const [topicMetric] = await ctx.db
      .select()
      .from(userTopicMetrics)
      .where(
        and(
          eq(userTopicMetrics.userId, studentId),
          eq(userTopicMetrics.topicId, targetTopicId)
        )
      );

    expect(topicMetric).toBeDefined();
    expect(topicMetric?.totalAttempted).toBe(10);
    expect(topicMetric?.totalCorrect).toBe(2);
    expect(parseFloat(topicMetric!.accuracyRate)).toBe(20.0);

    // 3. Verify mistake_book ingested all 8 missed questions as unmastered
    const mistakes = await ctx.db
      .select()
      .from(mistakeBook)
      .where(eq(mistakeBook.userId, studentId));

    expect(mistakes.length).toBe(8);
    for (const m of mistakes) {
      expect(m.mistakeCount).toBe(1);
      expect(m.consecutiveCorrectCount).toBe(0);
      expect(m.isMastered).toBe(false);
    }
  });

  it("Test 2: Two-Strike Mastery Rule - 2 consecutive correct answers marks question as mastered", async () => {
    // Pick the first missed question
    const targetQuestion = seededQuestions[2]!;

    // Strike 1: Answer correctly once
    const res1 = await app.inject({
      method: "POST",
      url: "/api/v1/analytics/mistake-book/retest/evaluate",
      headers: {
        authorization: `Bearer ${studentToken}`,
      },
      payload: {
        answers: [
          {
            questionId: targetQuestion.id,
            selectedOption: targetQuestion.correctOptionId,
          },
        ],
      },
    });

    expect(res1.statusCode).toBe(200);
    const body1 = res1.json();
    expect(body1.success).toBe(true);
    expect(body1.totalCorrect).toBe(1);
    expect(body1.newlyMasteredCount).toBe(0);
    expect(body1.results[0].consecutiveCorrectCount).toBe(1);
    expect(body1.results[0].isMastered).toBe(false);

    // Verify DB state after Strike 1
    const [mb1] = await ctx.db
      .select()
      .from(mistakeBook)
      .where(
        and(
          eq(mistakeBook.userId, studentId),
          eq(mistakeBook.questionId, targetQuestion.id)
        )
      );
    expect(mb1?.consecutiveCorrectCount).toBe(1);
    expect(mb1?.isMastered).toBe(false);

    // Strike 2: Answer correctly a second consecutive time
    const res2 = await app.inject({
      method: "POST",
      url: "/api/v1/analytics/mistake-book/retest/evaluate",
      headers: {
        authorization: `Bearer ${studentToken}`,
      },
      payload: {
        answers: [
          {
            questionId: targetQuestion.id,
            selectedOption: targetQuestion.correctOptionId,
          },
        ],
      },
    });

    expect(res2.statusCode).toBe(200);
    const body2 = res2.json();
    expect(body2.success).toBe(true);
    expect(body2.totalCorrect).toBe(1);
    expect(body2.newlyMasteredCount).toBe(1);
    expect(body2.results[0].consecutiveCorrectCount).toBe(2);
    expect(body2.results[0].isMastered).toBe(true);

    // Verify DB state after Strike 2 (Now Mastered!)
    const [mb2] = await ctx.db
      .select()
      .from(mistakeBook)
      .where(
        and(
          eq(mistakeBook.userId, studentId),
          eq(mistakeBook.questionId, targetQuestion.id)
        )
      );
    expect(mb2?.consecutiveCorrectCount).toBe(2);
    expect(mb2?.isMastered).toBe(true);
  });

  it("Test 3: Wrong answer immediately resets consecutive correct count and revokes mastery", async () => {
    // Pick the second missed question
    const targetQuestion = seededQuestions[3]!;

    // Step 1: Get 1 correct answer (consecutive = 1)
    await app.inject({
      method: "POST",
      url: "/api/v1/analytics/mistake-book/retest/evaluate",
      headers: {
        authorization: `Bearer ${studentToken}`,
      },
      payload: {
        answers: [
          {
            questionId: targetQuestion.id,
            selectedOption: targetQuestion.correctOptionId,
          },
        ],
      },
    });

    // Step 2: Answer incorrectly
    const resWrong = await app.inject({
      method: "POST",
      url: "/api/v1/analytics/mistake-book/retest/evaluate",
      headers: {
        authorization: `Bearer ${studentToken}`,
      },
      payload: {
        answers: [
          {
            questionId: targetQuestion.id,
            selectedOption: "WRONG_OPTION_CHOICE",
          },
        ],
      },
    });

    expect(resWrong.statusCode).toBe(200);
    const bodyWrong = resWrong.json();
    expect(bodyWrong.totalIncorrect).toBe(1);
    expect(bodyWrong.results[0].isCorrect).toBe(false);
    expect(bodyWrong.results[0].consecutiveCorrectCount).toBe(0);
    expect(bodyWrong.results[0].isMastered).toBe(false);
    expect(bodyWrong.results[0].mistakeCount).toBe(2);

    // Verify in database: consecutive_correct_count is 0, is_mastered is false, mistake_count is 2
    const [mbDb] = await ctx.db
      .select()
      .from(mistakeBook)
      .where(
        and(
          eq(mistakeBook.userId, studentId),
          eq(mistakeBook.questionId, targetQuestion.id)
        )
      );
    expect(mbDb?.consecutiveCorrectCount).toBe(0);
    expect(mbDb?.isMastered).toBe(false);
    expect(mbDb?.mistakeCount).toBe(2);
  });

  it("Test 4: GET /api/v1/analytics/dashboard executes in under 20ms and flags NEEDS_IMPROVEMENT alert", async () => {
    const startTime = performance.now();

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/analytics/dashboard",
      headers: {
        authorization: `Bearer ${studentToken}`,
      },
    });

    const elapsedMs = performance.now() - startTime;

    expect(response.statusCode).toBe(200);
    expect(elapsedMs).toBeLessThan(50); // Direct pre-aggregated retrieval

    const body = response.json();
    expect(body.success).toBe(true);
    expect(body.data.userId).toBe(studentId);
    expect(body.data.totalExamsTaken).toBe(1);
    expect(body.data.weakTopicsCount).toBeGreaterThanOrEqual(1);

    // Topic with 20% accuracy must be flagged as NEEDS_IMPROVEMENT
    const weakTopic = body.data.topicBreakdown.find(
      (t: { accuracyRate: string }) => parseFloat(t.accuracyRate) < 50.0
    );
    expect(weakTopic).toBeDefined();
    expect(weakTopic?.status).toBe("NEEDS_IMPROVEMENT");
  });

  it("Test 5: Dynamic retest sanitizes questions and handles zero unmastered mistakes gracefully", async () => {
    // 1. Fetch dynamic retest while unmastered questions still exist
    const resRetest = await app.inject({
      method: "GET",
      url: "/api/v1/analytics/mistake-book/retest",
      headers: {
        authorization: `Bearer ${studentToken}`,
      },
    });

    expect(resRetest.statusCode).toBe(200);
    const bodyRetest = resRetest.json();
    expect(bodyRetest.success).toBe(true);
    expect(bodyRetest.count).toBeGreaterThan(0);

    // Verify sanitization: NO correctOptionId or explanation exposed
    for (const q of bodyRetest.questions) {
      expect(q).not.toHaveProperty("correctOptionId");
      expect(q).not.toHaveProperty("explanation");
      expect(q).toHaveProperty("questionText");
      expect(q).toHaveProperty("options");
      expect(q).toHaveProperty("mistakeCount");
      expect(q).toHaveProperty("consecutiveCorrectCount");
    }

    // 2. Mark all remaining mistakes as mastered
    await ctx.db
      .update(mistakeBook)
      .set({ isMastered: true })
      .where(eq(mistakeBook.userId, studentId));

    // 3. Fetch dynamic retest when 0 unmastered mistakes remain
    const resZero = await app.inject({
      method: "GET",
      url: "/api/v1/analytics/mistake-book/retest",
      headers: {
        authorization: `Bearer ${studentToken}`,
      },
    });

    expect(resZero.statusCode).toBe(200);
    const bodyZero = resZero.json();
    expect(bodyZero).toEqual({
      success: true,
      message: "All mistakes mastered! Take a fresh model test.",
      count: 0,
      questions: [],
    });
  });
});
