"use client";

import {
  useSessionPageNavigation,
} from "@/features/session/constants/session";
import { SessionPageUI } from "@/features/session/components/SessionPageUI";

export function SessionPage() {
  const { state, handleEnroll, handleUnenroll, getSessionDetailHref } = useSessionPageNavigation();

  return (
    <SessionPageUI
      dashboard={state.dashboard}
      records={state.records}
      enrolledSessionIds={state.enrolledSessionIds}
      enrollmentCounts={state.enrollmentCounts}
      isDashboardLoading={state.isDashboardLoading}
      isRecordsLoading={state.isRecordsLoading}
      dashboardError={state.dashboardError}
      recordsError={state.recordsError}
      successMessage={state.successMessage}
      enrollingSessionId={state.enrollingSessionId}
      unenrollingSessionId={state.unenrollingSessionId}
      onEnroll={handleEnroll}
      onUnenroll={handleUnenroll}
      getSessionDetailHref={getSessionDetailHref}
    />
  );
}
