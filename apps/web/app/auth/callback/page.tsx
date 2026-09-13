"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Google অ্যাকাউন্ট যাচাই করা হচ্ছে...");

  useEffect(() => {
    const token = searchParams.get("token");
    const userParam = searchParams.get("user");
    const error = searchParams.get("error");
    const redirect = searchParams.get("redirect") || "/dashboard";

    if (error) {
      setStatus("error");
      setMessage("Google লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
      setTimeout(() => router.replace("/login"), 2500);
      return;
    }

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        login(user, token);
        setStatus("success");
        setMessage("সফলভাবে লগইন হয়েছে! ড্যাশবোর্ডে যাচ্ছে...");
        setTimeout(() => router.replace(decodeURIComponent(redirect)), 1000);
      } catch {
        setStatus("error");
        setMessage("সেশন তথ্য পড়তে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
        setTimeout(() => router.replace("/login"), 2500);
      }
    } else {
      setStatus("error");
      setMessage("অপ্রত্যাশিত ত্রুটি। লগইন পেজে ফিরে যাচ্ছে...");
      setTimeout(() => router.replace("/login"), 2500);
    }
  }, [searchParams, login, router]);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center">
      <div className="text-center space-y-4">
        {status === "loading" && (
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
        )}
        {status === "success" && (
          <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
        )}
        {status === "error" && (
          <XCircle className="h-10 w-10 text-red-500 mx-auto" />
        )}
        <p className="text-sm font-semibold text-zinc-700">{message}</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    }>
      <AuthCallbackInner />
    </Suspense>
  );
}
