const API_BASE_URL =
  process.env["NEXT_PUBLIC_API_URL"] ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"
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
  const res = await fetch(`${API_BASE_URL}/analytics/dashboard`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error(`Dashboard fetch failed with status ${res.status}`);
  }
  return res.json();
}

export async function fetchExamPaper(examId: string) {
  const res = await fetch(`${API_BASE_URL}/exams/${examId}/paper`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch exam paper: ${res.statusText}`);
  }
  return res.json();
}

export async function submitExam(
  examId: string,
  answers: Array<{ questionId: string; selectedOptionId: string }>,
  idempotencyKey?: string
) {
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
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Exam submission failed with status ${res.status}`);
  }

  return res.json();
}

export async function fetchMistakeBook(isMastered?: boolean) {
  const query = isMastered !== undefined ? `?isMastered=${isMastered}` : "";
  const res = await fetch(`${API_BASE_URL}/analytics/mistake-book${query}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch mistake book");
  return res.json();
}

export async function generateRetest(limit: number = 20) {
  const res = await fetch(`${API_BASE_URL}/analytics/mistake-book/retest?limit=${limit}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to generate retest");
  return res.json();
}

export async function evaluateRetest(
  answers: Array<{ questionId: string; selectedOption: string }>
) {
  const res = await fetch(`${API_BASE_URL}/analytics/mistake-book/retest/evaluate`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ answers }),
  });
  if (!res.ok) throw new Error("Failed to evaluate retest");
  return res.json();
}

export async function reportProctorInfraction(
  userId: string,
  examId: string,
  infractionType: string,
  metadata?: Record<string, unknown>
) {
  const res = await fetch(`${API_BASE_URL}/admin/proctor/infraction`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      userId,
      examId,
      infractionType,
      metadata: metadata || {},
    }),
  });
  if (!res.ok) {
    console.warn("Failed to report proctor infraction:", res.status);
    return null;
  }
  return res.json();
}

// Admin Command Center APIs
export async function adminFetchStudents() {
  const res = await fetch(`${API_BASE_URL}/admin/students`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch students");
  return res.json();
}

export async function adminFetchStudentAudit(studentId: string) {
  const res = await fetch(`${API_BASE_URL}/admin/students/${studentId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch student audit");
  return res.json();
}

export async function adminExtractQuestions(payload: {
  sourceFileUrl: string;
  fileType: "PDF" | "IMAGE";
  targetSubjectId: number;
  targetChapterId: number;
  base64Data?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/admin/ingestion/extract`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to trigger multimodal extraction");
  return res.json();
}

export async function adminFetchDrafts(status = "DRAFT") {
  const res = await fetch(`${API_BASE_URL}/admin/drafts?status=${status}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch drafts");
  return res.json();
}

export async function adminUpdateDraft(
  draftId: string,
  payload: Record<string, unknown>
) {
  const res = await fetch(`${API_BASE_URL}/admin/drafts/${draftId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update draft");
  return res.json();
}

export async function adminApproveDraft(draftId: string) {
  const res = await fetch(`${API_BASE_URL}/admin/drafts/${draftId}/approve`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to approve draft");
  return res.json();
}

export async function adminRejectDraft(draftId: string) {
  const res = await fetch(`${API_BASE_URL}/admin/drafts/${draftId}/reject`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to reject draft");
  return res.json();
}
