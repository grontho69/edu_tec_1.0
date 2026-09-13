import type { FastifyInstance } from "fastify";
import type { DatabaseInstance } from "@admission-engine/database";
import { questions } from "@admission-engine/database";
import type { IRedisClient } from "../auth/redis.service";
import { defaultRedisClient } from "../auth/redis.service";
import { createAuthMiddleware } from "../auth/auth.middleware";

export interface AdminRoutesOptions {
  db: DatabaseInstance;
  redisClient?: IRedisClient;
}

export async function adminRoutes(app: FastifyInstance, opts: AdminRoutesOptions) {
  const { db, redisClient = defaultRedisClient } = opts;
  const { requireAuth, requireRole } = createAuthMiddleware({ redisClient });

  // Guard all admin routes with strict SUPER_ADMIN role requirement
  app.addHook("preHandler", requireAuth);
  app.addHook("preHandler", requireRole(["SUPER_ADMIN"]));

  /**
   * GET /api/v1/admin/questions
   * Administrative view of questions including full unredacted metadata.
   */
  app.get("/admin/questions", async (_request, reply) => {
    const allQuestions = await db.select().from(questions).limit(20);
    return reply.status(200).send({
      success: true,
      count: allQuestions.length,
      data: allQuestions,
    });
  });
}
