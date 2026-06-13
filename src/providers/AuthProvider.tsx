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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("roteen_logging_out");
    }

    let isActive = true;
    let previousUserId: string | null = initialUser?.id ?? null;

    const syncAuthState = async () => {
      setIsLoading(true);

      try {
        const { data, error } = await supabase.auth.getSession();

        if (!isActive) {
          return;
        }

        if (error) {
          setSession(null);
          setUser(null);
          setIsLoading(false);
          return;
        }

        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch {
        // Transient network error (e.g. "Failed to fetch" on tab wake-up).
        // Supabase auth-js retries automatically; keep whatever session state
        // we already have from initialSession / initialUser props.
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

      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setIsLoading(false);
    });

    void syncAuthState();

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [initialUser?.id]);

  const signOut = async () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("roteen_logging_out", "true");
    }

    // Optimistically clear local state for an instant UI update
    setSession(null);
    setUser(null);

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

