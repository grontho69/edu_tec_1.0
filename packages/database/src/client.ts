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

let globalContext: DatabaseContext | null = null;

export interface CreateClientOptions {
  connectionString?: string;
  usePglite?: boolean;
  pgliteDataDir?: string;
}

export function createDatabaseClient(options: CreateClientOptions = {}): DatabaseInstance {
  const ctx = createDatabaseContext(options);
  return ctx.db;
}

export function createDatabaseContext(options: CreateClientOptions = {}): DatabaseContext {
  const connectionString = options.connectionString || process.env["DATABASE_URL"];

  if (options.usePglite || (!connectionString && !process.env["DATABASE_URL"])) {
    const pglite = new PGlite(options.pgliteDataDir);
    const db = drizzlePglite(pglite, { schema });
    return {
      db,
      clientType: "pglite",
      pglite,
    };
  }

  const pool = new pg.Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
  const db = drizzleNodePg(pool, { schema });
  return {
    db,
    clientType: "node-postgres",
    pool,
  };
}

export function getDatabaseContext(): DatabaseContext {
  if (!globalContext) {
    globalContext = createDatabaseContext();
  }
  return globalContext;
}

export function getDatabaseClient(): DatabaseInstance {
  return getDatabaseContext().db;
}

export async function closeDatabaseConnections(): Promise<void> {
  if (globalContext) {
    if (globalContext.pool) {
      await globalContext.pool.end();
    }
    if (globalContext.pglite) {
      await globalContext.pglite.close();
    }
    globalContext = null;
  }
}
