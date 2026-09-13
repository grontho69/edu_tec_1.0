import { z } from "zod";
import { TargetUnitEnum } from "./users.js";

export const InfractionTypeSchema = z.enum([
  "TAB_BLUR",
  "FULLSCREEN_EXIT",
  "MULTIPLE_DISPLAYS",
  "DEVTOOLS_OPEN",
]);
export type InfractionType = z.infer<typeof InfractionTypeSchema>;

export const ProctorActionSchema = z.enum([
  "WARNING",
  "FORCED_SUBMISSION",
]);
export type ProctorAction = z.infer<typeof ProctorActionSchema>;

export const StudentFilterSchema = z.object({
  search: z.string().optional(),
  targetUnit: TargetUnitEnum.optional(),
  limit: z.coerce.number().int().positive().default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
});
export type StudentFilter = z.infer<typeof StudentFilterSchema>;

export const LogCheatingInfractionSchema = z.object({
  userId: z.string().uuid(),
  examId: z.string().uuid(),
  infractionType: InfractionTypeSchema,
  metadata: z.record(z.unknown()).optional(),
});
export type LogCheatingInfractionInput = z.infer<typeof LogCheatingInfractionSchema>;

export const ExtractedOptionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  isLatex: z.boolean().optional(),
});
export type ExtractedOption = z.infer<typeof ExtractedOptionSchema>;

export const ExtractedQuestionItemSchema = z.object({
  questionText: z.string().min(1),
  options: z.array(ExtractedOptionSchema).min(2),
  correctOption: z.string().min(1),
  explanation: z.string().optional().default(""),
  latexFormulas: z.array(z.string()).default([]),
  confidenceScore: z.number().min(0).max(1).optional().default(0.95),
  targetTopicId: z.number().int().positive().optional(),
  universityTags: z.array(z.string()).default([]),
});
export type ExtractedQuestionItem = z.infer<typeof ExtractedQuestionItemSchema>;

export const GeminiExtractionResponseSchema = z.object({
  questions: z.array(ExtractedQuestionItemSchema),
});
export type GeminiExtractionResponse = z.infer<typeof GeminiExtractionResponseSchema>;

export const AdminExtractJobInputSchema = z.object({
  sourceFileUrl: z.string().min(1),
  fileType: z.enum(["PDF", "IMAGE"]),
  targetSubjectId: z.number().int().positive(),
  targetChapterId: z.number().int().positive(),
  base64Data: z.string().optional(),
  extractedQuestions: z.array(ExtractedQuestionItemSchema).optional(),
});
export type AdminExtractJobInput = z.infer<typeof AdminExtractJobInputSchema>;

export const UpdateDraftSchema = z.object({
  questionText: z.string().optional(),
  options: z.array(ExtractedOptionSchema).optional(),
  correctOption: z.string().optional(),
  explanation: z.string().optional(),
  latexFormulas: z.array(z.string()).optional(),
  targetTopicId: z.number().int().positive().nullable().optional(),
  universityTags: z.array(z.string()).optional(),
});
export type UpdateDraftInput = z.infer<typeof UpdateDraftSchema>;

export const ApproveDraftSchema = z.object({
  draftId: z.string().uuid(),
});
export type ApproveDraftInput = z.infer<typeof ApproveDraftSchema>;

export const BatchApproveDraftsSchema = z.object({
  draftIds: z.array(z.string().uuid()).min(1),
});
export type BatchApproveDraftsInput = z.infer<typeof BatchApproveDraftsSchema>;
