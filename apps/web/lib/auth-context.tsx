"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface AuthUser {
  id: string;
  role: "STUDENT" | "SUPER_ADMIN";
  fullName: string;
  email: string;
  phone?: string | null;
  targetUnit?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  loginAsDemoStudent: () => Promise<void>;
  loginAsAdmin: (passkey: string) => Promise<{ success: boolean; message: string }>;
  sendOtp: (phone: string) => Promise<{ success: boolean; message: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL =
  process.env["NEXT_PUBLIC_API_URL"] ||
  (typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? "/api/backend"
    : "http://localhost:3000/api/v1");

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hydrate authentication state from localStorage safely in browser
    try {
      const storedToken = localStorage.getItem("auth_token");
      const storedUser = localStorage.getItem("auth_user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.warn("Could not load stored session:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (newUser: AuthUser, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    try {
      localStorage.setItem("auth_token", newToken);
      localStorage.setItem("auth_user", JSON.stringify(newUser));
    } catch (e) {
      console.warn("Storage error:", e);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      localStorage.removeItem("admin_passkey");
    } catch (e) {
      console.warn("Storage error:", e);
    }
    router.push("/");
  };

  const loginAsDemoStudent = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/demo-student-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const json = await res.json();
        login(json.user, json.token);
        router.push("/dashboard");
        return;
      }
    } catch (e) {
      console.warn("Live API demo student login failed, falling back locally:", e);
    }

    // Local simulation fallback
    const fallbackDemoStudent: AuthUser = {
      id: "55555555-5555-5555-5555-555555555555",
      role: "STUDENT",
      fullName: "তাহমিদ আলী (HSC '25)",
      email: "tahmid.admission@student.edu.bd",
      phone: "+8801700000001",
      targetUnit: "ENGINEERING",
    };
    login(fallbackDemoStudent, "demo-student-token-simulation");
    router.push("/dashboard");
  };

  const loginAsAdmin = async (passkey: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminKey: passkey }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        login(json.user, json.token);
        try {
          localStorage.setItem("admin_passkey", passkey);
        } catch {}
        return { success: true, message: json.message || "সফলভাবে লগইন হয়েছে।" };
      }
      return { success: false, message: json.message || "ভুল পাসকি।" };
    } catch (e) {
      // Local fallback check
      if (passkey.trim() === "admin_super_secret_2025" || passkey.trim() === "buet_admin_2025") {
        const fallbackAdmin: AuthUser = {
          id: "00000000-0000-0000-0000-000000000001",
          role: "SUPER_ADMIN",
          fullName: "Admission Engine Lead Administrator",
          email: "admin@admissionengine.com",
          phone: "+8801700000000",
          targetUnit: "ENGINEERING",
        };
        login(fallbackAdmin, "admin-simulated-jwt-token");
        try {
          localStorage.setItem("admin_passkey", passkey);
        } catch {}
        return { success: true, message: "সুপার অ্যাডমিন হিসেবে প্রমাণিত।" };
      }
      return {
        success: false,
        message: "ভুল পাসকি! সুপার অ্যাডমিন কমান্ড সেন্টারে প্রবেশের অনুমতি নেই।",
      };
    }
  };

  const sendOtp = async (phone: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const json = await res.json();
      if (res.ok) {
        return { success: true, message: json.message || "ওটিপি কোড পাঠানো হয়েছে।" };
      }
      return { success: false, message: json.message || "ওটিপি পাঠাতে সমস্যা হয়েছে।" };
    } catch (e) {
      return { success: true, message: "ডেমো মোড: ওটিপি কোড পাঠানো হয়েছে (যেকোনো ৬ ডিজিট দিন, যেমন ১২৩৪৫৬)।" };
    }
  };

  const verifyOtp = async (phone: string, otp: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        login(json.user, json.token);
        return { success: true, message: "সফলভাবে লগইন হয়েছে।" };
      }
      return { success: false, message: json.message || "ভুল ওটিপি কোড।" };
    } catch (e) {
      // Demo fallback
      const studentUser: AuthUser = {
        id: "student-" + Date.now(),
        role: "STUDENT",
        fullName: `শিক্ষার্থী (${phone.slice(-4)})`,
        email: `${phone.replace("+", "")}@admissionengine.edu`,
        phone,
        targetUnit: "ENGINEERING",
      };
      login(studentUser, "simulated-otp-jwt-token");
      return { success: true, message: "সফলভাবে লগইন হয়েছে (সিমুলেশন)।" };
    }
  };

  const isAdmin = user?.role === "SUPER_ADMIN";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin,
        login,
        logout,
        loginAsDemoStudent,
        loginAsAdmin,
        sendOtp,
        verifyOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
