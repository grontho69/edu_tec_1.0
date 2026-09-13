import { z } from "zod";

export const QuestionTypeEnum = z.enum(["MCQ", "NUMERICAL"]);
export type QuestionType = z.infer<typeof QuestionTypeEnum>;

export const DifficultyEnum = z.enum(["EASY", "MEDIUM", "HARD"]);
export type Difficulty = z.infer<typeof DifficultyEnum>;

export const QuestionOptionSchema = z.object({
  id: z.string().min(1).max(10), // e.g. "A", "B", "C", "D"
  text: z.string().min(1),
  isLatex: z.boolean().default(false),
});

export type QuestionOption = z.infer<typeof QuestionOptionSchema>;

// Strict numeric representation validator ensuring 2 decimal places max
export const NumericPrecisionStringSchema = (integerDigits: number, decimalDigits = 2) =>
  z.string().regex(
    new RegExp(`^\\d{1,${integerDigits}}(\\.\\d{1,${decimalDigits}})?$`),
    `Must be a valid decimal format (up to ${integerDigits} integer digits and ${decimalDigits} decimal places)`
  );

export const QuestionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().min(1).max(64).default("DIRECT_B2C"),
  topicId: z.number().int().positive().nullable().optional(),
  subjectId: z.number().int().positive().nullable().optional(),
  chapterId: z.number().int().positive().nullable().optional(),
  questionText: z.string().min(1),
  questionType: QuestionTypeEnum.default("MCQ"),
  options: z.array(QuestionOptionSchema).min(2),
  correctOptionId: z.string().min(1).max(10),
  explanation: z.string().nullable().optional(),
  latexFormulas: z.array(z.string()).default([]),
  marks: z.string().default("1.00"), // NUMERIC(6, 2)
  negativeMarks: z.string().default("0.25"), // NUMERIC(4, 2)
  difficulty: DifficultyEnum.default("MEDIUM"),
  universityTags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Question = z.infer<typeof QuestionSchema>;

export const CreateQuestionInputSchema = QuestionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial({
  tenantId: true,
  topicId: true,
  subjectId: true,
  chapterId: true,
  questionType: true,
  explanation: true,
  latexFormulas: true,
  marks: true,
  negativeMarks: true,
  difficulty: true,
  universityTags: true,
  isActive: true,
});

export type CreateQuestionInput = z.infer<typeof CreateQuestionInputSchema>;
