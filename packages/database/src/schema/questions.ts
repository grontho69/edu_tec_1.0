import {
  boolean,
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
import { tenants } from "./tenants";
import { chapters, subjects, topics } from "./taxonomy";

export const questionTypeEnum = pgEnum("question_type", ["MCQ", "NUMERICAL"]);
export const difficultyEnum = pgEnum("difficulty_level", ["EASY", "MEDIUM", "HARD"]);

export const questions = pgTable(
  "questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: varchar("tenant_id", { length: 64 })
      .references(() => tenants.id, { onDelete: "cascade" })
      .default("DIRECT_B2C")
      .notNull(),
    topicId: integer("topic_id").references(() => topics.id, { onDelete: "set null" }),
    subjectId: integer("subject_id").references(() => subjects.id, { onDelete: "set null" }),
    chapterId: integer("chapter_id").references(() => chapters.id, { onDelete: "set null" }),
    questionText: text("question_text").notNull(),
    questionType: questionTypeEnum("question_type").default("MCQ").notNull(),
    options: jsonb("options")
      .$type<Array<{ id: string; text: string; isLatex?: boolean }>>()
      .notNull(),
    correctOptionId: varchar("correct_option_id", { length: 10 }).notNull(),
    explanation: text("explanation"),
    latexFormulas: text("latex_formulas").array().default([]).notNull(),
    marks: numeric("marks", { precision: 6, scale: 2 }).default("1.00").notNull(),
    negativeMarks: numeric("negative_marks", { precision: 4, scale: 2 }).default("0.25").notNull(),
    difficulty: difficultyEnum("difficulty").default("MEDIUM").notNull(),
    universityTags: text("university_tags").array().default([]).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    // GIN index on university_tags array for instantaneous admission tagging searches
    index("questions_university_tags_gin_idx").using("gin", table.universityTags),
    index("questions_subject_chapter_topic_idx").on(table.subjectId, table.chapterId, table.topicId),
  ]
);

export type QuestionRecord = typeof questions.$inferSelect;
export type NewQuestionRecord = typeof questions.$inferInsert;
