import { drizzle as drizzleNodePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite, type PgliteDatabase } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";
import * as schema from "./schema/index";

export type NodePgDb = NodePgDatabase<typeof schema>;
export type PgliteDb = PgliteDatabase<typeof schema>;
export type DatabaseInstance = NodePgDb | PgliteDb;

export type DbClientType = "node-postgres" | "pglite";

export interface DatabaseContext {
  db: DatabaseInstance;
  clientType: DbClientType;
  pool?: pg.Pool;
  pglite?: PGlite;
}

const globalForDb = globalThis as unknown as {
  admissionDbCtx?: DatabaseContext | undefined;
};

export interface CreateClientOptions {
  connectionString?: string;
  usePglite?: boolean;
  pgliteDataDir?: string;
  poolMax?: number;
}

export function createDatabaseClient(options: CreateClientOptions = {}): DatabaseInstance {
  const ctx = createDatabaseContext(options);
  return ctx.db;
}

export function createDatabaseContext(options: CreateClientOptions = {}): DatabaseContext {
  // If no custom overrides are passed and singleton exists, return it
  if (!options.connectionString && !options.usePglite && !options.pgliteDataDir && globalForDb.admissionDbCtx) {
    return globalForDb.admissionDbCtx;
  }

  const connectionString = options.connectionString || process.env["DATABASE_URL"];

  if (options.usePglite || (!connectionString && !process.env["DATABASE_URL"])) {
    const pglite = new PGlite(options.pgliteDataDir);
    const db = drizzlePglite(pglite, { schema });
    const ctx: DatabaseContext = {
      db,
      clientType: "pglite",
      pglite,
    };
    if (process.env["NODE_ENV"] !== "production") {
      globalForDb.admissionDbCtx = ctx;
    }
    return ctx;
  }

  const isServerless =
    process.env["VERCEL"] === "1" ||
    process.env["AWS_LAMBDA_FUNCTION_NAME"] !== undefined ||
    process.env["NETLIFY"] === "true";

  // Serverless pool tuning: keep connections per container minimal (1-5) to avoid exhausting free-tier Postgres limits
  const maxPoolConnections =
    options.poolMax ||
    (process.env["DATABASE_POOL_MAX"]
      ? parseInt(process.env["DATABASE_POOL_MAX"], 10)
      : isServerless
      ? 1
      : 5);

  const connStr = connectionString || "";
  const requiresSsl =
    connStr.includes("sslmode=require") ||
    connStr.includes("supabase.co") ||
    connStr.includes("neon.tech") ||
    process.env["NODE_ENV"] === "production";

  const pool = new pg.Pool({
    connectionString: connStr,
    max: maxPoolConnections,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
    maxUses: isServerless ? 100 : 7500,
    ssl: requiresSsl ? { rejectUnauthorized: false } : undefined,
  });

  const db = drizzleNodePg(pool, { schema });
  const ctx: DatabaseContext = {
    db,
    clientType: "node-postgres",
    pool,
  };

  if (process.env["NODE_ENV"] !== "production" || isServerless) {
    globalForDb.admissionDbCtx = ctx;
  }

  return ctx;
}

export function getDatabaseContext(): DatabaseContext {
  if (!globalForDb.admissionDbCtx) {
    globalForDb.admissionDbCtx = createDatabaseContext();
  }
  return globalForDb.admissionDbCtx;
}

export function getDatabaseClient(): DatabaseInstance {
  return getDatabaseContext().db;
}

export async function closeDatabaseConnections(): Promise<void> {
  if (globalForDb.admissionDbCtx) {
    if (globalForDb.admissionDbCtx.pool) {
      await globalForDb.admissionDbCtx.pool.end();
    }
    if (globalForDb.admissionDbCtx.pglite) {
      await globalForDb.admissionDbCtx.pglite.close();
    }
    globalForDb.admissionDbCtx = undefined;
  }
}
