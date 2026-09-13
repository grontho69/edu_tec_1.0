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

      const job = {
        ticketId,
        examId,
        userId,
        answers: body.answers,
        clientSubmittedAt: body.clientSubmittedAt,
      };

      const isServerlessDirect =
        process.env["SERVERLESS_DIRECT_EVAL"] === "true" ||
        process.env["VERCEL"] === "1" ||
        request.headers["x-serverless-eval"] === "true";

      if (isServerlessDirect && typeof this.queue.processDirect === "function") {
        const result = await this.queue.processDirect(job);
        return reply.status(202).send({
          status: "EVALUATED",
          trackingTicket: ticketId,
          message: "Submission evaluated immediately (Serverless execution mode).",
          result: {
            submissionId: result.submissionId,
            rawScore: result.rawScore,
            compositeScore: result.compositeScore,
            totalCorrect: result.totalCorrect,
            totalWrong: result.totalWrong,
          },
        });
      }

      // Push to non-blocking submission queue
      await this.queue.push(job);

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

  /**
   * POST /api/v1/exams/worker/process
   * Upstash QStash or Serverless HTTP webhook trigger for decoupled background grading.
   */
  async processWebhookJob(request: FastifyRequest, reply: FastifyReply) {
    try {
      const webhookSecret = process.env["QSTASH_SECRET"] || process.env["WORKER_SECRET"];
      if (webhookSecret) {
        const headerSecret = request.headers["x-worker-secret"] || request.headers["upstash-signature"];
        if (headerSecret !== webhookSecret) {
          return reply.status(401).send({ error: "Unauthorized webhook caller" });
        }
      }

      const body = request.body as any;
      if (!body || !body.examId || !body.answers) {
        return reply.status(400).send({ error: "Invalid webhook job payload" });
      }

      const job = {
        ticketId: body.ticketId || crypto.randomUUID(),
        examId: body.examId,
        userId: body.userId || "55555555-5555-5555-5555-555555555555",
        answers: body.answers,
        clientSubmittedAt: body.clientSubmittedAt || new Date().toISOString(),
      };

      const result =
        typeof this.queue.processDirect === "function"
          ? await this.queue.processDirect(job)
          : await this.queue.push(job);

      return reply.status(200).send({
        success: true,
        message: "Job evaluated via serverless HTTP webhook successfully",
        result,
      });
    } catch (err) {
      return reply.status(500).send({
        success: false,
        error: err instanceof Error ? err.message : "Failed to process webhook job",
      });
    }
  }
}
