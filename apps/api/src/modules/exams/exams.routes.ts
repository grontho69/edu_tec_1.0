import type { FastifyInstance } from "fastify";
import type { DatabaseInstance } from "@admission-engine/database";
import type { IRedisClient } from "../auth/redis.service";
import { defaultRedisClient } from "../auth/redis.service";
import { ExamCacheService } from "./exam-cache.service";
import { ExamWorker } from "./exam-worker";
import { InMemorySubmissionQueue, type ISubmissionQueue } from "./exam-submission.queue";
import { ExamsController } from "./exams.controller";
import { LeaderboardController } from "./leaderboard.controller";

export interface ExamsRoutesOptions {
  db: DatabaseInstance;
  redisClient?: IRedisClient | undefined;
  queue?: ISubmissionQueue | undefined;
  cacheService?: ExamCacheService | undefined;
}

export async function examsRoutes(app: FastifyInstance, opts: ExamsRoutesOptions) {
  const redis = opts.redisClient || defaultRedisClient;
  const cacheService = opts.cacheService || new ExamCacheService(opts.db, redis);
  const worker = new ExamWorker(opts.db, redis, cacheService);
  const queue = opts.queue || new InMemorySubmissionQueue(worker);

  const examsController = new ExamsController(redis, queue, cacheService);
  const leaderboardController = new LeaderboardController(redis);

  // 1. Asynchronous Submission Ingestion Endpoint (< 150ms HTTP 202 Accepted)
  app.post("/exams/:id/submit", async (req, rep) => examsController.submitExam(req, rep));

  // 2. Real-time O(1) Student Rank & Percentile Endpoint
  app.get("/exams/:id/rank", async (req, rep) => leaderboardController.getRank(req, rep));

  // 3. Real-time ZSET Leaderboard
  app.get("/exams/:id/leaderboard", async (req, rep) => leaderboardController.getLeaderboard(req, rep));

  // 4. Sanitized Question Paper Delivery
  app.get("/exams/:id/paper", async (req, rep) => examsController.getExamPaper(req, rep));

  // 5. Pre-warm Exam Paper in L1 Memory & L2 Redis
  app.post("/exams/:id/prewarm", async (req, rep) => examsController.prewarmExam(req, rep));

  // 6. Upstash QStash / Serverless HTTP Webhook Worker Endpoint
  app.post("/exams/worker/process", async (req, rep) => examsController.processWebhookJob(req, rep));
}
