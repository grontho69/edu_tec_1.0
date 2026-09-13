import type { IRedisClient } from "./redis.service";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export interface TwoTierOtpRateLimitResult {
  allowed: boolean;
  reason?: "PHONE_LIMIT_EXCEEDED" | "IP_LIMIT_EXCEEDED";
  message?: string;
  retryAfterSeconds?: number;
}

export class SlidingWindowRateLimiter {
  constructor(private redis: IRedisClient) {}

  /**
   * Evaluates a sliding window rate limit for an arbitrary key using Redis sorted sets.
   *
   * @param key Redis key identifying the subject (e.g. `ratelimit:otp:phone:+88017...`)
   * @param limit Maximum allowed events within the sliding window
   * @param windowSeconds Window length in seconds (e.g. 900 for 15 minutes)
   */
  async checkLimit(
    key: string,
    limit: number,
    windowSeconds: number
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;

    // 1. Remove entries older than the current sliding window
    await this.redis.zremrangebyscore(key, 0, windowStart);

    // 2. Count requests currently within the sliding window
    const currentCount = await this.redis.zcard(key);

    if (currentCount >= limit) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: windowSeconds,
      };
    }

    // 3. Register current event with timestamp score and unique member value
    const uniqueMember = `${now}:${Math.random().toString(36).slice(2, 9)}`;
    await this.redis.zadd(key, now, uniqueMember);

    // 4. Set TTL to keep Redis memory bounded
    await this.redis.expire(key, windowSeconds);

    return {
      allowed: true,
      remaining: limit - (currentCount + 1),
      retryAfterSeconds: 0,
    };
  }

  /**
   * Two-tier SMS OTP Rate Limiter (Sms Toll Fraud / Pumping Attack Prevention):
   * - Max 3 requests per phone per 15 minutes (900 seconds)
   * - Max 5 requests per IP per 15 minutes (900 seconds)
   */
  async checkOtpRateLimits(
    normalizedPhone: string,
    ipAddress: string,
    customLimits?: { phoneLimit?: number; ipLimit?: number; windowSeconds?: number }
  ): Promise<TwoTierOtpRateLimitResult> {
    const windowSecs = customLimits?.windowSeconds ?? 15 * 60; // 15 minutes (900s)
    const phoneLimit = customLimits?.phoneLimit ?? 3; // max 3 per phone
    const ipLimit = customLimits?.ipLimit ?? 5; // max 5 per IP

    const phoneKey = `ratelimit:otp:phone:${normalizedPhone}`;
    const ipKey = `ratelimit:otp:ip:${ipAddress}`;

    // 1. Check Phone Rate Limit
    const phoneResult = await this.checkLimit(phoneKey, phoneLimit, windowSecs);
    if (!phoneResult.allowed) {
      return {
        allowed: false,
        reason: "PHONE_LIMIT_EXCEEDED",
        message: `Too many OTP requests for this phone number. Please try again after 15 minutes.`,
        retryAfterSeconds: phoneResult.retryAfterSeconds,
      };
    }

    // 2. Check IP Rate Limit
    const ipResult = await this.checkLimit(ipKey, ipLimit, windowSecs);
    if (!ipResult.allowed) {
      return {
        allowed: false,
        reason: "IP_LIMIT_EXCEEDED",
        message: `Too many OTP requests from this IP address. Please try again after 15 minutes.`,
        retryAfterSeconds: ipResult.retryAfterSeconds,
      };
    }

    return {
      allowed: true,
    };
  }

  /**
   * Free-tier Email Magic Link Rate Limiter:
   * - Max 2 requests per email per 10 minutes (600 seconds)
   */
  async checkMagicLinkRateLimit(
    email: string,
    limit = 2,
    windowSeconds = 10 * 60
  ): Promise<RateLimitResult> {
    const key = `ratelimit:email:${email.toLowerCase().trim()}`;
    return this.checkLimit(key, limit, windowSeconds);
  }
}
