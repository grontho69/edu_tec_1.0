import { buildApp } from "./app";
import { createDatabaseContext, seed } from "@admission-engine/database";
import { validateServerEnv } from "@admission-engine/types";

const env = validateServerEnv();
const PORT = env.PORT;
const HOST = env.HOST;

async function startServer() {
  const dbContext = createDatabaseContext();

  try {
    if (dbContext.clientType === "pglite") {
      console.log("📦 In-memory PGlite detected (no DATABASE_URL set). Initializing schema and seed data...");
      await seed(dbContext);
    } else {
      console.log("🐘 PostgreSQL database detected. Verifying tables and schema initialization...");
      try {
        await seed(dbContext);
        console.log("✓ Database schema and seed data verified successfully.");
      } catch (seedErr) {
        console.warn("ℹ️ Schema initialization notice (tables may already exist or migrations applied):", (seedErr as Error)?.message || seedErr);
      }
    }
  } catch (dbErr) {
    console.warn("⚠️ Initial database check warning:", (dbErr as Error)?.message || dbErr);
  }

  const app = await buildApp({ dbContext, db: dbContext.db, logger: true });

  try {
    const address = await app.listen({ port: PORT, host: HOST });
    app.log.info(`🚀 Question Delivery Engine API listening at ${address}`);
  } catch (err) {
    app.log.error(err, "Failed to start server");
    process.exit(1);
  }
}

startServer();
