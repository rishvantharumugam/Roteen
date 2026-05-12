"use client";

import { useSyncExternalStore } from "react";

const THEME_CHANGE_EVENT = "dashboard-theme-change";

function readThemeSnapshot() {
  if (typeof window === "undefined") return false;

  const savedTheme = window.localStorage.getItem("dashboard-theme");
  if (savedTheme) return savedTheme === "dark";

  return document.documentElement.classList.contains("dark");
}

function subscribe(callback: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useDashboardTheme() {
  return useSyncExternalStore(subscribe, readThemeSnapshot, () => false);
}

