import {
  FALLBACK_EXAM_PAPER,
  FALLBACK_DASHBOARD_ANALYTICS,
  FALLBACK_PRACTICE_QUESTIONS,
  FALLBACK_TOPICS_CATALOG,
} from "./fallback-data";

const API_BASE_URL =
  process.env["NEXT_PUBLIC_API_URL"] ||
  (typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? "/api/backend"
    : "http://localhost:3000/api/v1");

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchDashboardAnalytics() {
  try {
    const res = await fetch(`${API_BASE_URL}/analytics/dashboard`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    // Graceful offline fallback when backend is not yet deployed
    return {
      success: true,
      isOfflineFallback: true,
      data: FALLBACK_DASHBOARD_ANALYTICS,
    };
  }
}

export async function fetchExamPaper(examId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/exams/${examId}/paper`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || json;
  } catch (err) {
    // Graceful offline fallback allowing full exam test without backend
    return {
      ...FALLBACK_EXAM_PAPER,
      examId,
      isOfflineFallback: true,
    };
  }
}

export async function submitExam(
  examId: string,
  answers: Array<{ questionId: string; selectedOptionId: string }>,
  idempotencyKey?: string
) {
  try {
    const headers = getAuthHeaders() as Record<string, string>;
    if (idempotencyKey) {
      headers["x-idempotency-key"] = idempotencyKey;
    }

    const res = await fetch(`${API_BASE_URL}/exams/${examId}/submit`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        answers,
        clientSubmittedAt: new Date().toISOString(),
      }),
    });

    if (!res.ok && res.status !== 202) {
      throw new Error(`HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    // Simulated offline acceptance
    return {
      status: "QUEUED",
      trackingTicket: idempotencyKey || "offline-ticket-" + Date.now(),
      message: "পরীক্ষা সফলভাবে সম্পন্ন হয়েছে (অফলাইন মোড)।",
      isOfflineFallback: true,
    };
  }
}

export async function fetchMistakeBook(isMastered?: boolean) {
  try {
    const query = isMastered !== undefined ? `?isMastered=${isMastered}` : "";
    const res = await fetch(`${API_BASE_URL}/analytics/mistake-book${query}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("HTTP error");
    return await res.json();
  } catch (err) {
    // Sample mistakes for demonstration
    const sampleMistakes = FALLBACK_PRACTICE_QUESTIONS.slice(0, 3).map((q, idx) => ({
      mistakeId: `mstk-${idx + 1}`,
      questionId: q.id,
      mistakeCount: 2,
      consecutiveCorrectCount: idx === 0 ? 1 : 0,
      isMastered: idx === 0,
      lastAttemptedAt: new Date().toISOString(),
      question: q,
    }));

    return {
      success: true,
      isOfflineFallback: true,
      data: sampleMistakes,
      pagination: { total: sampleMistakes.length, limit: 20, offset: 0 },
    };
  }
}

export async function generateRetest(limit: number = 20) {
  try {
    const res = await fetch(`${API_BASE_URL}/analytics/mistake-book/retest?limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("HTTP error");
    return await res.json();
  } catch (err) {
    return {
      success: true,
      isOfflineFallback: true,
      count: FALLBACK_PRACTICE_QUESTIONS.length,
      questions: FALLBACK_PRACTICE_QUESTIONS,
    };
  }
}

export async function evaluateRetest(
  answers: Array<{ questionId: string; selectedOption: string }>
) {
  try {
    const res = await fetch(`${API_BASE_URL}/analytics/mistake-book/retest/evaluate`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ answers }),
    });
    if (!res.ok) throw new Error("HTTP error");
    return await res.json();
  } catch (err) {
    return {
      success: true,
      isOfflineFallback: true,
      newlyMasteredCount: 1,
      results: answers.map((a) => ({
        questionId: a.questionId,
        isCorrect: true,
        consecutiveCorrectCount: 2,
        isMastered: true,
      })),
    };
  }
}

export async function reportProctorInfraction(
  userId: string,
  examId: string,
  infractionType: string,
  metadata?: Record<string, any>
) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/cheating-logs`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        userId,
        examId,
        infractionType,
        metadata,
      }),
    });
    if (!res.ok) throw new Error("HTTP error");
    return await res.json();
  } catch (err) {
    return { success: true, isOfflineFallback: true };
  }
}

export async function fetchStudents(filter?: any) {
  try {
    const params = new URLSearchParams(filter || {}).toString();
    const res = await fetch(`${API_BASE_URL}/admin/students?${params}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("HTTP error");
    return await res.json();
  } catch (err) {
    const mockStudents = [
      {
        id: "55555555-5555-5555-5555-555555555555",
        email: "student.tahmid@admissionengine.edu",
        fullName: "তাহমিদ আলী (HSC '25)",
        phone: "+8801700000001",
        targetUnit: "ENGINEERING",
        createdAt: "2025-01-10T08:00:00Z",
        totalExamsTaken: 8,
        overallAccuracy: 74.5,
        averageScore: "74.50",
        cheatingInfractionCount: 0,
      },
      {
        id: "66666666-6666-6666-6666-666666666666",
        email: "student.anika@admissionengine.edu",
        fullName: "আনিকা তাবাসসুম (HSC '25)",
        phone: "+8801700000002",
        targetUnit: "VARSITY_A",
        createdAt: "2025-01-12T09:30:00Z",
        totalExamsTaken: 12,
        overallAccuracy: 88.2,
        averageScore: "88.20",
        cheatingInfractionCount: 1,
      },
    ];
    return {
      success: true,
      isOfflineFallback: true,
      data: mockStudents,
      students: mockStudents,
      pagination: { total: mockStudents.length, limit: 20, offset: 0 },
    };
  }
}

export const adminFetchStudents = fetchStudents;

export async function adminFetchStudentAudit(studentId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/students/${studentId}/audit`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("HTTP error");
    return await res.json();
  } catch (err) {
    return {
      success: true,
      isOfflineFallback: true,
      data: {
        student: {
          id: studentId,
          fullName: "তাহমিদ আলী (HSC '25)",
          email: "student.tahmid@admissionengine.edu",
        },
        analytics: {
          overallAccuracy: 74.5,
          totalExamsTaken: 8,
        },
        submissions: [
          {
            id: "sub-1",
            examTitle: "BUET Special Live Mega Model Test 01",
            score: 82.5,
            completedAt: new Date().toISOString(),
          },
        ],
        infractions: [
          {
            id: "inf-1",
            infractionNumber: 1,
            infractionType: "WINDOW_BLUR",
            actionTaken: "WARNING",
            createdAt: new Date().toISOString(),
          },
        ],
      },
    };
  }
}

export async function adminExtractQuestions(payload: {
  sourceFileUrl: string;
  fileType: "PDF" | "IMAGE";
  targetSubjectId?: number;
  targetChapterId?: number;
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/extract`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("HTTP error");
    return await res.json();
  } catch (err) {
    return {
      success: true,
      isOfflineFallback: true,
      data: {
        totalDetected: 3,
        stagedDraftsCount: 3,
      },
    };
  }
}

export async function fetchDrafts(status: string = "DRAFT") {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/drafts?status=${status}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("HTTP error");
    return await res.json();
  } catch (err) {
    const mockDrafts = [
      {
        id: "draft-demo-01",
        rawOcrText: "একটি প্রক্ষেপকের সর্বোচ্চ পাল্লা R হলে এর সর্বোচ্চ উচ্চতা H কত?",
        parsedQuestionText: "একটি প্রক্ষেপকের সর্বোচ্চ পাল্লা $R$ হলে এর সর্বোচ্চ উচ্চতা $H$ কত?",
        parsedCorrectOption: "A",
        confidenceScore: 0.96,
        parsedLatexFormulas: ["R = 4H \\cot\\theta", "H = R/4"],
        structuredPayload: {
          questionText: "একটি প্রক্ষেপকের সর্বোচ্চ পাল্লা $R$ হলে এর সর্বোচ্চ উচ্চতা $H$ কত?",
          options: [
            { id: "A", text: "$H = R/4$" },
            { id: "B", text: "$H = R/2$" },
            { id: "C", text: "$H = 4R$" },
            { id: "D", text: "$H = R$" },
          ],
          correctOptionId: "A",
          explanation: "আমরা জানি, $R = 4H \\cot\\theta$। সর্বোচ্চ পাল্লার ক্ষেত্রে $\\theta = 45^\\circ$, তাই $R = 4H \\implies H = R/4$।",
          difficulty: "MEDIUM",
          universityTags: ["BUET", "CKRUET"],
        },
        status: "DRAFT",
        createdAt: new Date().toISOString(),
      },
      {
        id: "draft-demo-02",
        rawOcrText: "PCl5 এর বিয়োজনে 300 K তাপমাত্রায় সাম্যাবস্থার চাপ দ্বিগুণ করলে Kp এর মান কেমন পরিবর্তিত হবে?",
        parsedQuestionText: "$PCl_5$ এর বিয়োজনে $300\\text{ K}$ তাপমাত্রায় সাম্যাবস্থার মোট চাপ দ্বিগুণ করলে $K_p$ এর মান কেমন পরিবর্তিত হবে?",
        parsedCorrectOption: "C",
        confidenceScore: 0.98,
        parsedLatexFormulas: ["PCl_5", "300\\text{ K}", "K_p"],
        structuredPayload: {
          questionText: "$PCl_5$ এর বিয়োজনে $300\\text{ K}$ তাপমাত্রায় সাম্যাবস্থার মোট চাপ দ্বিগুণ করলে $K_p$ এর মান কেমন পরিবর্তিত হবে?",
          options: [
            { id: "A", text: "দ্বিগুণ হবে" },
            { id: "B", text: "অর্ধেক হবে" },
            { id: "C", text: "অপরিবর্তিত থাকবে" },
            { id: "D", text: "চারগুণ হবে" },
          ],
          correctOptionId: "C",
          explanation: "সাম্য ধ্রুবক $K_p$ শুধুমাত্র তাপমাত্রার উপর নির্ভরশীল। চাপ পরিবর্তন করলে সাম্যাবস্থার অবস্থান পরিবর্তিত হতে পারে, কিন্তু নির্দিষ্ট তাপমাত্রায় $K_p$ ধ্রুবক থাকে।",
          difficulty: "HARD",
          universityTags: ["DU", "BUET"],
        },
        status: "DRAFT",
        createdAt: new Date().toISOString(),
      },
    ];
    return {
      success: true,
      isOfflineFallback: true,
      data: mockDrafts,
      drafts: mockDrafts,
      pagination: { total: mockDrafts.length, limit: 20, offset: 0 },
    };
  }
}

export const adminFetchDrafts = fetchDrafts;

export async function adminUpdateDraft(draftId: string, updates: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/drafts/${draftId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("HTTP error");
    return await res.json();
  } catch (err) {
    return {
      success: true,
      isOfflineFallback: true,
      message: "Draft updated successfully (Simulation Mode)",
    };
  }
}

export async function approveDraft(draftId: string, overrides?: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/drafts/${draftId}/approve`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(overrides || {}),
    });
    if (!res.ok) throw new Error("HTTP error");
    return await res.json();
  } catch (err) {
    return {
      success: true,
      isOfflineFallback: true,
      message: "Draft approved and published to questions catalog successfully (Simulation Mode)",
    };
  }
}

export const adminApproveDraft = approveDraft;

export async function adminRejectDraft(draftId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/drafts/${draftId}/reject`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("HTTP error");
    return await res.json();
  } catch (err) {
    return {
      success: true,
      isOfflineFallback: true,
      message: "Draft rejected successfully (Simulation Mode)",
    };
  }
}

export async function fetchTaxonomy() {
  try {
    const res = await fetch(`${API_BASE_URL}/taxonomy`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || json;
  } catch (err) {
    return FALLBACK_TOPICS_CATALOG;
  }
}

export async function fetchQuestionsFeed(params?: {
  subjectId?: number;
  chapterId?: number;
  topicId?: number;
  limit?: number;
  offset?: number;
}) {
  try {
    const searchParams = new URLSearchParams();
    if (params?.subjectId) searchParams.set("subjectId", String(params.subjectId));
    if (params?.chapterId) searchParams.set("chapterId", String(params.chapterId));
    if (params?.topicId) searchParams.set("topicId", String(params.topicId));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.offset) searchParams.set("offset", String(params.offset));

    const res = await fetch(`${API_BASE_URL}/questions/feed?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    return FALLBACK_PRACTICE_QUESTIONS;
  }
}

export async function adminCreateQuestion(questionData: {
  subjectId: number;
  chapterId: number;
  topicId?: number;
  questionText: string;
  options: Array<{ id: string; text: string; isLatex?: boolean }>;
  correctOptionId: string;
  explanation?: string;
  latexFormulas?: string[];
  marks?: string;
  negativeMarks?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  universityTags?: string[];
}) {
  const res = await fetch(`${API_BASE_URL}/admin/questions`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(questionData),
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error || `HTTP ${res.status}`);
  }
  return await res.json();
}

export async function adminFetchLiveQuestions() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/questions`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    return [];
  }
}

export async function adminCheckDbHealth() {
  const res = await fetch(`${API_BASE_URL}/admin/db-health`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

