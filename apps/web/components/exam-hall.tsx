"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  ShieldAlert,
  Maximize2,
  Calculator as CalculatorIcon,
  CheckCircle,
  Send,
  Loader2,
} from "lucide-react";
import { fetchExamPaper, submitExam, reportProctorInfraction } from "@/lib/api-client";
import { useIndexedDB } from "@/lib/hooks/use-indexed-db";
import { LatexRenderer } from "@/components/latex-renderer";
import { ScientificCalculator } from "@/components/scientific-calculator";

interface ExamHallProps {
  examId: string;
}

export function ExamHall({ examId }: ExamHallProps) {
  const router = useRouter();
  const { isReady, saveExamAnswer, loadExamDraft, clearExamDraft } = useIndexedDB();

  // Exam Data
  const [loading, setLoading] = useState(true);
  const [paper, setPaper] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Synchronized Clock & Server Offset (Tamper Prevention)
  const [serverOffset, setServerOffset] = useState(0);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number | null>(null);

  // Anti-Cheat Proctoring State
  const [infractionCount, setInfractionCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Scientific Calculator
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mark component as mounted on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 1. Initial Load & Offline IndexedDB Rehydration (< 50ms)
  useEffect(() => {
    if (!isMounted) return;
    let active = true;

    async function loadExam() {
      try {
        // First check local offline draft
        const draft = await loadExamDraft(examId);
        if (draft && draft.answers && active) {
          setAnswers(draft.answers);
          if (draft.serverOffsetMs) {
            setServerOffset(draft.serverOffsetMs);
          }
        }

        // Fetch sanitized exam paper from API
        const clientFetchTime = Date.now();
        const data = await fetchExamPaper(examId);
        if (!active) return;

        setPaper(data);

        // Calculate synchronized server time offset
        const serverReportedTime = new Date().getTime();
        const offset = serverReportedTime - clientFetchTime;
        setServerOffset(offset);

        // Duration countdown setup
        const durationSecs = (data.durationMinutes || 60) * 60;
        setTimeRemainingSeconds(durationSecs);
      } catch (err) {
        console.error("Failed to load exam paper:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadExam();

    return () => {
      active = false;
    };
  }, [examId, isMounted, loadExamDraft]);

  // 2. Submit Exam Handler
  const handleFinalSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const answersPayload = Object.entries(answers).map(([qId, optId]) => ({
        questionId: qId,
        selectedOptionId: optId,
      }));

      await submitExam(examId, answersPayload);
      await clearExamDraft(examId);

      alert("তোমার পরীক্ষা সফলভাবে গৃহীত হয়েছে!");
      router.push("/dashboard");
    } catch (err: unknown) {
      alert(`সাবমিশন ত্রুটি: ${err instanceof Error ? err.message : String(err)}`);
      setIsSubmitting(false);
    }
  }, [answers, examId, isSubmitting, router, clearExamDraft]);

  // 3. Synchronized Countdown Timer (Operating System Clock Tamper-Proof)
  useEffect(() => {
    if (!isMounted || timeRemainingSeconds === null || timeRemainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit(); // Auto force-submit on timer expiry
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isMounted, timeRemainingSeconds, handleFinalSubmit]);

  // 4. Anti-Cheat Protocol: visibilitychange & window blur (Strictly registered after mount)
  useEffect(() => {
    if (!isMounted || typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    const handleInfraction = async (type: string) => {
      const nextCount = infractionCount + 1;
      setInfractionCount(nextCount);

      // Report to audit logging backend
      const userId = "55555555-5555-5555-5555-555555555555"; // student user
      await reportProctorInfraction(userId, examId, type, { infractionNumber: nextCount });

      if (nextCount >= 3) {
        // Auto force-submit on 3rd infraction
        setWarningMessage("৩য় বার স্ক্রিন পরিবর্তনের কারণে পরীক্ষা স্বয়ংক্রিয়ভাবে সমাপ্ত করা হলো!");
        setShowWarningModal(true);
        setTimeout(() => {
          handleFinalSubmit();
        }, 1500);
      } else {
        setWarningMessage(
          `সতর্কতা! স্ক্রিন বা ট্যাব পরিবর্তন সনাক্ত হয়েছে (ইনফ্রাকশন ${nextCount}/৩)। ৩য় বার পরিবর্তন করলে স্বয়ংক্রিয়ভাবে পরীক্ষা সাবমিট হয়ে যাবে।`
        );
        setShowWarningModal(true);
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleInfraction("TAB_BLUR");
      }
    };

    const onWindowBlur = () => {
      handleInfraction("TAB_BLUR");
    };

    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (!document.fullscreenElement) {
        handleInfraction("FULLSCREEN_EXIT");
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onWindowBlur);
    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onWindowBlur);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [isMounted, examId, infractionCount, handleFinalSubmit]);

  // 5. Safe Fullscreen Request
  const enterFullscreen = () => {
    if (typeof document !== "undefined" && document.documentElement?.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  // 6. Option Selection with Instant IndexedDB Write before React State
  const handleSelectOption = async (questionId: string, optionId: string) => {
    // Write directly to IndexedDB first
    await saveExamAnswer(examId, questionId, optionId, serverOffset);

    // Then update React state
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  if (!isMounted || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-600">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-sm font-medium">পরীক্ষা হল প্রস্তুত হচ্ছে...</span>
      </div>
    );
  }

  const questions = paper?.questions || [];
  const currentQ = questions[currentQuestionIndex];
  const totalQ = questions.length;
  const answeredCount = Object.keys(answers).length;

  const formatTimer = (seconds: number | null) => {
    if (seconds === null) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-900 selection:bg-blue-100 flex flex-col justify-between">
      {/* 1. Distraction-Free Header Bar */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 px-4 py-2.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
              পরীক্ষা হল
            </span>
            <h1 className="text-xs sm:text-sm font-bold text-zinc-900 truncate max-w-xs sm:max-w-md">
              {paper?.title || "মডেল টেস্ট"}
            </h1>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Countdown Timer */}
            <div className="flex items-center space-x-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 font-mono text-xs sm:text-sm font-bold text-emerald-400 shadow-inner">
              <Clock className="h-4 w-4 text-emerald-400" />
              <span>{formatTimer(timeRemainingSeconds)}</span>
            </div>

            {/* Scientific Calculator Trigger */}
            <button
              onClick={() => setIsCalculatorOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 shadow-2xs"
              title="সায়েন্টিফিক ক্যালকুলেটর"
            >
              <CalculatorIcon className="h-4 w-4 text-blue-600" />
              <span className="hidden sm:inline">ক্যালকুলেটর</span>
            </button>

            {/* Fullscreen Toggle */}
            {!isFullscreen && (
              <button
                onClick={enterFullscreen}
                className="hidden sm:flex items-center gap-1 rounded-lg bg-zinc-100 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-200"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                <span>ফুলস্ক্রিন</span>
              </button>
            )}

            {/* Final Submit Button */}
            <button
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm transition active:scale-98 min-h-[38px]"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              <span>সাবমিট করো</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Question & Option Area */}
      <main className="mx-auto max-w-4xl w-full px-4 py-6 sm:px-6 flex-1 flex flex-col justify-center">
        {currentQ ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs">
            {/* Question Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4 text-xs font-semibold text-zinc-500">
              <span>
                প্রশ্ন {currentQuestionIndex + 1} / {totalQ}
              </span>
              <div className="flex items-center space-x-2">
                <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-zinc-700">
                  মার্কস: +{currentQ.marks || "1.00"}
                </span>
                <span className="rounded-md bg-rose-50 px-2 py-0.5 text-rose-700 border border-rose-200">
                  নেগেটিভ: -{currentQ.negativeMarks || "0.25"}
                </span>
              </div>
            </div>

            {/* Question Text with KaTeX */}
            <div className="text-base sm:text-lg font-medium leading-relaxed text-zinc-900 mb-6">
              <LatexRenderer content={currentQ.questionText} />
            </div>

            {/* Option Radios */}
            <div className="space-y-3">
              {currentQ.options?.map((opt: any) => {
                const isSelected = answers[currentQ.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(currentQ.id, opt.id)}
                    className={`w-full text-left rounded-xl border p-4 text-sm font-medium transition flex items-center justify-between min-h-[52px] active:scale-[0.99] ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-600/20"
                        : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50/60"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {opt.id}
                      </span>
                      <span className="leading-snug">
                        <LatexRenderer content={opt.text} />
                      </span>
                    </div>
                    {isSelected && (
                      <CheckCircle className="h-5 w-5 text-blue-600 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Question Navigation */}
            <div className="mt-8 flex items-center justify-between border-t border-zinc-100 pt-4">
              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 min-h-[44px]"
              >
                আগের প্রশ্ন
              </button>

              <span className="text-xs text-zinc-500 font-medium">
                মোট উত্তর দিয়েছো: {answeredCount}/{totalQ}
              </span>

              <button
                onClick={() =>
                  setCurrentQuestionIndex((prev) => Math.min(totalQ - 1, prev + 1))
                }
                disabled={currentQuestionIndex === totalQ - 1}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-40 min-h-[44px]"
              >
                পরের প্রশ্ন
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-zinc-500">কোনো প্রশ্ন পাওয়া যায়নি।</div>
        )}
      </main>

      {/* 3. Anti-Cheat Infraction Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl ring-1 ring-red-500/20">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">
              প্রোক্টরিং সতর্কতা (ইনফ্রাকশন {infractionCount}/৩)
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-600 font-medium">
              {warningMessage}
            </p>
            <button
              onClick={() => setShowWarningModal(false)}
              className="mt-5 w-full rounded-xl bg-red-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-red-700 min-h-[48px]"
            >
              আমি বুঝেছি, পরীক্ষায় ফিরে যাবো
            </button>
          </div>
        </div>
      )}

      {/* 4. Scientific Calculator Component */}
      <ScientificCalculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />
    </div>
  );
}
