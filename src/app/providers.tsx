"use client";

import { ThemeProvider } from "next-themes";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createQueryClient } from "@/lib/queryClient";
import { CoreRoutePrefetcher } from "@/constants/CoreRoutePrefetcher";
import { StudyTimerTracker } from "@/features/dashboard/components/StudyTimerTracker";
import { GoalAchievedModal } from "@/features/dashboard/components/GoalAchievedModal";

// ─── Dev-mode noise suppression ─────────────────────────────────────────────
// 1. React 19 false-positive: next-themes injects a <script> tag during SSR
//    which React 19 warns about. Suppress that specific warning.
// 2. Supabase auth makes background token-refresh requests. When the network
//    is temporarily unavailable (tab wake-up, cold-start, laptop sleep, etc.)
//    those requests throw "TypeError: Failed to fetch". The error comes from
//    inside `@supabase/auth-js` and is NOT actionable — the library retries
//    automatically. We suppress it so it doesn't pollute the dev overlay.
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Encountered a script tag") ||
        args[0].includes("Failed to fetch"))
    ) {
      return;
    }
    // Suppress Error objects whose message is "Failed to fetch" (Supabase auth)
    if (args[0] instanceof Error && args[0].message === "Failed to fetch") {
      return;
    }
    originalConsoleError.apply(console, args);
  };

  // Also swallow the unhandledrejection event so Next.js error overlay
  // never triggers for this known, transient Supabase auth network error.
  const suppressSupabaseFetchError = (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    if (
      reason instanceof TypeError &&
      reason.message === "Failed to fetch"
    ) {
      event.preventDefault(); // prevents Next.js overlay from catching it
    }
  };
  window.addEventListener("unhandledrejection", suppressSupabaseFetchError);
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  // Clear ALL cached query data when the logged-in user changes.
  // Without this, a new user logging in would see the previous user's
  // notes, sessions, revision playlists etc. from the React Query cache.
  useEffect(() => {
    const handleAuthUserChanged = () => {
      queryClient.clear();
    };

    window.addEventListener("auth-user-changed", handleAuthUserChanged);
    return () => {
      window.removeEventListener("auth-user-changed", handleAuthUserChanged);
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <CoreRoutePrefetcher />
      <StudyTimerTracker />
      <GoalAchievedModal />
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
