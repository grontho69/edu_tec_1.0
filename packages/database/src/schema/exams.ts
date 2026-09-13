import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const examTypeEnum = pgEnum("exam_type", [
  "PRACTICE",
  "LIVE_MODEL_TEST",
  "TOPIC_QUIZ",
]);

export const exams = pgTable("exams", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: varchar("tenant_id", { length: 64 })
    .references(() => tenants.id, { onDelete: "cascade" })
    .default("DIRECT_B2C")
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  examType: examTypeEnum("exam_type").default("PRACTICE").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  totalMarks: numeric("total_marks", { precision: 6, scale: 2 }).default("100.00").notNull(),
  passMarks: numeric("pass_marks", { precision: 6, scale: 2 }).default("40.00").notNull(),
  negativeMarkingRate: numeric("negative_marking_rate", { precision: 4, scale: 2 })
    .default("0.25")
    .notNull(),
  startTime: timestamp("start_time", { withTimezone: true }),
  endTime: timestamp("end_time", { withTimezone: true }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type ExamRecord = typeof exams.$inferSelect;
export type NewExamRecord = typeof exams.$inferInsert;
