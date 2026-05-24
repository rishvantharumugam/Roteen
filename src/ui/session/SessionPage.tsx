"use client";

import {
  useSessionPageNavigation,
} from "@/navigation/session";
import { SessionPageUI } from "@/ui/session/SessionPageUI";

export function SessionPage() {
  const { state, handleEnroll, getSessionDetailHref } = useSessionPageNavigation();

  return (
    <SessionPageUI
      dashboard={state.dashboard}
      records={state.records}
      enrolledSessionIds={state.enrolledSessionIds}
      isDashboardLoading={state.isDashboardLoading}
      isRecordsLoading={state.isRecordsLoading}
      dashboardError={state.dashboardError}
      recordsError={state.recordsError}
      successMessage={state.successMessage}
      enrollingSessionId={state.enrollingSessionId}
      onEnroll={handleEnroll}
      getSessionDetailHref={getSessionDetailHref}
    />
  );
}
