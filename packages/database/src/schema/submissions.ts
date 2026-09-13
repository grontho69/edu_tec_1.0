import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { exams } from "./exams";
import { users } from "./users";
import { questions } from "./questions";

export const submissionStatusEnum = pgEnum("submission_status", [
  "IN_PROGRESS",
  "SUBMITTED",
  "EVALUATED",
]);

export const examSubmissions = pgTable(
  "exam_submissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    examId: uuid("exam_id")
      .references(() => exams.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    totalScore: numeric("total_score", { precision: 6, scale: 2 }).default("0.00").notNull(),
    totalAttempted: integer("total_attempted").default(0).notNull(),
    totalCorrect: integer("total_correct").default(0).notNull(),
    totalWrong: integer("total_wrong").default(0).notNull(),
    totalUnanswered: integer("total_unanswered").default(0).notNull(),
    accuracyRate: numeric("accuracy_rate", { precision: 5, scale: 2 }).default("0.00").notNull(),
    timeTakenSeconds: integer("time_taken_seconds").default(0).notNull(),
    status: submissionStatusEnum("status").default("SUBMITTED").notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    // High-concurrency leaderboard composite index: exam_submissions(exam_id, total_score DESC, time_taken_seconds ASC)
    index("exam_submissions_leaderboard_idx").on(
      table.examId,
      table.totalScore.desc(),
      table.timeTakenSeconds.asc()
    ),
    index("exam_submissions_user_id_idx").on(table.userId),
  ]
);

export const submissionAnswers = pgTable(
  "submission_answers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    submissionId: uuid("submission_id")
      .references(() => examSubmissions.id, { onDelete: "cascade" })
      .notNull(),
    questionId: uuid("question_id")
      .references(() => questions.id, { onDelete: "cascade" })
      .notNull(),
    selectedOptionId: varchar("selected_option_id", { length: 10 }),
    isCorrect: boolean("is_correct").default(false).notNull(),
    marksAwarded: numeric("marks_awarded", { precision: 6, scale: 2 }).default("0.00").notNull(),
    timeSpentSeconds: integer("time_spent_seconds").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("submission_answers_submission_id_idx").on(table.submissionId),
    index("submission_answers_question_id_idx").on(table.questionId),
  ]
);

export type ExamSubmissionRecord = typeof examSubmissions.$inferSelect;
export type NewExamSubmissionRecord = typeof examSubmissions.$inferInsert;
export type SubmissionAnswerRecord = typeof submissionAnswers.$inferSelect;
export type NewSubmissionAnswerRecord = typeof submissionAnswers.$inferInsert;
