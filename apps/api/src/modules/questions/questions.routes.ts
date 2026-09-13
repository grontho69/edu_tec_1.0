import type { FastifyInstance } from "fastify";
import type { DatabaseInstance } from "@admission-engine/database";
import { questionsController } from "./questions.controller";

export async function questionsRoutes(app: FastifyInstance, opts: { db: DatabaseInstance }) {
  const { db } = opts;

  // GET /api/v1/questions/filter
  app.get("/questions/filter", async (req, rep) => {
    return questionsController.filterQuestions(req, rep, db);
  });

  // POST /api/v1/questions/assemble
  app.post("/questions/assemble", async (req, rep) => {
    return questionsController.assemblePracticeTest(req, rep, db);
  });
}
