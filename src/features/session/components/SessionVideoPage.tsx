"use client";

import { useSessionVideoNavigation } from "@/features/session/constants/session";
import { SessionVideoPageUI } from "@/features/session/components/SessionVideoPageUI";

type SessionVideoPageProps = {
  sessionId: string;
};

export function SessionVideoPage({ sessionId }: SessionVideoPageProps) {
  const { record, isLoading, errorMessage } = useSessionVideoNavigation(sessionId);
  return <SessionVideoPageUI record={record} isLoading={isLoading} errorMessage={errorMessage} />;
}
