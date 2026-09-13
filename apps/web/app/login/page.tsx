"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  ArrowRight,
  Sparkles,
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  User,
  Target,
  Check,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithEmail, loginAsDemoStudent, loginAsAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<"student" | "admin">("student");

  // Free Email Login state
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [targetUnit, setTargetUnit] = useState("ENGINEERING");

  // Admin state
  const [adminPasskey, setAdminPasskey] = useState("");

  // Loading & Error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleStudentEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await loginWithEmail(email, fullName, targetUnit);
    setLoading(false);
    if (res.success) {
      router.push("/dashboard");
    } else {
      setError(res.message);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    // Instant zero-cost Google OAuth simulation / connection
    await loginWithEmail("student.google@gmail.com", "গুগল পরীক্ষার্থী (HSC '25)", "ENGINEERING");
    setLoading(false);
    router.push("/dashboard");
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await loginAsAdmin(adminPasskey);
    setLoading(false);
    if (res.success) {
      router.push("/admin");
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Logo & Back button */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>হোমে ফিরে যান</span>
          </Link>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            ১০০% ফ্রি ক্লাউড আর্কিটেকচার
          </span>
        </div>

        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-md shadow-blue-500/25 text-white mb-3">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">
            Admission <span className="text-blue-600">Engine</span>
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            মোবাইল এসএমএস এর ঝামেলা ও খরচ ছাড়া সম্পূর্ণ ফ্রিতে প্রস্তুত হও।
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-7 px-5 sm:px-8 shadow-sm border border-zinc-200/80 rounded-2xl">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-zinc-100 p-1 mb-6 text-xs font-bold">
            <button
              onClick={() => {
                setActiveTab("student");
                setError(null);
              }}
              className={`py-2 rounded-lg transition ${
                activeTab === "student"
                  ? "bg-white text-zinc-900 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              শিক্ষার্থী প্রবেশ (ফ্রি)
            </button>
            <button
              onClick={() => {
                setActiveTab("admin");
                setError(null);
              }}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                activeTab === "admin"
                  ? "bg-zinc-900 text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <Lock className="h-3 w-3" />
              <span>অ্যাডমিন গেট</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 border border-emerald-200 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: Student Login (100% Free - No Paid SMS Dependency) */}
          {activeTab === "student" && (
            <div className="space-y-4">
              <div className="rounded-xl bg-blue-50/70 p-3 border border-blue-200/60 text-[11px] text-blue-900">
                <div className="flex items-center gap-1.5 font-bold mb-0.5">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  <span>কোনো পেইড SMS OTP লাগবে না</span>
                </div>
                <p className="text-blue-700">
                  যেহেতু বাংলাদেশি নম্বরে SMS পাঠাতে প্রতি মেসেজে চার্জ কাটে, তাই শিক্ষার্থীদের জন্য ইমেইল ও গুগল লগইন সম্পূর্ণ ফ্রি রাখা হয়েছে।
                </p>
              </div>

              {/* 1. Google 1-Click Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 shadow-2xs hover:bg-zinc-50 transition min-h-[42px]"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google দিয়ে ১-ক্লিকে প্রবেশ করুন</span>
              </button>

              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-zinc-400 text-[11px]">বা ইমেইল দিয়ে প্রবেশ করুন</span>
              </div>

              {/* 2. Free Email + Name Form */}
              <form onSubmit={handleStudentEmailLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    ইমেইল ঠিকানা (Email)
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-4 w-4 text-zinc-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@gmail.com"
                      required
                      className="block w-full rounded-xl border border-zinc-200 pl-9 pr-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    তোমার পুরো নাম
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <User className="h-4 w-4 text-zinc-400" />
                    </div>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="তাহমিদ আলী (বা তোমার নাম)"
                      required
                      className="block w-full rounded-xl border border-zinc-200 pl-9 pr-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    টার্গেট ভর্তি ইউনিট
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Target className="h-4 w-4 text-zinc-400" />
                    </div>
                    <select
                      value={targetUnit}
                      onChange={(e) => setTargetUnit(e.target.value)}
                      className="block w-full rounded-xl border border-zinc-200 pl-9 pr-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-hidden focus:ring-1 focus:ring-blue-600 bg-white"
                    >
                      <option value="ENGINEERING">ইঞ্জিনিয়ারিং (BUET, CKRUET, MIST)</option>
                      <option value="DU_KA">ঢাকা বিশ্ববিদ্যালয় বিজ্ঞান অনুষদ — &#39;ক&#39; ইউনিট</option>
                      <option value="MEDICAL">মেডিকেল ভর্তি পরীক্ষা (MBBS / BDS)</option>
                      <option value="GST">জিএসটি সাধারণ ও বিজ্ঞান প্রযুক্তি গুচ্ছ</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-[0.99] transition disabled:opacity-50 min-h-[42px]"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span>লগইন ও ড্যাশবোর্ডে প্রবেশ</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* 3. Instant Demo Student Login */}
              <div className="pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => loginAsDemoStudent()}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition"
                >
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>তাৎক্ষণিক ডেমো শিক্ষার্থী হিসেবে প্রবেশ (তাহমিদ আলী)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Restricted Admin Gate */}
          {activeTab === "admin" && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="rounded-xl bg-amber-50/70 p-3 border border-amber-200/80 text-[11px] text-amber-800">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <Shield className="h-3.5 w-3.5 text-amber-600" />
                  <span>সংরক্ষিত সুপার অ্যাডমিন কমান্ড সেন্টার</span>
                </div>
                <p>
                  এই অংশটি শুধুমাত্র প্ল্যাটফর্মের প্রধান সুপার অ্যাডমিনের জন্য। শিক্ষার্থীদের এখানে কোনো এক্সেস নেই।
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  মাস্টার অ্যাডমিন সিক্রেট পাসকি (Secret Passkey)
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-zinc-400" />
                  </div>
                  <input
                    type="password"
                    value={adminPasskey}
                    onChange={(e) => setAdminPasskey(e.target.value)}
                    placeholder="••••••••••••••••"
                    required
                    className="block w-full rounded-xl border border-zinc-200 pl-9 pr-3 py-2.5 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-zinc-900 font-mono"
                  />
                </div>
                <p className="mt-1 text-[10px] text-zinc-400">
                  ডিফল্ট পাসকি: <code className="font-mono bg-zinc-100 px-1 py-0.5 rounded">admin_super_secret_2025</code>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !adminPasskey}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-zinc-800 active:scale-[0.99] transition disabled:opacity-50 min-h-[42px]"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Lock className="h-4 w-4 text-amber-400" />
                    <span>অ্যাডমিন কমান্ড সেন্টারে প্রবেশ</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-zinc-400">
          Admission Engine &copy; 2025 • ১০০% ফ্রি ক্লাউড ইনফ্রাস্ট্রাকচার
        </p>
      </div>
    </div>
  );
}
