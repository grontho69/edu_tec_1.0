import { sql } from "drizzle-orm";
import type { DatabaseInstance } from "./client";
import { userAnalytics, userTopicMetrics } from "./schema/index";

export interface AtomicAnalyticsIncrementParams {
  userId: string;
  examsTakenIncrement?: number;
  questionsAttemptedIncrement?: number;
  questionsCorrectIncrement?: number;
  studyTimeSecondsIncrement?: number;
  lastActiveAt?: Date;
}

/**
 * Executes a deadlock-free atomic PostgreSQL upsert for student progression analytics.
 * Guarantees zero race conditions during concurrent exam submissions.
 */
export async function atomicIncrementUserAnalytics(
  db: DatabaseInstance,
  params: AtomicAnalyticsIncrementParams
) {
  const {
    userId,
    examsTakenIncrement = 1,
    questionsAttemptedIncrement = 0,
    questionsCorrectIncrement = 0,
    studyTimeSecondsIncrement = 0,
    lastActiveAt = new Date(),
  } = params;

  return db
    .insert(userAnalytics)
    .values({
      userId,
      totalExamsTaken: examsTakenIncrement,
      totalQuestionsAttempted: questionsAttemptedIncrement,
      totalQuestionsCorrect: questionsCorrectIncrement,
      overallAccuracy:
        questionsAttemptedIncrement > 0
          ? ((questionsCorrectIncrement / questionsAttemptedIncrement) * 100).toFixed(2)
          : "0.00",
      totalStudyTimeSeconds: studyTimeSecondsIncrement,
      streakDays: 1,
      lastActiveAt,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: userAnalytics.userId,
      set: {
        totalExamsTaken: sql`${userAnalytics.totalExamsTaken} + ${examsTakenIncrement}`,
        totalQuestionsAttempted: sql`${userAnalytics.totalQuestionsAttempted} + ${questionsAttemptedIncrement}`,
        totalQuestionsCorrect: sql`${userAnalytics.totalQuestionsCorrect} + ${questionsCorrectIncrement}`,
        overallAccuracy: sql`CASE 
          WHEN (${userAnalytics.totalQuestionsAttempted} + ${questionsAttemptedIncrement}) > 0 
          THEN ROUND(((${userAnalytics.totalQuestionsCorrect} + ${questionsCorrectIncrement})::numeric / 
                      (${userAnalytics.totalQuestionsAttempted} + ${questionsAttemptedIncrement})::numeric) * 100, 2)
          ELSE 0.00 
        END`,
        totalStudyTimeSeconds: sql`${userAnalytics.totalStudyTimeSeconds} + ${studyTimeSecondsIncrement}`,
        lastActiveAt,
        updatedAt: new Date(),
      },
    })
    .returning();
}

export interface AtomicTopicMetricIncrementParams {
  userId: string;
  topicId: number;
  attemptedIncrement: number;
  correctIncrement: number;
  lastAttemptedAt?: Date;
}

/**
 * Atomically upserts topic progression metrics with bounds protection (0.00 - 100.00).
 */
export async function atomicIncrementUserTopicMetrics(
  db: DatabaseInstance,
  params: AtomicTopicMetricIncrementParams
) {
  const {
    userId,
    topicId,
    attemptedIncrement,
    correctIncrement,
    lastAttemptedAt = new Date(),
  } = params;

  const initialAccuracy =
    attemptedIncrement > 0
      ? Math.min(100, Math.max(0, (correctIncrement / attemptedIncrement) * 100)).toFixed(2)
      : "0.00";

  return db
    .insert(userTopicMetrics)
    .values({
      userId,
      topicId,
      totalAttempted: attemptedIncrement,
      totalCorrect: correctIncrement,
      accuracyRate: initialAccuracy,
      masteryScore: initialAccuracy,
      lastAttemptedAt,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [userTopicMetrics.userId, userTopicMetrics.topicId],
      set: {
        totalAttempted: sql`${userTopicMetrics.totalAttempted} + ${attemptedIncrement}`,
        totalCorrect: sql`${userTopicMetrics.totalCorrect} + ${correctIncrement}`,
        accuracyRate: sql`CASE 
          WHEN (${userTopicMetrics.totalAttempted} + ${attemptedIncrement}) > 0 
          THEN LEAST(100.00, GREATEST(0.00, ROUND(((${userTopicMetrics.totalCorrect} + ${correctIncrement})::numeric / 
                      (${userTopicMetrics.totalAttempted} + ${attemptedIncrement})::numeric) * 100, 2)))
          ELSE 0.00 
        END`,
        masteryScore: sql`CASE 
          WHEN (${userTopicMetrics.totalAttempted} + ${attemptedIncrement}) > 0 
          THEN LEAST(100.00, GREATEST(0.00, ROUND(((${userTopicMetrics.totalCorrect} + ${correctIncrement})::numeric / 
                      (${userTopicMetrics.totalAttempted} + ${attemptedIncrement})::numeric) * 100 * 
                      LEAST(1.0, (${userTopicMetrics.totalAttempted} + ${attemptedIncrement})::numeric / 20.0), 2)))
          ELSE 0.00 
        END`,
        lastAttemptedAt,
        updatedAt: new Date(),
      },
    })
    .returning();
}
