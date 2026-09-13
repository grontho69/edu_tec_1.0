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
import { analyticsRoutes } from "./modules/analytics/analytics.routes";
import { initAnalyticsSubscriber } from "./modules/analytics/analytics.subscriber";
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
  enableAnalyticsSubscriber?: boolean;
  logger?: boolean;
}

export async function buildApp(options: BuildAppOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: options.logger ?? false,
  });

  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin) {
        cb(null, true);
        return;
      }
      const isAllowed =
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:") ||
        origin.endsWith(".vercel.app") ||
        (process.env["CORS_ALLOWED_ORIGINS"] &&
          process.env["CORS_ALLOWED_ORIGINS"]
            .split(",")
            .map((s) => s.trim())
            .includes(origin));

      if (isAllowed || process.env["NODE_ENV"] !== "production") {
        cb(null, true);
      } else {
        cb(null, true);
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-idempotency-key",
      "X-Idempotency-Key",
      "x-serverless-eval",
      "X-Serverless-Eval",
      "x-worker-secret",
      "upstash-signature",
      "x-requested-with",
    ],
    credentials: true,
    maxAge: 86400,
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
      await v1.register(analyticsRoutes, { db });
    },
    { prefix: "/api/v1" }
  );

  // Initialize dynamic analytics event subscriber
  if (options.enableAnalyticsSubscriber !== false) {
    initAnalyticsSubscriber(db);
  }

  // Health check
  app.get("/health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));

  // Root endpoint: API Status & Directory
  app.get("/", async () => ({
    name: "Admission Engine REST API",
    status: "online",
    version: "1.0.0",
    message: "Question Delivery Engine API is operational.",
    endpoints: {
      health: "/health",
      taxonomy: "/api/v1/taxonomy",
      questions: "/api/v1/questions",
      exams: "/api/v1/exams",
      analytics: "/api/v1/analytics",
      auth: "/api/v1/auth",
    },
    timestamp: new Date().toISOString(),
  }));

  // Global error handler
  app.setErrorHandler((error: any, _request, reply) => {
    app.log.error(error);
    const statusCode = error?.statusCode || 500;
    return reply.status(statusCode).send({
      success: false,
      error: error?.name || "InternalServerError",
      message: error?.message || "An internal error occurred on the API server.",
    });
  });

  return app;
}
