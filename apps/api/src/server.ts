import { buildApp } from "./app";
import { createDatabaseContext, seed } from "@admission-engine/database";
import { validateServerEnv } from "@admission-engine/types";

const env = validateServerEnv();
const PORT = env.PORT;
const HOST = env.HOST;

async function startServer() {
  const dbContext = createDatabaseContext();

  if (dbContext.clientType === "pglite") {
    console.log("📦 In-memory PGlite detected (no DATABASE_URL set). Initializing schema and seed data...");
    await seed(dbContext);
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
