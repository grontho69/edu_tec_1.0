import type { FastifyRequest, FastifyReply } from "fastify";
import type { IRedisClient } from "../auth/redis.service";
import { defaultRedisClient } from "../auth/redis.service";
import { LeaderboardQuerySchema } from "./exams.dto";

export class LeaderboardController {
  constructor(private redis: IRedisClient = defaultRedisClient) {}

  /**
   * GET /api/v1/exams/:id/rank
   * Queries Redis ZREVRANK in O(1) to return exact rank and percentile.
   * Formula: ((Total - Rank) / Total) * 100
   */
  async getRank(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id: examId } = request.params as { id: string };
      const query = request.query as { userId?: string };

      // Target student ID
      const userId = query.userId || request.user?.userId;
      if (!userId) {
        return reply.status(400).send({
          success: false,
          error: "Missing userId in query parameters or authentication context.",
        });
      }

      const leaderboardKey = `exam:${examId}:leaderboard`;

      // Upstash command budgeted: O(1) rank query
      const rankIdx = await this.redis.zrevrank(leaderboardKey, userId);
      if (rankIdx === null) {
        return reply.status(404).send({
          success: false,
          error: "Student has not submitted this exam or is unranked.",
        });
      }

      const totalParticipants = await this.redis.zcard(leaderboardKey);
      const score = await this.redis.zscore(leaderboardKey, userId);

      // Human rank (1-indexed)
      const rank = rankIdx + 1;

      // Percentile formula: ((Total - Rank) / Total) * 100
      const percentile =
        totalParticipants > 0
          ? Number((((totalParticipants - rank) / totalParticipants) * 100).toFixed(2))
          : 100;

      return reply.status(200).send({
        success: true,
        examId,
        userId,
        rank,
        totalParticipants,
        score,
        percentile,
      });
    } catch (err) {
      return reply.status(400).send({
        success: false,
        error: err instanceof Error ? err.message : "Failed to retrieve student rank.",
      });
    }
  }

  /**
   * GET /api/v1/exams/:id/leaderboard
   * Returns paginated top participants in descending order from Redis ZREVRANGE.
   */
  async getLeaderboard(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id: examId } = request.params as { id: string };
      const query = LeaderboardQuerySchema.parse(request.query);

      const leaderboardKey = `exam:${examId}:leaderboard`;
      const totalParticipants = await this.redis.zcard(leaderboardKey);

      const rawEntries = await this.redis.zrevrange(
        leaderboardKey,
        query.offset,
        query.offset + query.limit - 1,
        true
      );

      const leaderboard = rawEntries.map((entry: any, index: number) => ({
        rank: query.offset + index + 1,
        userId: entry.member,
        score: entry.score,
      }));

      return reply.status(200).send({
        success: true,
        examId,
        totalParticipants,
        limit: query.limit,
        offset: query.offset,
        leaderboard,
      });
    } catch (err) {
      return reply.status(400).send({
        success: false,
        error: err instanceof Error ? err.message : "Failed to retrieve leaderboard.",
      });
    }
  }
}
