import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import {
  createDatabaseContext,
  closeDatabaseConnections,
  type DatabaseContext,
  seed,
  users,
  userAnalytics,
} from "@admission-engine/database";
import { buildApp } from "../src/app";
import { InMemoryRedisClient } from "../src/modules/auth/redis.service";
import { defaultSmsProvider } from "../src/modules/auth/sms-provider.service";
import { defaultJwtService } from "../src/modules/auth/jwt.service";

describe("Authentication & Session Management Service Test Suite", () => {
  let app: FastifyInstance;
  let ctx: DatabaseContext;
  let redisClient: InMemoryRedisClient;

  beforeAll(async () => {
    // 1. Initialize isolated in-memory Postgres WASM database and seed data
    ctx = createDatabaseContext({ usePglite: true });
    await seed(ctx);

    // 2. Initialize isolated Redis instance
    redisClient = new InMemoryRedisClient();

    // 3. Build Fastify API instance connected to the test database and redis
    app = await buildApp({ db: ctx.db, redisClient });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await closeDatabaseConnections();
  });

  beforeEach(async () => {
    await redisClient.flushall();
    defaultSmsProvider.clear();
  });

  // =========================================================================
  // 1. Two-Tier Rate Limiting & SMS Toll Fraud Protection
  // =========================================================================
  it("1. Dispatch 4 consecutive OTP requests from the same IP; assert the 4th call receives HTTP 429", async () => {
    const testPhone = "01712345678";
    const testIp = "103.145.23.10";

    // Calls 1, 2, and 3 should succeed (within 3 per phone limit)
    for (let i = 1; i <= 3; i++) {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/send-otp",
        headers: { "x-forwarded-for": testIp },
        payload: { phoneNumber: testPhone },
      });

      expect(response.statusCode).toBe(200);
      const json = JSON.parse(response.payload);
      expect(json.success).toBe(true);
      expect(json.message).toBe("OTP sent.");
      expect(json.retryAfterSeconds).toBe(60);
    }

    // 4th call from the same IP and phone exceeds phone rate limit (max 3/15m) -> HTTP 429
    const fourthResponse = await app.inject({
      method: "POST",
      url: "/api/v1/auth/send-otp",
      headers: { "x-forwarded-for": testIp },
      payload: { phoneNumber: testPhone },
    });

    expect(fourthResponse.statusCode).toBe(429);
    const fourthJson = JSON.parse(fourthResponse.payload);
    expect(fourthJson.success).toBe(false);
    expect(fourthJson.error).toContain("Too many OTP requests");
    expect(fourthResponse.headers).toHaveProperty("retry-after");
  });

  it("1b. Protects against SMS toll fraud / pumping attack across varying phone numbers from single IP (max 5 per IP)", async () => {
    const testIp = "182.16.100.5";

    // 5 calls to distinct phone numbers from the same IP
    for (let i = 1; i <= 5; i++) {
      const phone = `0171000000${i}`;
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/auth/send-otp",
        headers: { "x-forwarded-for": testIp },
        payload: { phoneNumber: phone },
      });
      expect(response.statusCode).toBe(200);
    }

    // 6th call from same IP (even with a 6th unique phone) must trigger IP limit -> 429
    const sixthResponse = await app.inject({
      method: "POST",
      url: "/api/v1/auth/send-otp",
      headers: { "x-forwarded-for": testIp },
      payload: { phoneNumber: "01710000006" },
    });

    expect(sixthResponse.statusCode).toBe(429);
    const json = JSON.parse(sixthResponse.payload);
    expect(json.reason).toBe("IP_LIMIT_EXCEEDED");
  });

  // =========================================================================
  // 2. Strict RBAC Enforcement: Students vs Super Admins
  // =========================================================================
  it("2. Send a request to an admin route with a student JWT; assert status code is 403 Forbidden", async () => {
    // Generate a valid student JWT
    const studentToken = defaultJwtService.sign({
      userId: "11111111-2222-3333-4444-555555555555",
      role: "STUDENT",
      targetUnit: "ENGINEERING",
      phone: "+8801711111111",
      deviceFingerprint: "test-device",
    });

    // Attempt to access restricted admin route
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/admin/questions",
      headers: {
        authorization: `Bearer ${studentToken}`,
      },
    });

    expect(response.statusCode).toBe(403);
    const json = JSON.parse(response.payload);
    expect(json.success).toBe(false);
    expect(json.error).toContain("Forbidden");
  });

  it("2b. Allows Super Admin with verified role claim to access admin endpoints", async () => {
    // Generate a valid super admin JWT
    const adminToken = defaultJwtService.sign({
      userId: "00000000-0000-0000-0000-000000000001",
      role: "SUPER_ADMIN",
      phone: "+8801700000000",
      deviceFingerprint: "admin-device",
    });

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/admin/questions",
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    });

    expect(response.statusCode).toBe(200);
    const json = JSON.parse(response.payload);
    expect(json.success).toBe(true);
    expect(json).toHaveProperty("data");
  });

  // =========================================================================
  // 3. Bangladeshi Phone Number Normalization & Validation
  // =========================================================================
  it("3. Strictly normalizes diverse Bangladeshi phone formats to +8801XXXXXXXXX and rejects invalid numbers", async () => {
    const validInputs = [
      { raw: "01712345678", expected: "+8801712345678" },
      { raw: "8801812345678", expected: "+8801812345678" },
      { raw: "+8801912345678", expected: "+8801912345678" },
      { raw: "008801512345678", expected: "+8801512345678" },
      { raw: "+88 01312-345678", expected: "+8801312345678" },
    ];

    for (const item of validInputs) {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/auth/send-otp",
        payload: { phoneNumber: item.raw },
      });
      expect(res.statusCode).toBe(200);

      // Verify that Redis key uses strictly normalized format
      const redisKey = `otp:${item.expected}`;
      const stored = await redisClient.get(redisKey);
      expect(stored).toBeDefined();
      expect(stored).not.toBeNull();
    }

    // Invalid phone numbers (non-BD, wrong length, invalid operator prefix)
    const invalidInputs = [
      "12345",
      "01212345678", // 012 is not a valid BD operator
      "+14155552671", // US number
      "abcdefghijk",
    ];

    for (const raw of invalidInputs) {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/auth/send-otp",
        payload: { phoneNumber: raw },
      });
      expect(res.statusCode).toBe(400);
      const json = JSON.parse(res.payload);
      expect(json.success).toBe(false);
      expect(json.error).toContain("Invalid");
    }
  });

  // =========================================================================
  // 4. Constant-Time OTP Verification, Dynamic Metric Seeding & Role Issuance
  // =========================================================================
  it("4. Constant-time OTP verification, dynamic user_analytics seeding, and student vs admin tokens", async () => {
    const studentPhone = "01799887766";
    const normalizedStudentPhone = "+8801799887766";

    // Request OTP
    const sendRes = await app.inject({
      method: "POST",
      url: "/api/v1/auth/send-otp",
      payload: { phoneNumber: studentPhone },
    });
    expect(sendRes.statusCode).toBe(200);

    const receivedOtp = defaultSmsProvider.getLastOtp(normalizedStudentPhone);
    expect(receivedOtp).toBeDefined();
    expect(receivedOtp).toMatch(/^\d{6}$/);

    // 4a. Verify with incorrect OTP -> fails with HTTP 400
    const failRes = await app.inject({
      method: "POST",
      url: "/api/v1/auth/verify-otp",
      payload: {
        phoneNumber: studentPhone,
        otp: "000000",
        deviceFingerprint: "browser-fp-1",
      },
    });
    expect(failRes.statusCode).toBe(400);
    expect(JSON.parse(failRes.payload).error).toBe("Invalid OTP code");

    // 4b. Verify with correct OTP -> succeeds
    const successRes = await app.inject({
      method: "POST",
      url: "/api/v1/auth/verify-otp",
      payload: {
        phoneNumber: studentPhone,
        otp: receivedOtp!,
        deviceFingerprint: "browser-fp-1",
      },
    });
    expect(successRes.statusCode).toBe(200);
    const successJson = JSON.parse(successRes.payload);

    expect(successJson.success).toBe(true);
    expect(successJson.token).toBeDefined();
    expect(successJson.user.role).toBe("STUDENT");
    expect(successJson.user.targetUnit).toBe("ENGINEERING");

    // 4c. Verify dynamic metric seeding: user_analytics row must be automatically initialized with zeroed counters
    const [analyticsRecord] = await ctx.db
      .select()
      .from(userAnalytics)
      .where(eq(userAnalytics.userId, successJson.user.id));

    expect(analyticsRecord).toBeDefined();
    expect(analyticsRecord?.totalExamsTaken).toBe(0);
    expect(analyticsRecord?.totalQuestionsAttempted).toBe(0);
    expect(analyticsRecord?.totalQuestionsCorrect).toBe(0);
    expect(analyticsRecord?.overallAccuracy).toBe("0.00");
    expect(analyticsRecord?.totalStudyTimeSeconds).toBe(0);
    expect(analyticsRecord?.streakDays).toBe(0);

    // 4d. Replay attack prevention: OTP key must be removed from Redis immediately
    const replayRes = await app.inject({
      method: "POST",
      url: "/api/v1/auth/verify-otp",
      payload: {
        phoneNumber: studentPhone,
        otp: receivedOtp!,
      },
    });
    expect(replayRes.statusCode).toBe(400);

    // 4e. Admin Phone login -> receives SUPER_ADMIN JWT
    const adminPhone = "+8801700000000";
    await app.inject({
      method: "POST",
      url: "/api/v1/auth/send-otp",
      payload: { phoneNumber: adminPhone },
    });
    const adminOtp = defaultSmsProvider.getLastOtp(adminPhone);

    const adminVerifyRes = await app.inject({
      method: "POST",
      url: "/api/v1/auth/verify-otp",
      payload: {
        phoneNumber: adminPhone,
        otp: adminOtp!,
        deviceFingerprint: "admin-laptop",
      },
    });

    expect(adminVerifyRes.statusCode).toBe(200);
    const adminJson = JSON.parse(adminVerifyRes.payload);
    expect(adminJson.user.role).toBe("SUPER_ADMIN");

    // Decode and verify JWT payload claims
    const decodedAdminPayload = defaultJwtService.verify(adminJson.token);
    expect(decodedAdminPayload.role).toBe("SUPER_ADMIN");
  });

  // =========================================================================
  // 5. Enforce Single-Device Active Sessions
  // =========================================================================
  it("5. Enforces single-device active sessions; logging into device B invalidates device A", async () => {
    const phone = "01755443322";
    const normalizedPhone = "+8801755443322";

    // 1. Device A logs in
    await app.inject({
      method: "POST",
      url: "/api/v1/auth/send-otp",
      payload: { phoneNumber: phone },
    });
    const otp1 = defaultSmsProvider.getLastOtp(normalizedPhone);

    const loginResA = await app.inject({
      method: "POST",
      url: "/api/v1/auth/verify-otp",
      payload: {
        phoneNumber: phone,
        otp: otp1!,
        deviceFingerprint: "device-iphone-13",
      },
    });
    const tokenA = JSON.parse(loginResA.payload).token;

    // Verify Device A can access protected /auth/me
    const meRes1 = await app.inject({
      method: "GET",
      url: "/api/v1/auth/me",
      headers: { authorization: `Bearer ${tokenA}` },
    });
    expect(meRes1.statusCode).toBe(200);

    // 2. User logs in on Device B
    await app.inject({
      method: "POST",
      url: "/api/v1/auth/send-otp",
      payload: { phoneNumber: phone },
    });
    const otp2 = defaultSmsProvider.getLastOtp(normalizedPhone);

    const loginResB = await app.inject({
      method: "POST",
      url: "/api/v1/auth/verify-otp",
      payload: {
        phoneNumber: phone,
        otp: otp2!,
        deviceFingerprint: "device-desktop-chrome",
      },
    });
    const tokenB = JSON.parse(loginResB.payload).token;

    // Device B is now active
    const meResB = await app.inject({
      method: "GET",
      url: "/api/v1/auth/me",
      headers: { authorization: `Bearer ${tokenB}` },
    });
    expect(meResB.statusCode).toBe(200);

    // 3. Device A attempts to use its token -> Session invalidated (HTTP 401)
    const meResAAfter = await app.inject({
      method: "GET",
      url: "/api/v1/auth/me",
      headers: { authorization: `Bearer ${tokenA}` },
    });
    expect(meResAAfter.statusCode).toBe(401);
    const jsonA = JSON.parse(meResAAfter.payload);
    expect(jsonA.code).toBe("SESSION_INVALIDATED");
  });

  // =========================================================================
  // 6. Google OAuth ID Token Authentication
  // =========================================================================
  it("6. Mock a Google ID token; assert a new user is created and a matching user_analytics record is initialized", async () => {
    // Generate a simulated Google JWT token payload
    const mockGoogleSub = `google_oauth_sub_${Date.now()}`;
    const mockGoogleEmail = `student_${Date.now()}@gmail.com`;

    const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64");
    const payload = Buffer.from(
      JSON.stringify({
        sub: mockGoogleSub,
        email: mockGoogleEmail,
        name: "Google Exam Taker",
        iss: "https://accounts.google.com",
      })
    ).toString("base64");
    const mockIdToken = `${header}.${payload}.mockSignature`;

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/auth/google",
      payload: {
        idToken: mockIdToken,
        deviceFingerprint: "pixel-7",
      },
    });

    expect(response.statusCode).toBe(200);
    const json = JSON.parse(response.payload);
    expect(json.success).toBe(true);
    expect(json.user.email).toBe(mockGoogleEmail);
    expect(json.user.role).toBe("STUDENT");
    expect(json.token).toBeDefined();

    // Verify user exists in database
    const [dbUser] = await ctx.db
      .select()
      .from(users)
      .where(eq(users.email, mockGoogleEmail));
    expect(dbUser).toBeDefined();
    expect(dbUser?.googleId).toBe(mockGoogleSub);

    // Verify user_analytics is atomically initialized with zeroed counters
    const [analytics] = await ctx.db
      .select()
      .from(userAnalytics)
      .where(eq(userAnalytics.userId, dbUser!.id));
    expect(analytics).toBeDefined();
    expect(analytics?.totalExamsTaken).toBe(0);
    expect(analytics?.overallAccuracy).toBe("0.00");
  });

  // =========================================================================
  // 7. Email Magic Link & Replay Protection
  // =========================================================================
  it("7. Attempt to verify an email magic token twice; assert the second attempt fails with HTTP 400", async () => {
    const testEmail = `magic_student_${Date.now()}@example.com`;

    // 1. Request magic link
    const magicRes = await app.inject({
      method: "POST",
      url: "/api/v1/auth/magic-link",
      payload: { email: testEmail },
    });

    expect(magicRes.statusCode).toBe(200);
    const magicJson = JSON.parse(magicRes.payload);
    expect(magicJson.success).toBe(true);
    expect(magicJson.token).toBeDefined();
    const token = magicJson.token;

    // 2. First verification attempt -> Success (200 OK)
    const verify1 = await app.inject({
      method: "POST",
      url: "/api/v1/auth/verify-magic-link",
      payload: { token, deviceFingerprint: "laptop" },
    });
    expect(verify1.statusCode).toBe(200);
    const verify1Json = JSON.parse(verify1.payload);
    expect(verify1Json.success).toBe(true);
    expect(verify1Json.user.email).toBe(testEmail);

    // 3. Second verification attempt with same token -> Fails with HTTP 400 (Atomic GETDEL replay protection)
    const verify2 = await app.inject({
      method: "POST",
      url: "/api/v1/auth/verify-magic-link",
      payload: { token, deviceFingerprint: "laptop" },
    });
    expect(verify2.statusCode).toBe(400);
    const verify2Json = JSON.parse(verify2.payload);
    expect(verify2Json.success).toBe(false);
    expect(verify2Json.error).toContain("Invalid or expired");
  });
});
