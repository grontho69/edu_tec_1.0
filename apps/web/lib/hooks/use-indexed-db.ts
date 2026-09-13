"use client";

import { useState, useEffect, useCallback } from "react";
import {
  saveAnswer,
  getDraft,
  clearDraft,
  recordLocalInfraction,
  getLocalInfractions,
  type ExamDraftRecord,
  type InfractionRecord,
} from "@/lib/storage/exam-store";

export function useIndexedDB() {
  const [isSupported, setIsSupported] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const hasIndexedDb =
      typeof window !== "undefined" &&
      "indexedDB" in window &&
      window.indexedDB !== undefined;

    setIsSupported(hasIndexedDb);
    setIsReady(true);
  }, []);

  const saveExamAnswer = useCallback(
    async (
      examId: string,
      questionId: string,
      optionId: string,
      serverOffsetMs: number = 0
    ) => {
      if (typeof window === "undefined") return;
      await saveAnswer(examId, questionId, optionId, serverOffsetMs);
    },
    []
  );

  const loadExamDraft = useCallback(
    async (examId: string): Promise<ExamDraftRecord | null> => {
      if (typeof window === "undefined") return null;
      return await getDraft(examId);
    },
    []
  );

  const clearExamDraft = useCallback(async (examId: string) => {
    if (typeof window === "undefined") return;
    await clearDraft(examId);
  }, []);

  const logInfraction = useCallback(
    async (examId: string, type: string) => {
      if (typeof window === "undefined") return;
      await recordLocalInfraction(examId, type);
    },
    []
  );

  const fetchInfractions = useCallback(
    async (examId: string): Promise<InfractionRecord[]> => {
      if (typeof window === "undefined") return [];
      return await getLocalInfractions(examId);
    },
    []
  );

  return {
    isSupported,
    isReady,
    saveExamAnswer,
    loadExamDraft,
    clearExamDraft,
    logInfraction,
    fetchInfractions,
  };
}
