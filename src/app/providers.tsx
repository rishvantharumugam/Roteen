"use client";

import { ThemeProvider } from "next-themes";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createQueryClient } from "@/lib/queryClient";
import { CoreRoutePrefetcher } from "@/constants/CoreRoutePrefetcher";

// Suppress React 19 false-positive error caused by next-themes injecting a script tag
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    if (typeof args[0] === "string" && args[0].includes("Encountered a script tag")) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
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
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
