import type { FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";
import {
  StudentFilterSchema,
  LogCheatingInfractionSchema,
  AdminExtractJobInputSchema,
  UpdateDraftSchema,
  BatchApproveDraftsSchema,
} from "@admission-engine/types";
import type { StudentOversightService } from "./student-oversight.service";
import type { GeminiExtractorService } from "./gemini-extractor.service";
import type { DraftReviewService } from "./draft-review.service";

export class AdminController {
  constructor(
    private oversightService: StudentOversightService,
    private extractorService: GeminiExtractorService,
    private draftReviewService: DraftReviewService
  ) {}

  /**
   * GET /api/v1/admin/students
   */
  async listStudents(request: FastifyRequest, reply: FastifyReply) {
    try {
      const filter = StudentFilterSchema.parse(request.query);
      const students = await this.oversightService.listStudents(filter);
      return reply.status(200).send({
        success: true,
        count: students.length,
        data: students,
      });
    } catch (err) {
      if (err instanceof ZodError) {
        return reply.status(400).send({ success: false, error: "Invalid query params", details: err.issues });
      }
      request.log.error({ err }, "[AdminController] listStudents error");
      return reply.status(500).send({ success: false, error: "Failed to list students" });
    }
  }

  /**
   * GET /api/v1/admin/students/:id
   */
  async getStudentAudit(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const audit = await this.oversightService.getStudentAudit(id);
      if (!audit) {
        return reply.status(404).send({ success: false, error: "Student not found" });
      }
      return reply.status(200).send({
        success: true,
        data: audit,
      });
    } catch (err) {
      request.log.error({ err }, "[AdminController] getStudentAudit error");
      return reply.status(500).send({ success: false, error: "Failed to fetch student audit report" });
    }
  }

  /**
   * POST /api/v1/admin/proctor/infraction
   * Records student proctoring infractions (visibilitychange blur, fullscreen drops).
   */
  async recordCheatingInfraction(request: FastifyRequest, reply: FastifyReply) {
    try {
      const input = LogCheatingInfractionSchema.parse(request.body);
      const result = await this.oversightService.recordCheatingInfraction(input);
      return reply.status(200).send({
        success: true,
        data: result,
      });
    } catch (err) {
      if (err instanceof ZodError) {
        return reply.status(400).send({ success: false, error: "Validation error", details: err.issues });
      }
      request.log.error({ err }, "[AdminController] recordCheatingInfraction error");
      return reply.status(500).send({ success: false, error: "Failed to log infraction" });
    }
  }

  /**
   * POST /api/v1/admin/ingestion/extract
   * Triggers free multimodal Gemini Flash question extraction into staging buffer.
   */
  async extractQuestions(request: FastifyRequest, reply: FastifyReply) {
    try {
      const adminId = (request as any).user?.userId || "00000000-0000-0000-0000-000000000001";
      const input = AdminExtractJobInputSchema.parse(request.body);
      const result = await this.extractorService.extractAndStageQuestions(adminId, input);
      return reply.status(200).send({
        success: true,
        data: result,
      });
    } catch (err) {
      if (err instanceof ZodError) {
        return reply.status(400).send({ success: false, error: "Invalid extraction input", details: err.issues });
      }
      request.log.error({ err }, "[AdminController] extractQuestions error");
      return reply.status(500).send({
        success: false,
        error: err instanceof Error ? err.message : "Failed to extract questions",
      });
    }
  }

  /**
   * GET /api/v1/admin/drafts
   */
  async listDrafts(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = (request.query as Record<string, string>) || {};
      const drafts = await this.draftReviewService.listDrafts({
        jobId: query["jobId"],
        status: query["status"] as any,
        limit: query["limit"] ? parseInt(query["limit"], 10) : 50,
        offset: query["offset"] ? parseInt(query["offset"], 10) : 0,
      });
      return reply.status(200).send({
        success: true,
        count: drafts.length,
        data: drafts,
      });
    } catch (err) {
      request.log.error({ err }, "[AdminController] listDrafts error");
      return reply.status(500).send({ success: false, error: "Failed to fetch question drafts" });
    }
  }

  /**
   * GET /api/v1/admin/drafts/:id
   */
  async getDraft(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const draft = await this.draftReviewService.getDraft(id);
      if (!draft) {
        return reply.status(404).send({ success: false, error: "Draft not found" });
      }
      return reply.status(200).send({
        success: true,
        data: draft,
      });
    } catch (err) {
      request.log.error({ err }, "[AdminController] getDraft error");
      return reply.status(500).send({ success: false, error: "Failed to fetch draft" });
    }
  }

  /**
   * PATCH /api/v1/admin/drafts/:id
   */
  async updateDraft(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const input = UpdateDraftSchema.parse(request.body);
      const updated = await this.draftReviewService.updateDraft(id, input);
      if (!updated) {
        return reply.status(404).send({ success: false, error: "Draft not found" });
      }
      return reply.status(200).send({
        success: true,
        data: updated,
      });
    } catch (err) {
      if (err instanceof ZodError) {
        return reply.status(400).send({ success: false, error: "Validation error", details: err.issues });
      }
      request.log.error({ err }, "[AdminController] updateDraft error");
      return reply.status(500).send({ success: false, error: "Failed to update draft" });
    }
  }

  /**
   * POST /api/v1/admin/drafts/:id/approve
   * Atomically publishes draft to live questions bank.
   */
  async approveDraft(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const published = await this.draftReviewService.approveDraft(id);
      return reply.status(200).send({
        success: true,
        message: "Question draft successfully published to questions bank",
        data: published,
      });
    } catch (err) {
      request.log.error({ err }, "[AdminController] approveDraft error");
      return reply.status(500).send({
        success: false,
        error: err instanceof Error ? err.message : "Failed to approve draft",
      });
    }
  }

  /**
   * POST /api/v1/admin/drafts/batch-approve
   */
  async batchApproveDrafts(request: FastifyRequest, reply: FastifyReply) {
    try {
      const input = BatchApproveDraftsSchema.parse(request.body);
      const published = await this.draftReviewService.batchApproveDrafts(input.draftIds);
      return reply.status(200).send({
        success: true,
        approvedCount: published.length,
        data: published,
      });
    } catch (err) {
      if (err instanceof ZodError) {
        return reply.status(400).send({ success: false, error: "Validation error", details: err.issues });
      }
      request.log.error({ err }, "[AdminController] batchApproveDrafts error");
      return reply.status(500).send({ success: false, error: "Failed to batch approve drafts" });
    }
  }

  /**
   * POST /api/v1/admin/drafts/:id/reject
   */
  async rejectDraft(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const rejected = await this.draftReviewService.rejectDraft(id);
      return reply.status(200).send({
        success: true,
        data: rejected,
      });
    } catch (err) {
      request.log.error({ err }, "[AdminController] rejectDraft error");
      return reply.status(500).send({
        success: false,
        error: err instanceof Error ? err.message : "Failed to reject draft",
      });
    }
  }
}
