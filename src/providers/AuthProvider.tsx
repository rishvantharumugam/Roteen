"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

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
    let isActive = true;

    const syncAuthState = async () => {
      setIsLoading(true);

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
      setIsLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isActive) {
        return;
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
  }, []);

  const signOut = async () => {
    setIsLoading(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setIsLoading(false);
      return { error: new Error(error.message) };
    }

    setSession(null);
    setUser(null);
    setIsLoading(false);
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

