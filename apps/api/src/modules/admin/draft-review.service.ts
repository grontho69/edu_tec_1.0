import type { DatabaseInstance } from "@admission-engine/database";
import {
  questionDrafts,
  questions,
  ingestionJobs,
} from "@admission-engine/database";
import { eq, and, desc, sql } from "drizzle-orm";
import type { UpdateDraftInput } from "@admission-engine/types";

export interface DraftQueryOptions {
  jobId?: string | undefined;
  status?: "DRAFT" | "APPROVED" | "REJECTED" | "FAILED_PARSE" | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}

export class DraftReviewService {
  constructor(private db: DatabaseInstance) {}

  /**
   * Retrieves staged question drafts for split-screen review.
   */
  async listDrafts(options?: DraftQueryOptions) {
    const limit = Math.min(100, Math.max(1, options?.limit ?? 50));
    const offset = Math.max(0, options?.offset ?? 0);
    const conditions = [];

    if (options?.jobId) {
      conditions.push(eq(questionDrafts.jobId, options.jobId));
    }
    if (options?.status) {
      conditions.push(eq(questionDrafts.status, options.status));
    }

    const query = this.db
      .select()
      .from(questionDrafts)
      .orderBy(desc(questionDrafts.createdAt))
      .limit(limit)
      .offset(offset);

    if (conditions.length > 0) {
      return query.where(and(...conditions));
    }
    return query;
  }

  /**
   * Retrieves a single question draft.
   */
  async getDraft(draftId: string) {
    const [draft] = await this.db
      .select()
      .from(questionDrafts)
      .where(eq(questionDrafts.id, draftId))
      .limit(1);

    return draft || null;
  }

  /**
   * Updates question draft fields during split-screen admin review.
   */
  async updateDraft(draftId: string, input: UpdateDraftInput) {
    const [updated] = await this.db
      .update(questionDrafts)
      .set({
        parsedQuestionText: input.questionText,
        parsedOptions: input.options
          ? input.options.map((o) => ({
              id: o.id,
              text: o.text,
              ...(o.isLatex !== undefined ? { isLatex: o.isLatex } : {}),
            }))
          : undefined,
        parsedCorrectOption: input.correctOption,
        parsedExplanation: input.explanation,
        parsedLatexFormulas: input.latexFormulas,
        targetTopicId: input.targetTopicId,
        universityTags: input.universityTags,
        updatedAt: new Date(),
      })
      .where(eq(questionDrafts.id, draftId))
      .returning();

    return updated || null;
  }

  /**
   * Atomically approves a draft and publishes it into the live questions bank.
   */
  async approveDraft(draftId: string) {
    const draft = await this.getDraft(draftId);
    if (!draft) {
      throw new Error(`Draft with ID ${draftId} not found`);
    }

    if (!draft.parsedQuestionText || !draft.parsedOptions || !draft.parsedCorrectOption) {
      throw new Error("Draft is missing required question text, options, or correct answer");
    }

    // 1. Publish into live questions table
    const [newQuestion] = await this.db
      .insert(questions)
      .values({
        tenantId: "DIRECT_B2C",
        questionText: draft.parsedQuestionText,
        questionType: "MCQ",
        options: draft.parsedOptions,
        correctOptionId: draft.parsedCorrectOption,
        explanation: draft.parsedExplanation || null,
        latexFormulas: draft.parsedLatexFormulas || [],
        topicId: draft.targetTopicId || null,
        universityTags: draft.universityTags || [],
        marks: "1.00",
        negativeMarks: "0.25",
        difficulty: "MEDIUM",
        isActive: true,
      })
      .returning();

    // 2. Mark draft as APPROVED
    await this.db
      .update(questionDrafts)
      .set({
        status: "APPROVED",
        updatedAt: new Date(),
      })
      .where(eq(questionDrafts.id, draftId));

    // 3. Increment approvedCount on ingestion job
    await this.db
      .update(ingestionJobs)
      .set({
        approvedCount: sql`${ingestionJobs.approvedCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(ingestionJobs.id, draft.jobId));

    return newQuestion;
  }

  /**
   * Batch approves multiple drafts and publishes them to the questions table.
   */
  async batchApproveDrafts(draftIds: string[]) {
    const published = [];
    for (const id of draftIds) {
      try {
        const question = await this.approveDraft(id);
        published.push(question);
      } catch (err) {
        console.warn(`[DraftReviewService] Failed to approve draft ${id}:`, err);
      }
    }
    return published;
  }

  /**
   * Rejects a question draft.
   */
  async rejectDraft(draftId: string) {
    const draft = await this.getDraft(draftId);
    if (!draft) {
      throw new Error(`Draft with ID ${draftId} not found`);
    }

    const [updated] = await this.db
      .update(questionDrafts)
      .set({
        status: "REJECTED",
        updatedAt: new Date(),
      })
      .where(eq(questionDrafts.id, draftId))
      .returning();

    await this.db
      .update(ingestionJobs)
      .set({
        rejectedCount: sql`${ingestionJobs.rejectedCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(ingestionJobs.id, draft.jobId));

    return updated;
  }
}
