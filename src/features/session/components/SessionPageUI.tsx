"use client";

import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { SessionDataTable } from "@/features/session/components/SessionDataTable";
import { SessionStatsCard } from "@/features/session/components/SessionStatsCard";
import { motion } from "framer-motion";
import type {
  SessionDashboardState,
  SessionRecord,
} from "@/features/session/components/sessionStore";

type SessionPageUIProps = {
  dashboard: SessionDashboardState | null;
  records: SessionRecord[];
  enrolledSessionIds: Set<string>;
  enrollmentCounts: Record<string, number>;
  isDashboardLoading: boolean;
  isRecordsLoading: boolean;
  dashboardError: string;
  recordsError: string;
  successMessage: string;
  enrollingSessionId: string;
  unenrollingSessionId: string;
  onEnroll: (session: SessionRecord) => Promise<void> | void;
  onUnenroll: (session: SessionRecord) => Promise<void> | void;
  getSessionDetailHref: (sessionId: string) => string;
};

export function SessionPageUI({
  dashboard,
  records,
  enrolledSessionIds,
  enrollmentCounts,
  isDashboardLoading,
  isRecordsLoading,
  dashboardError,
  recordsError,
  successMessage,
  enrollingSessionId,
  unenrollingSessionId,
  onEnroll,
  onUnenroll,
  getSessionDetailHref,
}: SessionPageUIProps) {
  // We let SessionDataTable handle isRecordsLoading natively

  return (
    <main className={`bg-black text-zinc-200 min-h-screen  text-slate-100`}>
      <DashboardHeader activeLabel="Sessions" />

      <div className="mx-auto grid max-w-[1560px] gap-8 px-6 py-8 lg:gap-10 lg:px-12 lg:py-10">
        {dashboardError ? (
          <div className="pt-5 text-sm font-medium text-rose-700">{dashboardError}</div>
        ) : null}

        {dashboard ? (
          <motion.section
            className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {dashboard.stats.map((stat) => (
              <SessionStatsCard key={stat.id} stat={stat} />
            ))}
          </motion.section>
        ) : null}

        <SessionDataTable
          records={records}
          isLoading={isDashboardLoading || isRecordsLoading}
          errorMessage={recordsError}
          successMessage={successMessage}
          enrollingSessionId={enrollingSessionId}
          unenrollingSessionId={unenrollingSessionId}
          enrolledSessionIds={enrolledSessionIds}
          enrollmentCounts={enrollmentCounts}
          onEnroll={onEnroll}
          onUnenroll={onUnenroll}
          getSessionDetailHref={getSessionDetailHref}
        />
      </div>
    </main>
  );
}
