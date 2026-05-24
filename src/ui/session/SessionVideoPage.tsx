"use client";

import { useSessionVideoNavigation } from "@/navigation/session";
import { SessionVideoPageUI } from "@/ui/session/SessionVideoPageUI";

type SessionVideoPageProps = {
  sessionId: string;
};

export function SessionVideoPage({ sessionId }: SessionVideoPageProps) {
  const { record, isLoading, errorMessage } = useSessionVideoNavigation(sessionId);
  return <SessionVideoPageUI record={record} isLoading={isLoading} errorMessage={errorMessage} />;
}
