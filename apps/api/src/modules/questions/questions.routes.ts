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

    const { questions, subjects, chapters, topics } = await import("@admission-engine/database");
    const { eq, and } = await import("drizzle-orm");

    const conditions = [eq(questions.isActive, true)];
    if (query.subjectId) conditions.push(eq(questions.subjectId, parseInt(query.subjectId, 10)));
    if (query.chapterId) conditions.push(eq(questions.chapterId, parseInt(query.chapterId, 10)));
    if (query.topicId) conditions.push(eq(questions.topicId, parseInt(query.topicId, 10)));
    if ((query as any).subjectCode) {
      conditions.push(eq(subjects.code, (query as any).subjectCode.toUpperCase()));
    }

    const limit = Math.min(parseInt(query.limit || "100", 10), 1000);
    const offset = parseInt(query.offset || "0", 10);

    const rows = await db
      .select({
        id: questions.id,
        tenantId: questions.tenantId,
        subjectId: questions.subjectId,
        subjectCode: subjects.code,
        subjectName: subjects.name,
        chapterId: questions.chapterId,
        chapterName: chapters.name,
        topicId: questions.topicId,
        topicName: topics.name,
        questionText: questions.questionText,
        questionType: questions.questionType,
        options: questions.options,
        correctOptionId: questions.correctOptionId,
        explanation: questions.explanation,
        marks: questions.marks,
        negativeMarks: questions.negativeMarks,
        difficulty: questions.difficulty,
        universityTags: questions.universityTags,
        isActive: questions.isActive,
      })
      .from(questions)
      .leftJoin(subjects, eq(questions.subjectId, subjects.id))
      .leftJoin(chapters, eq(questions.chapterId, chapters.id))
      .leftJoin(topics, eq(questions.topicId, topics.id))
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
