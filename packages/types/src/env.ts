import { z } from "zod";

/**
 * Server Environment Variables Schema
 */
export const ServerEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default("0.0.0.0"),
  DATABASE_URL: z.string().optional(),
  DATABASE_POOL_MAX: z.coerce.number().optional(),
  JWT_SECRET: z.string().min(8).default("admission-engine-dev-secret-key-secure-2026"),
  GEMINI_API_KEY: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  QSTASH_SECRET: z.string().optional(),
  WORKER_SECRET: z.string().optional(),
  SERVERLESS_DIRECT_EVAL: z.string().optional(),
  VERCEL: z.string().optional(),
  CORS_ALLOWED_ORIGINS: z.string().optional(),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;

/**
 * Client Environment Variables Schema
 */
export const ClientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().optional(),
  API_INTERNAL_URL: z.string().optional(),
});

export type ClientEnv = z.infer<typeof ClientEnvSchema>;

declare const process: { env?: Record<string, string | undefined> } | undefined;
declare const console: { warn: (...args: any[]) => void; error: (...args: any[]) => void };

/**
 * Validates runtime environment variables and logs actionable diagnostics.
 */
export function validateServerEnv(
  env: Record<string, string | undefined> = typeof process !== "undefined" && process.env ? process.env : {}
): ServerEnv {
  const result = ServerEnvSchema.safeParse(env);

  if (!result.success) {
    const errorDetails = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    const message = `❌ Invalid Server Environment Variables:\n${errorDetails}`;
    if (env["NODE_ENV"] === "production") {
      throw new Error(message);
    } else {
      console.warn(`⚠️ [Env Validation Warning]:\n${errorDetails}`);
      return ServerEnvSchema.parse({});
    }
  }

  // Production check for database
  if (result.data.NODE_ENV === "production" && !result.data.DATABASE_URL) {
    console.warn(
      "⚠️ [Env Warning] Production mode detected without DATABASE_URL. Falling back to embedded PGlite, but external PostgreSQL (Neon/Supabase) is strongly recommended."
    );
  }

  return result.data;
}

export function validateClientEnv(
  env: Record<string, string | undefined> = typeof process !== "undefined" && process.env ? process.env : {}
): ClientEnv {
  const result = ClientEnvSchema.safeParse(env);
  if (!result.success) {
    console.warn("⚠️ Invalid Client Environment Variables:", result.error.format());
    return {};
  }
  return result.data;
}
