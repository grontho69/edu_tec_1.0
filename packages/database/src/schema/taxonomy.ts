import { integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  iconUrl: text("icon_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const chapters = pgTable("chapters", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id")
    .references(() => subjects.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  chapterNumber: integer("chapter_number").notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  chapterId: integer("chapter_id")
    .references(() => chapters.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type SubjectRecord = typeof subjects.$inferSelect;
export type NewSubjectRecord = typeof subjects.$inferInsert;
export type ChapterRecord = typeof chapters.$inferSelect;
export type NewChapterRecord = typeof chapters.$inferInsert;
export type TopicRecord = typeof topics.$inferSelect;
export type NewTopicRecord = typeof topics.$inferInsert;
