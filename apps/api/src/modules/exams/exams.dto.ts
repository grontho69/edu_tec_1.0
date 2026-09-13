import { z } from "zod";

export const SubmitExamAnswerSchema = z.object({
  questionId: z.string().uuid("Invalid question UUID"),
  selectedOption: z.string().max(10),
  timeSpentSeconds: z.number().int().nonnegative().default(0),
});

export type SubmitExamAnswer = z.infer<typeof SubmitExamAnswerSchema>;

export const SubmitExamInputSchema = z.object({
  answers: z.array(SubmitExamAnswerSchema),
  clientSubmittedAt: z.string().datetime().optional().default(() => new Date().toISOString()),
});

export type SubmitExamInput = z.infer<typeof SubmitExamInputSchema>;

export const LeaderboardQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
});

export type LeaderboardQuery = z.infer<typeof LeaderboardQuerySchema>;
