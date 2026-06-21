"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from '@/lib/supabase/client';

type AuthContextValue = {
  isLoading: boolean;
  session: Session | null;
  user: User | null;
  signOut: () => Promise<{ error: Error | null }>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
  initialSession: Session | null;
  initialUser: User | null;
};

export function AuthProvider({
  children,
  initialSession,
  initialUser,
}: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(initialSession);
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoading, setIsLoading] = useState(!initialUser);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("roteen_logging_out");
    }

    let isActive = true;
    let previousUserId: string | null = initialUser?.id ?? null;

    const checkUserProfileAndSetState = async (currentSession: Session | null) => {
      const currentUser = currentSession?.user ?? null;

      if (currentUser) {
        // Check if profile exists in users table
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("id")
          .eq("id", currentUser.id)
          .maybeSingle();

        if (!profileError && !userProfile) {
          // Profile does not exist. Check if there is an active onboarding session draft.
          let hasActiveDraft = false;
          try {
            const draft = window.localStorage.getItem("routeen-auth-flow-draft");
            if (draft) {
              const parsed = JSON.parse(draft);
              if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
                hasActiveDraft = true;
              }
            }
          } catch { }

          if (!hasActiveDraft) {
            // No active onboarding draft. Sign out to clear dangling auth session.
            await supabase.auth.signOut();
          }

          // In either case, treat them as logged out in context since the profile is incomplete.
          setSession(null);
          setUser(null);
          setIsLoading(false);
          return;
        }
      }

      setSession(currentSession);
      setUser(currentUser);
      setIsLoading(false);
    };

    const syncAuthState = async () => {
      if (!initialUser) {
        setIsLoading(true);
      }

      try {
        const sessionResult = await supabase.auth.getSession();
        if (!isActive) {
          return;
        }

        if (sessionResult.error) {
          await supabase.auth.signOut().catch(() => {});
          setSession(null);
          setUser(null);
          setIsLoading(false);
          return;
        }

        const session = sessionResult.data.session;
        await checkUserProfileAndSetState(session);
      } catch {
        // Transient network error. Supabase auth-js retries automatically.
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, nextSession: any) => {
      if (!isActive) {
        return;
      }

      // If we are logging out, bypass auth state changes to prevent component layout flicker before redirect
      const isLoggingOut = typeof window !== "undefined" && window.sessionStorage.getItem("roteen_logging_out") === "true";
      if (isLoggingOut) {
        return;
      }

      const nextUserId = nextSession?.user?.id ?? null;

      // If the user changed (sign-out, sign-in as different user, token switch)
      // dispatch a custom event so the QueryClient wrapper can clear all cached data.
      if (nextUserId !== previousUserId) {
        const wasLoggedIn = previousUserId !== null;
        previousUserId = nextUserId;
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth-user-changed"));

          try {
            const { clearLocalLearningState } = require('@/features/video/components/learningStateStore');
            clearLocalLearningState();

            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith('roteen_video_state_')) {
                keysToRemove.push(key);
              }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
          } catch (e) {
            console.error('Failed to clear video state on user change', e);
          }

          if (wasLoggedIn && !nextUserId) {
            window.sessionStorage.setItem("roteen_logging_out", "true");
            window.location.href = "/";
          }
        }
      }

      void checkUserProfileAndSetState(nextSession);
    });

    const handleProfileUpdated = () => {
      void syncAuthState();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("roteen-profile-updated", handleProfileUpdated);
    }

    void syncAuthState();

    return () => {
      isActive = false;
      subscription.unsubscribe();
      if (typeof window !== "undefined") {
        window.removeEventListener("roteen-profile-updated", handleProfileUpdated);
      }
    };
  }, [initialUser?.id]);

  const signOut = async () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("roteen_logging_out", "true");
    }

    const { error } = await supabase.auth.signOut();

    if (typeof window !== "undefined") {
      window.location.href = "/";
    }

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        session,
        user,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}

