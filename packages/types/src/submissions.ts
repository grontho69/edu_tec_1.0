import { z } from "zod";

export const SubmissionStatusEnum = z.enum(["IN_PROGRESS", "SUBMITTED", "EVALUATED"]);
export type SubmissionStatus = z.infer<typeof SubmissionStatusEnum>;

export const ExamSubmissionSchema = z.object({
  id: z.string().uuid(),
  examId: z.string().uuid(),
  userId: z.string().uuid(),
  totalScore: z.string().regex(/^-?\d{1,4}(\.\d{1,2})?$/).default("0.00"), // NUMERIC(6, 2)
  totalAttempted: z.number().int().nonnegative().default(0),
  totalCorrect: z.number().int().nonnegative().default(0),
  totalWrong: z.number().int().nonnegative().default(0),
  totalUnanswered: z.number().int().nonnegative().default(0),
  accuracyRate: z.string().regex(/^\d{1,3}(\.\d{1,2})?$/).default("0.00"), // NUMERIC(5, 2)
  timeTakenSeconds: z.number().int().nonnegative().default(0),
  status: SubmissionStatusEnum.default("SUBMITTED"),
  submittedAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ExamSubmission = z.infer<typeof ExamSubmissionSchema>;

export const SubmissionAnswerSchema = z.object({
  id: z.string().uuid(),
  submissionId: z.string().uuid(),
  questionId: z.string().uuid(),
  selectedOptionId: z.string().max(10).nullable().optional(),
  isCorrect: z.boolean().default(false),
  marksAwarded: z.string().regex(/^-?\d{1,4}(\.\d{1,2})?$/).default("0.00"), // NUMERIC(6, 2)
  timeSpentSeconds: z.number().int().nonnegative().default(0),
  createdAt: z.coerce.date(),
});

export type SubmissionAnswer = z.infer<typeof SubmissionAnswerSchema>;

export const SubmitExamInputSchema = z.object({
  examId: z.string().uuid(),
  userId: z.string().uuid(),
  timeTakenSeconds: z.number().int().nonnegative(),
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      selectedOptionId: z.string().max(10).nullable().optional(),
      timeSpentSeconds: z.number().int().nonnegative().default(0),
    })
  ),
});

export type SubmitExamInput = z.infer<typeof SubmitExamInputSchema>;
