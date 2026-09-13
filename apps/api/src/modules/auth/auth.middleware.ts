import type { FastifyRequest, FastifyReply } from "fastify";
import type { UserRole } from "@admission-engine/types";
import { JwtService, defaultJwtService, type JwtPayload } from "./jwt.service";
import type { IRedisClient } from "./redis.service";
import { defaultRedisClient } from "./redis.service";

declare module "fastify" {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

export interface AuthMiddlewareOptions {
  jwtService?: JwtService;
  redisClient?: IRedisClient;
}

export function createAuthMiddleware(options: AuthMiddlewareOptions = {}) {
  const jwt = options.jwtService || defaultJwtService;
  const redis = options.redisClient || defaultRedisClient;

  /**
   * Enforces valid Bearer JWT authentication and single-device active session validation.
   */
  const requireAuth = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.status(401).send({
        success: false,
        error: "Unauthorized: Missing or invalid Authorization header.",
      });
    }

    const token = authHeader.slice(7).trim();
    let payload: JwtPayload;

    try {
      payload = jwt.verify(token);
    } catch (err) {
      return reply.status(401).send({
        success: false,
        error: `Unauthorized: ${err instanceof Error ? err.message : "Invalid token."}`,
      });
    }

    // Enforce single-device active session if deviceFingerprint is present
    if (payload.deviceFingerprint && payload.userId) {
      try {
        const sessionKey = `session:user:${payload.userId}`;
        const activeFingerprint = await redis.get(sessionKey);

        if (activeFingerprint && activeFingerprint !== payload.deviceFingerprint) {
          return reply.status(401).send({
            success: false,
            error: "Session terminated: This account has been logged in from another device.",
            code: "SESSION_INVALIDATED",
          });
        }
      } catch (err) {
        request.log.warn(err, "Redis session verification check encountered an error");
      }
    }

    request.user = payload;
  };

  /**
   * Enforces strict Role-Based Access Control (RBAC).
   * Rejects unauthorized roles with HTTP 403 Forbidden.
   */
  const requireRole = (allowedRoles: UserRole[] | UserRole) => {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      // 1. Ensure user is authenticated
      if (!request.user) {
        await requireAuth(request, reply);
        if (reply.sent) return;
      }

      // 2. Check Role permissions
      if (!request.user || !roles.includes(request.user.role)) {
        return reply.status(403).send({
          success: false,
          error: "Forbidden: You do not have permission to access this resource.",
        });
      }
    };
  };

  /**
   * Pro Pass Subscription Gate.
   */
  const requireProPass = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      await requireAuth(request, reply);
      if (reply.sent) return;
    }

    // Super Admin has universal access
    if (request.user?.role === "SUPER_ADMIN") {
      return;
    }

    // Pro pass logic check (can be checked against user status / entitlements)
    const isProStudent = false; // Default until subscription pass is activated
    if (!isProStudent) {
      return reply.status(403).send({
        success: false,
        error: "Forbidden: Pro Pass subscription required to access this feature.",
        code: "PRO_PASS_REQUIRED",
      });
    }
  };

  return {
    requireAuth,
    requireRole,
    requireProPass,
  };
}

// Default export middlewares for convenience
export const { requireAuth, requireRole, requireProPass } = createAuthMiddleware();
