import type { FastifyInstance } from "fastify";
import type { DatabaseInstance } from "@admission-engine/database";
import { questions } from "@admission-engine/database";
import type { IRedisClient } from "../auth/redis.service";
import { defaultRedisClient } from "../auth/redis.service";
import { createAuthMiddleware } from "../auth/auth.middleware";
import { StudentOversightService } from "./student-oversight.service";
import { GeminiExtractorService } from "./gemini-extractor.service";
import { DraftReviewService } from "./draft-review.service";
import { AdminController } from "./admin.controller";

export interface AdminRoutesOptions {
  db: DatabaseInstance;
  redisClient?: IRedisClient;
}

export async function adminRoutes(app: FastifyInstance, opts: AdminRoutesOptions) {
  const { db, redisClient = defaultRedisClient } = opts;
  const { requireAuth, requireRole } = createAuthMiddleware({ redisClient });

  const oversightService = new StudentOversightService(db);
  const extractorService = new GeminiExtractorService(db);
  const draftReviewService = new DraftReviewService(db);
  const controller = new AdminController(oversightService, extractorService, draftReviewService);

  // 1. Proctoring Infraction Endpoint (Authenticated for Students during active exams)
  app.post(
    "/admin/proctor/infraction",
    { preHandler: [requireAuth] },
    async (req, rep) => controller.recordCheatingInfraction(req, rep)
  );

  // 2. Strict Super Admin Command Center Endpoints
  await app.register(async (adminScope) => {
    adminScope.addHook("preHandler", requireAuth);
    adminScope.addHook("preHandler", requireRole(["SUPER_ADMIN"]));

    // Student Oversight & Cheating Audit
    adminScope.get("/admin/students", async (req, rep) => controller.listStudents(req, rep));
    adminScope.get("/admin/students/:id", async (req, rep) => controller.getStudentAudit(req, rep));

    // Multimodal AI Question Extraction Pipeline
    adminScope.post("/admin/ingestion/extract", async (req, rep) =>
      controller.extractQuestions(req, rep)
    );

    // Staging Buffer Draft Review & Publishing
    adminScope.get("/admin/drafts", async (req, rep) => controller.listDrafts(req, rep));
    adminScope.get("/admin/drafts/:id", async (req, rep) => controller.getDraft(req, rep));
    adminScope.patch("/admin/drafts/:id", async (req, rep) => controller.updateDraft(req, rep));
    adminScope.post("/admin/drafts/:id/approve", async (req, rep) =>
      controller.approveDraft(req, rep)
    );
    adminScope.post("/admin/drafts/batch-approve", async (req, rep) =>
      controller.batchApproveDrafts(req, rep)
    );
    adminScope.post("/admin/drafts/:id/reject", async (req, rep) =>
      controller.rejectDraft(req, rep)
    );

    // Live Questions Bank
    adminScope.get("/admin/questions", async (_request, reply) => {
      const allQuestions = await db.select().from(questions).limit(50);
      return reply.status(200).send({
        success: true,
        count: allQuestions.length,
        data: allQuestions,
      });
    });
  });
}
