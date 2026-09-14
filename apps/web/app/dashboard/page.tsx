"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  User,
  GraduationCap,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  Award,
  Loader2,
} from "lucide-react";
import { fetchDashboardAnalytics } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useAuthGuard } from "@/lib/with-auth";
import {
  TAHMID_PERSONA,
  FARABI_PERSONA,
  getStudentData,
} from "@/lib/user-store";

export default function StudentDashboardPage() {
  const { user, login, logout } = useAuth();
  const { isLoading: authLoading } = useAuthGuard();
  const queryClient = useQueryClient();

  const {
    data: analyticsResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["student-analytics", user?.id],
    queryFn: fetchDashboardAnalytics,
  });

  const analytics = analyticsResponse?.data;
  const overallAccuracy = parseFloat(analytics?.overallAccuracy || "0");
  const mistakeRate = parseFloat(analytics?.mistakeRate || "0");
  const syllabusCoverage = analytics?.syllabusCoveragePercentage ?? 0;
  const streakDays = analytics?.streakDays ?? 0;
  const totalExams = analytics?.totalExamsTaken ?? 0;
  const totalAttempted = analytics?.totalQuestionsAttempted ?? 0;
  const totalCorrect = analytics?.totalQuestionsCorrect ?? 0;
  const totalWrong = analytics?.totalQuestionsWrong ?? Math.max(0, totalAttempted - totalCorrect);
  const studyHours = Math.max(1, Math.round((analytics?.totalStudyTimeSeconds || 0) / 3600));

  // Resolved dynamic profile attributes
  const currentStudentData = getStudentData(user?.id, user?.fullName);
  const collegeName = analytics?.collegeName || currentStudentData.profile.collegeName;
  const targetUniversity = analytics?.targetUniversity || currentStudentData.profile.targetUniversity;
  const targetCountdownDays = analytics?.targetCountdownDays || currentStudentData.profile.targetCountdownDays;
  const avatarInitial = analytics?.avatarInitial || currentStudentData.profile.avatarInitial;
  const avatarColor = analytics?.avatarColor || currentStudentData.profile.avatarColor;
  const recentExams = analytics?.recentExams || currentStudentData.recentExams || [];
  const weakTopics = analytics?.weakTopics || currentStudentData.weakTopics || [];
  const topicBreakdown = analytics?.topicBreakdown || [];

  // Quick Persona Switcher for testing/evaluation
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
      queryClient.invalidateQueries({ queryKey: ["student-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["mistake-book"] });
    }, 50);
  };

  const isTahmid = (user?.fullName || "").includes("তাহমিদ") || (user?.id || "").includes("tahmid");
  const isFarabi = (user?.fullName || "").includes("ফারাবি") || (user?.id || "").includes("farabi");

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-900 pb-20">
      {authLoading && (
        <div className="fixed inset-0 bg-white/80 z-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center space-x-3">
            <Link href="/" className="font-extrabold text-lg tracking-tight text-zinc-900 flex items-center gap-1.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs shadow-xs">
                AE
              </span>
              <span>Admission <span className="text-blue-600">Engine</span></span>
            </Link>
            <nav className="hidden md:flex items-center space-x-4 text-xs font-semibold text-zinc-600 ml-4 border-l border-zinc-200 pl-4">
              <Link href="/topics" className="hover:text-blue-600 transition">
                টপিক প্র্যাকটিস
              </Link>
              <Link href="/exams" className="hover:text-blue-600 transition">
                মডেল টেস্ট
              </Link>
              <Link href="/ranking" className="hover:text-blue-600 transition">
                র‍্যাংকিং
              </Link>
              <Link href="/dashboard/mistake-book" className="hover:text-rose-600 transition flex items-center gap-1">
                <span>ভুল খাতা</span>
                {totalWrong > 0 && (
                  <span className="rounded-full bg-rose-100 px-1.5 py-0.2 text-[10px] font-bold text-rose-700">
                    {totalWrong}
                  </span>
                )}
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Streak Badge */}
            <div className="flex items-center space-x-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200 shadow-2xs">
              <Flame className="h-4 w-4 text-amber-600 animate-pulse" />
              <span>{streakDays} দিন স্ট্রিক</span>
            </div>

            {/* User Profile */}
            {user ? (
              <div className="flex items-center gap-2 pl-1 border-l border-zinc-200">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr ${avatarColor} text-white font-bold text-xs shadow-xs`}>
                  {avatarInitial}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-zinc-800 leading-tight">
                    {user.fullName}
                  </span>
                  <span className="text-[10px] font-medium text-zinc-500 truncate max-w-[130px]">
                    {collegeName.split(",")[0]}
                  </span>
                </div>
                <button
                  onClick={() => logout()}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-red-600 transition"
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
        {/* Persona Quick Switcher Bar (User-specific demonstration control) */}
        <div className="mb-6 rounded-2xl bg-white border border-zinc-200/80 p-3 sm:p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-xs">
              <User className="h-3.5 w-3.5" />
            </span>
            <span className="text-xs font-bold text-zinc-700">
              ইউজার ইন্টারফেস সুইচার (User-Specific Demo):
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => switchToPersona(TAHMID_PERSONA)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                isTahmid
                  ? "bg-blue-600 text-white shadow-xs scale-102"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span>তাহমিদ আহমেদ (BUET Engineering)</span>
            </button>

            <button
              onClick={() => switchToPersona(FARABI_PERSONA)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                isFarabi
                  ? "bg-emerald-600 text-white shadow-xs scale-102"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-teal-400"></span>
              <span>ফারাবি হাসান (DMC Medical)</span>
            </button>

            <Link
              href="/login"
              className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition"
            >
              <span>+ অন্য শিক্ষার্থী</span>
            </Link>
          </div>
        </div>

        {/* Personalized Welcome Banner */}
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
          {/* Background Decorative Rings */}
          <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
          <div className="absolute right-36 -top-10 h-48 w-48 rounded-full bg-blue-400/20 blur-xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/20 px-3 py-0.5 text-[11px] font-bold backdrop-blur-xs">
                  {collegeName}
                </span>
                <span className="text-white/60 text-xs">•</span>
                <span className="rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-0.5 text-[11px] font-bold">
                  {analytics?.targetUnit || currentStudentData.profile.targetUnit}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                স্বাগতম, {user?.fullName || "শিক্ষার্থী"}!
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
                তোমার টার্গেট: <strong className="text-white">{targetUniversity}</strong>। তোমার দেওয়া প্রতিটি পরীক্ষা এবং ভুলের খাতা সম্পূর্ণ ডায়নামিকভাবে ট্র্যাক হচ্ছে।
              </p>
            </div>

            {/* Target Countdown Card */}
            <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4 text-center shrink-0 min-w-[170px] shadow-sm">
              <div className="flex items-center justify-center space-x-1 text-amber-300 text-xs font-bold mb-1">
                <Calendar className="h-4 w-4" />
                <span>ভর্তি পরীক্ষা বাকি</span>
              </div>
              <div className="text-3xl font-black tracking-tight text-white">
                {targetCountdownDays} <span className="text-sm font-semibold text-blue-200">দিন</span>
              </div>
              <div className="mt-1 text-[10px] text-blue-200 font-medium">
                টার্গেট ডেট: {currentStudentData.profile.targetExamDate}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Metric Grid: 4 Core KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* KPI 1: Exams Completed */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs transition hover:shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
              <span>মোট এক্সাম সম্পন্ন</span>
              <Award className="h-4 w-4 text-blue-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-zinc-900">{totalExams}</span>
              <span className="text-xs font-semibold text-zinc-500">টি পরীক্ষা</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-100 pt-2">
              <span>সর্বশেষ স্কোর</span>
              <span className="font-bold text-blue-600">
                {recentExams[0]?.totalScore || "০.০০"} / {recentExams[0]?.maxScore || "৫০.০০"}
              </span>
            </div>
          </div>

          {/* KPI 2: Overall Accuracy % */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs transition hover:shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
              <span>সামগ্রিক নির্ভুলতা (Accuracy)</span>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-zinc-900">{overallAccuracy}%</span>
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                  overallAccuracy >= 80
                    ? "bg-emerald-50 text-emerald-700"
                    : overallAccuracy >= 60
                    ? "bg-amber-50 text-amber-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {overallAccuracy >= 80 ? "চমৎকার" : overallAccuracy >= 60 ? "চলতি মান" : "উন্নয়ন প্রয়োজন"}
              </span>
            </div>
            {/* Visual dual bar */}
            <div className="mt-2.5 h-2 w-full rounded-full bg-rose-100 overflow-hidden flex">
              <div
                className="h-full bg-emerald-500 transition-all duration-700"
                style={{ width: `${Math.min(100, overallAccuracy)}%` }}
                title={`সঠিক: ${overallAccuracy}%`}
              ></div>
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-zinc-400">
              <span className="text-emerald-600 font-semibold">সঠিক: {totalCorrect}টি</span>
              <span className="text-rose-600 font-semibold">ভুল: {totalWrong}টি</span>
            </div>
          </div>

          {/* KPI 3: Mistake Rate % */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs transition hover:shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
              <span>ভুলের হার (Mistake Rate)</span>
              <AlertTriangle className="h-4 w-4 text-rose-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-rose-600">{mistakeRate}%</span>
              <span className="rounded-md bg-rose-50 text-rose-700 px-1.5 py-0.5 text-[10px] font-bold">
                {totalWrong}টি ভুল উত্তর
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-100 pt-2">
              <span>ভুল খাতায় সংরক্ষিত</span>
              <Link
                href="/dashboard/mistake-book"
                className="font-bold text-rose-600 hover:underline inline-flex items-center gap-0.5"
              >
                <span>রিভিশন দাও</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* KPI 4: Daily Streak & Study Time */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs transition hover:shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
              <span>স্টাডি স্ট্রিক ও সময়</span>
              <Flame className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-zinc-900">{streakDays}</span>
              <span className="text-xs font-semibold text-zinc-500">দিন ধারাবাহিক</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-100 pt-2">
              <span>মোট অধ্যয়ন সময়</span>
              <span className="font-bold text-amber-700">{studyHours} ঘণ্টা</span>
            </div>
          </div>
        </div>

        {/* 3 Primary Intent Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-10">
          {/* Card 1: আজকের লাইভ এক্সাম */}
          <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/30 p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-blue-600 px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                  লাইভ এক্সাম
                </span>
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-zinc-900">
                {isFarabi ? "মেডিকেল জীববিজ্ঞান ও রসায়ন বুস্টার টেস্ট" : "বুয়েট স্পেশাল লাইভ মেগা টেস্ট ০১"}
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 leading-relaxed">
                রিয়েল-টাইম মেধা তালিকা, নেগেটিভ মার্কিং (-০.২৫) এবং অটোমেটিক ভুল খাতা সিঙ্ক।
              </p>
            </div>
            <Link
              href="/exams/8f8b89e2-1111-2222-3333-444455556666/room"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition active:scale-98 min-h-[46px]"
            >
              <span>পরীক্ষা শুরু করো</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Card 2: টপিক প্র্যাকটিস */}
          <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white tracking-wider">
                  সিলেবাস কভারেজ
                </span>
                <BookOpen className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-zinc-900">
                টপিকভিত্তিক প্রশ্ন ব্যাংক
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 leading-relaxed">
                ৪০০টি অথেনটিক ভর্তি প্রশ্ন LaTeX ফর্মুলা ও ব্যাখ্যাসহ প্র্যাকটিস করো।
              </p>
              {/* Syllabus Progress */}
              <div className="mt-4">
                <div className="flex justify-between text-xs font-bold text-zinc-600 mb-1.5">
                  <span>সিলেবাস সম্পন্ন</span>
                  <span className="text-emerald-700">{syllabusCoverage}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                    style={{ width: `${Math.min(100, syllabusCoverage)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <Link
              href="/topics"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition active:scale-98 min-h-[46px]"
            >
              <span>টপিক প্র্যাকটিস করো</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Card 3: আমার ভুল খাতা */}
          <div className="rounded-3xl border border-rose-200 bg-gradient-to-br from-rose-50/80 via-white to-rose-50/30 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-rose-600 px-2.5 py-1 text-[10px] font-bold text-white tracking-wider">
                  পারসোনালাইজড
                </span>
                <FileCheck2 className="h-5 w-5 text-rose-600" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-zinc-900">
                আমার ভুল খাতা (Mistake Book)
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600 leading-relaxed">
                যে প্রশ্নগুলোতে তুমি ভুল করেছিলে সেগুলো আলাদাভাবে অনুশীলন করো। ২ বার সঠিক দিয়ে মাস্টার করো।
              </p>
              <div className="mt-4 flex items-center space-x-2 text-xs font-semibold text-zinc-700">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-rose-700 font-extrabold text-xs">
                  {currentStudentData.mistakes.filter(m => !m.isMastered).length}
                </span>
                <span>টি প্রশ্ন পুনরায় সমাধান করা বাকি</span>
              </div>
            </div>
            <Link
              href="/dashboard/mistake-book"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition active:scale-98 min-h-[46px]"
            >
              <span>ভুল খাতা খোলো</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Personalized AI Weakness & Remedial Recommendations */}
        {weakTopics.length > 0 && (
          <section className="mb-10 rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50/70 via-white to-amber-50/30 p-6 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-white shrink-0 shadow-xs">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-zinc-900">
                  {user?.fullName || "শিক্ষার্থী"} এর দুর্বল টপিক সতর্কতা ও স্টাডি গাইডেন্স (AI DAG Analysis)
                </h3>
                <p className="text-xs text-zinc-600">
                  বিগত পরীক্ষার ডেটা অনুযায়ী তোমার নিচের বিষয়গুলোতে ভুল বেশি হয়েছে। ভর্তি পরীক্ষায় ভালো করতে এগুলো দ্রুত রিভিশন দাও:
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {weakTopics.map((topic: any) => (
                <div
                  key={topic.topicId}
                  className="rounded-2xl border border-amber-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-zinc-900">{topic.topicName}</span>
                      <span className="rounded-md bg-rose-50 text-rose-700 px-2 py-0.5 text-[11px] font-bold border border-rose-200">
                        নির্ভুলতা: {topic.accuracyRate}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-500 mb-2">
                      বিষয়: {topic.subjectName} • ভুল হয়েছে: {topic.attempted - topic.correct}টি
                    </div>
                    <p className="text-xs text-zinc-700 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                      💡 <strong>পরামর্শ:</strong> {topic.recommendation}
                    </p>
                  </div>
                  <Link
                    href="/topics"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    <span>এই টপিক এখনই প্র্যাকটিস করো</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Personalized Recent Exam Submissions & History */}
        <section className="mb-10 rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-zinc-900">
                {user?.fullName || "শিক্ষার্থী"} এর সাম্প্রতিক পরীক্ষা ও মেধা স্কোর
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                তোমার প্রতিটি পরীক্ষার নম্বর ও সঠিক/ভুল প্রশ্নের বিস্তারিত বিশ্লেষণ।
              </p>
            </div>
            <Link
              href="/exams"
              className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              <span>সব মডেল টেস্ট</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentExams.map((ex: any) => (
              <div
                key={ex.id}
                className="rounded-2xl border border-zinc-200/80 p-4 transition hover:border-blue-300 hover:bg-blue-50/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-600">
                      {ex.university}
                    </span>
                    <span className="text-xs text-zinc-400">{ex.submittedAt}</span>
                  </div>
                  <h4 className="text-sm font-bold text-zinc-900">{ex.examTitle}</h4>
                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span>চেষ্টা: {ex.totalAttempted}টি</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-semibold">সঠিক: {ex.totalCorrect}টি</span>
                    <span>•</span>
                    <span className="text-rose-600 font-semibold">ভুল: {ex.totalWrong}টি</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 sm:text-right">
                  <div>
                    <div className="text-lg font-extrabold text-blue-600">
                      {ex.totalScore} <span className="text-xs text-zinc-400">/ {ex.maxScore}</span>
                    </div>
                    <div className="text-[11px] font-semibold text-zinc-600">
                      নির্ভুলতা: {ex.accuracyRate}
                    </div>
                  </div>
                  <span className="rounded-xl bg-purple-50 text-purple-700 px-3 py-1.5 text-xs font-bold border border-purple-200">
                    {ex.rankBadge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Topic Health Analytics Breakdown */}
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-zinc-900">
                টপিকভিত্তিক পারফরম্যান্স ও স্বাস্থ্য চার্ট
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                প্রতিটি সাবজেক্টের অধ্যায়ভিত্তিক মাস্টারি ট্র্যাকিং।
              </p>
            </div>
            <span className="text-xs font-bold text-zinc-500">
              {topicBreakdown.length} টি বিষয় পর্যবেক্ষণাধীন
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">টপিক আইডি</th>
                  <th className="px-4 py-3">চেষ্টা করেছে</th>
                  <th className="px-4 py-3">সঠিক</th>
                  <th className="px-4 py-3">নির্ভুলতা</th>
                  <th className="px-4 py-3">মাস্টারি স্কোর</th>
                  <th className="px-4 py-3 text-right">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {topicBreakdown.map((topic: any) => {
                  const accuracy = parseFloat(topic.accuracyRate);
                  return (
                    <tr key={topic.topicId} className="hover:bg-zinc-50/60 transition">
                      <td className="px-4 py-3.5 font-bold text-zinc-900">
                        টপিক #{topic.topicId}
                      </td>
                      <td className="px-4 py-3.5 text-zinc-700">{topic.totalAttempted}</td>
                      <td className="px-4 py-3.5 text-emerald-600 font-semibold">
                        {topic.totalCorrect}
                      </td>
                      <td className="px-4 py-3.5 font-extrabold">
                        {topic.accuracyRate}%
                      </td>
                      <td className="px-4 py-3.5 text-zinc-700">
                        {topic.masteryScore}%
                      </td>
                      <td className="px-4 py-3.5 text-right">
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
        </section>
      </main>
    </div>
  );
}
