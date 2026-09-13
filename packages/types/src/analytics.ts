import { z } from "zod";

// Helper validator for percentage rates: 0.00 to 100.00 (NUMERIC(5, 2))
export const PercentageRateSchema = z.string().refine((val) => {
  const num = parseFloat(val);
  return !isNaN(num) && num >= 0 && num <= 100;
}, {
  message: "Rate must be between 0.00 and 100.00",
});

export const UserAnalyticsSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  totalExamsTaken: z.number().int().nonnegative().default(0),
  totalQuestionsAttempted: z.number().int().nonnegative().default(0),
  totalQuestionsCorrect: z.number().int().nonnegative().default(0),
  overallAccuracy: PercentageRateSchema.default("0.00"), // NUMERIC(5, 2)
  totalStudyTimeSeconds: z.number().int().nonnegative().default(0),
  streakDays: z.number().int().nonnegative().default(0),
  lastActiveAt: z.coerce.date().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type UserAnalytics = z.infer<typeof UserAnalyticsSchema>;

// Atomic update input for high-concurrency increment operations
export const AtomicAnalyticsIncrementInputSchema = z.object({
  userId: z.string().uuid(),
  examsTakenIncrement: z.number().int().nonnegative().default(1),
  questionsAttemptedIncrement: z.number().int().nonnegative().default(0),
  questionsCorrectIncrement: z.number().int().nonnegative().default(0),
  studyTimeSecondsIncrement: z.number().int().nonnegative().default(0),
  lastActiveAt: z.coerce.date().default(() => new Date()),
});

export type AtomicAnalyticsIncrementInput = z.infer<
  typeof AtomicAnalyticsIncrementInputSchema
>;

export const UserTopicMetricsSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  topicId: z.number().int().positive(),
  totalAttempted: z.number().int().nonnegative().default(0),
  totalCorrect: z.number().int().nonnegative().default(0),
  accuracyRate: PercentageRateSchema.default("0.00"), // NUMERIC(5, 2)
  masteryScore: PercentageRateSchema.default("0.00"), // NUMERIC(5, 2)
  lastAttemptedAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type UserTopicMetrics = z.infer<typeof UserTopicMetricsSchema>;

export const UpsertUserTopicMetricsInputSchema = z.object({
  userId: z.string().uuid(),
  topicId: z.number().int().positive(),
  attemptedIncrement: z.number().int().nonnegative().default(0),
  correctIncrement: z.number().int().nonnegative().default(0),
  lastAttemptedAt: z.coerce.date().default(() => new Date()),
});

export type UpsertUserTopicMetricsInput = z.infer<
  typeof UpsertUserTopicMetricsInputSchema
>;
