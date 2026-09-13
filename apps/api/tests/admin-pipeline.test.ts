import crypto from "node:crypto";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
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
  questionDrafts,
  ingestionJobs,
  cheatingLogs,
} from "@admission-engine/database";
import { buildApp } from "../src/app";
import { InMemoryRedisClient } from "../src/modules/auth/redis.service";
import { defaultJwtService } from "../src/modules/auth/jwt.service";

describe("Super Admin Command Center & Multimodal AI Pipeline Test Suite", () => {
  let app: FastifyInstance;
  let ctx: DatabaseContext;
  let redisClient: InMemoryRedisClient;

  const adminId = "00000000-0000-0000-0000-000000000001";
  const studentId = "55555555-5555-5555-5555-555555555555";
  const examId = "66666666-6666-6666-6666-666666666666";

  let adminToken: string;
  let studentToken: string;

  beforeAll(async () => {
    ctx = createDatabaseContext({ usePglite: true });
    await seed(ctx);

    // 1. Insert Student User
    await ctx.db
      .insert(users)
      .values({
        id: studentId,
        tenantId: "DIRECT_B2C",
        role: "STUDENT",
        targetUnit: "ENGINEERING",
        email: "oversight.student@test.com",
        fullName: "Oversight Student",
      })
      .onConflictDoNothing();

    // 2. Insert Test Exam
    await ctx.db
      .insert(exams)
      .values({
        id: examId,
        tenantId: "DIRECT_B2C",
        title: "BUET Engineering Model Test 01",
        examType: "LIVE_MODEL_TEST",
        durationMinutes: 60,
        totalMarks: "100.00",
        passMarks: "40.00",
        negativeMarkingRate: "0.25",
        isActive: true,
      })
      .onConflictDoNothing();

    // 3. Tokens
    adminToken = defaultJwtService.sign({
      userId: adminId,
      role: "SUPER_ADMIN",
      email: "admin@admission-engine.com",
    });

    studentToken = defaultJwtService.sign({
      userId: studentId,
      role: "STUDENT",
      email: "oversight.student@test.com",
    });

    redisClient = new InMemoryRedisClient();
    app = await buildApp({
      db: ctx.db,
      redisClient,
      enableAnalyticsSubscriber: false,
    });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await closeDatabaseConnections();
  });

  it("Test 1: Student oversight listing & detailed audit", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/admin/students",
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.success).toBe(true);
    expect(body.count).toBeGreaterThan(0);

    const found = body.data.find((s: any) => s.id === studentId);
    expect(found).toBeDefined();
    expect(found.fullName).toBe("Oversight Student");
    expect(found.targetUnit).toBe("ENGINEERING");

    // Student detail audit
    const auditRes = await app.inject({
      method: "GET",
      url: `/api/v1/admin/students/${studentId}`,
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });

    expect(auditRes.statusCode).toBe(200);
    const auditBody = auditRes.json();
    expect(auditBody.success).toBe(true);
    expect(auditBody.data.student.id).toBe(studentId);
    expect(Array.isArray(auditBody.data.infractions)).toBe(true);
  });

  it("Test 2: Anti-cheat protocol - 3 infractions auto-escalate to FORCED_SUBMISSION", async () => {
    // Infraction 1: TAB_BLUR -> WARNING
    const res1 = await app.inject({
      method: "POST",
      url: "/api/v1/admin/proctor/infraction",
      headers: {
        authorization: `Bearer ${studentToken}`,
      },
      payload: {
        userId: studentId,
        examId,
        infractionType: "TAB_BLUR",
      },
    });

    expect(res1.statusCode).toBe(200);
    expect(res1.json().data.infractionNumber).toBe(1);
    expect(res1.json().data.actionTaken).toBe("WARNING");
    expect(res1.json().data.shouldForceSubmit).toBe(false);

    // Infraction 2: FULLSCREEN_EXIT -> WARNING
    const res2 = await app.inject({
      method: "POST",
      url: "/api/v1/admin/proctor/infraction",
      headers: {
        authorization: `Bearer ${studentToken}`,
      },
      payload: {
        userId: studentId,
        examId,
        infractionType: "FULLSCREEN_EXIT",
      },
    });

    expect(res2.statusCode).toBe(200);
    expect(res2.json().data.infractionNumber).toBe(2);
    expect(res2.json().data.actionTaken).toBe("WARNING");
    expect(res2.json().data.shouldForceSubmit).toBe(false);

    // Infraction 3: TAB_BLUR -> FORCED_SUBMISSION
    const res3 = await app.inject({
      method: "POST",
      url: "/api/v1/admin/proctor/infraction",
      headers: {
        authorization: `Bearer ${studentToken}`,
      },
      payload: {
        userId: studentId,
        examId,
        infractionType: "TAB_BLUR",
      },
    });

    expect(res3.statusCode).toBe(200);
    expect(res3.json().data.infractionNumber).toBe(3);
    expect(res3.json().data.actionTaken).toBe("FORCED_SUBMISSION");
    expect(res3.json().data.shouldForceSubmit).toBe(true);

    // Verify persisted cheating logs in DB
    const logs = await ctx.db
      .select()
      .from(cheatingLogs)
      .where(eq(cheatingLogs.userId, studentId));
    expect(logs.length).toBe(3);
  });

  it("Test 3: Free Multimodal AI Extraction stages questions to question_drafts with status 'DRAFT'", async () => {
    const extractRes = await app.inject({
      method: "POST",
      url: "/api/v1/admin/ingestion/extract",
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
      payload: {
        sourceFileUrl: "https://pub-r2.admission-engine.com/papers/buet_2024_phy.pdf",
        fileType: "PDF",
        targetSubjectId: 1,
        targetChapterId: 1,
      },
    });

    expect(extractRes.statusCode).toBe(200);
    const extractBody = extractRes.json();
    expect(extractBody.success).toBe(true);
    expect(extractBody.data.jobId).toBeDefined();
    expect(extractBody.data.totalDetected).toBeGreaterThanOrEqual(2);

    const jobId = extractBody.data.jobId;

    // Verify ingestion_jobs record
    const [job] = await ctx.db
      .select()
      .from(ingestionJobs)
      .where(eq(ingestionJobs.id, jobId));
    expect(job).toBeDefined();
    expect(job?.status).toBe("COMPLETED");
    expect(job?.totalDetected).toBeGreaterThanOrEqual(2);

    // Verify staged drafts in question_drafts with status DRAFT
    const drafts = await ctx.db
      .select()
      .from(questionDrafts)
      .where(eq(questionDrafts.jobId, jobId));

    expect(drafts.length).toBeGreaterThanOrEqual(2);
    for (const d of drafts) {
      expect(d.status).toBe("DRAFT");
      expect(d.parsedQuestionText).toContain("$"); // LaTeX enforcement
      expect(d.parsedCorrectOption).toBe("A");
      expect(Array.isArray(d.parsedOptions)).toBe(true);
    }
  });

  it("Test 4: Split-screen review, draft editing, and atomic publication into live question bank", async () => {
    // 1. Fetch drafts
    const listRes = await app.inject({
      method: "GET",
      url: "/api/v1/admin/drafts?status=DRAFT",
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });

    expect(listRes.statusCode).toBe(200);
    const drafts = listRes.json().data;
    expect(drafts.length).toBeGreaterThan(0);

    const targetDraft = drafts[0];

    // 2. Edit draft in split-screen review
    const editRes = await app.inject({
      method: "PATCH",
      url: `/api/v1/admin/drafts/${targetDraft.id}`,
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
      payload: {
        questionText: "সংশোধিত প্রশ্ন: $F = ma$ অনুযায়ী বল কত?",
        correctOption: "B",
      },
    });

    expect(editRes.statusCode).toBe(200);
    expect(editRes.json().data.parsedQuestionText).toBe("সংশোধিত প্রশ্ন: $F = ma$ অনুযায়ী বল কত?");
    expect(editRes.json().data.parsedCorrectOption).toBe("B");

    // 3. Approve draft to publish into questions bank
    const approveRes = await app.inject({
      method: "POST",
      url: `/api/v1/admin/drafts/${targetDraft.id}/approve`,
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });

    expect(approveRes.statusCode).toBe(200);
    const published = approveRes.json().data;
    expect(published.id).toBeDefined();
    expect(published.questionText).toBe("সংশোধিত প্রশ্ন: $F = ma$ অনুযায়ী বল কত?");
    expect(published.correctOptionId).toBe("B");

    // Verify in live questions table
    const [liveQuestion] = await ctx.db
      .select()
      .from(questions)
      .where(eq(questions.id, published.id));
    expect(liveQuestion).toBeDefined();

    // Verify draft status updated to APPROVED
    const [approvedDraft] = await ctx.db
      .select()
      .from(questionDrafts)
      .where(eq(questionDrafts.id, targetDraft.id));
    expect(approvedDraft?.status).toBe("APPROVED");
  });
});
