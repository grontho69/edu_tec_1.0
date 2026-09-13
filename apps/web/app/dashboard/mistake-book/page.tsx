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
} from "lucide-react";
import {
  fetchMistakeBook,
  generateRetest,
  evaluateRetest,
} from "@/lib/api-client";
import { LatexRenderer } from "@/components/latex-renderer";

export default function MistakeBookPage() {
  const queryClient = useQueryClient();
  const [filterMastered, setFilterMastered] = useState<boolean>(false);

  // Retest Quiz Session State
  const [isRetestActive, setIsRetestActive] = useState(false);
  const [retestQuestions, setRetestQuestions] = useState<any[]>([]);
  const [retestAnswers, setRetestAnswers] = useState<Record<string, string>>({});
  const [retestResults, setRetestResults] = useState<any | null>(null);

  // Query Mistake Book
  const { data: mistakesResponse, isLoading } = useQuery({
    queryKey: ["mistake-book", filterMastered],
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

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-900 pb-20">
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-xs font-semibold text-zinc-600 hover:text-zinc-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>ড্যাশবোর্ড</span>
            </Link>
            <span className="text-zinc-300">|</span>
            <div className="flex items-center space-x-1.5 font-bold text-zinc-900 text-sm">
              <FileCheck2 className="h-4 w-4 text-rose-600" />
              <span>আমার ভুল খাতা (Mistake Book)</span>
            </div>
          </div>

          <button
            onClick={() => generateRetestMutation.mutate()}
            disabled={generateRetestMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 active:scale-98 transition min-h-[42px]"
          >
            {generateRetestMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PlayCircle className="h-4 w-4" />
            )}
            <span>রিভিশন রিটেস্ট শুরু করো (১-ক্লিক)</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        {/* Banner with Two-Strike rule explanation */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 sm:p-5 mb-6">
          <div className="flex items-start space-x-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white font-bold">
              2x
            </div>
            <div>
              <h2 className="text-sm font-bold text-rose-900">
                টু-স্ট্রাইক মাস্টারি নিয়ম (Two-Strike Mastery Rule)
              </h2>
              <p className="mt-0.5 text-xs text-rose-800 leading-relaxed">
                ভুল খাতার কোনো প্রশ্ন আয়ত্তে আনার জন্য রিটেস্টে টানা ২ বার সঠিকভাবে উত্তর দিতে হবে। যেকোনো ১ বার ভুল হলে টানা সঠিকের সংখ্যা পুনরায় ০ তে রিসেট হবে।
              </p>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterMastered(false)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                !filterMastered
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              রিভিশন বাকি ({mistakes.length})
            </button>
            <button
              onClick={() => setFilterMastered(true)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                filterMastered
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              মাস্টার করা সম্পন্ন
            </button>
          </div>
          <span className="text-xs text-zinc-500 font-medium">
            ব্যর্থতার সংখ্যা অনুযায়ী সাজানো
          </span>
        </div>

        {/* Mistakes List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-rose-600" />
          </div>
        ) : mistakes.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-xs">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 mb-3" />
            <h3 className="text-base font-bold text-zinc-900">
              {filterMastered
                ? "এখনও কোনো প্রশ্ন মাস্টার করা হয়নি।"
                : "সব ভুল প্রশ্ন মাস্টার করা শেষ! নতুন মডেল টেস্টে অংশ নাও।"}
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              নিয়মিত এক্সামে অংশ নিয়ে ভুলগুলো ট্র্যাক করো।
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {mistakes.map((entry: any) => (
              <div
                key={entry.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs transition hover:shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5 mb-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="rounded-md bg-rose-50 px-2 py-0.5 font-bold text-rose-700 border border-rose-200">
                      ভুল হয়েছে: {entry.mistakeCount} বার
                    </span>
                    <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-medium text-zinc-700">
                      টানা সঠিক: {entry.consecutiveCorrectCount} / ২
                    </span>
                  </div>

                  {entry.isMastered ? (
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-600 text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      মাস্টারড
                    </span>
                  ) : (
                    <span className="text-zinc-400 font-medium">
                      মাস্টারি অপেক্ষমান
                    </span>
                  )}
                </div>

                {/* Question text */}
                <div className="text-sm sm:text-base font-medium text-zinc-900 leading-relaxed mb-3">
                  <LatexRenderer content={entry.question?.questionText || ""} />
                </div>

                {/* Options list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {entry.question?.options?.map((opt: any) => (
                    <div
                      key={opt.id}
                      className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-2.5 flex items-center space-x-2 text-zinc-700"
                    >
                      <span className="font-bold text-zinc-500">{opt.id}.</span>
                      <LatexRenderer content={opt.text} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Retest Quiz Modal */}
      {isRetestActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-rose-600" />
                <h3 className="font-bold text-base text-zinc-900">
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
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
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
                      className={`rounded-xl border p-3.5 text-xs ${
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
                      <div className="text-zinc-600">
                        তোমার উত্তর: <span className="font-bold">{res.selectedOption}</span> | সঠিক উত্তর:{" "}
                        <span className="font-bold">{res.correctOptionId}</span>
                      </div>
                      {res.explanation && (
                        <div className="mt-2 text-zinc-700 border-t border-zinc-200/60 pt-1.5">
                          <strong>ব্যাখ্যা:</strong> <LatexRenderer content={res.explanation} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setIsRetestActive(false)}
                  className="w-full rounded-xl bg-zinc-900 py-3 text-xs font-bold text-white shadow-sm hover:bg-zinc-800 min-h-[44px]"
                >
                  সমাপ্ত করো
                </button>
              </div>
            ) : (
              /* Retest Question Answering */
              <div className="space-y-6">
                {retestQuestions.map((q, idx) => (
                  <div key={q.id} className="rounded-xl border border-zinc-200 p-4">
                    <div className="text-xs font-bold text-zinc-500 mb-2">
                      প্রশ্ন {idx + 1} / {retestQuestions.length} (পূর্বের ভুল: {q.mistakeCount} বার)
                    </div>
                    <div className="text-sm font-medium text-zinc-900 mb-3">
                      <LatexRenderer content={q.questionText} />
                    </div>

                    <div className="space-y-2">
                      {q.options?.map((opt: any) => {
                        const isSelected = retestAnswers[q.id] === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() =>
                              setRetestAnswers((prev) => ({ ...prev, [q.id]: opt.id }))
                            }
                            className={`w-full text-left rounded-lg border p-2.5 text-xs font-medium transition flex items-center justify-between ${
                              isSelected
                                ? "border-rose-600 bg-rose-50 text-rose-900 ring-1 ring-rose-500"
                                : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800"
                            }`}
                          >
                            <span className="flex items-center space-x-2">
                              <span className="font-bold">{opt.id}.</span>
                              <LatexRenderer content={opt.text} />
                            </span>
                            {isSelected && <CheckCircle2 className="h-4 w-4 text-rose-600 shrink-0" />}
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
                  className="w-full rounded-xl bg-rose-600 py-3.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 disabled:opacity-50 min-h-[48px] flex items-center justify-center gap-2"
                >
                  {evaluateRetestMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  <span>রিটেস্ট জমা দাও এবং মূল্যায়ন দেখো</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
