import { buildApp } from "./app";

const PORT = parseInt(process.env["PORT"] || "3000", 10);
const HOST = process.env["HOST"] || "0.0.0.0";

async function startServer() {
  const app = await buildApp({ logger: true });

  try {
    const address = await app.listen({ port: PORT, host: HOST });
    app.log.info(`🚀 Question Delivery Engine API listening at ${address}`);
  } catch (err) {
    app.log.error(err, "Failed to start server");
    process.exit(1);
  }
}

startServer();
