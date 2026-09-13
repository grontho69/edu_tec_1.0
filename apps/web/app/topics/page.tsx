"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Atom,
  FlaskConical,
  Binary,
  Dna,
  Search,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { FALLBACK_TOPICS_CATALOG, FALLBACK_PRACTICE_QUESTIONS } from "@/lib/fallback-data";
import { LatexRenderer } from "@/components/latex-renderer";
import { useAuthGuard } from "@/lib/with-auth";
import { Loader2 } from "lucide-react";

export default function TopicsPracticePage() {
  const { isLoading: authLoading } = useAuthGuard();
  const [activeSubjectId, setActiveSubjectId] = useState("phy");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedChapter, setExpandedChapter] = useState<string>("phy-ch4");
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(103);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showExplanations, setShowExplanations] = useState<Record<string, boolean>>({});

  const activeSubject =
    FALLBACK_TOPICS_CATALOG.find((s) => s.id === activeSubjectId) || FALLBACK_TOPICS_CATALOG[0];

  // Filter questions for the selected topic
  const questions = FALLBACK_PRACTICE_QUESTIONS.filter((q) => {
    if (searchQuery.trim()) {
      return (
        q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.chapter.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.universityTag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  const handleSelectOption = (qId: string, optId: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optId }));
    setShowExplanations((prev) => ({ ...prev, [qId]: true }));
  };

  const getSubjectIcon = (id: string) => {
    switch (id) {
      case "phy":
        return <Atom className="h-4 w-4" />;
      case "chem":
        return <FlaskConical className="h-4 w-4" />;
      case "math":
        return <Binary className="h-4 w-4" />;
      case "bio":
        return <Dna className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-900 pb-20">
      {authLoading && (
        <div className="fixed inset-0 bg-white/80 z-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center space-x-3">
            <Link href="/" className="font-bold text-lg text-zinc-900">
              Admission <span className="text-blue-600">Engine</span>
            </Link>
            <span className="text-xs font-semibold text-zinc-400">|</span>
            <span className="text-xs font-semibold text-zinc-600">টপিকভিত্তিক প্রশ্ন ব্যাংক ও প্র্যাকটিস</span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 shadow-2xs"
            >
              <span>ড্যাশবোর্ড</span>
            </Link>
            <Link
              href="/exams/8f8b89e2-1111-2222-3333-444455556666/room"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs"
            >
              <span>আজকের মেগা টেস্ট</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        {/* Page Hero */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-950 to-zinc-900 p-6 text-white shadow-md">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/20 px-2.5 py-0.5 text-xs font-bold text-blue-300 border border-blue-400/20 mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              অধ্যায় ও টপিকভিত্তিক প্রশ্ন ভাণ্ডার
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              টপিক প্র্যাকটিস ও বিগত বছরের প্রশ্ন ব্যাংক
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-300">
              বুয়েট, ঢাকা বিশ্ববিদ্যালয় এবং মেডিকেলের বিগত ১০ বছরের প্রশ্ন বিস্তারিত সমাধান ও বৈজ্ঞানিক ব্যাখ্যাসহ অনুশীলন করো।
            </p>
          </div>
        </div>

        {/* Subject Navigation Tabs */}
        <div className="flex overflow-x-auto pb-2 gap-2 mb-6 border-b border-zinc-200">
          {FALLBACK_TOPICS_CATALOG.map((subject) => {
            const isActive = subject.id === activeSubjectId;
            return (
              <button
                key={subject.id}
                onClick={() => {
                  setActiveSubjectId(subject.id);
                  if (subject.chapters[0]) {
                    setExpandedChapter(subject.chapters[0].id);
                  }
                }}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition active:scale-98 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                {getSubjectIcon(subject.id)}
                <span>{subject.name}</span>
                <span
                  className={`rounded-md px-1.5 py-0.2 text-[10px] ${
                    isActive ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {subject.totalQuestions}টি
                </span>
              </button>
            );
          })}
        </div>

        {/* Two-Column Explorer: Left Syllabus Taxonomy, Right Questions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Chapters & Topics Accordion */}
          <div className="lg:col-span-4 space-y-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  {activeSubject?.name} — সিলেবাস সূচি
                </h3>
                <span className="text-xs text-zinc-400">
                  {activeSubject?.chapters.length}টি অধ্যায়
                </span>
              </div>

              <div className="space-y-2">
                {activeSubject?.chapters.map((chapter) => {
                  const isExpanded = expandedChapter === chapter.id;
                  return (
                    <div
                      key={chapter.id}
                      className="rounded-xl border border-zinc-200 overflow-hidden bg-white"
                    >
                      <button
                        onClick={() =>
                          setExpandedChapter(isExpanded ? "" : chapter.id)
                        }
                        className="w-full flex items-center justify-between p-3 text-left text-xs font-bold text-zinc-900 bg-zinc-50/70 hover:bg-zinc-100/70 transition"
                      >
                        <span className="truncate pr-2">{chapter.name}</span>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-zinc-500 shrink-0" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="p-2 space-y-1 bg-white border-t border-zinc-100">
                          {chapter.topics.map((topic) => {
                            const isSelected = selectedTopicId === topic.id;
                            return (
                              <button
                                key={topic.id}
                                onClick={() => setSelectedTopicId(topic.id)}
                                className={`w-full flex items-center justify-between rounded-lg p-2 text-left text-xs font-medium transition ${
                                  isSelected
                                    ? "bg-blue-50 text-blue-900 font-semibold"
                                    : "text-zinc-700 hover:bg-zinc-50"
                                }`}
                              >
                                <div className="flex items-center space-x-2 truncate">
                                  <span className="text-[11px] text-zinc-400 font-mono">
                                    #{topic.id}
                                  </span>
                                  <span className="truncate">{topic.name}</span>
                                </div>
                                <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                                  {topic.alert && (
                                    <span className="inline-flex items-center rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 border border-rose-200">
                                      দুর্বল ({topic.accuracy}%)
                                    </span>
                                  )}
                                  <span className="text-[11px] text-zinc-400">
                                    {topic.questionsCount}টি
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Question Practice Feed */}
          <div className="lg:col-span-8 space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="প্রশ্ন বা বিষয় লিখে সার্চ করো (যেমন: ব্যাংকিং, দ্রাব্যতা, লিমিট)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-hidden shadow-2xs"
                />
              </div>
            </div>

            {/* Questions List */}
            {questions.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center text-zinc-500">
                কোনো প্রশ্ন পাওয়া যায়নি। অন্য টপিক বা কিওয়ার্ড দিয়ে অনুসন্ধান করো।
              </div>
            ) : (
              questions.map((q, idx) => {
                const userAns = selectedAnswers[q.id];
                const showExpl = showExplanations[q.id];
                const isAnswered = !!userAns;
                const isCorrect = userAns === q.correctOptionId;

                return (
                  <div
                    key={q.id}
                    className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-xs transition hover:shadow-sm"
                  >
                    {/* Question Meta */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-3 mb-4 text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="rounded-md bg-blue-600 text-white px-2 py-0.5 font-bold text-[10px]">
                          প্রশ্ন {idx + 1}
                        </span>
                        <span className="font-semibold text-zinc-700">{q.chapter}</span>
                        <span className="text-zinc-400">•</span>
                        <span className="text-zinc-500">{q.topic}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="rounded-md bg-purple-50 text-purple-700 px-2 py-0.5 text-[11px] font-bold border border-purple-200">
                          {q.universityTag} ({q.year})
                        </span>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            q.difficulty === "HARD"
                              ? "bg-rose-50 text-rose-700"
                              : q.difficulty === "MEDIUM"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {q.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Question Text with KaTeX */}
                    <div className="text-sm sm:text-base font-medium leading-relaxed text-zinc-900 mb-5">
                      <LatexRenderer content={q.questionText} />
                    </div>

                    {/* Option Radios */}
                    <div className="space-y-2.5 mb-4">
                      {q.options.map((opt) => {
                        const isSelected = userAns === opt.id;
                        const isThisCorrect = opt.id === q.correctOptionId;

                        let style =
                          "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50";

                        if (isAnswered) {
                          if (isThisCorrect) {
                            style = "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold";
                          } else if (isSelected && !isThisCorrect) {
                            style = "border-rose-500 bg-rose-50 text-rose-900 font-semibold";
                          }
                        }

                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleSelectOption(q.id, opt.id)}
                            className={`w-full text-left rounded-xl border p-3.5 text-xs sm:text-sm transition flex items-center justify-between min-h-[46px] ${style}`}
                          >
                            <div className="flex items-center space-x-3">
                              <span
                                className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold ${
                                  isAnswered && isThisCorrect
                                    ? "bg-emerald-600 text-white"
                                    : isAnswered && isSelected
                                    ? "bg-rose-600 text-white"
                                    : "bg-zinc-100 text-zinc-600"
                                }`}
                              >
                                {opt.id}
                              </span>
                              <span>
                                <LatexRenderer content={opt.text} />
                              </span>
                            </div>
                            {isAnswered && isThisCorrect && (
                              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 ml-2" />
                            )}
                            {isAnswered && isSelected && !isThisCorrect && (
                              <XCircle className="h-5 w-5 text-rose-600 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Toggle Explanation Button */}
                    <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
                      <button
                        onClick={() =>
                          setShowExplanations((prev) => ({
                            ...prev,
                            [q.id]: !prev[q.id],
                          }))
                        }
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
                      >
                        <Lightbulb className="h-4 w-4" />
                        <span>{showExpl ? "ব্যাখ্যা লুকাও" : "সঠিক উত্তর ও ব্যাখ্যা দেখুন"}</span>
                      </button>

                      {isAnswered && (
                        <span
                          className={`text-xs font-bold ${
                            isCorrect ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {isCorrect ? "✓ সঠিক উত্তর!" : "✗ ভুল উত্তর"}
                        </span>
                      )}
                    </div>

                    {/* Explanation Box */}
                    {showExpl && (
                      <div className="mt-3 rounded-xl bg-blue-50/70 border border-blue-200 p-4 text-xs sm:text-sm text-zinc-800 leading-relaxed animate-in fade-in">
                        <div className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                          <span>সঠিক উত্তর: ({q.correctOptionId})</span>
                        </div>
                        <LatexRenderer content={q.explanation} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
