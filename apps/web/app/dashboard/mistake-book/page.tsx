"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileCheck2,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Flame,
  ArrowLeft,
  Sparkles,
  Loader2,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Check,
  RotateCcw,
  User,
} from "lucide-react";
import {
  fetchMistakeBook,
  generateRetest,
  evaluateRetest,
} from "@/lib/api-client";
import { LatexRenderer } from "@/components/latex-renderer";
import { useAuth } from "@/lib/auth-context";
import {
  recordQuestionAnswerInStore,
  getStudentData,
  TAHMID_PERSONA,
  FARABI_PERSONA,
} from "@/lib/user-store";

export default function MistakeBookPage() {
  const { user, login } = useAuth();
  const queryClient = useQueryClient();
  const [filterMastered, setFilterMastered] = useState<boolean>(false);

  // Direct In-Card Solving State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [revealedExplanations, setRevealedExplanations] = useState<Record<string, boolean>>({});

  // Retest Quiz Session State
  const [isRetestActive, setIsRetestActive] = useState(false);
  const [retestQuestions, setRetestQuestions] = useState<any[]>([]);
  const [retestAnswers, setRetestAnswers] = useState<Record<string, string>>({});
  const [retestResults, setRetestResults] = useState<any | null>(null);

  // Query Mistake Book
  const { data: mistakesResponse, isLoading } = useQuery({
    queryKey: ["mistake-book", filterMastered, user?.id],
    queryFn: () => fetchMistakeBook(filterMastered),
  });

  // Mutation: Generate Dynamic Retest
  const generateRetestMutation = useMutation({
    mutationFn: () => generateRetest(20),
    onSuccess: (data) => {
      if (data.count === 0) {
        alert(data.message || "সব ভুল প্রশ্ন ইতিমধ্যে মাস্টার করা হয়েছে!");
        return;
      }
      setRetestQuestions(data.questions || []);
      setRetestAnswers({});
      setRetestResults(null);
      setIsRetestActive(true);
    },
    onError: (err: any) => {
      alert(`রিটেস্ট জেনারেট করা যায়নি: ${err.message}`);
    },
  });

  // Mutation: Evaluate Retest
  const evaluateRetestMutation = useMutation({
    mutationFn: () => {
      const answersPayload = Object.entries(retestAnswers).map(([qId, opt]) => ({
        questionId: qId,
        selectedOption: opt,
      }));
      return evaluateRetest(answersPayload);
    },
    onSuccess: (result) => {
      setRetestResults(result);
      queryClient.invalidateQueries({ queryKey: ["mistake-book"] });
      queryClient.invalidateQueries({ queryKey: ["student-analytics"] });
    },
    onError: (err: any) => {
      alert(`ইভ্যালুয়েশন ত্রুটি: ${err.message}`);
    },
  });

  const mistakes = mistakesResponse?.data || [];
  const studentName = user?.fullName || mistakesResponse?.studentName || "শিক্ষার্থী";

  // Handle direct in-card practice
  const handleAnswerCard = (entry: any, optId: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [entry.questionId]: optId }));
    setRevealedExplanations((prev) => ({ ...prev, [entry.questionId]: true }));

    if (user?.id) {
      recordQuestionAnswerInStore(user.id, entry.question, optId, user.fullName);
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["mistake-book"] });
        queryClient.invalidateQueries({ queryKey: ["student-analytics"] });
      }, 50);
    }
  };

  const switchToPersona = (persona: typeof TAHMID_PERSONA) => {
    login(
      {
        id: persona.profile.id,
        fullName: persona.profile.fullName,
        email: persona.profile.email,
        role: persona.profile.role,
        targetUnit: persona.profile.targetUnit,
      },
      `token-${persona.profile.id}`
    );
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ["mistake-book"] });
      queryClient.invalidateQueries({ queryKey: ["student-analytics"] });
    }, 50);
  };

  const isTahmid = (user?.fullName || "").includes("তাহমিদ") || (user?.id || "").includes("tahmid");
  const isFarabi = (user?.fullName || "").includes("ফারাবি") || (user?.id || "").includes("farabi");

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-900 pb-20">
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-blue-600 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>ড্যাশবোর্ড</span>
            </Link>
            <span className="text-zinc-300">|</span>
            <div className="flex items-center space-x-1.5 font-extrabold text-zinc-900 text-sm">
              <FileCheck2 className="h-4 w-4 text-rose-600" />
              <span>আমার ভুল খাতা (Mistake Book)</span>
            </div>
          </div>

          <button
            onClick={() => generateRetestMutation.mutate()}
            disabled={generateRetestMutation.isPending || mistakes.length === 0}
            className="inline-flex items-center space-x-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 active:scale-98 transition disabled:opacity-50"
          >
            {generateRetestMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PlayCircle className="h-4 w-4" />
            )}
            <span>রিভিশন টেস্ট দাও</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        {/* User Switcher Bar */}
        <div className="mb-6 rounded-2xl bg-white border border-zinc-200/80 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-zinc-700">
            <User className="h-4 w-4 text-rose-600" />
            <span>ভুল খাতা ব্যবহারকারী:</span>
            <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md font-bold border border-rose-200">
              {studentName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => switchToPersona(TAHMID_PERSONA)}
              className={`rounded-xl px-2.5 py-1 text-xs font-bold transition ${
                isTahmid
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              তাহমিদ (Physics/Math)
            </button>
            <button
              onClick={() => switchToPersona(FARABI_PERSONA)}
              className={`rounded-xl px-2.5 py-1 text-xs font-bold transition ${
                isFarabi
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              ফারাবি (Bio/Chem)
            </button>
          </div>
        </div>

        {/* Dynamic Header Overview */}
        <div className="mb-6 rounded-3xl bg-white border border-zinc-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-[11px] font-bold text-rose-700 border border-rose-200 mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                <span>২-স্ট্রাইক মাস্টারি নিয়ম (Two-Strike Mastery Rule)</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">
                {studentName} এর পারসোনালাইজড ভুল খাতা
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-2xl">
                তোমার পূর্বে ভুল হওয়া প্রশ্নগুলো আলাদাভাবে তালিকাভুক্ত করা হয়েছে। প্রতিটি প্রশ্ন পরপর ২ বার সঠিক উত্তর দিলে তা মাস্টারড হিসেবে গণ্য হবে।
              </p>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center rounded-xl bg-zinc-100 p-1 self-start sm:self-center shrink-0">
              <button
                onClick={() => setFilterMastered(false)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  !filterMastered
                    ? "bg-white text-zinc-900 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                ভুল প্রশ্নসমূহ
              </button>
              <button
                onClick={() => setFilterMastered(true)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  filterMastered
                    ? "bg-white text-zinc-900 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                মাস্টারড খাতা
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-12 text-zinc-500">
            <Loader2 className="h-8 w-8 animate-spin text-rose-600 mb-2" />
            <span className="text-xs font-medium">ভুলের খাতা লোড হচ্ছে...</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && mistakes.length === 0 && (
          <div className="rounded-3xl border border-zinc-200 bg-white p-12 text-center shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">
              {filterMastered
                ? "এখনও কোনো প্রশ্ন মাস্টার করা হয়নি।"
                : "দারুণ! তোমার কোনো অমীমাংসিত ভুল প্রশ্ন নেই।"}
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-zinc-500 leading-relaxed">
              মডেল টেস্ট অথবা টপিক প্র্যাকটিসে অংশ নাও। ভুল হওয়া যেকোনো প্রশ্ন সরাসরি এখানে চলে আসবে।
            </p>
            <div className="mt-6">
              <Link
                href="/topics"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
              >
                <span>টপিক প্র্যাকটিস শুরু করো</span>
                <BookOpen className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Mistakes List */}
        {!isLoading && mistakes.length > 0 && (
          <div className="space-y-4">
            {mistakes.map((entry: any) => {
              const q = entry.question;
              const qId = entry.questionId || q?.id;
              const userAns = selectedAnswers[qId];
              const isAnswered = !!userAns;
              const isCorrectAnswer = userAns === q?.correctOptionId;
              const showExp = revealedExplanations[qId] || isAnswered;

              return (
                <div
                  key={entry.mistakeId || qId}
                  className="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-xs transition hover:shadow-sm"
                >
                  {/* Top Meta Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-3 mb-4 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="rounded-md bg-rose-50 px-2 py-0.5 font-bold text-rose-700 border border-rose-200">
                        ভুল হয়েছে: {entry.mistakeCount} বার
                      </span>
                      <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-semibold text-zinc-700">
                        টানা সঠিক: {entry.consecutiveCorrectCount} / ২
                      </span>
                      <span className="text-zinc-400">•</span>
                      <span className="font-semibold text-zinc-600">{q?.chapter}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="rounded-md bg-purple-50 text-purple-700 px-2 py-0.5 text-[11px] font-bold border border-purple-200">
                        {q?.universityTag}
                      </span>
                      {entry.isMastered ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          মাস্টারড
                        </span>
                      ) : (
                        <span className="rounded-md bg-amber-50 text-amber-700 px-2 py-0.5 text-[11px] font-bold border border-amber-200">
                          রিভিশন প্রয়োজন
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Text with KaTeX */}
                  <div className="text-sm sm:text-base font-medium leading-relaxed text-zinc-900 mb-5">
                    <LatexRenderer content={q?.questionText || ""} />
                  </div>

                  {/* Interactive Option Buttons (Solve Mistake Directly) */}
                  <div className="space-y-2.5 mb-4">
                    {q?.options?.map((opt: any) => {
                      const isSelected = userAns === opt.id;
                      const isThisCorrect = opt.id === q?.correctOptionId;

                      let btnStyle =
                        "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50";

                      if (isAnswered) {
                        if (isThisCorrect) {
                          btnStyle =
                            "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold";
                        } else if (isSelected && !isThisCorrect) {
                          btnStyle =
                            "border-rose-500 bg-rose-50 text-rose-900 font-semibold";
                        }
                      }

                      return (
                        <button
                          key={opt.id}
                          disabled={isAnswered}
                          onClick={() => handleAnswerCard(entry, opt.id)}
                          className={`w-full text-left rounded-2xl border p-3.5 text-xs sm:text-sm transition flex items-center justify-between min-h-[46px] ${btnStyle}`}
                        >
                          <div className="flex items-center space-x-3">
                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold ${
                                isAnswered && isThisCorrect
                                  ? "bg-emerald-600 text-white"
                                  : isAnswered && isSelected
                                  ? "bg-rose-600 text-white"
                                  : "bg-zinc-100 text-zinc-600"
                              }`}
                            >
                              {opt.id}
                            </span>
                            <div className="overflow-x-auto">
                              <LatexRenderer content={opt.text} />
                            </div>
                          </div>

                          {isAnswered && isThisCorrect && (
                            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                          )}
                          {isAnswered && isSelected && !isThisCorrect && (
                            <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Notes & Explanation Toggle */}
                  {entry.notes && (
                    <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-3 text-xs text-amber-900 mb-3">
                      <strong>📝 তোমার নোট:</strong> {entry.notes}
                    </div>
                  )}

                  {showExp && q?.explanation && (
                    <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-950 mt-3 space-y-1.5">
                      <div className="flex items-center space-x-1.5 font-bold text-blue-900">
                        <Lightbulb className="h-4 w-4 text-amber-500" />
                        <span>বৈজ্ঞানিক সমাধান ও ব্যাখ্যা:</span>
                      </div>
                      <div className="leading-relaxed">
                        <LatexRenderer content={q.explanation} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Retest Quiz Modal */}
      {isRetestActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-rose-600" />
                <h3 className="font-extrabold text-base text-zinc-900">
                  রিভিশন রিটেস্ট সেশন ({retestQuestions.length} টি প্রশ্ন)
                </h3>
              </div>
              <button
                onClick={() => setIsRetestActive(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              >
                ✕
              </button>
            </div>

            {/* If Results received */}
            {retestResults ? (
              <div className="space-y-4">
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-center">
                  <h4 className="text-base font-bold text-emerald-900">
                    রিটেস্ট ফলাফল মূল্যায়িত হয়েছে!
                  </h4>
                  <p className="text-xs text-emerald-800 mt-1">
                    মোট প্রশ্ন: {retestResults.totalQuestions} | সঠিক:{" "}
                    {retestResults.totalCorrect} | ভুল: {retestResults.totalIncorrect} | নতুন মাস্টারড:{" "}
                    {retestResults.newlyMasteredCount}
                  </p>
                </div>

                <div className="space-y-3">
                  {retestResults.results?.map((res: any, idx: number) => (
                    <div
                      key={res.questionId}
                      className={`rounded-2xl border p-3.5 text-xs ${
                        res.isCorrect
                          ? "border-emerald-200 bg-emerald-50/50"
                          : "border-rose-200 bg-rose-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold mb-1">
                        <span className={res.isCorrect ? "text-emerald-700" : "text-rose-700"}>
                          প্রশ্ন {idx + 1}: {res.isCorrect ? "সঠিক উত্তর!" : "ভুল উত্তর"}
                        </span>
                        <span>
                          টানা সঠিক: {res.consecutiveCorrectCount}/২{" "}
                          {res.isMastered && "🎉 (মাস্টারড)"}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-600">
                        {res.isCorrect
                          ? "দারুণ! তুমি সঠিক উত্তর দিয়েছ।"
                          : "পুনরায় চেষ্টা করো। সঠিক ব্যাখ্যা লক্ষ্য করো।"}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setIsRetestActive(false)}
                  className="w-full rounded-2xl bg-zinc-900 py-3 text-xs font-bold text-white hover:bg-zinc-800 transition"
                >
                  ফলাফল বন্ধ করো
                </button>
              </div>
            ) : (
              /* Quiz Questions */
              <div className="space-y-6">
                {retestQuestions.map((q: any, idx: number) => (
                  <div key={q.id} className="rounded-2xl border border-zinc-200 p-4">
                    <div className="flex items-center space-x-2 text-xs font-bold text-zinc-500 mb-2">
                      <span className="rounded-md bg-rose-50 text-rose-700 px-2 py-0.5 border border-rose-200">
                        প্রশ্ন {idx + 1}
                      </span>
                      <span>{q.chapter}</span>
                    </div>

                    <div className="text-sm font-medium text-zinc-900 mb-4">
                      <LatexRenderer content={q.questionText} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options?.map((opt: any) => {
                        const isSelected = retestAnswers[q.id] === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() =>
                              setRetestAnswers((prev) => ({
                                ...prev,
                                [q.id]: opt.id,
                              }))
                            }
                            className={`flex items-center space-x-2 rounded-xl border p-3 text-left transition ${
                              isSelected
                                ? "border-rose-500 bg-rose-50 text-rose-900 font-bold"
                                : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700"
                            }`}
                          >
                            <span className="font-bold">{opt.id}.</span>
                            <LatexRenderer content={opt.text} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => evaluateRetestMutation.mutate()}
                  disabled={
                    evaluateRetestMutation.isPending ||
                    Object.keys(retestAnswers).length === 0
                  }
                  className="w-full rounded-2xl bg-rose-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-rose-700 active:scale-98 transition disabled:opacity-50"
                >
                  {evaluateRetestMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  ) : (
                    "উত্তর সাবমিট করো ও মাস্টারি যাচাই করো"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
