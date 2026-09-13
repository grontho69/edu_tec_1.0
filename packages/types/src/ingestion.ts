import { z } from "zod";
import { QuestionOptionSchema } from "./questions.js";

export const IngestionFileTypeEnum = z.enum(["PDF", "IMAGE"]);
export type IngestionFileType = z.infer<typeof IngestionFileTypeEnum>;

export const IngestionJobStatusEnum = z.enum([
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
]);
export type IngestionJobStatus = z.infer<typeof IngestionJobStatusEnum>;

export const IngestionJobSchema = z.object({
  id: z.string().min(1).max(64), // e.g. "job_123e4567-e89b-12d3-a456-426614174000"
  adminId: z.string().uuid(),
  sourceFileUrl: z.string().url(),
  fileType: IngestionFileTypeEnum,
  targetSubjectId: z.number().int().positive(),
  targetChapterId: z.number().int().positive(),
  status: IngestionJobStatusEnum.default("PROCESSING"),
  totalDetected: z.number().int().nonnegative().default(0),
  approvedCount: z.number().int().nonnegative().default(0),
  rejectedCount: z.number().int().nonnegative().default(0),
  errorMessage: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type IngestionJob = z.infer<typeof IngestionJobSchema>;

export const CreateIngestionJobInputSchema = IngestionJobSchema.omit({
  createdAt: true,
  updatedAt: true,
}).partial({
  status: true,
  totalDetected: true,
  approvedCount: true,
  rejectedCount: true,
  errorMessage: true,
});

export type CreateIngestionJobInput = z.infer<typeof CreateIngestionJobInputSchema>;

export const QuestionDraftStatusEnum = z.enum([
  "DRAFT",
  "APPROVED",
  "REJECTED",
  "FAILED_PARSE",
]);
export type QuestionDraftStatus = z.infer<typeof QuestionDraftStatusEnum>;

// Strict schema for successful OCR vision parsing
export const ParsedQuestionDraftSchema = z.object({
  parsedQuestionText: z.string().min(1),
  parsedOptions: z.array(QuestionOptionSchema).min(2),
  parsedCorrectOption: z.string().min(1).max(10),
  parsedExplanation: z.string().nullable().optional(),
  parsedLatexFormulas: z.array(z.string()).default([]),
  targetTopicId: z.number().int().positive().nullable().optional(),
  universityTags: z.array(z.string()).default([]),
  confidenceScore: z.string().regex(/^\d{1,2}(\.\d{1,2})?$/).nullable().optional(), // NUMERIC(4, 2) e.g. "0.95"
});

export type ParsedQuestionDraft = z.infer<typeof ParsedQuestionDraftSchema>;

// Full database entity for question drafts
export const QuestionDraftSchema = z.object({
  id: z.string().uuid(),
  jobId: z.string().min(1).max(64),
  rawImageUrl: z.string().url().nullable().optional(),
  parsedQuestionText: z.string().nullable().optional(),
  parsedOptions: z.array(QuestionOptionSchema).nullable().optional(),
  parsedCorrectOption: z.string().max(10).nullable().optional(),
  parsedExplanation: z.string().nullable().optional(),
  parsedLatexFormulas: z.array(z.string()).default([]),
  rawResponse: z.string().nullable().optional(), // Preserved raw response when OCR parse fails
  status: QuestionDraftStatusEnum.default("DRAFT"),
  targetTopicId: z.number().int().positive().nullable().optional(),
  universityTags: z.array(z.string()).default([]),
  confidenceScore: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type QuestionDraft = z.infer<typeof QuestionDraftSchema>;

export interface SafeParseQuestionDraftSuccess {
  success: true;
  data: ParsedQuestionDraft;
  status: "DRAFT";
  rawResponse?: string;
}

export interface SafeParseQuestionDraftFailure {
  success: false;
  status: "FAILED_PARSE";
  rawResponse: string;
  error: string;
}

export type SafeParseQuestionDraftResult =
  | SafeParseQuestionDraftSuccess
  | SafeParseQuestionDraftFailure;

/**
 * Safe parsing utility for handling corrupt JSON / math OCR vision payloads.
 * If validation fails or JSON is malformed, preserves the raw response string,
 * marks status as 'FAILED_PARSE', and guarantees the database insertion does not crash.
 */
export function safeParseQuestionDraft(rawInput: unknown): SafeParseQuestionDraftResult {
  let parsedPayload: unknown = rawInput;
  let rawResponseStr: string = "";

  if (typeof rawInput === "string") {
    rawResponseStr = rawInput;
    try {
      parsedPayload = JSON.parse(rawInput);
    } catch (err) {
      return {
        success: false,
        status: "FAILED_PARSE",
        rawResponse: rawInput,
        error: `JSON parse error: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  } else {
    try {
      rawResponseStr = JSON.stringify(rawInput);
    } catch {
      rawResponseStr = String(rawInput);
    }
  }

  const result = ParsedQuestionDraftSchema.safeParse(parsedPayload);
  if (!result.success) {
    return {
      success: false,
      status: "FAILED_PARSE",
      rawResponse: rawResponseStr,
      error: result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "),
    };
  }

  return {
    success: true,
    data: result.data,
    status: "DRAFT",
    rawResponse: rawResponseStr,
  };
}
