import type { FastifyRequest, FastifyReply } from "fastify";
import { ZodError } from "zod";
import {
  SendOtpInputSchema,
  VerifyOtpInputSchema,
  GoogleAuthInputSchema,
  MagicLinkRequestSchema,
  VerifyMagicLinkSchema,
} from "./auth.dto";
import { AuthService, RateLimitError, AuthenticationError } from "./auth.service";

export class AuthController {
  constructor(private authService: AuthService) {}

  private extractClientIp(request: FastifyRequest): string {
    const xForwardedFor = request.headers["x-forwarded-for"];
    if (typeof xForwardedFor === "string") {
      const firstIp = xForwardedFor.split(",")[0]?.trim();
      if (firstIp) return firstIp;
    }
    return request.ip || "127.0.0.1";
  }

  /**
   * POST /api/v1/auth/send-otp
   */
  async sendOtp(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = SendOtpInputSchema.parse(request.body);
      const ip = this.extractClientIp(request);

      const result = await this.authService.sendOtp(body.phoneNumber, ip);
      return reply.status(200).send(result);
    } catch (err) {
      if (err instanceof RateLimitError) {
        return reply
          .status(429)
          .header("Retry-After", err.retryAfterSeconds)
          .send({
            success: false,
            error: err.message,
            retryAfterSeconds: err.retryAfterSeconds,
            reason: err.reason,
          });
      }

      if (err instanceof ZodError) {
        return reply.status(400).send({
          success: false,
          error: err.errors[0]?.message || "Invalid input format.",
        });
      }

      return reply.status(400).send({
        success: false,
        error: err instanceof Error ? err.message : "Failed to send OTP.",
      });
    }
  }

  /**
   * POST /api/v1/auth/verify-otp
   */
  async verifyOtp(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = VerifyOtpInputSchema.parse(request.body);
      const result = await this.authService.verifyOtp(
        body.phoneNumber,
        body.otp,
        body.deviceFingerprint
      );
      return reply.status(200).send(result);
    } catch (err) {
      if (err instanceof AuthenticationError) {
        return reply.status(400).send({
          success: false,
          error: err.message,
        });
      }

      if (err instanceof ZodError) {
        return reply.status(400).send({
          success: false,
          error: err.errors[0]?.message || "Invalid input format.",
        });
      }

      return reply.status(400).send({
        success: false,
        error: err instanceof Error ? err.message : "Verification failed.",
      });
    }
  }

  /**
   * POST /api/v1/auth/google
   */
  async googleAuth(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = GoogleAuthInputSchema.parse(request.body);
      const result = await this.authService.authenticateWithGoogle(
        body.idToken,
        body.deviceFingerprint
      );
      return reply.status(200).send(result);
    } catch (err) {
      if (err instanceof ZodError) {
        return reply.status(400).send({
          success: false,
          error: err.errors[0]?.message || "Invalid input.",
        });
      }

      return reply.status(400).send({
        success: false,
        error: err instanceof Error ? err.message : "Google authentication failed.",
      });
    }
  }

  /**
   * POST /api/v1/auth/magic-link
   */
  async magicLink(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = MagicLinkRequestSchema.parse(request.body);
      const result = await this.authService.sendMagicLink(body.email);
      return reply.status(200).send(result);
    } catch (err) {
      if (err instanceof RateLimitError) {
        return reply.status(429).send({
          success: false,
          error: err.message,
          retryAfterSeconds: err.retryAfterSeconds,
        });
      }

      if (err instanceof ZodError) {
        return reply.status(400).send({
          success: false,
          error: err.errors[0]?.message || "Invalid email address.",
        });
      }

      return reply.status(400).send({
        success: false,
        error: err instanceof Error ? err.message : "Failed to dispatch magic link.",
      });
    }
  }

  /**
   * POST /api/v1/auth/verify-magic-link
   */
  async verifyMagicLink(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = VerifyMagicLinkSchema.parse(request.body);
      const result = await this.authService.verifyMagicLink(
        body.token,
        body.deviceFingerprint
      );
      return reply.status(200).send(result);
    } catch (err) {
      if (err instanceof AuthenticationError) {
        return reply.status(400).send({
          success: false,
          error: err.message,
        });
      }

      if (err instanceof ZodError) {
        return reply.status(400).send({
          success: false,
          error: err.errors[0]?.message || "Invalid token.",
        });
      }

      return reply.status(400).send({
        success: false,
        error: err instanceof Error ? err.message : "Magic link verification failed.",
      });
    }
  }

  /**
   * GET /api/v1/auth/me
   */
  async me(request: FastifyRequest, reply: FastifyReply) {
    return reply.status(200).send({
      success: true,
      user: request.user,
    });
  }
}
