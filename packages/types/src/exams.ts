import { z } from "zod";

export const ExamTypeEnum = z.enum(["PRACTICE", "LIVE_MODEL_TEST", "TOPIC_QUIZ"]);
export type ExamType = z.infer<typeof ExamTypeEnum>;

export const ExamSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().min(1).max(64).default("DIRECT_B2C"),
  title: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  examType: ExamTypeEnum.default("PRACTICE"),
  durationMinutes: z.number().int().positive(),
  totalMarks: z.string().regex(/^\d{1,4}(\.\d{1,2})?$/).default("100.00"), // NUMERIC(6, 2)
  passMarks: z.string().regex(/^\d{1,4}(\.\d{1,2})?$/).default("40.00"), // NUMERIC(6, 2)
  negativeMarkingRate: z.string().regex(/^\d{1,2}(\.\d{1,2})?$/).default("0.25"), // NUMERIC(4, 2)
  startTime: z.coerce.date().nullable().optional(),
  endTime: z.coerce.date().nullable().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Exam = z.infer<typeof ExamSchema>;

export const CreateExamInputSchema = ExamSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial({
  tenantId: true,
  description: true,
  examType: true,
  totalMarks: true,
  passMarks: true,
  negativeMarkingRate: true,
  startTime: true,
  endTime: true,
  isActive: true,
});

export type CreateExamInput = z.infer<typeof CreateExamInputSchema>;
