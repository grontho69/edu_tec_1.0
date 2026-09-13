import type { FastifyInstance } from "fastify";
import type { DatabaseInstance } from "@admission-engine/database";
import type { IRedisClient } from "./redis.service";
import { defaultRedisClient } from "./redis.service";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { createAuthMiddleware } from "./auth.middleware";

export interface AuthRoutesOptions {
  db: DatabaseInstance;
  redisClient?: IRedisClient;
}

export async function authRoutes(app: FastifyInstance, opts: AuthRoutesOptions) {
  const redis = opts.redisClient || defaultRedisClient;
  const authService = new AuthService({
    db: opts.db,
    redis,
  });

  const controller = new AuthController(authService);
  const { requireAuth } = createAuthMiddleware({ redisClient: redis });

  // 1. Passwordless SMS OTP Endpoints (Bangladeshi numbers: +8801XXXXXXXXX)
  app.post("/auth/send-otp", async (req, rep) => controller.sendOtp(req, rep));
  app.post("/auth/verify-otp", async (req, rep) => controller.verifyOtp(req, rep));

  // 2. Google OAuth 2.0 Endpoint
  app.post("/auth/google", async (req, rep) => controller.googleAuth(req, rep));

  // 3. Passwordless Email Magic Link Endpoints
  app.post("/auth/magic-link", async (req, rep) => controller.magicLink(req, rep));
  app.post("/auth/verify-magic-link", async (req, rep) => controller.verifyMagicLink(req, rep));

  // 4. Authenticated profile endpoint
  app.get("/auth/me", { preHandler: [requireAuth] }, async (req, rep) => controller.me(req, rep));
}
