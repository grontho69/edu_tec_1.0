"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Medal,
  Target,
  Sparkles,
  TrendingUp,
  Award,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { FALLBACK_LEADERBOARD } from "@/lib/fallback-data";

export default function RankingLeaderboardPage() {
  const [activeTab, setActiveTab] = useState("BUET");

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-900 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center space-x-3">
            <Link href="/" className="font-bold text-lg text-zinc-900">
              Admission <span className="text-blue-600">Engine</span>
            </Link>
            <span className="text-xs font-semibold text-zinc-400">|</span>
            <span className="text-xs font-semibold text-zinc-600">অল-বাংলাদেশ লাইভ মেরিট র‍্যাংকিং</span>
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
              <span>লাইভ এক্সাম</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        {/* Hero Card */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-zinc-900 p-6 sm:p-8 text-white shadow-lg">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-md bg-white/20 px-2.5 py-0.5 text-xs font-bold backdrop-blur-xs mb-3">
              <Trophy className="h-3.5 w-3.5 text-amber-200" />
              রিয়েল-টাইম টাই-ব্রেকার মেরিট লিস্ট
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              অল-বাংলাদেশ এডমিশন মেধা তালিকা
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-amber-100 leading-relaxed">
              সঠিক উত্তর, নেগেটিভ মার্কিং এবং পরীক্ষা সম্পন্ন করার সময়ের নিখুঁত গাণিতিক টাই-ব্রেকার সূত্রে স্বয়ংক্রিয়ভাবে তৈরি মেধা তালিকা।
            </p>
          </div>
        </div>

        {/* User's Current Rank Card */}
        <div className="mb-6 rounded-2xl border-2 border-blue-600 bg-blue-50/70 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-extrabold text-lg shadow-sm">
              #৫
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-zinc-900">তাহমিদ আলী (তুমি)</h3>
                <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                  তোমার বর্তমান পজিশন
                </span>
              </div>
              <p className="text-xs text-zinc-600 mt-0.5">
                স্কোর: <span className="font-bold text-zinc-900">৪৩.৭৫ / ৫০</span> • পারসেন্টাইল: <span className="font-bold text-emerald-600">৯৮.২%</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-zinc-500">সম্ভাব্য চান্স প্রজেকশন:</span>
            <span className="inline-flex items-center rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
              বুয়েট টপ ২৫০ (নিশ্চিত জোন)
            </span>
          </div>
        </div>

        {/* Top Performers Table */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs">
          <div className="border-b border-zinc-200 bg-zinc-50/80 px-4 py-3 sm:px-6 flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <Medal className="h-4 w-4 text-amber-500" />
              <span>শীর্ষ মেধাতালিকা (বুয়েট স্পেশাল মেগা টেস্ট ০১)</span>
            </h2>
            <span className="text-xs text-zinc-500">মোট পরীক্ষার্থী: ৪,১২০ জন</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200 bg-white text-zinc-500 font-semibold">
                <tr>
                  <th className="px-4 py-3">মেরিট পজিশন</th>
                  <th className="px-4 py-3">শিক্ষার্থী ও কলেজ</th>
                  <th className="px-4 py-3">স্কোর</th>
                  <th className="px-4 py-3">অ্যাকুরেসি</th>
                  <th className="px-4 py-3 text-right">টার্গেট ইউনিট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {FALLBACK_LEADERBOARD.map((item) => {
                  return (
                    <tr
                      key={item.rank}
                      className={`transition ${
                        item.isCurrentUser
                          ? "bg-blue-50/80 font-semibold"
                          : "hover:bg-zinc-50/60"
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                              item.rank === 1
                                ? "bg-amber-100 text-amber-800 ring-1 ring-amber-400"
                                : item.rank === 2
                                ? "bg-zinc-200 text-zinc-800"
                                : item.rank === 3
                                ? "bg-amber-800/10 text-amber-900"
                                : "bg-zinc-100 text-zinc-600"
                            }`}
                          >
                            {item.rank}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-zinc-900 text-sm">
                          {item.name}
                        </div>
                        <div className="text-zinc-500 text-[11px] mt-0.5">
                          {item.college}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-extrabold text-sm text-zinc-900">
                          {item.score}
                        </span>
                        <span className="text-zinc-400 text-[10px]"> / ৫০</span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-bold text-emerald-600">
                        {item.accuracy}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <span className="inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-1 text-[11px] font-bold text-zinc-700">
                          {item.target}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
