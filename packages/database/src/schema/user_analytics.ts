import {
  check,
  integer,
  numeric,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

export const userAnalytics = pgTable(
  "user_analytics",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull()
      .unique(),
    totalExamsTaken: integer("total_exams_taken").default(0).notNull(),
    totalQuestionsAttempted: integer("total_questions_attempted").default(0).notNull(),
    totalQuestionsCorrect: integer("total_questions_correct").default(0).notNull(),
    overallAccuracy: numeric("overall_accuracy", { precision: 5, scale: 2 })
      .default("0.00")
      .notNull(),
    totalStudyTimeSeconds: integer("total_study_time_seconds").default(0).notNull(),
    streakDays: integer("streak_days").default(0).notNull(),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    check(
      "user_analytics_accuracy_check",
      sql`${table.overallAccuracy} >= 0.00 AND ${table.overallAccuracy} <= 100.00`
    ),
  ]
);

export type UserAnalyticsRecord = typeof userAnalytics.$inferSelect;
export type NewUserAnalyticsRecord = typeof userAnalytics.$inferInsert;
