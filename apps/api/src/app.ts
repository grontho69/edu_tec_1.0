import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import {
  createDatabaseContext,
  type DatabaseContext,
  type DatabaseInstance,
} from "@admission-engine/database";
import { taxonomyRoutes } from "./modules/taxonomy/taxonomy.routes";
import { questionsRoutes } from "./modules/questions/questions.routes";

export interface BuildAppOptions {
  db?: DatabaseInstance;
  dbContext?: DatabaseContext;
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

  // Register API v1 routes
  await app.register(
    async (v1) => {
      await v1.register(taxonomyRoutes, { db });
      await v1.register(questionsRoutes, { db });
    },
    { prefix: "/api/v1" }
  );

  // Health check
  app.get("/health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));

  return app;
}
