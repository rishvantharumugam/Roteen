"use client";

import { useSyncExternalStore } from "react";

export type SelectedVideoSubject = {
  id: string;
  slug: string | null;
  name: string | null;
  standard: string | null;
};

const STORAGE_KEY = "roteen_video_selected_subject";

let subjectState: SelectedVideoSubject | null = null;
const listeners = new Set<() => void>();
let hasHydratedFromStorage = false;

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function normalizeSubject(input: SelectedVideoSubject): SelectedVideoSubject {
  return {
    id: String(input.id).trim(),
    slug: input.slug?.trim() || null,
    name: input.name?.trim() || null,
    standard: input.standard?.trim() || null,
  };
}

function readFromStorage(): SelectedVideoSubject | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as SelectedVideoSubject;
    if (!parsed?.id) {
      return null;
    }

    return normalizeSubject(parsed);
  } catch {
    return null;
  }
}

function writeToStorage(nextState: SelectedVideoSubject | null) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (!nextState) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  } catch {
    // Ignore storage quota/privacy-mode issues.
  }
}

export function hydrateSelectedVideoSubjectFromStorage(): SelectedVideoSubject | null {
  if (hasHydratedFromStorage) {
    return subjectState;
  }

  hasHydratedFromStorage = true;
  subjectState = readFromStorage();
  return subjectState;
}

export function getSelectedVideoSubject(): SelectedVideoSubject | null {
  if (!hasHydratedFromStorage) {
    hydrateSelectedVideoSubjectFromStorage();
  }
  return subjectState;
}

export function setSelectedVideoSubject(nextSubject: SelectedVideoSubject): void {
  const normalized = normalizeSubject(nextSubject);
  subjectState = normalized;
  hasHydratedFromStorage = true;
  writeToStorage(normalized);
  notifyListeners();
}

export function clearSelectedVideoSubject(): void {
  subjectState = null;
  hasHydratedFromStorage = true;
  writeToStorage(null);
  notifyListeners();
}

export function subscribeSelectedVideoSubject(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSelectedVideoSubject(): SelectedVideoSubject | null {
  return useSyncExternalStore(
    subscribeSelectedVideoSubject,
    getSelectedVideoSubject,
    () => null,
  );
}
