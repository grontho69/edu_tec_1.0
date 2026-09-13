/**
 * Explicit index metadata and definitions for the high-concurrency Admission Exam Engine.
 *
 * Index Directory:
 * 1. questions.university_tags -> GIN index ('questions_university_tags_gin_idx')
 *    Enables sub-millisecond filtering by university admission tags (e.g. BUET, DU, DMC).
 *
 * 2. exam_submissions(exam_id, total_score DESC, time_taken_seconds ASC) -> Composite index ('exam_submissions_leaderboard_idx')
 *    Powers real-time admission exam leaderboards without runtime in-memory sorting or table scans.
 *
 * 3. mistake_book(user_id, is_mastered, last_attempted_at DESC) -> Compound index ('mistake_book_user_mastered_last_attempt_idx')
 *    Accelerates retrieval of unmastered mistakes for spaced-repetition student revision sessions.
 *
 * 4. user_topic_metrics(user_id, topic_id) -> Composite index ('user_topic_metrics_user_topic_idx')
 *    Supports lock-free concurrent upserts and instant topic dashboard load times.
 */

export const INDEX_NAMES = {
  QUESTIONS_UNIVERSITY_TAGS_GIN: "questions_university_tags_gin_idx",
  EXAM_SUBMISSIONS_LEADERBOARD: "exam_submissions_leaderboard_idx",
  MISTAKE_BOOK_USER_MASTERED: "mistake_book_user_mastered_last_attempt_idx",
  USER_TOPIC_METRICS_USER_TOPIC: "user_topic_metrics_user_topic_idx",
} as const;
