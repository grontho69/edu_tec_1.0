import {
  check,
  index,
  integer,
  numeric,
  pgTable,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { topics } from "./taxonomy";

export const userTopicMetrics = pgTable(
  "user_topic_metrics",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    topicId: integer("topic_id")
      .references(() => topics.id, { onDelete: "cascade" })
      .notNull(),
    totalAttempted: integer("total_attempted").default(0).notNull(),
    totalCorrect: integer("total_correct").default(0).notNull(),
    accuracyRate: numeric("accuracy_rate", { precision: 5, scale: 2 })
      .default("0.00")
      .notNull(),
    masteryScore: numeric("mastery_score", { precision: 5, scale: 2 })
      .default("0.00")
      .notNull(),
    lastAttemptedAt: timestamp("last_attempted_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    // Composite index on user_topic_metrics(user_id, topic_id)
    index("user_topic_metrics_user_topic_idx").on(table.userId, table.topicId),
    unique("user_topic_metrics_user_topic_unique").on(table.userId, table.topicId),
    // Strict CHECK constraint enforcing accuracy_rate <= 100.00 and >= 0.00
    check(
      "user_topic_metrics_accuracy_check",
      sql`${table.accuracyRate} >= 0.00 AND ${table.accuracyRate} <= 100.00`
    ),
    // Strict CHECK constraint enforcing mastery_score <= 100.00 and >= 0.00
    check(
      "user_topic_metrics_mastery_check",
      sql`${table.masteryScore} >= 0.00 AND ${table.masteryScore} <= 100.00`
    ),
  ]
);

export type UserTopicMetricRecord = typeof userTopicMetrics.$inferSelect;
export type NewUserTopicMetricRecord = typeof userTopicMetrics.$inferInsert;
