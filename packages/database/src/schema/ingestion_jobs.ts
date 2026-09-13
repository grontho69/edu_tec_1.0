import { integer, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";
import { chapters, subjects } from "./taxonomy";

export const ingestionFileTypeEnum = pgEnum("ingestion_file_type", ["PDF", "IMAGE"]);
export const ingestionJobStatusEnum = pgEnum("ingestion_job_status", [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
]);

export const ingestionJobs = pgTable("ingestion_jobs", {
  id: varchar("id", { length: 64 }).primaryKey(), // e.g. "job_123e4567-e89b-12d3-a456-426614174000"
  adminId: uuid("admin_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  sourceFileUrl: text("source_file_url").notNull(),
  fileType: ingestionFileTypeEnum("file_type").notNull(),
  targetSubjectId: integer("target_subject_id")
    .references(() => subjects.id)
    .notNull(),
  targetChapterId: integer("target_chapter_id")
    .references(() => chapters.id)
    .notNull(),
  status: ingestionJobStatusEnum("status").default("PROCESSING").notNull(),
  totalDetected: integer("total_detected").default(0).notNull(),
  approvedCount: integer("approved_count").default(0).notNull(),
  rejectedCount: integer("rejected_count").default(0).notNull(),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type IngestionJobRecord = typeof ingestionJobs.$inferSelect;
export type NewIngestionJobRecord = typeof ingestionJobs.$inferInsert;
