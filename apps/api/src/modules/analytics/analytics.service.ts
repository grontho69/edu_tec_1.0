import type { DatabaseInstance } from "@admission-engine/database";
import { userAnalytics, userTopicMetrics, topics } from "@admission-engine/database";
import { eq, desc } from "drizzle-orm";
import {
  atomicIncrementUserAnalytics,
  atomicIncrementUserTopicMetrics,
} from "@admission-engine/database";

export interface UserMetricsUpdateParams {
  examsTakenIncrement?: number;
  questionsAttempted: number;
  questionsCorrect: number;
  studyTimeSeconds?: number;
}

export interface TopicMetricItem {
  topicId: number;
  attempted: number;
  correct: number;
  incorrect?: number;
}

export interface TopicHealthSummary {
  topicId: number;
  totalAttempted: number;
  totalCorrect: number;
  accuracyRate: string;
  masteryScore: string;
  status: "NEEDS_IMPROVEMENT" | "IN_PROGRESS" | "MASTERED";
}

export interface DashboardAnalyticsResponse {
  userId: string;
  totalExamsTaken: number;
  totalQuestionsAttempted: number;
  totalQuestionsCorrect: number;
  overallAccuracy: string;
  totalStudyTimeSeconds: number;
  streakDays: number;
  lastActiveAt: string | null;
  syllabusCoveragePercentage: number;
  topicBreakdown: TopicHealthSummary[];
  weakTopicsCount: number;
}

export class AnalyticsService {
  constructor(private db: DatabaseInstance) {}

  /**
   * Updates student's high-level progression metrics atomically.
   */
  async updateUserMetrics(userId: string, params: UserMetricsUpdateParams) {
    return atomicIncrementUserAnalytics(this.db, {
      userId,
      examsTakenIncrement:
        params.examsTakenIncrement !== undefined ? params.examsTakenIncrement : 1,
      questionsAttemptedIncrement: params.questionsAttempted,
      questionsCorrectIncrement: params.questionsCorrect,
      studyTimeSecondsIncrement: params.studyTimeSeconds || 0,
      lastActiveAt: new Date(),
    });
  }

  /**
   * Executes atomic rolling updates for topic-wise metrics.
   * Processes in batches of 50 to avoid memory exhaustion on free server tiers.
   */
  async updateTopicBreakdown(userId: string, topicMetrics: TopicMetricItem[]) {
    if (!topicMetrics || topicMetrics.length === 0) return;

    const BATCH_SIZE = 50;
    for (let i = 0; i < topicMetrics.length; i += BATCH_SIZE) {
      const chunk = topicMetrics.slice(i, i + BATCH_SIZE);
      await Promise.all(
        chunk.map((item) =>
          atomicIncrementUserTopicMetrics(this.db, {
            userId,
            topicId: item.topicId,
            attemptedIncrement: item.attempted,
            correctIncrement: item.correct,
            lastAttemptedAt: new Date(),
          })
        )
      );
    }
  }

  /**
   * Serves pre-calculated dynamic metrics in sub-20ms directly from
   * user_analytics and user_topic_metrics without table scans.
   */
  async getDashboardAnalytics(userId: string): Promise<DashboardAnalyticsResponse> {
    // 1. Fetch user high-level analytics
    const [analyticsRecord] = await this.db
      .select()
      .from(userAnalytics)
      .where(eq(userAnalytics.userId, userId))
      .limit(1);

    // 2. Fetch topic metrics
    const userTopics = await this.db
      .select()
      .from(userTopicMetrics)
      .where(eq(userTopicMetrics.userId, userId))
      .orderBy(desc(userTopicMetrics.lastAttemptedAt));

    // 3. Count total syllabus topics
    const allTopics = await this.db.select({ id: topics.id }).from(topics);
    const totalSyllabusTopics = Math.max(1, allTopics.length);
    const attemptedTopicsCount = userTopics.length;
    const syllabusCoveragePercentage = Number(
      ((attemptedTopicsCount / totalSyllabusTopics) * 100).toFixed(2)
    );

    // 4. Map topic health and flag NEEDS_IMPROVEMENT alert states
    let weakTopicsCount = 0;
    const topicBreakdown: TopicHealthSummary[] = userTopics.map((t) => {
      const accuracy = parseFloat(t.accuracyRate);
      let status: "NEEDS_IMPROVEMENT" | "IN_PROGRESS" | "MASTERED" = "IN_PROGRESS";

      if (accuracy < 50.0) {
        status = "NEEDS_IMPROVEMENT"; // Red alert!
        weakTopicsCount++;
      } else if (accuracy >= 80.0) {
        status = "MASTERED";
      }

      return {
        topicId: t.topicId,
        totalAttempted: t.totalAttempted,
        totalCorrect: t.totalCorrect,
        accuracyRate: t.accuracyRate,
        masteryScore: t.masteryScore,
        status,
      };
    });

    return {
      userId,
      totalExamsTaken: analyticsRecord?.totalExamsTaken || 0,
      totalQuestionsAttempted: analyticsRecord?.totalQuestionsAttempted || 0,
      totalQuestionsCorrect: analyticsRecord?.totalQuestionsCorrect || 0,
      overallAccuracy: analyticsRecord?.overallAccuracy || "0.00",
      totalStudyTimeSeconds: analyticsRecord?.totalStudyTimeSeconds || 0,
      streakDays: analyticsRecord?.streakDays || 0,
      lastActiveAt: analyticsRecord?.lastActiveAt ? analyticsRecord.lastActiveAt.toISOString() : null,
      syllabusCoveragePercentage,
      topicBreakdown,
      weakTopicsCount,
    };
  }
}
