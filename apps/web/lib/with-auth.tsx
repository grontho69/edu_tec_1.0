"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./auth-context";

/**
 * useAuthGuard — protects a page from unauthenticated access.
 * Redirects to /login?redirect=<current-path> if not logged in.
 */
export function useAuthGuard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, isLoading, router, pathname]);

  return { user, isLoading, isAuthenticated: !!user };
}
