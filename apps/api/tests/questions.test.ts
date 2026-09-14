import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import {
  createDatabaseContext,
  closeDatabaseConnections,
  type DatabaseContext,
  seed,
} from "@admission-engine/database";
import { buildApp } from "../src/app";
import {
  fisherYatesShuffle,
  questionsService,
} from "../src/modules/questions/questions.service";

describe("Question Delivery Engine & Sanitization API Test Suite", () => {
  let app: FastifyInstance;
  let ctx: DatabaseContext;

  beforeAll(async () => {
    // 1. Initialize isolated in-memory Postgres WASM database and seed data
    ctx = createDatabaseContext({ usePglite: true });
    await seed(ctx);

    // 2. Build Fastify API instance connected to the test database
    app = await buildApp({ db: ctx.db });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await closeDatabaseConnections();
  });

  it("1. Assert that GET /api/v1/questions/filter never outputs correctOption or explanation in JSON response keys", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/questions/filter?limit=10",
    });

    expect(response.statusCode).toBe(200);
    const json = JSON.parse(response.payload);

    expect(json.success).toBe(true);
    expect(json.questions.length).toBeGreaterThan(0);

    // Deeply inspect every question and option in payload
    for (const q of json.questions) {
      // Direct property leak assertions
      expect(q).not.toHaveProperty("correctOption");
      expect(q).not.toHaveProperty("correct_option");
      expect(q).not.toHaveProperty("correctOptionId");
      expect(q).not.toHaveProperty("correct_option_id");
      expect(q).not.toHaveProperty("explanation");
      expect(q).not.toHaveProperty("formulaCheat");
      expect(q).not.toHaveProperty("formula_cheat");
      expect(q).not.toHaveProperty("latexFormulas");
      expect(q).not.toHaveProperty("latex_formulas");

      // Verify essential public properties exist
      expect(q).toHaveProperty("id");
      expect(q).toHaveProperty("questionText");
      expect(q).toHaveProperty("options");
      expect(q).toHaveProperty("difficulty");
      expect(q).toHaveProperty("marks");

      // Verify options are sanitized
      for (const opt of q.options) {
        expect(opt).toHaveProperty("key");
        expect(opt).toHaveProperty("text");
        expect(opt).not.toHaveProperty("isCorrect");
        expect(opt).not.toHaveProperty("is_correct");
      }
    }

    // Verify raw JSON string does not contain 'correctOption' or 'correct_option'
    const rawPayload = response.payload;
    expect(rawPayload).not.toContain("correctOption");
    expect(rawPayload).not.toContain("correct_option");
    expect(rawPayload).not.toContain("correctOptionId");
    expect(rawPayload).not.toContain("correct_option_id");
  });

  it("2. Mock 5,000 question IDs and verify the sampling function executes in under 20ms", () => {
    // Generate 5,000 simulated UUIDs
    const mockIds: string[] = [];
    for (let i = 0; i < 5000; i++) {
      mockIds.push(`mock-uuid-${i.toString().padStart(6, "0")}`);
    }

    // Benchmark in-memory Fisher-Yates shuffle sampling
    const start = performance.now();
    const shuffled = fisherYatesShuffle(mockIds);
    const sampled = shuffled.slice(0, 30);
    const elapsed = performance.now() - start;

    expect(sampled).toHaveLength(30);
    expect(new Set(sampled).size).toBe(30); // All sampled IDs must be unique
    expect(elapsed).toBeLessThan(20); // Strict requirement: < 20ms
  });

  it("3. Assembles balanced practice test matching target difficulty quotas without leakage", async () => {
    // Call POST /api/v1/questions/assemble
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/questions/assemble",
      payload: {
        action: "ASSEMBLE_PRACTICE",
        topicIds: [1, 2, 3, 4, 5],
        totalCount: 5,
        difficultyRatio: {
          EASY: 0.2, // 1 Easy
          MEDIUM: 0.6, // 3 Medium
          HARD: 0.2, // 1 Hard
        },
      },
    });

    expect(response.statusCode).toBe(200);
    const json = JSON.parse(response.payload);

    expect(json.success).toBe(true);
    expect(json.data.action).toBe("ASSEMBLE_PRACTICE");
    expect(json.data.totalCount).toBe(5);
    expect(json.data.questions).toHaveLength(5);

    // Verify sanitized outputs
    for (const q of json.data.questions) {
      expect(q).not.toHaveProperty("correctOptionId");
      expect(q).not.toHaveProperty("explanation");
    }

    // Verify quotas match
    const easy = json.data.questions.filter((q: any) => q.difficulty === "EASY").length;
    const medium = json.data.questions.filter((q: any) => q.difficulty === "MEDIUM").length;
    const hard = json.data.questions.filter((q: any) => q.difficulty === "HARD").length;

    expect(easy).toBe(1);
    expect(medium).toBe(3);
    expect(hard).toBe(1);
  });

  it("4. Relaxes tags progressively when filters are over-restrictive (Risk 2 Prevention)", async () => {
    // Filter with a tag that doesn't exist
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/questions/filter?tags=NON_EXISTENT_TAG_999&limit=5",
    });

    expect(response.statusCode).toBe(200);
    const json = JSON.parse(response.payload);

    // Fallback should have kicked in to provide 5 questions from available pool
    expect(json.success).toBe(true);
    expect(json.questions.length).toBe(5);
  });

  it("5. Caches hierarchical taxonomy tree in memory and invalidates on demand", async () => {
    // 1st request: Cache miss (fetches from database)
    const res1 = await app.inject({
      method: "GET",
      url: "/api/v1/taxonomy",
    });
    expect(res1.statusCode).toBe(200);
    const json1 = JSON.parse(res1.payload);
    expect(json1.success).toBe(true);
    expect(json1.data.length).toBeGreaterThanOrEqual(4); // Physics, Chemistry, Math, Biology
    expect(json1.data[0]).toHaveProperty("chapters");
    expect(json1.data[0].chapters[0]).toHaveProperty("topics");

    // 2nd request: In-memory cache hit
    const res2 = await app.inject({
      method: "GET",
      url: "/api/v1/taxonomy",
    });
    const json2 = JSON.parse(res2.payload);
    expect(json2.meta.isCached).toBe(true);

    // 3rd request: Invalidate cache
    const invRes = await app.inject({
      method: "POST",
      url: "/api/v1/taxonomy/invalidate",
    });
    expect(invRes.statusCode).toBe(200);
    const invJson = JSON.parse(invRes.payload);
    expect(invJson.success).toBe(true);
  });
});
