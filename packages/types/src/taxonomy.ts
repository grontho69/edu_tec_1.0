import { z } from "zod";

export const SubjectSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(50),
  slug: z.string().min(1).max(100),
  iconUrl: z.string().url().nullable().optional(),
  createdAt: z.coerce.date(),
});

export type Subject = z.infer<typeof SubjectSchema>;

export const ChapterSchema = z.object({
  id: z.number().int().positive(),
  subjectId: z.number().int().positive(),
  name: z.string().min(1).max(255),
  chapterNumber: z.number().int().positive(),
  slug: z.string().min(1).max(255),
  createdAt: z.coerce.date(),
});

export type Chapter = z.infer<typeof ChapterSchema>;

export const TopicSchema = z.object({
  id: z.number().int().positive(),
  chapterId: z.number().int().positive(),
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  createdAt: z.coerce.date(),
});

export type Topic = z.infer<typeof TopicSchema>;

export const CreateSubjectInputSchema = SubjectSchema.omit({
  id: true,
  createdAt: true,
}).partial({
  iconUrl: true,
});

export type CreateSubjectInput = z.infer<typeof CreateSubjectInputSchema>;

export const CreateChapterInputSchema = ChapterSchema.omit({
  id: true,
  createdAt: true,
});

export type CreateChapterInput = z.infer<typeof CreateChapterInputSchema>;

export const CreateTopicInputSchema = TopicSchema.omit({
  id: true,
  createdAt: true,
});

export type CreateTopicInput = z.infer<typeof CreateTopicInputSchema>;
