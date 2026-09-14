"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Flame,
  Clock,
  BookOpen,
  FileCheck2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Target,
  BarChart3,
  RefreshCw,
  LogOut,
  Loader2,
} from "lucide-react";
import { fetchDashboardAnalytics } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useAuthGuard } from "@/lib/with-auth";

export default function StudentDashboardPage() {
  const { user, logout } = useAuth();
  const { isLoading: authLoading } = useAuthGuard();
  const {
    data: analyticsResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["student-analytics"],
    queryFn: fetchDashboardAnalytics,
  });

  const analytics = analyticsResponse?.data;
  const overallAccuracy = parseFloat(analytics?.overallAccuracy || "0");
  const syllabusCoverage = analytics?.syllabusCoveragePercentage ?? 0;
  const streakDays = analytics?.streakDays ?? 0;
  const totalExams = analytics?.totalExamsTaken ?? 0;
  const weakTopicsCount = analytics?.weakTopicsCount ?? 0;
  const topicBreakdown = analytics?.topicBreakdown ?? [];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-900 pb-16">
      {authLoading && (
        <div className="fixed inset-0 bg-white/80 z-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center space-x-3">
            <Link href="/" className="font-bold text-lg text-zinc-900">
              Admission <span className="text-blue-600">Engine</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-4 text-xs font-semibold text-zinc-600 ml-3">
              <Link href="/topics" className="hover:text-blue-600">
                প্রশ্ন ব্যাংক
              </Link>
              <Link href="/exams" className="hover:text-blue-600">
                মডেল টেস্ট
              </Link>
              <Link href="/ranking" className="hover:text-blue-600">
                র‍্যাংকিং
              </Link>
              <Link href="/dashboard/mistake-book" className="hover:text-rose-600">
                ভুল খাতা
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-2.5">
            <div className="flex items-center space-x-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200">
              <Flame className="h-4 w-4 text-amber-600" />
              <span>{streakDays} দিন স্ট্রাইক</span>
            </div>

            {user ? (
              <div className="flex items-center gap-1.5 pl-1 border-l border-zinc-200">
                <span className="hidden sm:inline-flex text-xs font-semibold text-zinc-700 bg-zinc-100 px-2.5 py-1 rounded-lg">
                  {user.fullName}
                </span>
                <button
                  onClick={() => logout()}
                  className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-red-600 transition"
                  title="লগআউট"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
              >
                লগইন
              </Link>
            )}

            <button
              onClick={() => refetch()}
              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 transition"
              title="রিলোড অ্যানালিটিক্স"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        {/* Welcome greeting */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              স্বাগতম, {user?.fullName || "শিক্ষার্থী"}!
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1">
              তোমার প্রস্তুতি ট্র্যাক হচ্ছে ১০০% রিয়েল-টাইম ডাইনামিক ডেটা দিয়ে।
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
              <Target className="h-3.5 w-3.5" />
              টার্গেট: Engineering (BUET / CKRUET)
            </span>
          </div>
        </div>

        {/* Dynamic / Demo Mode Indicator */}
        {analyticsResponse?.isOfflineFallback && (
          <div className="mb-6 rounded-2xl bg-blue-50/80 border border-blue-200 p-4 text-xs text-blue-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
              <span>
                <strong>ডেমো মোড সক্রিয়:</strong> ব্যাকএন্ড এখনো অফলাইন থাকা সত্ত্বেও সমস্ত প্রশ্ন ব্যাংক, লাইভ টেস্ট এবং প্র্যাকটিস ফিচার ১০০% কাজ করছে।
              </span>
            </div>
            <Link
              href="/topics"
              className="inline-flex items-center gap-1 font-bold text-blue-700 hover:underline shrink-0"
            >
              <span>প্রশ্ন ব্যাংক খোলো</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}

        {/* 1. The 3 Primary Intent Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
          {/* Intent Card 1: আজকের লাইভ এক্সাম */}
          <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/60 to-white p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                  লাইভ
                </span>
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="mt-3 text-lg font-bold text-zinc-900">
                আজকের লাইভ এক্সাম
              </h3>
              <p className="mt-1 text-xs text-zinc-600">
                বুয়েট স্পেশাল মেগা টেস্ট ০১ — রিয়েল-টাইম মেরিট লিস্ট এবং নেগেটিভ মার্কিং।
              </p>
            </div>
            <Link
              href="/exams/8f8b89e2-1111-2222-3333-444455556666/room"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition active:scale-98 min-h-[48px]"
            >
              <span>এক্সামে অংশ নাও</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Intent Card 2: টপিক প্র্যাকটিস */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  সিলেবাস কভারেজ
                </span>
                <BookOpen className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="mt-3 text-lg font-bold text-zinc-900">
                টপিক প্র্যাকটিস
              </h3>
              <p className="mt-1 text-xs text-zinc-600">
                টপিকভিত্তিক বিগত বছরের প্রশ্ন সমাধান করো এবং দুর্বল বিষয়গুলো দূর করো।
              </p>
              {/* Syllabus progress bar */}
              <div className="mt-3">
                <div className="flex justify-between text-[11px] font-semibold text-zinc-500 mb-1">
                  <span>সিলেবাস সম্পন্ন</span>
                  <span>{syllabusCoverage}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, syllabusCoverage)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <Link
              href="/topics"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition active:scale-98 min-h-[48px] shadow-xs"
            >
              <span>টপিক প্র্যাকটিস শুরু করো</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Intent Card 3: আমার ভুল খাতা */}
          <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50/50 to-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                  অটোমেটেড
                </span>
                <FileCheck2 className="h-5 w-5 text-rose-600" />
              </div>
              <h3 className="mt-3 text-lg font-bold text-zinc-900">
                আমার ভুল খাতা
              </h3>
              <p className="mt-1 text-xs text-zinc-600">
                পূর্বে ভুল হওয়া প্রশ্নগুলো পুনরায় অনুশীলন করো। ২ বার সঠিক দিয়ে মাস্টার করো।
              </p>
              <div className="mt-3 flex items-center space-x-2 text-xs font-medium text-zinc-700">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-rose-700 font-bold text-[11px]">
                  {analytics?.totalQuestionsAttempted ? Math.max(0, analytics.totalQuestionsAttempted - analytics.totalQuestionsCorrect) : 0}
                </span>
                <span>টি প্রশ্ন রিভিশন অপেক্ষায়</span>
              </div>
            </div>
            <Link
              href="/dashboard/mistake-book"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 transition active:scale-98 min-h-[48px]"
            >
              <span>ভুল খাতা খোলো</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* 2. Dynamic Progression & Health Metric Ring */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 mb-8">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs">
            <div className="text-xs font-semibold text-zinc-500">মোট এক্সাম সম্পন্ন</div>
            <div className="mt-2 text-2xl font-extrabold text-zinc-900">
              {totalExams}
            </div>
            <div className="mt-1 text-[11px] text-zinc-500">অফিসিয়াল ও প্র্যাকটিস টেস্ট</div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs">
            <div className="text-xs font-semibold text-zinc-500">সামগ্রিক নির্ভুলতা (Accuracy)</div>
            <div className="mt-2 flex items-baseline space-x-1">
              <span className="text-2xl font-extrabold text-zinc-900">{overallAccuracy}%</span>
              <span
                className={`text-xs font-bold ${
                  overallAccuracy >= 70 ? "text-emerald-600" : overallAccuracy >= 50 ? "text-amber-600" : "text-rose-600"
                }`}
              >
                {overallAccuracy >= 70 ? "খুব ভালো" : overallAccuracy >= 50 ? "চলতি মান" : "উন্নয়ন প্রয়োজন"}
              </span>
            </div>
            <div className="mt-1 text-[11px] text-zinc-500">সকল প্রশ্নের নির্ভুল উত্তর হার</div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs">
            <div className="text-xs font-semibold text-zinc-500">মোট প্রশ্ন উত্তর</div>
            <div className="mt-2 text-2xl font-extrabold text-zinc-900">
              {analytics?.totalQuestionsAttempted ?? 0}
            </div>
            <div className="mt-1 text-[11px] text-emerald-600 font-medium">
              সঠিক: {analytics?.totalQuestionsCorrect ?? 0} টি
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs">
            <div className="text-xs font-semibold text-zinc-500">দুর্বল টপিক সতর্কতা</div>
            <div className="mt-2 flex items-baseline space-x-1">
              <span className="text-2xl font-extrabold text-rose-600">{weakTopicsCount}</span>
              <span className="text-xs text-zinc-500 font-medium">টি বিষয়ে &lt; ৫০% মার্ক</span>
            </div>
            <div className="mt-1 text-[11px] text-rose-600 font-medium">
              {weakTopicsCount > 0 ? "জরুরি রিভিশন প্রয়োজন" : "কোনো লাল সতর্কতা নেই"}
            </div>
          </div>
        </div>

        {/* 3. Subject & Topic Weakness Breakdown Table */}
        <section id="topics" className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-zinc-900">
                টপিকভিত্তিক পারফরম্যান্স ও স্বাস্থ্য অ্যানালিটিক্স
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                প্রতিটি এক্সাম শেষে স্বয়ংক্রিয়ভাবে নির্ভুলতা হিসাব করা হয়।
              </p>
            </div>
            <span className="text-xs font-medium text-zinc-400">
              {topicBreakdown.length} টি টপিক ট্র্যাকিং হচ্ছে
            </span>
          </div>

          {topicBreakdown.length === 0 ? (
            <div className="rounded-xl bg-zinc-50 p-8 text-center text-xs text-zinc-500">
              এখনও কোনো টপিক অ্যানালিটিক্স তৈরি হয়নি। প্রথম মডেল টেস্টে অংশ নিয়ে তোমার পারফরম্যান্স চার্ট দেখো।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 font-semibold">
                  <tr>
                    <th className="px-3.5 py-2.5">টপিক আইডি</th>
                    <th className="px-3.5 py-2.5">চেষ্টা করেছে</th>
                    <th className="px-3.5 py-2.5">সঠিক</th>
                    <th className="px-3.5 py-2.5">নির্ভুলতা</th>
                    <th className="px-3.5 py-2.5">মাস্টারি স্কোর</th>
                    <th className="px-3.5 py-2.5 text-right">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {topicBreakdown.map((topic: any) => {
                    const accuracy = parseFloat(topic.accuracyRate);
                    return (
                      <tr key={topic.topicId} className="hover:bg-zinc-50/60 transition">
                        <td className="px-3.5 py-3 font-semibold text-zinc-900">
                          টপিক #{topic.topicId}
                        </td>
                        <td className="px-3.5 py-3 text-zinc-700">{topic.totalAttempted}</td>
                        <td className="px-3.5 py-3 text-emerald-600 font-medium">
                          {topic.totalCorrect}
                        </td>
                        <td className="px-3.5 py-3 font-bold">
                          {topic.accuracyRate}%
                        </td>
                        <td className="px-3.5 py-3 text-zinc-700">
                          {topic.masteryScore}%
                        </td>
                        <td className="px-3.5 py-3 text-right">
                          {topic.status === "NEEDS_IMPROVEMENT" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 border border-rose-200">
                              <AlertTriangle className="h-3 w-3" />
                              উন্নয়ন প্রয়োজন
                            </span>
                          ) : topic.status === "MASTERED" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="h-3 w-3" />
                              মাস্টারড
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-700">
                              চলমান
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
