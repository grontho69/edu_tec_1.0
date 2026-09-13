import type { DatabaseInstance } from "@admission-engine/database";
import { examEvents, type EvaluatedExamResult } from "../exams/exam-worker";
import { AnalyticsService } from "./analytics.service";
import { MistakeBookService } from "./mistake-book.service";

export interface AnalyticsSubscriberOptions {
  analyticsService?: AnalyticsService;
  mistakeBookService?: MistakeBookService;
}

/**
 * Initializes the background event listener for EXAM_EVALUATED events.
 * Executes metric recalculations, topic updates, and mistake book ingestion asynchronously.
 * Guarantees zero blocking on the student's exam grading response pipeline.
 */
export function initAnalyticsSubscriber(
  db: DatabaseInstance,
  options?: AnalyticsSubscriberOptions
): () => void {
  const analyticsService = options?.analyticsService || new AnalyticsService(db);
  const mistakeBookService =
    options?.mistakeBookService || new MistakeBookService(db, analyticsService);

  const handler = async (result: EvaluatedExamResult) => {
    try {
      const {
        userId,
        totalCorrect,
        totalWrong,
        timeTakenSeconds,
        topicBreakdown,
        missedQuestionIds,
      } = result;

      // 1. Asynchronously recalculate student overall progression in user_analytics
      const attempted = totalCorrect + totalWrong;
      await analyticsService.updateUserMetrics(userId, {
        questionsAttempted: attempted,
        questionsCorrect: totalCorrect,
        studyTimeSeconds: timeTakenSeconds,
      });

      // 2. Asynchronously recalculate topic rolling metrics in user_topic_metrics
      if (topicBreakdown && topicBreakdown.length > 0) {
        await analyticsService.updateTopicBreakdown(userId, topicBreakdown);
      }

      // 3. Atomically upsert incorrect and skipped questions into mistake_book
      if (missedQuestionIds && missedQuestionIds.length > 0) {
        await mistakeBookService.ingestExamMistakes(userId, missedQuestionIds);
      }
    } catch (err) {
      // STRICT NON-BLOCKING GUARANTEE: Never crash or propagate errors back to submission engine
      console.error("[AnalyticsSubscriber] Error processing EXAM_EVALUATED event:", err);
    }
  };

  examEvents.on("EXAM_EVALUATED", handler);

  // Return unsubscribe handler to ensure zero memory leaks during test suites
  return () => {
    examEvents.off("EXAM_EVALUATED", handler);
  };
}
