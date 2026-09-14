"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import {
  Shield,
  ArrowRight,
  Lock,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Mail,
  User,
  Target,
  BookOpen,
  Sparkles,
  CheckCircle2,
  X,
} from "lucide-react";
import { useAuth, type AuthUser } from "@/lib/auth-context";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
        };
      };
    };
  }
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const { login, loginWithEmail, loginAsAdmin, user, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"student" | "admin">("student");

  // Student form state
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [targetUnit, setTargetUnit] = useState("ENGINEERING");

  // Admin state
  const [adminPasskey, setAdminPasskey] = useState("");

  // Google Modal State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleName, setGoogleName] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(user.role === "SUPER_ADMIN" ? "/admin" : redirectTo);
    }
  }, [user, authLoading, router, redirectTo]);

  // Handle Google Credential Response from GIS
  const handleGoogleCredentialResponse = (response: any) => {
    try {
      if (!response.credential) return;
      const base64Url = response.credential.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const payload = JSON.parse(jsonPayload);

      const googleUser: AuthUser = {
        id: payload.sub || `google-${Date.now()}`,
        role: "STUDENT",
        fullName: payload.name || payload.email.split("@")[0],
        email: payload.email,
        targetUnit: "ENGINEERING",
      };

      login(googleUser, response.credential);
      router.push(redirectTo);
    } catch (e) {
      console.warn("Could not decode Google credential:", e);
      setIsGoogleModalOpen(true);
    }
  };

  // Google Login click handler
  const handleGoogleLogin = () => {
    // 1. Try Google Identity Services if loaded
    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: "645001530796-17ajo1vvvdklrvtk5h8r7shcqdprk4g5.apps.googleusercontent.com",
          callback: handleGoogleCredentialResponse,
          auto_select: false,
        });
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fallback to quick Google prompt dialog
            setIsGoogleModalOpen(true);
          }
        });
        return;
      } catch (e) {
        console.warn("GIS prompt error:", e);
      }
    }

    // 2. Open quick Google login dialog if GIS is not ready
    setIsGoogleModalOpen(true);
  };

  // Complete Google login through modal
  const handleGoogleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail) return;

    const derivedName = googleName.trim() || googleEmail.split("@")[0] || "Google Student";
    const googleUser: AuthUser = {
      id: `google-${Date.now()}`,
      role: "STUDENT",
      fullName: derivedName,
      email: googleEmail.toLowerCase().trim(),
      targetUnit: (targetUnit as any) || "ENGINEERING",
    };

    login(googleUser, `google-session-${Date.now()}`);
    setIsGoogleModalOpen(false);
    router.push(redirectTo);
  };

  // Official OAuth redirect flow (if user explicitly chooses)
  const handleOfficialGoogleOAuthRedirect = () => {
    const apiBase =
      process.env["NEXT_PUBLIC_API_URL"] || "https://admission-engine-1-0.onrender.com/api/v1";
    window.location.href = `${apiBase}/auth/google?redirect=${encodeURIComponent(redirectTo)}`;
  };

  // Direct 1-Click Demo Login
  const handleDirectDemoLogin = (persona: "tahmid" | "farabi") => {
    if (persona === "tahmid") {
      login(
        {
          id: "student-tahmid-buet-101",
          role: "STUDENT",
          fullName: "তাহমিদ আহমেদ",
          email: "tahmid@admissionengine.com",
          targetUnit: "ENGINEERING",
        },
        "demo-token-tahmid"
      );
    } else {
      login(
        {
          id: "student-farabi-dmc-102",
          role: "STUDENT",
          fullName: "ফারাবি হাসান",
          email: "farabi@admissionengine.com",
          targetUnit: "MEDICAL",
        },
        "demo-token-farabi"
      );
    }
    router.push(redirectTo);
  };

  const handleStudentEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !fullName) {
      setError("ইমেইল এবং নাম অবশ্যই পূরণ করুন।");
      return;
    }
    setLoading(true);
    const res = await loginWithEmail(email, fullName, targetUnit);
    setLoading(false);
    if (res.success) {
      router.push(redirectTo);
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Load Google Identity Services SDK */}
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.google?.accounts?.id) {
            try {
              window.google.accounts.id.initialize({
                client_id: "645001530796-17ajo1vvvdklrvtk5h8r7shcqdprk4g5.apps.googleusercontent.com",
                callback: handleGoogleCredentialResponse,
              });
            } catch (e) {
              console.warn("GIS Init error:", e);
            }
          }
        }}
      />

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
          <span className="text-[11px] font-bold text-zinc-500 bg-zinc-100 px-2.5 py-0.5 rounded-full border border-zinc-200">
            Admission Engine
          </span>
        </div>

        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-md shadow-blue-500/25 text-white mb-3">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">
            স্বাগতম
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            তোমার অ্যাকাউন্টে প্রবেশ করো বা নতুন অ্যাকাউন্ট তৈরি করো।
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-7 px-5 sm:px-8 shadow-sm border border-zinc-200/80 rounded-2xl">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-zinc-100 p-1 mb-6 text-xs font-bold">
            <button
              onClick={() => { setActiveTab("student"); setError(null); }}
              className={`py-2 rounded-lg transition ${
                activeTab === "student"
                  ? "bg-white text-zinc-900 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5 inline mr-1.5" />
              শিক্ষার্থী লগইন
            </button>
            <button
              onClick={() => { setActiveTab("admin"); setError(null); }}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                activeTab === "admin"
                  ? "bg-zinc-900 text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <Lock className="h-3 w-3" />
              <span>অ্যাডমিন</span>
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: Student Login */}
          {activeTab === "student" && (
            <div className="space-y-4">
              {/* Google Login Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 shadow-2xs hover:bg-zinc-50 hover:border-zinc-300 transition min-h-[44px]"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google অ্যাকাউন্ট দিয়ে প্রবেশ করুন</span>
              </button>

              {/* Quick Persona 1-Click Direct Login (Guaranteed Instant Access) */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-3.5 space-y-2">
                <div className="text-[11px] font-bold text-zinc-700 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                    <span>তাৎক্ষণিক ডেমো শিক্ষার্থী হিসেবে প্রবেশ (১-ক্লিক):</span>
                  </span>
                  <span className="rounded-md bg-blue-600 text-white px-1.5 py-0.2 text-[9px] font-extrabold">
                    সরাসরি ড্যাশবোর্ড
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDirectDemoLogin("tahmid")}
                    className="flex items-center gap-2 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 hover:border-blue-300 p-2.5 text-left transition shadow-2xs active:scale-98"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs shrink-0">
                      তা
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-zinc-900 truncate">তাহমিদ আহমেদ</div>
                      <div className="text-[10px] text-blue-700 font-semibold">BUET Target</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDirectDemoLogin("farabi")}
                    className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 p-2.5 text-left transition shadow-2xs active:scale-98"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs shrink-0">
                      ফা
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-zinc-900 truncate">ফারাবি হাসান</div>
                      <div className="text-[10px] text-emerald-700 font-semibold">DMC Target</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-zinc-400 text-[11px] relative z-10">অথবা যেকোনো নাম ও ইমেইল দিয়ে</span>
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-zinc-200" />
              </div>

              {/* Email + Name Form */}
              <form onSubmit={handleStudentEmailLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    ইমেইল ঠিকানা <span className="text-red-500">*</span>
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
                    পুরো নাম <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <User className="h-4 w-4 text-zinc-400" />
                    </div>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="তোমার পুরো নাম লেখো"
                      required
                      className="block w-full rounded-xl border border-zinc-200 pl-9 pr-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    টার্গেট ভর্তি পরীক্ষা
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Target className="h-4 w-4 text-zinc-400" />
                    </div>
                    <select
                      value={targetUnit}
                      onChange={(e) => setTargetUnit(e.target.value)}
                      className="block w-full rounded-xl border border-zinc-200 pl-9 pr-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-hidden focus:ring-1 focus:ring-blue-600 bg-white appearance-none"
                    >
                      <option value="ENGINEERING">ইঞ্জিনিয়ারিং — BUET, CUET, RUET, KUET, MIST</option>
                      <option value="DU_KA">ঢাকা বিশ্ববিদ্যালয় — বিজ্ঞান অনুষদ 'ক' ইউনিট</option>
                      <option value="MEDICAL">মেডিকেল ভর্তি পরীক্ষা — MBBS / BDS</option>
                      <option value="GST">গুচ্ছ ভর্তি পরীক্ষা — GST (বিজ্ঞান)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email || !fullName}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-[0.99] transition disabled:opacity-50 min-h-[42px]"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span>প্রবেশ করুন</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Admin Login */}
          {activeTab === "admin" && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200 leading-relaxed">
                <strong>নিরাপত্তা গার্ড:</strong> অ্যাডমিন প্যানেল শুধুমাত্র অনুমোদিত ব্যক্তিদের জন্য সংরক্ষিত।
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  অ্যাডমিন সিক্রেট পাসকি <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-zinc-400" />
                  </div>
                  <input
                    type="password"
                    value={adminPasskey}
                    onChange={(e) => setAdminPasskey(e.target.value)}
                    placeholder="পাসকি লিখুন"
                    required
                    className="block w-full rounded-xl border border-zinc-200 pl-9 pr-3 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-zinc-900 font-mono"
                  />
                </div>
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
                    <Shield className="h-3.5 w-3.5 text-emerald-400" />
                    <span>অ্যাডমিন ড্যাশবোর্ডে প্রবেশ</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Google Account Direct Sign-in Dialog */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-4 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsGoogleModalOpen(false)}
              className="absolute top-4 right-4 rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-50 border border-zinc-200">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Google দিয়ে প্রবেশ</h3>
                <p className="text-[11px] text-zinc-500">তোমার জিমেইল অ্যাকাউন্ট তথ্য দাও</p>
              </div>
            </div>

            <form onSubmit={handleGoogleModalSubmit} className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                  Gmail এড্রেস
                </label>
                <input
                  type="email"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  required
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                  তোমার নাম
                </label>
                <input
                  type="text"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="যেমন: সাকিব হাসান"
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs text-zinc-900 focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
              >
                Google দিয়ে ড্যাশবোর্ডে প্রবেশ
              </button>

              <div className="pt-2 border-t border-zinc-100 text-center">
                <button
                  type="button"
                  onClick={handleOfficialGoogleOAuthRedirect}
                  className="text-[10px] font-semibold text-zinc-500 hover:text-blue-600 underline"
                >
                  অথবা অফিসিয়াল গুগল রিডাইরেক্টে যান (OAuth 2.0)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    }>
      <LoginPageInner />
    </Suspense>
  );
}
