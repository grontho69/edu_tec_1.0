import type { FastifyInstance } from "fastify";
import type { DatabaseInstance } from "@admission-engine/database";
import { questionsController } from "./questions.controller";

export async function questionsRoutes(app: FastifyInstance, opts: { db: DatabaseInstance }) {
  const { db } = opts;

  // GET /api/v1/questions/filter
  app.get("/questions/filter", async (req, rep) => {
    return questionsController.filterQuestions(req, rep, db);
  });

  // GET /api/v1/questions/feed
  app.get("/questions/feed", async (req, rep) => {
    const query = req.query as {
      subjectId?: string;
      chapterId?: string;
      topicId?: string;
      limit?: string;
      offset?: string;
    };

    const { questions } = await import("@admission-engine/database");
    const { eq, and } = await import("drizzle-orm");

    const conditions = [eq(questions.isActive, true)];
    if (query.subjectId) conditions.push(eq(questions.subjectId, parseInt(query.subjectId, 10)));
    if (query.chapterId) conditions.push(eq(questions.chapterId, parseInt(query.chapterId, 10)));
    if (query.topicId) conditions.push(eq(questions.topicId, parseInt(query.topicId, 10)));

    const limit = Math.min(parseInt(query.limit || "50", 10), 100);
    const offset = parseInt(query.offset || "0", 10);

    const rows = await db
      .select()
      .from(questions)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset);

    return rep.status(200).send({
      success: true,
      count: rows.length,
      data: rows,
    });
  });

  // POST /api/v1/questions/assemble
  app.post("/questions/assemble", async (req, rep) => {
    return questionsController.assemblePracticeTest(req, rep, db);
  });
}
