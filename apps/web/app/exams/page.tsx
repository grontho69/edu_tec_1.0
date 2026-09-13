"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Clock,
  Sparkles,
  Award,
  Users,
  CheckCircle,
  ArrowRight,
  Filter,
  Loader2,
} from "lucide-react";
import { FALLBACK_MODEL_TESTS } from "@/lib/fallback-data";
import { useAuthGuard } from "@/lib/with-auth";

export default function ModelTestsDirectoryPage() {
  const { isLoading: authLoading } = useAuthGuard();
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const filteredTests = FALLBACK_MODEL_TESTS.filter((t) => {
    if (filterStatus === "ALL") return true;
    return t.status === filterStatus;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-900 pb-20">
      {authLoading && (
        <div className="fixed inset-0 bg-white/80 z-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center space-x-3">
            <Link href="/" className="font-bold text-lg text-zinc-900">
              Admission <span className="text-blue-600">Engine</span>
            </Link>
            <span className="text-xs font-semibold text-zinc-400">|</span>
            <span className="text-xs font-semibold text-zinc-600">সেন্ট্রাল মডেল টেস্ট তালিকা</span>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 shadow-2xs"
            >
              <span>ড্যাশবোর্ড</span>
            </Link>
            <Link
              href="/topics"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 shadow-2xs"
            >
              <span>প্রশ্ন ব্যাংক</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        {/* Hero */}
        <div className="mb-6 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 sm:p-8 text-white shadow-lg">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-md bg-red-500/20 px-2.5 py-0.5 text-xs font-bold text-red-300 border border-red-500/30 mb-3">
              <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse"></span>
              অল-বাংলাদেশ সেন্ট্রাল এডমিশন টেস্ট
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              লাইভ মডেল টেস্ট ও বিগত বছরের প্রশ্নপত্র
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-zinc-300 leading-relaxed">
              সঠিক টাইমার, ওএমআর শিট এবং -০.২৫ নেগেটিভ মার্কিং হিসাবসহ কেন্দ্রীয় পরীক্ষায় অংশ নাও। প্রতিটি এক্সাম শেষে তাৎক্ষণিক মেরিট লিস্ট ও পারসেন্টাইল দেখো।
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-6">
          <Filter className="h-4 w-4 text-zinc-400 mr-1" />
          {[
            { id: "ALL", label: "সবগুলো পরীক্ষা" },
            { id: "LIVE", label: "🔴 লাইভ চলছে" },
            { id: "UPCOMING", label: "আপকামিং" },
            { id: "PAST", label: "আর্কাইভ / বিগত বছর" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                filterStatus === tab.id
                  ? "bg-zinc-900 text-white shadow-xs"
                  : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Exam Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTests.map((test) => {
            const isLive = test.status === "LIVE";
            return (
              <div
                key={test.id}
                className={`rounded-2xl border bg-white p-5 shadow-xs flex flex-col justify-between transition hover:shadow-md ${
                  isLive ? "border-blue-300 ring-2 ring-blue-500/20" : "border-zinc-200"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-[10px] font-bold border ${test.badgeColor}`}
                    >
                      {test.tag}
                    </span>
                    <span className="text-[11px] font-bold text-zinc-500">
                      {test.university}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-zinc-900 mt-1">
                    {test.title}
                  </h3>

                  <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-zinc-50 p-3 text-center text-xs">
                    <div>
                      <div className="text-zinc-400 text-[10px]">প্রশ্ন সংখ্যা</div>
                      <div className="font-bold text-zinc-800">{test.questionsCount}টি</div>
                    </div>
                    <div>
                      <div className="text-zinc-400 text-[10px]">সময়সীমা</div>
                      <div className="font-bold text-zinc-800">{test.durationMinutes} মিনিট</div>
                    </div>
                    <div>
                      <div className="text-zinc-400 text-[10px]">মার্কস সিস্টেম</div>
                      <div className="font-bold text-zinc-800">{test.marks}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {test.participants.toLocaleString()} জন পরীক্ষার্থী
                    </span>
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle className="h-3.5 w-3.5" />
                      সম্পূর্ণ ফ্রি
                    </span>
                  </div>
                </div>

                <Link
                  href={`/exams/${test.id}/room`}
                  className={`mt-5 inline-flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-bold transition active:scale-98 min-h-[46px] ${
                    isLive
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                      : "border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 shadow-2xs"
                  }`}
                >
                  <span>{isLive ? "এখনই পরীক্ষায় বসো (লাইভ)" : "অনুশীলন শুরু করো"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
