"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionVideoNavigation } from "@/features/session/constants/session";
import { SessionVideoPageUI } from "@/features/session/components/SessionVideoPageUI";
import { useAuth } from "@/providers/AuthProvider";
import { Loader2 } from "lucide-react";

type SessionVideoPageProps = {
  sessionId: string;
};

export function SessionVideoPage({ sessionId }: SessionVideoPageProps) {
  const { user, isLoading: isAuthLoading, openLoginModal } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/session");
      openLoginModal(`/session/${sessionId}`);
    }
  }, [user, isAuthLoading, router, openLoginModal, sessionId]);

  const { record, isLoading, errorMessage } = useSessionVideoNavigation(sessionId);

  if (isAuthLoading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          <p className="text-[14px] text-zinc-400 font-medium">Checking session...</p>
        </div>
      </div>
    );
  }

  return <SessionVideoPageUI record={record} isLoading={isLoading} errorMessage={errorMessage} />;
}
