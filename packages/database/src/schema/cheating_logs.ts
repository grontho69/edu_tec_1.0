import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { exams } from "./exams";

export const infractionTypeEnum = pgEnum("infraction_type", [
  "TAB_BLUR",
  "FULLSCREEN_EXIT",
  "MULTIPLE_DISPLAYS",
  "DEVTOOLS_OPEN",
]);

export const proctorActionEnum = pgEnum("proctor_action", [
  "WARNING",
  "FORCED_SUBMISSION",
]);

export const cheatingLogs = pgTable(
  "cheating_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    examId: uuid("exam_id")
      .references(() => exams.id, { onDelete: "cascade" })
      .notNull(),
    infractionType: infractionTypeEnum("infraction_type").notNull(),
    infractionNumber: integer("infraction_number").default(1).notNull(),
    actionTaken: proctorActionEnum("action_taken").default("WARNING").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("cheating_logs_user_exam_idx").on(table.userId, table.examId),
    index("cheating_logs_created_at_idx").on(table.createdAt),
  ]
);

export type CheatingLogRecord = typeof cheatingLogs.$inferSelect;
export type NewCheatingLogRecord = typeof cheatingLogs.$inferInsert;
