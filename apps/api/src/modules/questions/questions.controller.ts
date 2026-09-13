import type { FastifyRequest, FastifyReply } from "fastify";
import type { DatabaseInstance } from "@admission-engine/database";
import {
  QuestionFilterQuerySchema,
  AssemblePracticeInputSchema,
} from "./questions.dto";
import { questionsService } from "./questions.service";

export class QuestionsController {
  /**
   * GET /api/v1/questions/filter
   * Fast question filtering with anti-repetition and zero SQL RANDOM().
   */
  async filterQuestions(
    request: FastifyRequest,
    reply: FastifyReply,
    db: DatabaseInstance
  ) {
    try {
      const query = QuestionFilterQuerySchema.parse(request.query);
      const { questions, count } = await questionsService.filterQuestions(db, query);

      return reply.status(200).send({
        success: true,
        count,
        questions,
      });
    } catch (err) {
      request.log.error(err, "Failed to filter questions");
      return reply.status(400).send({
        success: false,
        error: err instanceof Error ? err.message : "Invalid filter parameters",
      });
    }
  }

  /**
   * POST /api/v1/questions/assemble
   * Balanced practice test assembly with progressive fallback.
   */
  async assemblePracticeTest(
    request: FastifyRequest,
    reply: FastifyReply,
    db: DatabaseInstance
  ) {
    try {
      const input = AssemblePracticeInputSchema.parse(request.body);
      const result = await questionsService.assemblePracticeTest(db, input);

      return reply.status(200).send({
        success: true,
        data: result,
      });
    } catch (err) {
      request.log.error(err, "Failed to assemble practice test");
      return reply.status(400).send({
        success: false,
        error: err instanceof Error ? err.message : "Invalid assembly parameters",
      });
    }
  }
}

export const questionsController = new QuestionsController();
