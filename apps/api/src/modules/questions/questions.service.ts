import { eq, and, inArray, notInArray, arrayOverlaps } from "drizzle-orm";
import type { DatabaseInstance, QuestionRecord } from "@admission-engine/database";
import { questions } from "@admission-engine/database";
import type { Difficulty } from "@admission-engine/types";
import type {
  QuestionFilterQuery,
  AssemblePracticeInput,
  SanitizedQuestion,
} from "./questions.dto";
import { SanitizedQuestionSchema } from "./questions.dto";

/**
 * In-memory Fisher-Yates shuffle algorithm.
 * Guarantees uniform distribution in O(N) time without database disk sorts.
 */
export function fisherYatesShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i]!;
    result[i] = result[j]!;
    result[j] = temp;
  }
  return result;
}

export interface SampleQuestionIdsOptions {
  topicIds?: number[] | undefined;
  subjectId?: number | undefined;
  chapterId?: number | undefined;
  difficulty?: Difficulty | undefined;
  tags?: string[] | undefined;
  excludeIds?: string[] | undefined;
  limit: number;
  allowTagFallback?: boolean | undefined;
}

export class QuestionsService {
  /**
   * High-performance two-phase question ID sampling.
   * Phase 1: Indexed ID lookup (Zero SQL RANDOM()).
   * Phase 2: In-memory Fisher-Yates shuffle -> slice.
   * Phase 3: Hydrate chosen IDs by primary key.
   */
  async getSampledQuestionIds(
    db: DatabaseInstance,
    options: SampleQuestionIdsOptions
  ): Promise<string[]> {
    const {
      topicIds = [],
      subjectId,
      chapterId,
      difficulty,
      tags = [],
      excludeIds = [],
      limit,
      allowTagFallback = true,
    } = options;

    const baseConditions = [eq(questions.isActive, true)];

    if (topicIds.length > 0) {
      baseConditions.push(inArray(questions.topicId, topicIds));
    }
    if (subjectId !== undefined) {
      baseConditions.push(eq(questions.subjectId, subjectId));
    }
    if (chapterId !== undefined) {
      baseConditions.push(eq(questions.chapterId, chapterId));
    }
    if (difficulty) {
      baseConditions.push(eq(questions.difficulty, difficulty));
    }
    if (excludeIds.length > 0) {
      baseConditions.push(notInArray(questions.id, excludeIds));
    }

    // Step 1: Attempt matching with strict tags
    let matchingIds: string[] = [];

    if (tags.length > 0) {
      const tagConditions = [
        ...baseConditions,
        arrayOverlaps(questions.universityTags, tags),
      ];
      const rows = await db
        .select({ id: questions.id })
        .from(questions)
        .where(and(...tagConditions));
      matchingIds = rows.map((r) => r.id);
    }

    // Step 2: Progressive Fallback (Risk 2 Prevention)
    // If strict tags yielded fewer questions than the quota and fallback is allowed, relax the tags
    if (tags.length === 0 || (allowTagFallback && matchingIds.length < limit)) {
      const remainingNeeded = limit - matchingIds.length;
      const alreadyFoundSet = new Set(matchingIds);
      const extendedExcludeIds = [...excludeIds, ...matchingIds];

      const relaxedConditions = [
        ...baseConditions,
        ...(extendedExcludeIds.length > 0 ? [notInArray(questions.id, extendedExcludeIds)] : []),
      ];

      const relaxedRows = await db
        .select({ id: questions.id })
        .from(questions)
        .where(and(...relaxedConditions));

      const additionalIds = relaxedRows.map((r) => r.id).filter((id) => !alreadyFoundSet.has(id));

      if (tags.length === 0) {
        matchingIds = additionalIds;
      } else {
        // Append relaxed questions to fill quota
        const shuffledAdditional = fisherYatesShuffle(additionalIds);
        matchingIds.push(...shuffledAdditional.slice(0, remainingNeeded));
      }
    }

    // Step 3: In-memory Fisher-Yates shuffle
    const shuffledIds = fisherYatesShuffle(matchingIds);

    // Step 4: Slice down to exact limit
    return shuffledIds.slice(0, limit);
  }

  /**
   * Hydrates questions by IDs and sanitizes output payloads.
   * Strips correctOptionId, explanation, and latexFormulas cheat hints.
   */
  async hydrateAndSanitizeQuestions(
    db: DatabaseInstance,
    questionIds: string[]
  ): Promise<SanitizedQuestion[]> {
    if (questionIds.length === 0) return [];

    const rows = await db
      .select()
      .from(questions)
      .where(inArray(questions.id, questionIds));

    // Preserve exact shuffle ordering
    const rowMap = new Map<string, QuestionRecord>();
    for (const row of rows) {
      rowMap.set(row.id, row);
    }

    const orderedAndSanitized: SanitizedQuestion[] = [];

    for (const id of questionIds) {
      const raw = rowMap.get(id);
      if (!raw) continue;

      // Transform raw options to sanitized public options
      const options = raw.options.map((opt) => ({
        key: opt.id,
        text: opt.text,
        isLatex: opt.isLatex,
      }));

      // Sanitize through strict Zod schema (stripping correctOptionId, explanation, etc.)
      const sanitized = SanitizedQuestionSchema.parse({
        id: raw.id,
        topicId: raw.topicId,
        subjectId: raw.subjectId,
        chapterId: raw.chapterId,
        questionText: raw.questionText,
        type: raw.questionType,
        questionType: raw.questionType,
        options,
        marks: raw.marks,
        negativeMarks: raw.negativeMarks,
        difficulty: raw.difficulty,
        universityTags: raw.universityTags,
      });

      orderedAndSanitized.push(sanitized);
    }

    return orderedAndSanitized;
  }

  /**
   * Filters questions with zero SQL RANDOM() and anti-repetition.
   */
  async filterQuestions(
    db: DatabaseInstance,
    query: QuestionFilterQuery
  ): Promise<{ questions: SanitizedQuestion[]; count: number }> {
    const sampledIds = await this.getSampledQuestionIds(db, {
      topicIds: query.topicIds,
      subjectId: query.subjectId,
      chapterId: query.chapterId,
      difficulty: query.difficulty,
      tags: query.tags,
      excludeIds: query.excludeIds,
      limit: query.limit,
      allowTagFallback: true,
    });

    const sanitizedQuestions = await this.hydrateAndSanitizeQuestions(db, sampledIds);

    return {
      questions: sanitizedQuestions,
      count: sanitizedQuestions.length,
    };
  }

  /**
   * Assembles a balanced practice test set based on target difficulty ratios.
   * e.g. 20 total questions with 20% Easy (4), 60% Medium (12), 20% Hard (4).
   */
  async assemblePracticeTest(
    db: DatabaseInstance,
    input: AssemblePracticeInput
  ): Promise<{
    action: string;
    totalCount: number;
    questionIds: string[];
    questions: SanitizedQuestion[];
    distribution: Record<Difficulty, number>;
  }> {
    const { totalCount, difficultyRatio, topicIds, tags, excludeIds } = input;

    // Calculate quotas
    const easyCount = Math.round(totalCount * (difficultyRatio.EASY ?? 0.2));
    const hardCount = Math.round(totalCount * (difficultyRatio.HARD ?? 0.2));
    const mediumCount = totalCount - easyCount - hardCount;

    const quotas: Array<{ difficulty: Difficulty; count: number }> = [
      { difficulty: "EASY", count: easyCount },
      { difficulty: "MEDIUM", count: mediumCount },
      { difficulty: "HARD", count: hardCount },
    ];

    const allAssembledIds: string[] = [];
    const currentExcludeIds = [...excludeIds];

    for (const quota of quotas) {
      if (quota.count <= 0) continue;

      const sampled = await this.getSampledQuestionIds(db, {
        topicIds,
        difficulty: quota.difficulty,
        tags,
        excludeIds: currentExcludeIds,
        limit: quota.count,
        allowTagFallback: true,
      });

      allAssembledIds.push(...sampled);
      currentExcludeIds.push(...sampled);
    }

    // Hydrate and sanitize all assembled questions
    const sanitizedQuestions = await this.hydrateAndSanitizeQuestions(db, allAssembledIds);

    return {
      action: input.action,
      totalCount: sanitizedQuestions.length,
      questionIds: allAssembledIds,
      questions: sanitizedQuestions,
      distribution: {
        EASY: sanitizedQuestions.filter((q) => q.difficulty === "EASY").length,
        MEDIUM: sanitizedQuestions.filter((q) => q.difficulty === "MEDIUM").length,
        HARD: sanitizedQuestions.filter((q) => q.difficulty === "HARD").length,
      },
    };
  }
}

export const questionsService = new QuestionsService();
