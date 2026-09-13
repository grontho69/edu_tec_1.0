import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import {
  createDatabaseContext,
  type DatabaseContext,
  type DatabaseInstance,
} from "@admission-engine/database";
import { taxonomyRoutes } from "./modules/taxonomy/taxonomy.routes";
import { questionsRoutes } from "./modules/questions/questions.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { adminRoutes } from "./modules/admin/admin.routes";
import { examsRoutes } from "./modules/exams/exams.routes";
import {
  defaultRedisClient,
  type IRedisClient,
} from "./modules/auth/redis.service";
import type { ISubmissionQueue } from "./modules/exams/exam-submission.queue";
import type { ExamCacheService } from "./modules/exams/exam-cache.service";

export interface BuildAppOptions {
  db?: DatabaseInstance;
  dbContext?: DatabaseContext;
  redisClient?: IRedisClient;
  submissionQueue?: ISubmissionQueue;
  examCacheService?: ExamCacheService;
  logger?: boolean;
}

export async function buildApp(options: BuildAppOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: options.logger ?? false,
  });

  await app.register(cors, {
    origin: true,
  });

  const dbContext = options.dbContext || (options.db ? undefined : createDatabaseContext());
  const db = options.db || dbContext?.db;

  if (!db) {
    throw new Error("Database instance could not be initialized");
  }

  const redisClient = options.redisClient || defaultRedisClient;

  // Register API v1 routes
  await app.register(
    async (v1) => {
      await v1.register(authRoutes, { db, redisClient });
      await v1.register(adminRoutes, { db, redisClient });
      await v1.register(examsRoutes, {
        db,
        redisClient,
        queue: options.submissionQueue,
        cacheService: options.examCacheService,
      });
      await v1.register(taxonomyRoutes, { db });
      await v1.register(questionsRoutes, { db });
    },
    { prefix: "/api/v1" }
  );

  // Health check
  app.get("/health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));

  return app;
}
