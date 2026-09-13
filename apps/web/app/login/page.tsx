"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  Phone,
  KeyRound,
  ArrowRight,
  Sparkles,
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { loginAsDemoStudent, loginAsAdmin, sendOtp, verifyOtp, user } = useAuth();

  const [activeTab, setActiveTab] = useState<"student" | "admin">("student");
  const [authMethod, setAuthMethod] = useState<"phone" | "magic-link">("phone");

  // Phone OTP state
  const [phone, setPhone] = useState("+8801700000001");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(60);

  // Email Magic Link state
  const [email, setEmail] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Admin state
  const [adminPasskey, setAdminPasskey] = useState("");

  // Loading & Error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const res = await sendOtp(phone);
    setLoading(false);
    if (res.success) {
      setOtpSent(true);
      setSuccessMsg(res.message);
    } else {
      setError(res.message);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await verifyOtp(phone, otp);
    setLoading(false);
    if (res.success) {
      router.push("/dashboard");
    } else {
      setError(res.message);
    }
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
          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
            HSC 2024-25 ভর্তি প্রস্তুতি
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
            তোমার অ্যাকাউন্টে প্রবেশ করে লাইভ পরীক্ষা এবং ড্যাশবোর্ড অ্যাক্সেস করো।
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
              শিক্ষার্থী লগইন
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

          {/* TAB 1: Student Login */}
          {activeTab === "student" && (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      মোবাইল নম্বর (বাংলা ওটিপি লগইন)
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Phone className="h-4 w-4 text-zinc-400" />
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+8801XXXXXXXXX"
                        required
                        className="block w-full rounded-xl border border-zinc-200 pl-9 pr-3 py-2.5 text-xs text-zinc-900 focus:border-blue-600 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-400">
                      কোনো পাসওয়ার্ড প্রয়োজন নেই। নম্বরে ৬ সংখ্যার ওটিপি যাবে।
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-[0.99] transition disabled:opacity-50 min-h-[42px]"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <span>ওটিপি পাঠান</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-zinc-700">
                        ৬-ডিজিটের ভেরিফিকেশন কোড
                      </label>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-[11px] font-semibold text-blue-600 hover:underline"
                      >
                        নম্বর পরিবর্তন
                      </button>
                    </div>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <KeyRound className="h-4 w-4 text-zinc-400" />
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                        required
                        className="block w-full rounded-xl border border-zinc-200 pl-9 pr-3 py-2.5 text-sm tracking-widest font-mono text-zinc-900 focus:border-blue-600 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-zinc-400">
                      কোডটি ৩ মিনিটের জন্য কার্যকর থাকবে।
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length < 4}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-[0.99] transition disabled:opacity-50 min-h-[42px]"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <span>যাচাই ও প্রবেশ করুন</span>
                        <CheckCircle2 className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Instant Demo Student Button */}
              <div className="pt-3 border-t border-zinc-100">
                <div className="relative flex justify-center text-xs mb-3">
                  <span className="bg-white px-2 text-zinc-400 text-[11px]">অথবা টেস্ট করুন</span>
                </div>
                <button
                  type="button"
                  onClick={() => loginAsDemoStudent()}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition"
                >
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>তাৎক্ষণিক ডেমো স্টুডেন্ট হিসেবে প্রবেশ (তাহমিদ আলী)</span>
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
                  <span>সংরক্ষিত কমান্ড সেন্টার</span>
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
          Admission Engine &copy; 2025 • নিরাপদ ও এনক্রিপ্টেড সেশন
        </p>
      </div>
    </div>
  );
}
