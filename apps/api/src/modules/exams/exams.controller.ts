import crypto from "node:crypto";
import type { FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";
import type { IRedisClient } from "../auth/redis.service";
import { defaultRedisClient } from "../auth/redis.service";
import { SubmitExamInputSchema } from "./exams.dto";
import type { ISubmissionQueue } from "./exam-submission.queue";
import type { ExamCacheService } from "./exam-cache.service";
import { defaultJwtService } from "../auth/jwt.service";

export class ExamsController {
  constructor(
    private redis: IRedisClient = defaultRedisClient,
    private queue: ISubmissionQueue,
    private cacheService: ExamCacheService
  ) {}

  /**
   * POST /api/v1/exams/:id/submit
   *
   * Asynchronous Submission Ingestion (Target: < 150ms):
   * 1. Single atomic Redis command: SET lock:sub:{idempotencyKey} "LOCKED" NX EX 120
   * 2. Returns HTTP 409 Conflict if duplicate submission detected.
   * 3. Pushes to asynchronous queue.
   * 4. Responds with HTTP 202 Accepted immediately.
   */
  async submitExam(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id: examId } = request.params as { id: string };
      const body = SubmitExamInputSchema.parse(request.body);

      const idempotencyKey = request.headers["x-idempotency-key"] as string | undefined;
      let userId = request.user?.userId;
      if (!userId && request.headers.authorization?.startsWith("Bearer ")) {
        try {
          const token = request.headers.authorization.slice(7).trim();
          const decoded = defaultJwtService.verify(token);
          userId = decoded.userId;
        } catch {
          // ignore
        }
      }
      if (!userId) {
        userId = crypto.randomUUID();
      }

      // Upstash Budget Optimization: Single atomic Redis command
      const lockKey = idempotencyKey
        ? `lock:sub:${idempotencyKey}`
        : `lock:sub:${userId}:${examId}`;

      const lockAcquired = await this.redis.set(lockKey, "LOCKED", "NX", "EX", 120);

      if (!lockAcquired) {
        return reply.status(409).send({
          success: false,
          error: "Duplicate submission in progress or already submitted (Idempotency Lock Active).",
          code: "SUBMISSION_LOCKED",
        });
      }

      // Tracking Ticket
      const ticketId = idempotencyKey || crypto.randomUUID();

      // Push to non-blocking submission queue
      await this.queue.push({
        ticketId,
        examId,
        userId,
        answers: body.answers,
        clientSubmittedAt: body.clientSubmittedAt,
      });

      // Respond within 150ms with HTTP 202 Accepted
      return reply.status(202).send({
        status: "QUEUED",
        trackingTicket: ticketId,
        message: "Submission received and queued for evaluation.",
      });
    } catch (err) {
      if (err instanceof ZodError) {
        return reply.status(400).send({
          success: false,
          error: err.errors[0]?.message || "Invalid submission format.",
        });
      }

      return reply.status(400).send({
        success: false,
        error: err instanceof Error ? err.message : "Failed to process submission.",
      });
    }
  }

  /**
   * GET /api/v1/exams/:id/paper
   * Sanitized question delivery without answer keys or formula hints.
   */
  async getExamPaper(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id: examId } = request.params as { id: string };
      const paper = await this.cacheService.getSanitizedExamPaper(examId);
      return reply.status(200).send({
        success: true,
        data: paper,
      });
    } catch (err) {
      return reply.status(404).send({
        success: false,
        error: err instanceof Error ? err.message : "Exam paper not found.",
      });
    }
  }

  /**
   * POST /api/v1/exams/:id/prewarm
   * Pre-warms exam in L1 memory and L2 Redis 15 minutes before exam.
   */
  async prewarmExam(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id: examId } = request.params as { id: string };
      const paper = await this.cacheService.prewarmExam(examId);
      return reply.status(200).send({
        success: true,
        message: "Exam paper pre-warmed successfully in memory and Redis.",
        examId: paper.examId,
        totalQuestions: paper.questions.length,
      });
    } catch (err) {
      return reply.status(400).send({
        success: false,
        error: err instanceof Error ? err.message : "Failed to prewarm exam.",
      });
    }
  }
}
