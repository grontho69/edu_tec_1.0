"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Calendar,
  Clock,
  BookOpen,
  FileCheck2,
  Bell,
  ArrowRight,
  Shield,
  Download,
  Flame,
  User,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export default function LandingPage() {
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>("ALL");

  const circulars = [
    {
      id: "buet",
      university: "বাংলাদেশ প্রকৌশল বিশ্ববিদ্যালয় (BUET)",
      unit: "প্রকৌশল ও আর্কিটেকচার গুচ্ছ",
      badge: "BUET",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      deadline: "১৫ জানুয়ারি, ২০২৫",
      deadlineWarning: true,
      examDate: "১৫ ফেব্রুয়ারি, ২০২৫",
      eligibility: "HSC GPA 5.00 (Phy+Chem+Math >= 270)",
      pdfUrl: "#",
    },
    {
      id: "du",
      university: "ঢাকা বিশ্ববিদ্যালয় (DU)",
      unit: "বিজ্ঞান অনুষদ — 'ক' ইউনিট",
      badge: "DU 'KA'",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      deadline: "২০ জানুয়ারি, ২০২৫",
      deadlineWarning: false,
      examDate: "০১ মার্চ, ২০২৫",
      eligibility: "SSC + HSC মোট GPA 8.50",
      pdfUrl: "#",
    },
    {
      id: "medical",
      university: "সরকারি ও বেসরকারি মেডিকেল কলেজ",
      unit: "MBBS এবং BDS ভর্তি পরীক্ষা",
      badge: "MEDICAL",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
      deadline: "০২ ফেব্রুয়ারি, ২০২৫",
      deadlineWarning: false,
      examDate: "১৪ ফেব্রুয়ারি, ২০২৫",
      eligibility: "মোট GPA 9.00 (Biology 4.00)",
      pdfUrl: "#",
    },
    {
      id: "sust",
      university: "শাহজালাল বিজ্ঞান ও প্রযুক্তি বিশ্ব. (SUST)",
      unit: "'A' ইউনিট বিজ্ঞান ও প্রযুক্তি অনুষদ",
      badge: "GST",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      deadline: "১১ ফেব্রুয়ারি, ২০২৫",
      deadlineWarning: false,
      examDate: "০৮ মার্চ, ২০২৫",
      eligibility: "বিজ্ঞান শাখা: মোট GPA 8.00",
      pdfUrl: "#",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 selection:bg-blue-100 selection:text-blue-900 pb-20">
      {/* 1. Global Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-sm shadow-blue-500/30 text-white">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-zinc-900">
                Admission <span className="text-blue-600">Engine</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-5 text-sm font-medium text-zinc-600">
              <Link href="/dashboard" className="text-zinc-900 hover:text-blue-600">
                প্রশ্ন ব্যাংক
              </Link>
              <Link href="/dashboard" className="hover:text-blue-600">
                মডেল টেস্ট
              </Link>
              <a href="#circulars" className="relative hover:text-blue-600 text-blue-600 font-semibold">
                সার্কুলার <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-600 align-super ml-0.5"></span>
              </a>
              <Link href="/dashboard" className="hover:text-blue-600">
                র‍্যাংকিং
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-3 text-xs sm:text-sm">
            <span className="hidden lg:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              লাইভ এক্সাম ফ্রি ট্রায়াল
            </span>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-1.5 text-xs sm:text-sm font-medium text-zinc-700 shadow-xs hover:bg-zinc-50"
            >
              <User className="h-4 w-4 text-zinc-500" />
              <span>তাহমিদ আলী (HSC &apos;25)</span>
            </Link>

            <Link
              href="/admin"
              className="rounded-lg bg-zinc-900 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-zinc-800"
            >
              অ্যাডমিন পোর্টাল
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="mx-auto max-w-5xl px-4 pt-10 pb-8 text-center sm:px-6 sm:pt-14">
        {/* Badge Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/80 px-3.5 py-1 text-xs font-semibold text-amber-900 shadow-xs backdrop-blur-sm mb-6">
          <Flame className="h-4 w-4 text-amber-600" />
          <span>HSC ২০২৪ ব্যাচের স্পেশাল এডমিশন সাইকেল শুরু হয়েছে</span>
          <ChevronRight className="h-3.5 w-3.5 text-amber-600" />
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl sm:leading-tight">
          বিশ্ববিদ্যালয় ভর্তির সেরা প্রস্তুতি,{" "}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            এক প্ল্যাটফর্মে
          </span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base">
          বুয়েট, ঢাবি &apos;ক&apos;, মেডিকেল কিংবা গুচ্ছ — রিয়েল-টাইম র‍্যাংকিং, নির্ভুল ওএমআর টাইমার এবং স্মার্ট ভুল খাতা নিয়ে তোমার চূড়ান্ত প্রস্তুতি নিশ্চিত করো।
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/exams/8f8b89e2-1111-2222-3333-444455556666/room"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98] transition min-h-[48px]"
          >
            <Clock className="h-4 w-4" />
            <span>টিকেটেই যুক্তহও (আজকের লাইভ)</span>
          </Link>

          <a
            href="#circulars"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-3.5 text-sm font-semibold text-zinc-700 shadow-xs hover:bg-zinc-50 active:scale-[0.98] transition min-h-[48px]"
          >
            <Calendar className="h-4 w-4 text-zinc-500" />
            <span>সার্কুলার ক্যালেন্ডার দেখো</span>
          </a>
        </div>

        {/* 3. Stat Counters Grid */}
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {[
            { label: "অ্যাক্টিভ পরীক্ষার্থী", value: "৫০,০০০+" },
            { label: "অ্যানালিটিক্স নিখুঁততা", value: "৯৯.৪%" },
            { label: "বিগত বছরের প্রশ্নব্যাংক", value: "১,২০০+" },
            { label: "ফ্রি ট্রায়াল (৫০টি এক্সাম)", value: "৳০" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-zinc-200/80 bg-white/70 p-4 text-center shadow-xs backdrop-blur-sm"
            >
              <div className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
                {stat.value}
              </div>
              <div className="mt-1 text-xs text-zinc-500 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Motivational Banner */}
      <section className="mx-auto max-w-5xl px-4 my-6 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl bg-zinc-900 p-6 text-white shadow-xl">
          <div className="relative z-10 max-w-xl">
            <span className="inline-block rounded-md bg-blue-600/30 px-2.5 py-0.5 text-xs font-semibold text-blue-300 border border-blue-500/30 mb-2">
              মেগা হক ট্রফি ২০২৫
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              মেধাতালিকার শীর্ষ ১০%-এ পৌঁছানোর বৈজ্ঞানিক প্রস্তুতি
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-zinc-300">
              প্রতিদিন রাত ৯টায় অনুষ্ঠিত হচ্ছে অল-বাংলাদেশ লাইভ মেগা টেস্ট। সম্পূর্ণ বিনামূল্যে অংশ নিয়ে নিজের বাস্তব অবস্থান যাচাই করো।
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-blue-600/20 blur-3xl pointer-events-none"></div>
        </div>
      </section>

      {/* 5. 4 Core Weapons Section */}
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              ENGINE ARCHITECTURE
            </span>
            <h2 className="text-2xl font-bold text-zinc-900 mt-1">
              তোমার ভর্তির যুদ্ধজয়ের ৪টি মূল অস্ত্র
            </h2>
          </div>
          <span className="text-xs text-zinc-500 mt-1 sm:mt-0 font-medium">
            ক্লিক করে বিস্তারিত ফিচার দেখো
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Card 1 */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Clock className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                রিয়েলটাইম
              </span>
            </div>
            <h3 className="mt-4 text-base font-bold text-zinc-900">
              লাইভ সেন্ট্রাল এক্সাম
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-600">
              স্টপওয়াচ টাইমার, কাট-অফ স্কোর এবং অল-বাংলাদেশ রিয়েল-টাইম মেরিট পজিশন দিয়ে সরকারি পরীক্ষার হুবহু অভিজ্ঞতা।
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5 text-[11px] font-medium text-zinc-500">
              <span className="rounded-md bg-zinc-100 px-2 py-0.5">±০.২৫ নেগেটিভ</span>
              <span className="rounded-md bg-zinc-100 px-2 py-0.5">র‍্যাংকিং ও মেরিট লিস্ট</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                BUET + DU + CKET
              </span>
            </div>
            <h3 className="mt-4 text-base font-bold text-zinc-900">
              স্মার্ট প্রশ্ন ব্যাংক
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-600">
              বিশ্ববিদ্যালয়ভিত্তিক ফিল্টার এবং চ্যাপ্টার-অনুযায়ী নির্ভুল ব্যাখ্যা। বিগত ১০ বছরের প্রতিটি প্রশ্নের নিখুঁত সমাধান।
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5 text-[11px] font-medium text-zinc-500">
              <span className="rounded-md bg-zinc-100 px-2 py-0.5">LaTeX ফর্মুলা সাপোর্ট</span>
              <span className="rounded-md bg-zinc-100 px-2 py-0.5">টপিকভিত্তিক ফিল্টার</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">
                স্মার্ট অ্যালগরিদম
              </span>
            </div>
            <h3 className="mt-4 text-base font-bold text-zinc-900">
              অটোমেটেড ভুল খাতা (Mistake Book)
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-600">
              তোমার প্রতিটি ভুল প্রশ্নের স্বয়ংক্রিয় স্টোরেজ ও পুনরাবৃত্তি রিভিশন প্র্যাকটিস। দুর্বল মার্কগুলো চিহ্নিত করে টপিকভিত্তিক প্রস্তুতি।
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5 text-[11px] font-medium text-zinc-500">
              <span className="rounded-md bg-zinc-100 px-2 py-0.5">-০.২৫ বাঁচানোর কৌশল</span>
              <span className="rounded-md bg-zinc-100 px-2 py-0.5">টু-স্ট্রাইক মাস্টারী</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Bell className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                ১০০% ভেরিফায়েড
              </span>
            </div>
            <h3 className="mt-4 text-base font-bold text-zinc-900">
              ভেরিফাইড সার্কুলার অ্যালার্ট
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-600">
              আবেদন শুরু, শেষ তারিখ, প্রবেশপত্র ও পরীক্ষার নোটিফিকেশন মিস হওয়ার সুযোগ নেই। সরকারি ওয়েবসাইট থেকে অফিসিয়াল পিডিএফ।
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5 text-[11px] font-medium text-zinc-500">
              <span className="rounded-md bg-zinc-100 px-2 py-0.5">সার্কুলার ক্যালেন্ডার</span>
              <span className="rounded-md bg-zinc-100 px-2 py-0.5">অফিসিয়াল পিডিএফ</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Live Admission Circular Directory Section */}
      <section id="circulars" className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></span>
            <h2 className="text-xl font-bold text-zinc-900 sm:text-2xl">
              লাইভ এডমিশন সার্কুলার ডিরেক্টরি ২০২৪-২৫
            </h2>
          </div>
          <span className="text-xs text-zinc-500">সর্বশেষ আপডেট: আজ সকাল ১১:৩০</span>
        </div>

        {/* Ticker Notice */}
        <div className="mb-4 flex items-center justify-between rounded-xl bg-blue-50/80 px-4 py-2.5 text-xs text-blue-800 border border-blue-200">
          <div className="flex items-center space-x-2">
            <span className="rounded-md bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">
              নোটিশ
            </span>
            <span className="font-medium">
              বুয়েট ২০২৪-২৫ শিক্ষাবর্ষের ভর্তি আবেদনের শেষ তারিখ ১৫ জানুয়ারি সন্ধ্যা ৬:০০ মিনিট পর্যন্ত বৃদ্ধি করা হয়েছে।
            </span>
          </div>
          <a href="#" className="hidden sm:inline-flex items-center gap-1 font-bold text-blue-600 hover:underline">
            বিস্তারিত <ArrowRight className="h-3 w-3" />
          </a>
        </div>

        {/* Circular Table */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 font-semibold">
                <tr>
                  <th className="px-4 py-3">বিশ্ববিদ্যালয় ও ইউনিট</th>
                  <th className="px-4 py-3">আবেদন শেষ</th>
                  <th className="px-4 py-3">পরীক্ষার তারিখ</th>
                  <th className="px-4 py-3">যোগ্যতা</th>
                  <th className="px-4 py-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {circulars.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/70 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-zinc-900 text-sm">
                        {item.university}
                      </div>
                      <div className="text-zinc-500 text-[11px] mt-0.5">
                        {item.unit}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 font-semibold text-[11px] ${
                          item.deadlineWarning
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "text-zinc-700"
                        }`}
                      >
                        {item.deadline}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-zinc-700">
                      {item.examDate}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600 max-w-xs">
                      {item.eligibility}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <a
                        href={item.pdfUrl}
                        className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 font-semibold text-zinc-700 hover:bg-zinc-50 shadow-2xs"
                      >
                        <Download className="h-3.5 w-3.5 text-zinc-500" />
                        <span>বিজ্ঞপ্তি (PDF)</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Banner / CTA */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-white border border-zinc-200 p-4 shadow-xs">
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-zinc-700">
            <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
            <span>লাইভ এক্সামে অংশ নাও এবং সম্পূর্ণ ফ্রিতে বুয়েট ও ঢাবির প্রশ্ন সমাধানের মেরিট দেখো।</span>
          </div>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-blue-700 shadow-sm"
          >
            এখনই ড্যাশবোর্ডে যাও
          </Link>
        </div>
      </section>

      {/* Mobile Sticky Bottom Bar (390px Viewport) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-zinc-200 bg-white/95 p-3 backdrop-blur-md sm:hidden flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-blue-600 uppercase">লাইভ মডেল টেস্ট</span>
          <span className="text-xs font-semibold text-zinc-900">আজকের মেগা টেস্ট</span>
        </div>
        <Link
          href="/exams/8f8b89e2-1111-2222-3333-444455556666/room"
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm min-h-[48px] flex items-center justify-center"
        >
          এক্সামে বসো
        </Link>
      </div>
    </div>
  );
}
