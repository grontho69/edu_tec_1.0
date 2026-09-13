import path from "node:path";
import { fileURLToPath } from "node:url";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { migrate as migrateNodePg } from "drizzle-orm/node-postgres/migrator";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import {
  createDatabaseContext,
  closeDatabaseConnections,
  type DatabaseContext,
  type NodePgDb,
  type PgliteDb,
} from "./client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const MIGRATIONS_FOLDER = path.resolve(__dirname, "../drizzle");

/**
 * Executes Drizzle database migrations against PostgreSQL or PGlite with zero 'any'.
 */
export async function runMigrations(
  ctx?: DatabaseContext,
  migrationsFolder = MIGRATIONS_FOLDER
): Promise<void> {
  const context = ctx || createDatabaseContext();

  if (context.clientType === "pglite") {
    await migratePglite(context.db as PgliteDb as unknown as PgliteDatabase<Record<string, unknown>>, {
      migrationsFolder,
    });
  } else {
    await migrateNodePg(context.db as NodePgDb as unknown as NodePgDatabase<Record<string, unknown>>, {
      migrationsFolder,
    });
  }
}

// If executed directly from CLI: tsx src/migrate.ts
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  runMigrations()
    .then(async () => {
      console.log("✓ Migrations executed successfully.");
      await closeDatabaseConnections();
      process.exit(0);
    })
    .catch(async (err: unknown) => {
      console.error("✗ Migration failed:", err);
      await closeDatabaseConnections();
      process.exit(1);
    });
}
