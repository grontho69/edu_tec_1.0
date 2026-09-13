import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { questions } from "./questions";

export const mistakeBook = pgTable(
  "mistake_book",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    questionId: uuid("question_id")
      .references(() => questions.id, { onDelete: "cascade" })
      .notNull(),
    mistakeCount: integer("mistake_count").default(1).notNull(),
    isMastered: boolean("is_mastered").default(false).notNull(),
    lastAttemptedAt: timestamp("last_attempted_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    // Fast unmastered mistake revision compound index: mistake_book(user_id, is_mastered, last_attempted_at DESC)
    index("mistake_book_user_mastered_last_attempt_idx").on(
      table.userId,
      table.isMastered,
      table.lastAttemptedAt.desc()
    ),
    unique("mistake_book_user_question_unique").on(table.userId, table.questionId),
  ]
);

export type MistakeBookRecord = typeof mistakeBook.$inferSelect;
export type NewMistakeBookRecord = typeof mistakeBook.$inferInsert;
