import crypto from "node:crypto";
import type { DatabaseInstance } from "@admission-engine/database";
import { ingestionJobs, questionDrafts } from "@admission-engine/database";
import { eq } from "drizzle-orm";
import type {
  AdminExtractJobInput,
  ExtractedQuestionItem,
  GeminiExtractionResponse,
} from "@admission-engine/types";

export interface ExtractResult {
  jobId: string;
  totalDetected: number;
  draftIds: string[];
}

export class GeminiExtractorService {
  private apiKey: string | undefined;

  constructor(private db: DatabaseInstance) {
    this.apiKey = process.env["GEMINI_API_KEY"];
  }

  /**
   * Multimodal AI extraction pipeline targeting Google AI Studio Free Gemini Flash API.
   * Free Tier: 1,500 requests/day, 100% free with structured JSON output.
   * Extracted questions are staged exclusively in question_drafts with status 'DRAFT'.
   */
  async extractAndStageQuestions(
    adminId: string,
    input: AdminExtractJobInput
  ): Promise<ExtractResult> {
    const jobId = `job_${crypto.randomUUID()}`;

    // 1. Initialize ingestion job in database
    await this.db.insert(ingestionJobs).values({
      id: jobId,
      adminId,
      sourceFileUrl: input.sourceFileUrl,
      fileType: input.fileType,
      targetSubjectId: input.targetSubjectId,
      targetChapterId: input.targetChapterId,
      status: "PROCESSING",
      totalDetected: 0,
      approvedCount: 0,
      rejectedCount: 0,
    });

    try {
      // 2. Perform AI extraction or use provided/simulated extraction
      let extractedQuestions: ExtractedQuestionItem[];

      if (input.extractedQuestions && input.extractedQuestions.length > 0) {
        extractedQuestions = input.extractedQuestions;
      } else if (this.apiKey && input.base64Data) {
        extractedQuestions = await this.callGeminiFlashApi(
          input.base64Data,
          input.fileType === "PDF" ? "application/pdf" : "image/jpeg"
        );
      } else {
        // Deterministic offline fallback simulator for test suites and dev environments
        extractedQuestions = this.getFallbackSimulatedExtraction();
      }

      // 3. Stage questions into question_drafts with status 'DRAFT' (Never directly into questions)
      const now = new Date();
      const draftIds: string[] = [];

      for (const q of extractedQuestions) {
        const draftId = crypto.randomUUID();
        draftIds.push(draftId);

        await this.db.insert(questionDrafts).values({
          id: draftId,
          jobId,
          rawImageUrl: input.sourceFileUrl,
          parsedQuestionText: q.questionText,
          parsedOptions: q.options.map((o) => ({
            id: o.id,
            text: o.text,
            ...(o.isLatex !== undefined ? { isLatex: o.isLatex } : {}),
          })),
          parsedCorrectOption: q.correctOption,
          parsedExplanation: q.explanation || null,
          parsedLatexFormulas: q.latexFormulas || [],
          status: "DRAFT",
          confidenceScore: (q.confidenceScore ?? 0.95).toFixed(2),
          targetTopicId: q.targetTopicId || null,
          universityTags: q.universityTags || ["BUET", "DU_KA"],
          createdAt: now,
          updatedAt: now,
        });
      }

      // 4. Update ingestion job to COMPLETED
      await this.db
        .update(ingestionJobs)
        .set({
          status: "COMPLETED",
          totalDetected: extractedQuestions.length,
          updatedAt: new Date(),
        })
        .where(eq(ingestionJobs.id, jobId));

      return {
        jobId,
        totalDetected: extractedQuestions.length,
        draftIds,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      await this.db
        .update(ingestionJobs)
        .set({
          status: "FAILED",
          errorMessage: errMsg,
          updatedAt: new Date(),
        })
        .where(eq(ingestionJobs.id, jobId));

      throw err;
    }
  }

  /**
   * Calls Google AI Studio Gemini 1.5 Flash REST API with structured JSON output schema.
   */
  private async callGeminiFlashApi(
    base64Data: string,
    mimeType: string
  ): Promise<ExtractedQuestionItem[]> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;

    const promptText = `
You are an expert academic digitizer for Bangladeshi university admission exams (BUET, Dhaka University, Medical).
Extract all multiple choice questions from this document.
STRICT RULES:
1. All mathematical formulas, variables, and units must be formatted using standard LaTeX ($...$ for inline, $$...$$ for display block).
2. Options must have id "A", "B", "C", "D" with exact question text and boolean flag isLatex.
3. Identify the correctOption ("A", "B", "C", or "D").
4. Provide step-by-step academic explanation with LaTeX equations.
5. Provide isolated latexFormulas array.
Return JSON adhering strictly to: { "questions": [{ "questionText": string, "options": [{ "id": string, "text": string, "isLatex": boolean }], "correctOption": string, "explanation": string, "latexFormulas": string[], "confidenceScore": number }] }
`;

    const requestPayload = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            {
              text: promptText,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini Flash API failed with status ${response.status}: ${errText}`);
    }

    const data = (await response.json()) as any;
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawContent) {
      throw new Error("Empty response returned from Gemini Flash");
    }

    const parsed = JSON.parse(rawContent) as GeminiExtractionResponse;
    return parsed.questions || [];
  }

  /**
   * Deterministic simulated question extraction for offline / CI environments.
   */
  private getFallbackSimulatedExtraction(): ExtractedQuestionItem[] {
    return [
      {
        questionText:
          "একটি কণার সরণ সমীকরণ $x(t) = 4t^3 - 6t^2 + 5t$। $t = 2\\text{ s}$ সময়ে কণাটির ত্বরণ কত?",
        options: [
          { id: "A", text: "$36\\text{ m/s}^2$", isLatex: true },
          { id: "B", text: "$24\\text{ m/s}^2$", isLatex: true },
          { id: "C", text: "$42\\text{ m/s}^2$", isLatex: true },
          { id: "D", text: "$18\\text{ m/s}^2$", isLatex: true },
        ],
        correctOption: "A",
        explanation:
          "বেগ $v = \\frac{dx}{dt} = 12t^2 - 12t + 5$। ত্বরণ $a = \\frac{dv}{dt} = 24t - 12$। $t=2$ বসালে $a = 24(2) - 12 = 36\\text{ m/s}^2$।",
        latexFormulas: [
          "x(t) = 4t^3 - 6t^2 + 5t",
          "v = \\frac{dx}{dt} = 12t^2 - 12t + 5",
          "a = \\frac{dv}{dt} = 24t - 12",
        ],
        confidenceScore: 0.98,
        universityTags: ["BUET", "CKRUET"],
      },
      {
        questionText:
          "$0.1\\text{ M } \\text{CH}_3\\text{COOH}$ দ্রবণের বিয়োজন মাত্রা $1.34\\%$ হলে এসিডটির $K_a$ কত?",
        options: [
          { id: "A", text: "$1.8 \\times 10^{-5}\\text{ mol/L}$", isLatex: true },
          { id: "B", text: "$1.34 \\times 10^{-4}\\text{ mol/L}$", isLatex: true },
          { id: "C", text: "$2.5 \\times 10^{-6}\\text{ mol/L}$", isLatex: true },
          { id: "D", text: "$3.6 \\times 10^{-5}\\text{ mol/L}$", isLatex: true },
        ],
        correctOption: "A",
        explanation:
          "অসওয়াল্ডের লঘুকরণ সূত্রানুসারে: $K_a = C\\alpha^2 = 0.1 \\times (0.0134)^2 \\approx 1.8 \\times 10^{-5}\\text{ mol/L}$।",
        latexFormulas: ["K_a = C\\alpha^2"],
        confidenceScore: 0.95,
        universityTags: ["DU_KA", "MEDICAL"],
      },
    ];
  }
}
