"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface AuthUser {
  id: string;
  role: "STUDENT" | "SUPER_ADMIN";
  fullName: string;
  email: string;
  targetUnit?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  loginAsAdmin: (passkey: string) => Promise<{ success: boolean; message: string }>;
  loginWithEmail: (
    email: string,
    fullName?: string,
    targetUnit?: string
  ) => Promise<{ success: boolean; message: string }>;
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
    } catch (e) {
      console.warn("Storage error:", e);
    }
    router.push("/");
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
        return { success: true, message: json.message || "সফলভাবে লগইন হয়েছে।" };
      }
      return { success: false, message: json.message || "ভুল পাসকি।" };
    } catch {
      // Local fallback — only if network is down
      const configuredKey = process.env["NEXT_PUBLIC_ADMIN_KEY"] || "";
      if (configuredKey && passkey.trim() === configuredKey) {
        const fallbackAdmin: AuthUser = {
          id: "00000000-0000-0000-0000-000000000001",
          role: "SUPER_ADMIN",
          fullName: "Admission Engine Administrator",
          email: "admin@admissionengine.com",
        };
        login(fallbackAdmin, "admin-offline-token");
        return { success: true, message: "সুপার অ্যাডমিন হিসেবে প্রমাণিত।" };
      }
      return {
        success: false,
        message: "সার্ভারে সংযোগ করা সম্ভব হয়নি। পরে আবার চেষ্টা করুন।",
      };
    }
  };

  const loginWithEmail = async (
    email: string,
    fullName?: string,
    targetUnit?: string
  ): Promise<{ success: boolean; message: string }> => {
    const isFarabi =
      email.toLowerCase().includes("farabi") || (fullName || "").includes("ফারাবি");
    const isTahmid =
      email.toLowerCase().includes("tahmid") || (fullName || "").includes("তাহমিদ");

    const fallbackUser: AuthUser = {
      id: isFarabi
        ? "student-farabi-dmc-102"
        : isTahmid
        ? "student-tahmid-buet-101"
        : `student-${Date.now()}`,
      role: "STUDENT",
      fullName: fullName || (isFarabi ? "ফারাবি হাসান" : isTahmid ? "তাহমিদ আহমেদ" : "শিক্ষার্থী"),
      email,
      targetUnit: targetUnit || (isFarabi ? "MEDICAL" : "ENGINEERING"),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/auth/student-email-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fullName, targetUnit }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.user) {
          login(json.user, json.token);
          return { success: true, message: json.message || "সফলভাবে লগইন হয়েছে।" };
        }
      }
      // If server returned non-200, fallback to local login
      login(fallbackUser, "offline-student-token");
      return { success: true, message: "শিক্ষার্থী হিসেবে প্রবেশ সফল হয়েছে।" };
    } catch {
      // Graceful offline demo fallback
      login(fallbackUser, "offline-student-token");
      return {
        success: true,
        message: "শিক্ষার্থী হিসেবে প্রবেশ সফল হয়েছে।",
      };
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
        loginAsAdmin,
        loginWithEmail,
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
