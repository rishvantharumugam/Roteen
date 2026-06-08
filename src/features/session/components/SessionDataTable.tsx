"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { SessionRecord } from "@/features/session/components/sessionStore";
import { motion } from "framer-motion";
import { CalendarDays, Clock3, Users, HelpCircle, XCircle, CheckCircle, Play, ChevronRight, Trash2, X, Info, GraduationCap, ArrowRight } from "lucide-react";
import { useSharedNow } from "@/lib/sharedNow";
import {
  formatSessionDate,
  formatSessionStartTime,
  getSessionAction,
  getSessionStatusClass,
  isFinishedSession,
  isLiveSession,
} from "@/features/session/components/sessionUtils";

type SessionDataTableProps = {
  records: SessionRecord[];
  isLoading: boolean;
  errorMessage: string;
  successMessage: string;
  enrollingSessionId: string;
  unenrollingSessionId: string;
  enrolledSessionIds: Set<string>;
  enrollmentCounts: Record<string, number>;
  onEnroll: (session: SessionRecord) => Promise<void> | void;
  onUnenroll: (session: SessionRecord) => Promise<void> | void;
  getSessionDetailHref: (sessionId: string) => string;
};

const cardGradients = [
  "from-purple-500 via-slate-900 to-violet-400",
  "from-indigo-500 via-slate-950 to-violet-400",
  "from-rose-500 via-slate-900 to-amber-400",
  "from-emerald-500 via-slate-950 to-lime-300",
] as const;

function parseSessionDateValue(sessionDate: string | null) {
  if (!sessionDate) {
    return Number.POSITIVE_INFINITY;
  }

  const parsedDate = Date.parse(sessionDate);

  return Number.isNaN(parsedDate) ? Number.POSITIVE_INFINITY : parsedDate;
}

function getSessionStartDateTime(session: SessionRecord) {
  if (!session.session_date) {
    return Number.NaN;
  }

  const sessionDateRaw = session.session_date.trim();
  const timeRaw = session.start_time?.trim();

  function parseBaseDate(value: string) {
    const direct = new Date(value);
    if (!Number.isNaN(direct.getTime())) {
      return direct;
    }

    const dmyMatch = value.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (dmyMatch) {
      const day = Number.parseInt(dmyMatch[1], 10);
      const month = Number.parseInt(dmyMatch[2], 10) - 1;
      const year = Number.parseInt(dmyMatch[3], 10);
      const parsed = new Date(year, month, day);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    const ymdMatch = value.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (ymdMatch) {
      const year = Number.parseInt(ymdMatch[1], 10);
      const month = Number.parseInt(ymdMatch[2], 10) - 1;
      const day = Number.parseInt(ymdMatch[3], 10);
      const parsed = new Date(year, month, day);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    return null;
  }

  const baseDate = parseBaseDate(sessionDateRaw);
  if (!baseDate) {
    return Number.NaN;
  }

  if (!timeRaw) {
    return baseDate.getTime();
  }

  // Supports "14:30", "14:30:00", "2:30 AM", "02:30 pm"
  const twelveHourMatch = timeRaw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp][Mm])$/);
  const twentyFourHourMatch = timeRaw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);

  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (twelveHourMatch) {
    hours = Number.parseInt(twelveHourMatch[1], 10);
    minutes = Number.parseInt(twelveHourMatch[2], 10);
    seconds = Number.parseInt(twelveHourMatch[3] ?? "0", 10);
    const meridian = twelveHourMatch[4].toUpperCase();
    if (meridian === "AM") {
      hours = hours === 12 ? 0 : hours;
    } else {
      hours = hours === 12 ? 12 : hours + 12;
    }
  } else if (twentyFourHourMatch) {
    hours = Number.parseInt(twentyFourHourMatch[1], 10);
    minutes = Number.parseInt(twentyFourHourMatch[2], 10);
    seconds = Number.parseInt(twentyFourHourMatch[3] ?? "0", 10);
  } else {
    const isoLike = `${sessionDateRaw}T${timeRaw}`;
    const parsed = Date.parse(isoLike);
    return Number.isNaN(parsed) ? Number.NaN : parsed;
  }

  const combined = new Date(baseDate.getTime());
  combined.setHours(hours, minutes, seconds, 0);
  return combined.getTime();
}

function getStartsInParts(session: SessionRecord, nowMs: number) {
  const startTimestamp = getSessionStartDateTime(session);
  if (Number.isNaN(startTimestamp)) {
    return null;
  }

  const diffMs = startTimestamp - nowMs;
  if (diffMs <= 0) {
    return null;
  }

  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return {
    prefix: "Starts in",
    value: `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`,
  };
}

function getCardStatusLabel(session: SessionRecord): "LIVE" | "UPCOMING" | "COMPLETED" {
  if (isFinishedSession(session.status)) {
    return "COMPLETED";
  }
  return isLiveSession(session.status) ? "LIVE" : "UPCOMING";
}

function getTagClassName(status: "LIVE" | "UPCOMING" | "COMPLETED") {
  if (status === "LIVE") return "rounded bg-red-500/20 px-2 py-0.5 text-[11px] font-semibold text-red-400 border border-red-500/30";
  if (status === "COMPLETED") return "rounded bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/30";
  return "rounded bg-violet-500/20 px-2 py-0.5 text-[11px] font-semibold text-violet-400 border border-violet-500/30";
}

function getCardStatusLabelClass(status: "LIVE" | "UPCOMING" | "COMPLETED") {
  if (status === "LIVE") return "border border-red-500/20 bg-red-500/5 text-[#ef4444]";
  if (status === "COMPLETED") return "border border-emerald-500/20 bg-emerald-500/5 text-[#22c55e]";
  return "border border-white/10 bg-transparent text-white";
}

function UpcomingCountdown({ session }: { session: SessionRecord }) {
  const now = useSharedNow();
  const startsIn = getStartsInParts(session, now);

  return (
    <p className="text-[12px] font-medium tracking-wide !text-white">
      {startsIn?.prefix ?? "Starts in"}{" "}
      <span className="font-bold !text-[#ef4444]">{startsIn?.value ?? "00h 00m"}</span>
    </p>
  );
}

export function SessionDataTable({
  records,
  isLoading,
  errorMessage,
  successMessage,
  enrollingSessionId,
  unenrollingSessionId,
  enrolledSessionIds,
  enrollmentCounts,
  onEnroll,
  onUnenroll,
  getSessionDetailHref,
}: SessionDataTableProps) {
  const [selectedSession, setSelectedSession] = useState<SessionRecord | null>(null);
  const [confirmEnrollSession, setConfirmEnrollSession] = useState<SessionRecord | null>(null);
  const [confirmUnenrollSession, setConfirmUnenrollSession] = useState<SessionRecord | null>(null);
  const now = useSharedNow();
  const previousSessionRecords = useMemo(
    () =>
      records
        .filter((record) => isFinishedSession(record.status))
        .sort((a, b) => parseSessionDateValue(b.session_date) - parseSessionDateValue(a.session_date)),
    [records],
  );
  const dynamicActiveUpcomingCards = useMemo(() => {
    const enrolled: SessionRecord[] = [];
    const live: SessionRecord[] = [];
    const upcoming: SessionRecord[] = [];

    records.forEach((record) => {
      if (isFinishedSession(record.status)) {
        return;
      }

      const isEnrolled = enrolledSessionIds.has(record.id);
      const isLive = isLiveSession(record.status);

      if (isEnrolled) {
        enrolled.push(record);
      } else if (isLive) {
        live.push(record);
      } else {
        const normalizedStatus = record.status?.trim().toLowerCase() ?? "";
        if (["upcoming", "pending", "scheduled", "not started"].includes(normalizedStatus)) {
          upcoming.push(record);
        }
      }
    });

    const sortByDate = (a: SessionRecord, b: SessionRecord) =>
      parseSessionDateValue(a.session_date) - parseSessionDateValue(b.session_date);

    enrolled.sort(sortByDate);
    live.sort(sortByDate);
    upcoming.sort(sortByDate);

    return [...enrolled, ...live, ...upcoming];
  }, [records, enrolledSessionIds]);
  const selectedSessionAction = selectedSession
    ? getSessionAction(selectedSession.status, enrolledSessionIds.has(selectedSession.id))
    : null;
  const selectedSessionDetailHref = selectedSession ? getSessionDetailHref(selectedSession.id) : "";
  const selectedActionClassName = selectedSessionAction
    ? selectedSessionAction.type === "enroll"
      ? "w-full rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
      : selectedSessionAction.type === "finished"
        ? "w-full rounded-xl bg-white/5 px-4 py-2 text-sm font-semibold text-slate-400 cursor-not-allowed"
        : isLiveSession(selectedSession?.status ?? null)
          ? "w-full rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
          : "w-full rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
    : "";

  useEffect(() => {
    if (!selectedSession) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedSession(null);
        setConfirmEnrollSession(null);
        setConfirmUnenrollSession(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedSession]);


  return (
    <motion.section
      className="bg-transparent p-0 shadow-none"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {successMessage ? <div className="fixed right-4 top-4 z-50 rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg ring-1 ring-emerald-500">{successMessage}</div> : null}

      <div className="mb-8">
        <div className="mb-1 flex flex-col gap-2 pb-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[32px] font-bold tracking-tight text-white sm:text-[36px]">Active/Upcoming Courses</h2>
            <p className="mt-1 text-sm text-slate-400">Quick glance at your current schedule</p>
          </div>
        </div>

        <div className="no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] mt-5 flex items-stretch gap-5 overflow-x-auto pb-6 snap-x snap-mandatory [&>*]:snap-start [&>*]:shrink-0 [&>*]:w-[85vw] sm:[&>*]:w-[280px] xl:[&>*]:w-[calc(20%-16px)]">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={`active-skeleton-${i}`} className="flex h-[390px] flex-col p-5 rounded-[24px] bg-[#151515] border border-[rgba(255,255,255,0.03)] w-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-5 w-24 rounded-full bg-[#1D1D1D] skeleton-shimmer" />
                </div>
                <div className="h-[150px] w-full rounded-xl bg-[#1D1D1D] skeleton-shimmer mb-4 shrink-0" />
                <div className="flex-1 flex flex-col gap-3 justify-center">
                  <div className="h-5 w-3/4 rounded bg-[#1D1D1D] skeleton-shimmer" />
                  <div className="h-4 w-full rounded bg-[#1D1D1D] skeleton-shimmer" />
                </div>
                <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.04)]">
                  <div className="h-10 w-full rounded-lg bg-[#1D1D1D] skeleton-shimmer" />
                </div>
              </div>
            ))
          ) : dynamicActiveUpcomingCards.length > 0 ? (
            dynamicActiveUpcomingCards.map((session, index) => {
              const effectiveStatus = session.status ?? "pending";
              const action = getSessionAction(effectiveStatus, enrolledSessionIds.has(session.id));
              const actionClassName =
                action.type === "enroll"
                  ? "w-full rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                  : action.type === "finished"
                    ? "w-full rounded-xl bg-white/5 px-4 py-2 text-sm font-semibold text-slate-400 cursor-not-allowed"
                    : isLiveSession(effectiveStatus)
                      ? "w-full rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                      : "w-full rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500";
              const detailHref = getSessionDetailHref(session.id);
              const status = getCardStatusLabel({ ...session, status: effectiveStatus });
              const statusLabel = status;
              const dateText = formatSessionDate(session.session_date);
              const timeText = formatSessionStartTime(session.start_time);
              const thumbnailUrl = session.thumbnail_url ?? session.thumb_url ?? null;

              return (
              <motion.article
                className="group flex min-h-[390px] flex-col overflow-hidden rounded-[24px] border border-zinc-800 bg-[#121212] p-5 shadow-2xl transition-all duration-300"
                key={session.id}
                initial={{ opacity: 0, y: 18 }}
                transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.22 }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  {status === "UPCOMING" ? (
                    <span className="inline-flex items-center gap-1.5 z-10 relative">
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                      <span className="text-orange-500 font-bold tracking-wider text-[11px] uppercase">UPCOMING</span>
                    </span>
                  ) : status === "LIVE" ? (
                    <span className="inline-flex items-center gap-1.5 z-10 relative">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      <span className="text-red-500 font-bold tracking-wider text-[11px] uppercase">LIVE</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 z-10 relative ml-auto">
                      <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                      <span className="text-gray-400 font-bold tracking-wider text-[11px] uppercase">{statusLabel}</span>
                    </span>
                  )}
                </div>
                
                <button
                  aria-label={`Open ${session.title ?? "session"} details`}
                  className="relative mb-3 h-[130px] w-full overflow-hidden rounded-lg bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/70 block"
                  onClick={() => setSelectedSession(session)}
                  type="button"
                >
                  {thumbnailUrl ? (
                    <Image
                      alt={session.title ?? "Session thumbnail"}
                      className="absolute inset-0 h-full w-full object-cover"
                      fill
                      sizes="(max-width: 700px) 100vw, 280px"
                      src={thumbnailUrl}
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-indigo-900/20 mix-blend-overlay" />
                </button>
                
                <h3 className="line-clamp-2 text-[17px] font-bold leading-tight text-white mb-1">{session.title ?? "Untitled session"}</h3>
                <p className="text-[12px] text-gray-400 mb-3">
                  By <span className="text-[#a855f7]">{session.instructor_name ?? "Unassigned"}</span> · Session
                </p>
                
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-transparent px-3 py-2 w-full">
                    <CalendarDays className="text-[#a855f7]" size={15} />
                    <span className="text-[12px] text-gray-300">Date: {dateText === "Not scheduled" ? "TBA" : `${dateText}, ${timeText === "Not available" ? "Time TBA" : timeText}`}</span>
                  </div>
                  
                  <div className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-transparent px-3 py-2 w-full">
                    <Users className="text-[#a855f7]" size={15} />
                    <span className="text-[12px] text-gray-300">
                      <span className="text-[#a855f7] font-semibold">{enrollmentCounts[session.id] ?? 0}/{session.seat_limit ?? session.Seat_Limit ?? 50}</span> Students Enrolled
                    </span>
                  </div>
                  
                  {status === "UPCOMING" && (
                    <div className="flex items-center justify-center w-full rounded-lg border border-white/10 bg-transparent py-2">
                      <UpcomingCountdown session={session} />
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-3 flex flex-col gap-2 w-full">
                  {action.type === "enroll" ? (
                    <button
                      className="w-full rounded-lg bg-[#5b3ea8] hover:bg-[#4a328f] py-2.5 text-[13px] font-bold text-white transition disabled:opacity-70"
                      disabled={enrollingSessionId === session.id}
                      onClick={() => onEnroll(session)}
                      type="button"
                    >
                      {enrollingSessionId === session.id ? "Enrolling..." : action.label}
                    </button>
                  ) : action.type === "enrolled" ? (
                    <>
                      {status === "LIVE" && (
                        <div className="flex items-center justify-center w-full rounded-lg border border-white/10 bg-transparent py-2 mb-2">
                          <span className="text-[12px] text-emerald-400 font-bold">Session has Started</span>
                        </div>
                      )}
                      
                      {status === "LIVE" ? (
                        <button 
                          className="w-full rounded-lg bg-[#5b3ea8] hover:bg-[#4a328f] py-2.5 text-[13px] font-bold text-white transition shadow-lg block" 
                          onClick={() => setSelectedSession(session)}
                          type="button"
                        >
                          Join Now
                        </button>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 w-full">
                          <button
                            className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-transparent py-2.5 text-[12px] font-semibold text-white hover:bg-white/5 transition"
                            type="button"
                          >
                            <HelpCircle size={15} /> Ask
                          </button>
                          <button
                            className="flex items-center justify-center gap-1.5 rounded-lg border border-red-500/30 bg-transparent py-2.5 text-[12px] font-semibold text-red-500 hover:bg-red-500/10 transition"
                            disabled={unenrollingSessionId === session.id}
                            onClick={() => setConfirmUnenrollSession(session)}
                            type="button"
                          >
                            <XCircle size={15} /> {unenrollingSessionId === session.id ? "Canceling..." : "Unenroll Now"}
                          </button>
                        </div>
                      )}
                    </>
                  ) : action.type === "cannot_join" ? (
                    <>
                      <div className="flex items-center justify-center w-full rounded-lg border border-white/10 bg-transparent py-2 mb-2">
                        <span className="text-[12px] text-emerald-400 font-bold">Session has Started</span>
                      </div>
                      <button
                        className="w-full rounded-lg bg-slate-800 border border-slate-700 py-2.5 text-[12px] font-bold text-slate-400 cursor-not-allowed truncate px-2"
                        disabled
                        type="button"
                        title={action.label}
                      >
                        {action.label}
                      </button>
                    </>
                  ) : action.type === "join" ? (
                    <>
                      <div className="flex items-center justify-center w-full rounded-lg border border-white/10 bg-transparent py-2 mb-2">
                        <span className="text-[12px] text-emerald-400 font-bold">Session has Started</span>
                      </div>
                      <Link className="flex items-center justify-center w-full rounded-lg bg-[#5b3ea8] hover:bg-[#4a328f] py-2.5 text-[13px] font-bold text-white transition shadow-lg" href={detailHref}>
                        {action.label}
                      </Link>
                    </>
                  ) : (
                    <Link className="flex items-center justify-center w-full rounded-lg bg-[#5b3ea8] hover:bg-[#4a328f] py-2.5 text-[13px] font-bold text-white transition shadow-lg" href={detailHref}>
                      {action.label}
                    </Link>
                  )}
                </div>
              </motion.article>
              );
            })
          ) : (
            <div className="rounded-lg border border-white/10 bg-[#0e1226] p-5 text-sm text-slate-400 lg:col-span-2">No live or upcoming courses found.</div>
          )}
        </div>
      </div>

      <div className="mb-1 flex flex-col gap-2 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[32px] font-bold tracking-tight text-white sm:text-[36px]">Previous Sessions</h2>
          <p className="mt-1 text-sm text-slate-400">Quick glance at your previous sessions</p>
        </div>
      </div>

      {errorMessage ? (
        <div className="pt-5 text-sm font-medium text-rose-700">{errorMessage}</div>
      ) : (
        <div className="no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] mt-5 flex items-stretch gap-5 overflow-x-auto pb-6 snap-x snap-mandatory [&>*]:snap-start [&>*]:shrink-0 [&>*]:w-[85vw] sm:[&>*]:w-[280px] xl:[&>*]:w-[calc(20%-16px)]">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={`prev-skeleton-${i}`} className="flex flex-col p-5 rounded-[24px] bg-[#151515] border border-[rgba(255,255,255,0.03)] w-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-5 w-24 rounded-full bg-[#1D1D1D] skeleton-shimmer" />
                </div>
                <div className="h-[150px] w-full rounded-xl bg-[#1D1D1D] skeleton-shimmer mb-4 shrink-0" />
                <div className="flex-1 flex flex-col gap-3 justify-center">
                  <div className="h-5 w-3/4 rounded bg-[#1D1D1D] skeleton-shimmer" />
                  <div className="h-4 w-full rounded bg-[#1D1D1D] skeleton-shimmer" />
                </div>
                <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.04)]">
                  <div className="h-10 w-full rounded-lg bg-[#1D1D1D] skeleton-shimmer" />
                </div>
              </div>
            ))
          ) : previousSessionRecords.length > 0 ? (
            previousSessionRecords.map((session, index) => {
              return (
                <motion.article
                  className="group flex flex-col overflow-hidden rounded-[24px] border border-zinc-800 bg-[#121212] p-5 shadow-2xl transition-all duration-300"
                  key={session.id}
                  initial={{ opacity: 0, y: 18 }}
                  transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
                  viewport={{ once: true, amount: 0.22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 z-10 relative">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="text-emerald-500 font-bold tracking-wider text-[11px] uppercase">COMPLETED</span>
                    </span>
                  </div>
                  
                  <button
                    aria-label={`Open ${session.title ?? "session"} details`}
                    className="relative mb-3 h-[130px] w-full overflow-hidden rounded-lg bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/70 block"
                    onClick={() => setSelectedSession(session)}
                    type="button"
                  >
                    {session.thumbnail_url || session.thumb_url ? (
                      <Image
                        alt={session.title ?? "Session thumbnail"}
                        className="absolute inset-0 h-full w-full object-cover"
                        fill
                        sizes="(max-width: 700px) 100vw, 280px"
                        src={session.thumbnail_url ?? session.thumb_url ?? ""}
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-indigo-900/20 mix-blend-overlay" />
                  </button>
                  
                  <h3 className="line-clamp-2 text-[17px] font-bold leading-tight text-white mb-1">{session.title ?? "Untitled session"}</h3>
                  <p className="text-[12px] text-gray-400 mb-3">
                    By <span className="text-[#a855f7]">{session.instructor_name ?? "Unassigned"}</span> · Revision Session
                  </p>
                  
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-transparent px-3 py-2 w-full">
                      <CalendarDays className="text-[#a855f7]" size={15} />
                      <span className="text-[12px] text-gray-300">Date: {formatSessionDate(session.session_date) === "Not scheduled" ? "TBA" : `${formatSessionDate(session.session_date)}, ${formatSessionStartTime(session.start_time) === "Not available" ? "Time TBA" : formatSessionStartTime(session.start_time)}`}</span>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-3 flex flex-col gap-2 w-full">
                    <Link className="flex items-center justify-center gap-2 w-full rounded-lg bg-[#5b3ea8] hover:bg-[#4a328f] py-2.5 text-[13px] font-bold text-white transition shadow-lg" href={getSessionDetailHref(session.id)}>
                      <Play size={15} fill="currentColor" /> View Replay
                    </Link>
                  </div>
                </motion.article>
              );
            })
          ) : (
            <div className="rounded-lg border border-white/10 bg-[#0e1226] p-5 text-sm text-slate-400 lg:col-span-2">No previous courses found.</div>
          )}
        </div>
      )}

      {selectedSession ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/72 p-4 backdrop-blur-sm" onClick={() => setSelectedSession(null)} role="presentation">
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-xl rounded-2xl border border-white/15 bg-[linear-gradient(160deg,rgba(17,22,45,.98),rgba(10,14,34,.98))] p-5 text-slate-100 shadow-[0_28px_80px_rgba(0,0,0,.5)] md:p-6"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            onClick={(event) => event.stopPropagation()}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <h3 className="text-2xl font-bold tracking-tight text-white">{selectedSession.title ?? "Untitled session"}</h3>
              <button className="rounded-lg border border-white/20 bg-white/8 px-3 py-1.5 text-sm font-semibold text-slate-100 transition hover:bg-white/14" onClick={() => setSelectedSession(null)} type="button">
                Close
              </button>
            </div>

            <div className="grid gap-4 rounded-xl border border-white/10 bg-white/5 p-4 md:grid-cols-2">
              <div>
                <p className="font-medium text-slate-400">Instructor</p>
                <p className="mt-1 text-base font-medium text-slate-100">{selectedSession.instructor_name ?? "Unassigned"}</p>
              </div>
              <div>
                <p className="font-medium text-slate-400">Status</p>
                <span className={`rounded-full border border-emerald-300/30 bg-emerald-500/14 px-3 py-1 text-xs font-semibold capitalize ring-1 ring-emerald-300/20 backdrop-blur ${getSessionStatusClass(selectedSession.status)}`}>
                  {selectedSession.status ?? "pending"}
                </span>
              </div>
              <div>
                <p className="font-medium text-slate-400">Date</p>
                <p className="mt-1 text-base font-medium text-slate-100">{formatSessionDate(selectedSession.session_date)}</p>
              </div>
              <div>
                <p className="font-medium text-slate-400">Time</p>
                <p className="mt-1 text-base font-medium text-slate-100">{formatSessionStartTime(selectedSession.start_time)}</p>
              </div>
            </div>

            <div className="mt-5">
              {selectedSessionAction?.type === "enroll" ? (
                <button
                  className={`inline-grid place-items-center rounded-lg border-0 px-3.5 py-2 text-[13px] font-semibold text-white transition duration-300 disabled:cursor-not-allowed disabled:opacity-70 ${selectedActionClassName}`}
                  disabled={enrollingSessionId === selectedSession.id}
                  onClick={() => setConfirmEnrollSession(selectedSession)}
                  type="button"
                >
                  {enrollingSessionId === selectedSession.id ? "Enrolling..." : selectedSessionAction.label}
                </button>
              ) : selectedSessionAction?.type === "enrolled" ? (
                <div className="grid grid-cols-2 gap-3 w-full">
                  <button
                    className={`inline-grid place-items-center rounded-lg border-0 px-3.5 py-2 text-[13px] font-semibold text-white transition duration-300 disabled:cursor-not-allowed disabled:opacity-70 w-full !bg-none bg-white/5 border border-white/10 hover:bg-white/10 text-white shadow-none hover:scale-100 !px-2`}
                    type="button"
                  >
                    Ask
                  </button>
                  <button
                    className={`inline-grid place-items-center rounded-lg border-0 px-3.5 py-2 text-[13px] font-semibold text-white transition duration-300 disabled:cursor-not-allowed disabled:opacity-70 w-full !bg-none bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 !text-rose-400 shadow-none hover:scale-100 !px-2`}
                    disabled={unenrollingSessionId === selectedSession.id}
                    onClick={() => setConfirmUnenrollSession(selectedSession)}
                    type="button"
                  >
                    {unenrollingSessionId === selectedSession.id ? "Canceling..." : "Unenroll Now"}
                  </button>
                </div>
              ) : selectedSessionAction?.type === "cannot_join" ? (
                <button
                  className={`inline-grid place-items-center rounded-lg border-0 px-3.5 py-2 text-[13px] font-semibold text-white transition duration-300 disabled:cursor-not-allowed disabled:opacity-70 !bg-none bg-slate-800/50 border border-slate-700/50 !text-rose-500 cursor-not-allowed`}
                  disabled
                  type="button"
                >
                  {selectedSessionAction.label}
                </button>
              ) : selectedSessionAction?.type === "join" ? (
                <Link className={`inline-grid place-items-center rounded-lg border-0 px-3.5 py-2 text-[13px] font-semibold text-white transition duration-300 disabled:cursor-not-allowed disabled:opacity-70 ${selectedActionClassName}`} href={selectedSessionDetailHref}>
                  {selectedSessionAction.label}
                </Link>
              ) : (
                <span className={`inline-grid place-items-center rounded-lg border-0 px-3.5 py-2 text-[13px] font-semibold text-white transition duration-300 disabled:cursor-not-allowed disabled:opacity-70 ${selectedActionClassName}`}>
                  {selectedSessionAction?.label ?? "View"}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      ) : null}

      {confirmEnrollSession ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/72 p-4 backdrop-blur-sm" onClick={() => setConfirmEnrollSession(null)} role="presentation">
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-[440px] rounded-[16px] border border-white/10 bg-[#131313] p-5 md:p-6 shadow-[0_28px_80px_rgba(0,0,0,.6)] text-slate-100"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            onClick={(event) => event.stopPropagation()}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center p-2.5 rounded-full border border-white/10 bg-transparent">
                  <GraduationCap size={18} className="text-[#a855f7]" />
                </div>
                <h3 className="text-[19px] font-bold text-white tracking-wide">Confirm Enrollment</h3>
              </div>
              <button className="p-1.5 rounded-md border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition" onClick={() => setConfirmEnrollSession(null)} type="button">
                <X size={16} />
              </button>
            </div>

            <div className="mb-6 flex flex-col gap-4">
              <p className="text-[14px] text-gray-300 leading-relaxed">
                Are you sure you want to enroll in the <br /><strong className="text-white text-[15px] mt-1 inline-block">{confirmEnrollSession.title ?? "this session"}?</strong>
              </p>
              
              <div className="flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-white/5">
                <Info size={18} className="text-gray-400 shrink-0 mt-0.5" />
                <p className="text-[13px] text-gray-300 leading-snug">
                  This will reserve your seat in the session.<br/>You can access all materials after enrollment.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                className="flex items-center justify-center w-full py-2.5 rounded-lg border border-white/10 bg-transparent text-[13px] font-bold text-white hover:bg-white/5 transition"
                onClick={() => setConfirmEnrollSession(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-transparent bg-[#5b3ea8] hover:bg-[#4a328f] text-[13px] font-bold text-white transition shadow-lg"
                disabled={enrollingSessionId === confirmEnrollSession.id}
                onClick={() => {
                  onEnroll(confirmEnrollSession);
                  setConfirmEnrollSession(null);
                  if (selectedSession?.id === confirmEnrollSession.id) {
                    setSelectedSession(null);
                  }
                }}
                type="button"
              >
                {enrollingSessionId === confirmEnrollSession.id ? "Enrolling..." : "Yes, Enroll"}
                {enrollingSessionId !== confirmEnrollSession.id && <ArrowRight size={14} />}
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}

      {confirmUnenrollSession ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/72 p-4 backdrop-blur-sm" onClick={() => setConfirmUnenrollSession(null)} role="presentation">
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-[440px] rounded-[16px] border border-white/10 bg-[#131313] p-5 md:p-6 shadow-[0_28px_80px_rgba(0,0,0,.6)] text-slate-100"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            onClick={(event) => event.stopPropagation()}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center p-2.5 rounded-full border border-white/10 bg-transparent">
                  <Trash2 size={18} className="text-gray-300" />
                </div>
                <h3 className="text-[19px] font-bold text-white tracking-wide">Cancel Enrollment</h3>
              </div>
              <button className="p-1.5 rounded-md border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition" onClick={() => setConfirmUnenrollSession(null)} type="button">
                <X size={16} />
              </button>
            </div>

            <div className="mb-6 flex flex-col gap-4">
              <p className="text-[14px] text-gray-300 leading-relaxed">
                Are you sure you want to cancel your enrollment in <br /><strong className="text-white text-[15px] mt-1 inline-block">{confirmUnenrollSession.title ?? "this session"}?</strong>
              </p>
              
              <div className="flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-white/5">
                <Info size={18} className="text-gray-400 shrink-0 mt-0.5" />
                <p className="text-[13px] text-gray-300 leading-snug">
                  You will lose access to session materials, updates, and future announcements.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                className="flex items-center justify-center w-full py-2.5 rounded-lg border border-white/10 bg-transparent text-[13px] font-bold text-white hover:bg-white/5 transition"
                onClick={() => setConfirmUnenrollSession(null)}
                type="button"
              >
                Go Back
              </button>
              <button
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-transparent bg-[#dc2626] hover:bg-[#b91c1c] text-[13px] font-bold text-white transition shadow-lg"
                disabled={unenrollingSessionId === confirmUnenrollSession.id}
                onClick={() => {
                  onUnenroll(confirmUnenrollSession);
                  setConfirmUnenrollSession(null);
                  if (selectedSession?.id === confirmUnenrollSession.id) {
                    setSelectedSession(null);
                  }
                }}
                type="button"
              >
                {unenrollingSessionId === confirmUnenrollSession.id ? "Canceling..." : "Yes, Cancel Enrollment"}
                {unenrollingSessionId !== confirmUnenrollSession.id && <Trash2 size={14} />}
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </motion.section>
  );
}
