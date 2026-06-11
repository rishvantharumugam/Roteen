"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useStudyTimerStore } from "@/features/dashboard/store/studyTimerStore";

export function StudyTimerTracker() {
  const pathname = usePathname();
  const incrementTime = useStudyTimerStore((state) => state.incrementTime);
  const resetIfNewDay = useStudyTimerStore((state) => state.resetIfNewDay);
  const lastActivityRef = useRef<number>(Date.now());

  // ── Daily reset on mount ─────────────────────────────────────────────────
  // Run once when the component mounts (i.e. every time the user opens / reloads
  // the app). If the stored date is not today, wipe timeSpentSeconds → 0.
  useEffect(() => {
    resetIfNewDay();
  }, [resetIfNewDay]);

  // ── Daily reset on tab visibility change ────────────────────────────────
  // Covers the case where the user leaves a tab open and returns the next day.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        resetIfNewDay();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [resetIfNewDay]);

  // ── Tick every second while user is active on a learning page ───────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    // List of active learning routes where study time counts
    const learningRoutes = ["/dashboard", "/video", "/notes", "/revision", "/session"];
    const isLearningPage = () => {
      const path = pathname || "";
      return learningRoutes.some((route) => path === route || path.startsWith(route + "/"));
    };

    // Keep track of last user interaction to pause when inactive (idle)
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("scroll", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("touchstart", handleActivity);

    const interval = setInterval(() => {
      const isVisible = document.visibilityState === "visible";
      // Inactivity timeout at 60 seconds (1 minute)
      const isUserActive = Date.now() - lastActivityRef.current < 60 * 1000;

      if (isVisible && isUserActive && isLearningPage()) {
        incrementTime();
      }
    }, 1000);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      clearInterval(interval);
    };
  }, [pathname, incrementTime]);

  return null;
}
