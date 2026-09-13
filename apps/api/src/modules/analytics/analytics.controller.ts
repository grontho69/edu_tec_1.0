import type { FastifyRequest, FastifyReply } from "fastify";
import { z, ZodError } from "zod";
import type { AnalyticsService } from "./analytics.service";
import type { MistakeBookService } from "./mistake-book.service";
import { defaultJwtService } from "../auth/jwt.service";

export const EvaluateRetestInputSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid("Invalid questionId UUID format"),
        selectedOption: z.string().min(1, "selectedOption is required"),
      })
    )
    .min(1, "At least one answer must be submitted for evaluation"),
});

export class AnalyticsController {
  constructor(
    private analyticsService: AnalyticsService,
    private mistakeBookService: MistakeBookService
  ) {}

  /**
   * Helper to resolve the authenticated userId from:
   * 1. request.user.userId
   * 2. Bearer JWT in Authorization header
   * 3. X-User-Id header
   * 4. Query param userId
   */
  private resolveUserId(request: FastifyRequest): string | null {
    if (request.user?.userId) {
      return request.user.userId;
    }

    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.slice(7).trim();
        const decoded = defaultJwtService.verify(token);
        if (decoded?.userId) return decoded.userId;
      } catch {
        // invalid token
      }
    }

    const headerUserId = request.headers["x-user-id"];
    if (typeof headerUserId === "string" && headerUserId.length > 0) {
      return headerUserId;
    }

    const queryUserId = (request.query as Record<string, unknown>)?.["userId"];
    if (typeof queryUserId === "string" && queryUserId.length > 0) {
      return queryUserId;
    }

    return null;
  }

  /**
   * GET /api/v1/analytics/dashboard
   * Serves pre-calculated dynamic metrics in sub-20ms directly from pre-aggregated records.
   */
  async getDashboard(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = this.resolveUserId(request);
      if (!userId) {
        return reply.status(401).send({
          success: false,
          error: "Unauthorized: Missing authentication credentials or user ID",
        });
      }

      const dashboard = await this.analyticsService.getDashboardAnalytics(userId);

      return reply.status(200).send({
        success: true,
        data: dashboard,
      });
    } catch (err: unknown) {
      request.log.error({ err }, "[AnalyticsController] getDashboard failed");
      return reply.status(500).send({
        success: false,
        error: "Failed to retrieve student dashboard analytics",
      });
    }
  }

  /**
   * GET /api/v1/analytics/mistake-book
   * Returns paginated list of unmastered or all student mistakes with question metadata.
   */
  async getMistakes(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = this.resolveUserId(request);
      if (!userId) {
        return reply.status(401).send({
          success: false,
          error: "Unauthorized: Missing authentication credentials or user ID",
        });
      }

      const query = (request.query as Record<string, unknown>) || {};
      const isMasteredParam = query["isMastered"];
      const isMastered =
        isMasteredParam === "true" ? true : isMasteredParam === "false" ? false : undefined;

      const limit = query["limit"] ? parseInt(String(query["limit"]), 10) : 50;
      const offset = query["offset"] ? parseInt(String(query["offset"]), 10) : 0;

      const mistakes = await this.mistakeBookService.getMistakes(userId, {
        isMastered,
        limit,
        offset,
      });

      return reply.status(200).send({
        success: true,
        count: mistakes.length,
        data: mistakes,
      });
    } catch (err: unknown) {
      request.log.error({ err }, "[AnalyticsController] getMistakes failed");
      return reply.status(500).send({
        success: false,
        error: "Failed to fetch student mistake book entries",
      });
    }
  }

  /**
   * POST /api/v1/analytics/mistake-book/retest
   * GET /api/v1/analytics/mistake-book/retest
   * Generates a dynamic sanitized retest paper from unmastered questions.
   */
  async generateRetest(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = this.resolveUserId(request);
      if (!userId) {
        return reply.status(401).send({
          success: false,
          error: "Unauthorized: Missing authentication credentials or user ID",
        });
      }

      const query = (request.query as Record<string, unknown>) || {};
      const body = (request.body as Record<string, unknown>) || {};
      const limitRaw = body["limit"] || query["limit"] || 20;
      const limit = parseInt(String(limitRaw), 10) || 20;

      const retest = await this.mistakeBookService.generateDynamicRetest(userId, limit);

      return reply.status(200).send(retest);
    } catch (err: unknown) {
      request.log.error({ err }, "[AnalyticsController] generateRetest failed");
      return reply.status(500).send({
        success: false,
        error: "Failed to generate dynamic retest",
      });
    }
  }

  /**
   * POST /api/v1/analytics/mistake-book/retest/evaluate
   * Evaluates retest submissions enforcing the Two-Strike Mastery Rule.
   */
  async evaluateRetest(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = this.resolveUserId(request);
      if (!userId) {
        return reply.status(401).send({
          success: false,
          error: "Unauthorized: Missing authentication credentials or user ID",
        });
      }

      const parsed = EvaluateRetestInputSchema.parse(request.body);
      const result = await this.mistakeBookService.evaluateRetest(userId, parsed.answers);

      return reply.status(200).send(result);
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        return reply.status(400).send({
          success: false,
          error: "Validation failed for retest answers",
          details: err.issues,
        });
      }

      request.log.error({ err }, "[AnalyticsController] evaluateRetest failed");
      return reply.status(500).send({
        success: false,
        error: "Failed to evaluate retest submission",
      });
    }
  }
}
