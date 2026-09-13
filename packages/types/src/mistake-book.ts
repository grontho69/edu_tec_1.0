import { z } from "zod";

export const MistakeBookItemSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  questionId: z.string().uuid(),
  mistakeCount: z.number().int().positive().default(1),
  consecutiveCorrectCount: z.number().int().nonnegative().default(0),
  isMastered: z.boolean().default(false),
  lastAttemptedAt: z.coerce.date(),
  notes: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type MistakeBookItem = z.infer<typeof MistakeBookItemSchema>;

export const UpsertMistakeInputSchema = z.object({
  userId: z.string().uuid(),
  questionId: z.string().uuid(),
  isMastered: z.boolean().optional(),
  notes: z.string().nullable().optional(),
});

export type UpsertMistakeInput = z.infer<typeof UpsertMistakeInputSchema>;
