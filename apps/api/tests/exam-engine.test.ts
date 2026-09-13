import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import {
  createDatabaseContext,
  closeDatabaseConnections,
  type DatabaseContext,
  seed,
  users,
  exams,
  questions,
  examSubmissions,
  submissionAnswers,
} from "@admission-engine/database";
import { buildApp } from "../src/app";
import { InMemoryRedisClient } from "../src/modules/auth/redis.service";
import { defaultJwtService } from "../src/modules/auth/jwt.service";
import { ExamCacheService } from "../src/modules/exams/exam-cache.service";
import { ExamWorker, examEvents, type EvaluatedExamResult } from "../src/modules/exams/exam-worker";
import { InMemorySubmissionQueue } from "../src/modules/exams/exam-submission.queue";

describe("Live Exam Delivery and Submission Ingestion Engine Test Suite", () => {
  let app: FastifyInstance;
  let ctx: DatabaseContext;
  let redisClient: InMemoryRedisClient;
  let cacheService: ExamCacheService;
  let worker: ExamWorker;
  let queue: InMemorySubmissionQueue;

  const testExamId = "8f8b89e2-1111-2222-3333-444455556666";
  const studentFasterId = "11111111-1111-1111-1111-111111111111";
  const studentSlowerId = "22222222-2222-2222-2222-222222222222";
  const studentDbVerifyId = "33333333-3333-3333-3333-333333333333";
  let seededQuestions: Array<{ id: string; correctOptionId: string }>;

  beforeAll(async () => {
    // 1. Initialize isolated in-memory Postgres WASM database and seed standard data
    ctx = createDatabaseContext({ usePglite: true });
    await seed(ctx);

    // 2. Insert test Student Users into database
    await ctx.db
      .insert(users)
      .values([
        {
          id: studentFasterId,
          tenantId: "DIRECT_B2C",
          role: "STUDENT",
          email: "faster@test.com",
          fullName: "Student Faster",
        },
        {
          id: studentSlowerId,
          tenantId: "DIRECT_B2C",
          role: "STUDENT",
          email: "slower@test.com",
          fullName: "Student Slower",
        },
        {
          id: studentDbVerifyId,
          tenantId: "DIRECT_B2C",
          role: "STUDENT",
          email: "dbverify@test.com",
          fullName: "Student DB Verify",
        },
      ])
      .onConflictDoNothing();

    // 3. Insert test Live Exam into database
    await ctx.db
      .insert(exams)
      .values({
        id: testExamId,
        tenantId: "DIRECT_B2C",
        title: "DU KA Unit Live Model Test 01",
        description: "Official real-time competitive exam simulation",
        examType: "LIVE_MODEL_TEST",
        durationMinutes: 60, // 3600 seconds
        totalMarks: "10.00",
        passMarks: "4.00",
        negativeMarkingRate: "0.25",
        isActive: true,
      })
      .onConflictDoNothing();

    // 4. Query questions available in seeded database
    const dbQuestions = await ctx.db.select().from(questions).limit(5);
    seededQuestions = dbQuestions.map((q) => ({
      id: q.id,
      correctOptionId: q.correctOptionId,
    }));

    // 4. Initialize isolated Redis and queue components
    redisClient = new InMemoryRedisClient();
    cacheService = new ExamCacheService(ctx.db, redisClient);
    worker = new ExamWorker(ctx.db, redisClient, cacheService);
    queue = new InMemorySubmissionQueue(worker);

    // 5. Pre-warm test exam paper into L1 memory and Redis
    await cacheService.prewarmExam(testExamId);

    // 6. Build Fastify API instance
    app = await buildApp({
      db: ctx.db,
      redisClient,
      submissionQueue: queue,
      examCacheService: cacheService,
    });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await closeDatabaseConnections();
  });

  beforeEach(async () => {
    await redisClient.flushall();
    cacheService.clearMemory();
    await cacheService.prewarmExam(testExamId);
  });

  // =========================================================================
  // 1. Idempotency Locking & Duplicate Submission Prevention
  // =========================================================================
  it("1. Submit two simultaneous requests with identical idempotency keys; verify one receives 202 Accepted and the other receives 409 Conflict", async () => {
    const idempotencyKey = "4a6f23d1-934a-4a27-a068-07e3240e3415";
    const payload = {
      answers: [
        {
          questionId: seededQuestions[0]!.id,
          selectedOption: seededQuestions[0]!.correctOptionId,
          timeSpentSeconds: 24,
        },
      ],
      clientSubmittedAt: new Date().toISOString(),
    };

    const authToken = defaultJwtService.sign({
      userId: studentFasterId,
      role: "STUDENT",
    });

    // Dispatch two simultaneous requests with identical X-Idempotency-Key
    const [res1, res2] = await Promise.all([
      app.inject({
        method: "POST",
        url: `/api/v1/exams/${testExamId}/submit`,
        headers: {
          "x-idempotency-key": idempotencyKey,
          authorization: `Bearer ${authToken}`,
        },
        payload,
      }),
      app.inject({
        method: "POST",
        url: `/api/v1/exams/${testExamId}/submit`,
        headers: {
          "x-idempotency-key": idempotencyKey,
          authorization: `Bearer ${authToken}`,
        },
        payload,
      }),
    ]);

    const statusCodes = [res1.statusCode, res2.statusCode].sort();
    // Exactly one must be 202 Accepted and the other must be 409 Conflict
    expect(statusCodes).toEqual([202, 409]);

    const acceptedRes = res1.statusCode === 202 ? res1 : res2;
    const conflictRes = res1.statusCode === 409 ? res1 : res2;

    const acceptedJson = JSON.parse(acceptedRes.payload);
    expect(acceptedJson.status).toBe("QUEUED");
    expect(acceptedJson.trackingTicket).toBe(idempotencyKey);

    const conflictJson = JSON.parse(conflictRes.payload);
    expect(conflictJson.code).toBe("SUBMISSION_LOCKED");
    expect(conflictJson.error).toContain("Duplicate submission");

    // Wait for the accepted submission to finish processing
    await queue.drain();
  });

  // =========================================================================
  // 2. Real-Time Leaderboard & Tie-Breaker Scoring in Redis ZSET
  // =========================================================================
  it("2. Simulate two students with identical raw marks but different completion times; assert the student with lower completion time ranks higher in Redis ZREVRANGE", async () => {
    // Both students answer 2 questions correctly and 1 question incorrectly
    // Raw score calculation:
    // +1.00 for Q0, +1.00 for Q1, -0.25 for Q2 => Raw Score = 1.75 marks
    const answersStudentFaster = [
      {
        questionId: seededQuestions[0]!.id,
        selectedOption: seededQuestions[0]!.correctOptionId, // Correct (+1.00)
        timeSpentSeconds: 400,
      },
      {
        questionId: seededQuestions[1]!.id,
        selectedOption: seededQuestions[1]!.correctOptionId, // Correct (+1.00)
        timeSpentSeconds: 400,
      },
      {
        questionId: seededQuestions[2]!.id,
        selectedOption: "X", // Incorrect (-0.25)
        timeSpentSeconds: 400,
      },
    ]; // Total time = 1200 seconds

    const answersStudentSlower = [
      {
        questionId: seededQuestions[0]!.id,
        selectedOption: seededQuestions[0]!.correctOptionId, // Correct (+1.00)
        timeSpentSeconds: 800,
      },
      {
        questionId: seededQuestions[1]!.id,
        selectedOption: seededQuestions[1]!.correctOptionId, // Correct (+1.00)
        timeSpentSeconds: 800,
      },
      {
        questionId: seededQuestions[2]!.id,
        selectedOption: "X", // Incorrect (-0.25)
        timeSpentSeconds: 800,
      },
    ]; // Total time = 2400 seconds

    // 1. Process Faster Student Submission
    await worker.processSubmission({
      ticketId: "ticket_faster",
      examId: testExamId,
      userId: studentFasterId,
      answers: answersStudentFaster,
      clientSubmittedAt: new Date().toISOString(),
    });

    // 2. Process Slower Student Submission
    await worker.processSubmission({
      ticketId: "ticket_slower",
      examId: testExamId,
      userId: studentSlowerId,
      answers: answersStudentSlower,
      clientSubmittedAt: new Date().toISOString(),
    });

    // 3. Query Redis ZSET Leaderboard in descending score order: ZREVRANGE
    const leaderboardKey = `exam:${testExamId}:leaderboard`;
    const topStudents = await redisClient.zrevrange(leaderboardKey, 0, 1, true);

    expect(topStudents).toHaveLength(2);

    // Rank 1 must be the faster student
    expect(topStudents[0].member).toBe(studentFasterId);
    // Rank 2 must be the slower student
    expect(topStudents[1].member).toBe(studentSlowerId);

    // Assert that the faster student has a strictly higher composite score
    expect(topStudents[0].score).toBeGreaterThan(topStudents[1].score);

    // Raw score is identical: 1.75
    // Faster student time: 1200s / 3600s => bonus: 1 - 1200/3600 = 0.666667 => score = 2.416667
    // Slower student time: 2400s / 3600s => bonus: 1 - 2400/3600 = 0.333333 => score = 2.083333
    expect(topStudents[0].score).toBeCloseTo(1.75 + (1 - 1200 / 3600), 4);
    expect(topStudents[1].score).toBeCloseTo(1.75 + (1 - 2400 / 3600), 4);
  });

  // =========================================================================
  // 3. Sub-150ms Submission Ingestion Benchmark
  // =========================================================================
  it("3. Confirms /exams/:id/submit responds within 150ms under asynchronous queue ingestion", async () => {
    const start = performance.now();
    const authToken = defaultJwtService.sign({
      userId: studentSlowerId,
      role: "STUDENT",
    });

    const response = await app.inject({
      method: "POST",
      url: `/api/v1/exams/${testExamId}/submit`,
      headers: {
        "x-idempotency-key": "sub_perf_ticket_001",
        authorization: `Bearer ${authToken}`,
      },
      payload: {
        answers: [
          {
            questionId: seededQuestions[0]!.id,
            selectedOption: "A",
            timeSpentSeconds: 15,
          },
        ],
      },
    });

    const duration = performance.now() - start;

    expect(response.statusCode).toBe(202);
    expect(duration).toBeLessThan(150); // Strict requirement: < 150ms

    await queue.drain();
  });

  // =========================================================================
  // 4. Sanitized Question Paper Delivery (Anti-Cheating Guarantee)
  // =========================================================================
  it("4. Sanitizes live exam papers; ensures correctOptionId and explanation are completely stripped", async () => {
    const response = await app.inject({
      method: "GET",
      url: `/api/v1/exams/${testExamId}/paper`,
    });

    expect(response.statusCode).toBe(200);
    const json = JSON.parse(response.payload);

    expect(json.success).toBe(true);
    expect(json.data.examId).toBe(testExamId);
    expect(json.data.questions.length).toBeGreaterThan(0);

    for (const q of json.data.questions) {
      expect(q).not.toHaveProperty("correctOptionId");
      expect(q).not.toHaveProperty("correct_option_id");
      expect(q).not.toHaveProperty("explanation");
      expect(q).toHaveProperty("id");
      expect(q).toHaveProperty("questionText");
      expect(q).toHaveProperty("options");
      expect(q).toHaveProperty("marks");
    }

    // Direct string leak verification
    expect(response.payload).not.toContain("correctOptionId");
    expect(response.payload).not.toContain("correct_option_id");
  });

  // =========================================================================
  // 5. O(1) Rank and Percentile Calculation Endpoint
  // =========================================================================
  it("5. Calculates exact rank and percentile via GET /api/v1/exams/:id/rank in O(1)", async () => {
    const leaderboardKey = `exam:${testExamId}:leaderboard`;

    // Seed 4 participants into Redis ZSET
    await redisClient.zadd(leaderboardKey, 95.5, "student_1"); // Rank 1
    await redisClient.zadd(leaderboardKey, 85.2, "student_2"); // Rank 2
    await redisClient.zadd(leaderboardKey, 72.1, "student_3"); // Rank 3
    await redisClient.zadd(leaderboardKey, 60.0, "student_4"); // Rank 4

    // Query Rank for student_2
    const response = await app.inject({
      method: "GET",
      url: `/api/v1/exams/${testExamId}/rank?userId=student_2`,
    });

    expect(response.statusCode).toBe(200);
    const json = JSON.parse(response.payload);

    expect(json.success).toBe(true);
    expect(json.userId).toBe("student_2");
    expect(json.rank).toBe(2); // 1-indexed
    expect(json.totalParticipants).toBe(4);

    // Percentile formula: ((Total - Rank) / Total) * 100 = ((4 - 2) / 4) * 100 = 50%
    expect(json.percentile).toBe(50.0);
  });

  // =========================================================================
  // 6. Database Batch Persistence & Event Emission
  // =========================================================================
  it("6. Persists evaluated exam submissions to PostgreSQL and emits EXAM_EVALUATED event", async () => {
    let emittedEvent: EvaluatedExamResult | undefined;
    const testListener = (eventData: EvaluatedExamResult) => {
      if (eventData.userId === studentDbVerifyId) {
        emittedEvent = eventData;
      }
    };

    examEvents.on("EXAM_EVALUATED", testListener);

    const submissionResult = await worker.processSubmission({
      ticketId: "ticket_db_verify",
      examId: testExamId,
      userId: studentDbVerifyId,
      answers: [
        {
          questionId: seededQuestions[0]!.id,
          selectedOption: seededQuestions[0]!.correctOptionId,
          timeSpentSeconds: 50,
        },
      ],
      clientSubmittedAt: new Date().toISOString(),
    });

    examEvents.off("EXAM_EVALUATED", testListener);

    // 1. Verify Event was emitted
    expect(emittedEvent).toBeDefined();
    expect(emittedEvent?.submissionId).toBe(submissionResult.submissionId);
    expect(emittedEvent?.totalCorrect).toBe(1);

    // 2. Verify PostgreSQL record in exam_submissions
    const [dbSubmission] = await ctx.db
      .select()
      .from(examSubmissions)
      .where(eq(examSubmissions.id, submissionResult.submissionId));

    expect(dbSubmission).toBeDefined();
    expect(dbSubmission?.examId).toBe(testExamId);
    expect(dbSubmission?.status).toBe("EVALUATED");

    // 3. Verify PostgreSQL records in submission_answers
    const answersInDb = await ctx.db
      .select()
      .from(submissionAnswers)
      .where(eq(submissionAnswers.submissionId, submissionResult.submissionId));

    expect(answersInDb.length).toBeGreaterThan(0);
    expect(answersInDb[0]?.isCorrect).toBe(true);
  });
});
