import { z } from "zod";
import { DifficultyEnum, QuestionTypeEnum } from "@admission-engine/types";

// Sanitized option representation sent to students
export const SanitizedQuestionOptionSchema = z.object({
  key: z.string(), // "A", "B", "C", "D"
  text: z.string(),
  isLatex: z.boolean().optional(),
});

export type SanitizedQuestionOption = z.infer<typeof SanitizedQuestionOptionSchema>;

/**
 * Strict student-facing question DTO.
 * Explicitly OMITS:
 * - correctOptionId / correct_option
 * - explanation
 * - latexFormulas / formula cheats
 * Guarantees zero leakage in the network tab.
 */
export const SanitizedQuestionSchema = z.object({
  id: z.string().uuid(),
  topicId: z.number().int().nullable().optional(),
  subjectId: z.number().int().nullable().optional(),
  chapterId: z.number().int().nullable().optional(),
  questionText: z.string(),
  type: QuestionTypeEnum,
  questionType: QuestionTypeEnum,
  options: z.array(SanitizedQuestionOptionSchema),
  marks: z.string(),
  negativeMarks: z.string(),
  difficulty: DifficultyEnum,
  universityTags: z.array(z.string()),
});

export type SanitizedQuestion = z.infer<typeof SanitizedQuestionSchema>;

// Query parameters for GET /api/v1/questions/filter
export const QuestionFilterQuerySchema = z.object({
  topicIds: z
    .string()
    .optional()
    .transform((val) =>
      val
        ? val
            .split(",")
            .map((s) => parseInt(s.trim(), 10))
            .filter((n) => !isNaN(n))
        : []
    ),
  subjectId: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val.trim(), 10) : undefined)),
  chapterId: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val.trim(), 10) : undefined)),
  difficulty: DifficultyEnum.optional(),
  tags: z
    .string()
    .optional()
    .transform((val) =>
      val
        ? val
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : []
    ),
  limit: z
    .string()
    .optional()
    .default("20")
    .transform((val) => Math.min(100, Math.max(1, parseInt(val, 10) || 20))),
  excludeIds: z
    .string()
    .optional()
    .transform((val) =>
      val
        ? val
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : []
    ),
});

export type QuestionFilterQuery = z.infer<typeof QuestionFilterQuerySchema>;

// Body schema for POST /api/v1/questions/assemble
export const AssemblePracticeInputSchema = z.object({
  action: z.literal("ASSEMBLE_PRACTICE").default("ASSEMBLE_PRACTICE"),
  topicIds: z.array(z.number().int().positive()).min(1),
  totalCount: z.number().int().positive().max(100).default(20),
  difficultyRatio: z
    .object({
      EASY: z.number().min(0).max(1).default(0.2),
      MEDIUM: z.number().min(0).max(1).default(0.6),
      HARD: z.number().min(0).max(1).default(0.2),
    })
    .default({ EASY: 0.2, MEDIUM: 0.6, HARD: 0.2 }),
  tags: z.array(z.string()).default([]),
  excludeIds: z.array(z.string()).default([]),
});

export type AssemblePracticeInput = z.infer<typeof AssemblePracticeInputSchema>;
