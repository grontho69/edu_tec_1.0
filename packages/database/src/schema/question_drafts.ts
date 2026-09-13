import {
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { ingestionJobs } from "./ingestion_jobs";
import { topics } from "./taxonomy";

export const questionDraftStatusEnum = pgEnum("question_draft_status", [
  "DRAFT",
  "APPROVED",
  "REJECTED",
  "FAILED_PARSE",
]);

export const questionDrafts = pgTable(
  "question_drafts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    jobId: varchar("job_id", { length: 64 })
      .references(() => ingestionJobs.id, { onDelete: "cascade" })
      .notNull(),
    rawImageUrl: text("raw_image_url"),
    parsedQuestionText: text("parsed_question_text"),
    parsedOptions: jsonb("parsed_options").$type<
      Array<{ id: string; text: string; isLatex?: boolean }>
    >(),
    parsedCorrectOption: varchar("parsed_correct_option", { length: 10 }),
    parsedExplanation: text("parsed_explanation"),
    parsedLatexFormulas: text("parsed_latex_formulas").array().default([]).notNull(),
    rawResponse: text("raw_response"),
    status: questionDraftStatusEnum("status").default("DRAFT").notNull(),
    targetTopicId: integer("target_topic_id").references(() => topics.id, {
      onDelete: "set null",
    }),
    universityTags: text("university_tags").array().default([]).notNull(),
    confidenceScore: numeric("confidence_score", { precision: 4, scale: 2 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("question_drafts_job_id_idx").on(table.jobId),
    index("question_drafts_status_idx").on(table.status),
  ]
);

export type QuestionDraftRecord = typeof questionDrafts.$inferSelect;
export type NewQuestionDraftRecord = typeof questionDrafts.$inferInsert;
