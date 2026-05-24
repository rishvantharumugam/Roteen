"use client";

import { sessionStyles } from "@/style/session";
import { DashboardHeader } from "@/store/dashboardpage/DashboardHeader";
import { SessionDataTable } from "@/store/session/SessionDataTable";
import { SessionStatsCard } from "@/store/session/SessionStatsCard";
import { motion } from "framer-motion";
import type {
  SessionDashboardState,
  SessionRecord,
} from "@/store/session/sessionStore";

type SessionPageUIProps = {
  dashboard: SessionDashboardState | null;
  records: SessionRecord[];
  enrolledSessionIds: Set<string>;
  isDashboardLoading: boolean;
  isRecordsLoading: boolean;
  dashboardError: string;
  recordsError: string;
  successMessage: string;
  enrollingSessionId: string;
  onEnroll: (session: SessionRecord) => Promise<void> | void;
  getSessionDetailHref: (sessionId: string) => string;
};

export function SessionPageUI({
  dashboard,
  records,
  enrolledSessionIds,
  isDashboardLoading,
  isRecordsLoading,
  dashboardError,
  recordsError,
  successMessage,
  enrollingSessionId,
  onEnroll,
  getSessionDetailHref,
}: SessionPageUIProps) {
  return (
    <main className={sessionStyles.page}>
      <DashboardHeader activeLabel="Sessions" />

      <div className={sessionStyles.shell}>
        {dashboardError ? (
          <div className={sessionStyles.errorText}>{dashboardError}</div>
        ) : null}

        {isDashboardLoading && !dashboard ? (
          <motion.section
            className={sessionStyles.statsGrid}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <article key={index} className={`${sessionStyles.statsCard} animate-pulse`}>
                <div className="h-1.5 bg-slate-200" />
                <div className={sessionStyles.statsCardBody}>
                  <div className="h-4 w-28 rounded bg-slate-200" />
                  <div className="mt-4 h-8 w-16 rounded bg-slate-200" />
                  <div className="mt-5 h-4 w-full rounded bg-slate-100" />
                </div>
              </article>
            ))}
          </motion.section>
        ) : dashboard ? (
          <motion.section
            className={sessionStyles.statsGrid}
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
          isLoading={isRecordsLoading}
          errorMessage={recordsError}
          successMessage={successMessage}
          enrollingSessionId={enrollingSessionId}
          enrolledSessionIds={enrolledSessionIds}
          onEnroll={onEnroll}
          getSessionDetailHref={getSessionDetailHref}
        />
      </div>
    </main>
  );
}
