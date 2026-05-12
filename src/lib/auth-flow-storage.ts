"use client";

export type StoredAuthMode = "signIn" | "signUp";

export type AuthFlowDraft = {
  mode: StoredAuthMode;
  signInStep?: 1 | 2;
  signInEmail?: string;
  signInOtp?: string;
  signUpStep?: 1 | 2 | 3;
  signUpEmail?: string;
  signUpOtp?: string;
  signUpPhone?: string;
  signUpStandard?: string;
  signUpSchoolType?: string;
  signUpSchoolName?: string;
  signUpDob?: string;
  signUpDistrict?: string;
  signUpGender?: string;
  signUpMedium?: string;
  signUpUserType?: string;
  isExistingUserFlow?: boolean;
  successMessage?: string;
  savedAt: number;
  expiresAt: number;
};

const AUTH_FLOW_STORAGE_KEY = "routeen-auth-flow-draft";
export const AUTH_FLOW_TTL_MS = 5 * 60 * 1000;
const authFlowDraftListeners = new Set<() => void>();
let cachedAuthFlowDraft: AuthFlowDraft | null = null;
let cachedRawDraft: string | null | undefined;

function canUseStorage() {
  return typeof window !== "undefined";
}

function notifyAuthFlowDraftListeners() {
  authFlowDraftListeners.forEach((listener) => listener());
}

function parseStoredAuthFlowDraft(rawDraft: string | null) {
  if (!rawDraft) {
    return null;
  }

  try {
    const parsedDraft = JSON.parse(rawDraft) as AuthFlowDraft;

    if (!parsedDraft.expiresAt || Date.now() >= parsedDraft.expiresAt) {
      window.localStorage.removeItem(AUTH_FLOW_STORAGE_KEY);
      cachedRawDraft = null;
      cachedAuthFlowDraft = null;
      return null;
    }

    return parsedDraft;
  } catch {
    window.localStorage.removeItem(AUTH_FLOW_STORAGE_KEY);
    cachedRawDraft = null;
    cachedAuthFlowDraft = null;
    return null;
  }
}

export function readAuthFlowDraft() {
  if (!canUseStorage()) {
    return null;
  }

  const rawDraft = window.localStorage.getItem(AUTH_FLOW_STORAGE_KEY);

  if (rawDraft === cachedRawDraft) {
    return cachedAuthFlowDraft;
  }

  cachedRawDraft = rawDraft;
  cachedAuthFlowDraft = parseStoredAuthFlowDraft(rawDraft);
  return cachedAuthFlowDraft;
}

export function getAuthFlowExpiryTimestamp() {
  return Date.now() + AUTH_FLOW_TTL_MS;
}

export function getAuthFlowRemainingMs(expiresAt: number) {
  return Math.max(0, expiresAt - Date.now());
}

export function formatAuthFlowCountdown(remainingMs: number) {
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function writeAuthFlowDraft(draft: Omit<AuthFlowDraft, "savedAt">) {
  if (!canUseStorage()) {
    return;
  }

  const nextDraft = {
    ...draft,
    savedAt: Date.now(),
  } satisfies AuthFlowDraft;
  const serializedDraft = JSON.stringify(nextDraft);

  window.localStorage.setItem(AUTH_FLOW_STORAGE_KEY, serializedDraft);
  cachedRawDraft = serializedDraft;
  cachedAuthFlowDraft = nextDraft;
  notifyAuthFlowDraftListeners();
}

export function clearAuthFlowDraft() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(AUTH_FLOW_STORAGE_KEY);
  cachedRawDraft = null;
  cachedAuthFlowDraft = null;
  notifyAuthFlowDraftListeners();
}

export function subscribeToAuthFlowDraft(listener: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key && event.key !== AUTH_FLOW_STORAGE_KEY) {
      return;
    }

    cachedRawDraft = event.newValue;
    cachedAuthFlowDraft = parseStoredAuthFlowDraft(event.newValue);
    listener();
  };

  authFlowDraftListeners.add(listener);
  window.addEventListener("storage", handleStorage);

  return () => {
    authFlowDraftListeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

