"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { sessionStyles } from "@/style/session";
import type { SessionRecord } from "@/store/session/sessionStore";
import { motion } from "framer-motion";
import { CalendarDays, Clock3 } from "lucide-react";
import { useSharedNow } from "@/lib/sharedNow";
import {
  formatSessionDate,
  formatSessionStartTime,
  getSessionAction,
  getSessionStatusClass,
  isFinishedSession,
  isLiveSession,
} from "@/store/session/sessionUtils";

type SessionDataTableProps = {
  records: SessionRecord[];
  isLoading: boolean;
  errorMessage: string;
  successMessage: string;
  enrollingSessionId: string;
  enrolledSessionIds: Set<string>;
  onEnroll: (session: SessionRecord) => Promise<void> | void;
  getSessionDetailHref: (sessionId: string) => string;
};

const cardGradients = [
  "from-cyan-500 via-slate-900 to-teal-400",
  "from-indigo-500 via-slate-950 to-sky-400",
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
  if (status === "LIVE") return sessionStyles.activeCardTagLive;
  if (status === "COMPLETED") return sessionStyles.activeCardTagCompleted;
  return sessionStyles.activeCardTagUpcoming;
}

function UpcomingCountdown({ session }: { session: SessionRecord }) {
  const now = useSharedNow();
  const startsIn = getStartsInParts(session, now);

  return (
    <p className={sessionStyles.cardCountdown}>
      {startsIn?.prefix ?? "Starts in"}{" "}
      <span className={sessionStyles.cardCountdownValue}>{startsIn?.value ?? "00h 00m"}</span>
    </p>
  );
}

export function SessionDataTable({
  records,
  isLoading,
  errorMessage,
  successMessage,
  enrollingSessionId,
  enrolledSessionIds,
  onEnroll,
  getSessionDetailHref,
}: SessionDataTableProps) {
  const [selectedSession, setSelectedSession] = useState<SessionRecord | null>(null);
  const now = useSharedNow();
  const previousSessionRecords = useMemo(
    () => records.filter((record) => isFinishedSession(record.status)),
    [records],
  );
  const dynamicActiveUpcomingCards = useMemo(() => {
    const liveOngoingSessions = records
      .filter((record) => isLiveSession(record.status))
      .sort((a, b) => parseSessionDateValue(a.session_date) - parseSessionDateValue(b.session_date));
    const upcomingSessions = records
      .filter((record) => {
        const normalizedStatus = record.status?.trim().toLowerCase() ?? "";
        return ["upcoming", "pending", "scheduled", "not started"].includes(normalizedStatus);
      })
      .sort((a, b) => parseSessionDateValue(a.session_date) - parseSessionDateValue(b.session_date));
    const cards: SessionRecord[] = [];

    if (liveOngoingSessions.length > 0) {
      const liveSession = liveOngoingSessions[0];
      cards.push(liveSession);
    }

    if (upcomingSessions.length > 0) {
      const upcomingSession = upcomingSessions[0];
      cards.push(upcomingSession);
    }

    return cards;
  }, [records]);
  const selectedSessionAction = selectedSession
    ? getSessionAction(selectedSession.status, enrolledSessionIds.has(selectedSession.id))
    : null;
  const selectedSessionDetailHref = selectedSession ? getSessionDetailHref(selectedSession.id) : "";
  const selectedActionClassName = selectedSessionAction
    ? selectedSessionAction.type === "enroll"
      ? sessionStyles.actionEnroll
      : selectedSessionAction.type === "finished"
        ? sessionStyles.actionFinished
        : isLiveSession(selectedSession?.status ?? null)
          ? sessionStyles.actionJoinLive
          : sessionStyles.actionJoin
    : "";

  useEffect(() => {
    if (!selectedSession) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedSession(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedSession]);

  function getEffectiveStatus(session: SessionRecord) {
    if (isFinishedSession(session.status)) {
      return session.status;
    }

    const startTimestamp = getSessionStartDateTime(session);
    if (!Number.isNaN(startTimestamp) && now >= startTimestamp) {
      return "live";
    }

    return session.status;
  }

  return (
    <motion.section
      className={sessionStyles.tableSection}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {successMessage ? <div className={sessionStyles.successToast}>{successMessage}</div> : null}

      <div className={sessionStyles.activeCoursesSection}>
        <div className={sessionStyles.tableHeader}>
          <div>
            <h2 className={sessionStyles.sectionTitle}>Active/Upcoming Courses</h2>
            <p className={sessionStyles.sectionSubtitle}>Quick glance at your current schedule</p>
          </div>
        </div>

        <div className={sessionStyles.activeCardsGrid}>
          {dynamicActiveUpcomingCards.length > 0 ? (
            dynamicActiveUpcomingCards.map((session, index) => {
              const effectiveStatus = getEffectiveStatus(session);
              const action = getSessionAction(effectiveStatus, enrolledSessionIds.has(session.id));
              const actionClassName =
                action.type === "enroll"
                  ? sessionStyles.actionEnroll
                  : action.type === "finished"
                    ? sessionStyles.actionFinished
                    : isLiveSession(effectiveStatus)
                      ? sessionStyles.actionJoinLive
                      : sessionStyles.actionJoin;
              const detailHref = getSessionDetailHref(session.id);
              const status = getCardStatusLabel({ ...session, status: effectiveStatus });
              const statusLabel = status;
              const dateText = formatSessionDate(session.session_date);
              const timeText = formatSessionStartTime(session.start_time);
              const thumbnailUrl = session.thumbnail_url ?? session.thumb_url ?? null;

              return (
              <motion.article
                className={sessionStyles.sessionCard}
                key={session.id}
                initial={{ opacity: 0, y: 18 }}
                transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.22 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -10, scale: 1.03 }}
              >
                <div className={sessionStyles.cardTopRow}>
                  {status === "UPCOMING" ? (
                    <>
                      <span className={`${sessionStyles.cardTag} ${getTagClassName(status)}`}>UPCOMING</span>
                      <UpcomingCountdown session={session} />
                    </>
                  ) : status === "LIVE" ? (
                    <span className={`${sessionStyles.cardTag} ${getTagClassName(status)}`}>LIVE</span>
                  ) : (
                    <span className={`ml-auto ${sessionStyles.cardTag} ${getTagClassName(status)}`}>{statusLabel}</span>
                  )}
                </div>
                <button
                  aria-label={`Open ${session.title ?? "session"} details`}
                  className={`${sessionStyles.cardCover} bg-gradient-to-br ${cardGradients[index % cardGradients.length]}`}
                  onClick={() => setSelectedSession(session)}
                  type="button"
                >
                  {thumbnailUrl ? (
                    <Image
                      alt={session.title ?? "Session thumbnail"}
                      className={sessionStyles.cardCoverImage}
                      fill
                      sizes="(max-width: 700px) 100vw, 280px"
                      src={thumbnailUrl}
                    />
                  ) : null}
                  <div className={sessionStyles.cardCoverShade} />
                  <div className={sessionStyles.cardCoverGlow} />
                  <div className={sessionStyles.cardCoverContent} />
                </button>
                <h3 className={sessionStyles.cardTopicTitle}>{session.title ?? "Untitled session"}</h3>
                <p className={sessionStyles.cardSubline}>By {session.instructor_name ?? "Unassigned"} · Session</p>
                <div className={sessionStyles.cardMetaList}>
                  <div className={sessionStyles.cardMetaRow}>
                    <CalendarDays className={sessionStyles.cardMetaIcon} size={15} />
                    <span>Date: {dateText === "Not scheduled" ? "TBA" : `${dateText}, ${timeText === "Not available" ? "Time TBA" : timeText}`}</span>
                  </div>
                  <div className={sessionStyles.cardMetaRow}>
                    <Clock3 className={sessionStyles.cardMetaIcon} size={15} />
                    <span>Duration: 1 hr</span>
                  </div>
                </div>
                <div className={sessionStyles.cardBottomRow}>
                  {action.type === "enroll" ? (
                    <button
                      className={`${sessionStyles.cardActionBase} ${actionClassName}`}
                      disabled={enrollingSessionId === session.id}
                      onClick={() => onEnroll(session)}
                      type="button"
                    >
                      {enrollingSessionId === session.id ? "Enrolling..." : action.label}
                    </button>
                  ) : (
                    <Link className={`${sessionStyles.cardActionBase} ${actionClassName}`} href={detailHref}>
                      {action.label}
                    </Link>
                  )}
                </div>
              </motion.article>
              );
            })
          ) : (
            <div className={sessionStyles.emptyState}>No live or upcoming courses found.</div>
          )}
        </div>
      </div>

      <div className={sessionStyles.tableHeader}>
        <div>
          <h2 className={sessionStyles.sectionTitle}>Previous Sessions</h2>
          <p className={sessionStyles.sectionSubtitle}>Live data from the public.sessions table</p>
        </div>
      </div>

      {errorMessage ? (
        <div className={sessionStyles.errorText}>{errorMessage}</div>
      ) : (
        <div className={sessionStyles.activeCardsGrid}>
          {isLoading ? (
            <div className={sessionStyles.emptyState}>Fetching sessions from Supabase...</div>
          ) : previousSessionRecords.length > 0 ? (
            previousSessionRecords.map((session, index) => {
              return (
                <motion.article
                  className={sessionStyles.sessionCard}
                  key={session.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.22 }}
                  transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
                  whileHover={{ y: -10, scale: 1.03 }}
                >
                  <div className={sessionStyles.cardTopRow}>
                    <span className={`${sessionStyles.cardTag} ${sessionStyles.activeCardTagCompleted}`}>COMPLETED</span>
                  </div>
                  <button
                    aria-label={`Open ${session.title ?? "session"} details`}
                    className={`${sessionStyles.cardCover} bg-gradient-to-br ${cardGradients[index % cardGradients.length]}`}
                    onClick={() => setSelectedSession(session)}
                    type="button"
                  >
                    {session.thumbnail_url || session.thumb_url ? (
                      <Image
                        alt={session.title ?? "Session thumbnail"}
                        className={sessionStyles.cardCoverImage}
                        fill
                        sizes="(max-width: 700px) 100vw, 280px"
                        src={session.thumbnail_url ?? session.thumb_url ?? ""}
                      />
                    ) : null}
                    <div className={sessionStyles.cardCoverShade} />
                    <div className={sessionStyles.cardCoverGlow} />
                    <div className={sessionStyles.cardCoverContent} />
                  </button>
                  <h3 className={sessionStyles.cardTopicTitle}>{session.title ?? "Untitled session"}</h3>
                  <p className={sessionStyles.cardSubline}>By {session.instructor_name ?? "Unassigned"} · Revision Session</p>
                  <div className={sessionStyles.cardMetaList}>
                    <div className={sessionStyles.cardMetaRow}>
                      <CalendarDays className={sessionStyles.cardMetaIcon} size={15} />
                      <span>
                        Completed: {formatSessionDate(session.session_date) === "Not scheduled" ? "Date N/A" : formatSessionDate(session.session_date)}
                      </span>
                    </div>
                    <div className={sessionStyles.cardMetaRow}>
                      <Clock3 className={sessionStyles.cardMetaIcon} size={15} />
                      <span>Duration: 45 mins</span>
                    </div>
                  </div>
                  <div className={sessionStyles.cardBottomRow}>
                    <Link className={`${sessionStyles.cardActionBase} ${sessionStyles.actionFinished}`} href={getSessionDetailHref(session.id)}>
                      View Replay
                    </Link>
                  </div>
                </motion.article>
              );
            })
          ) : (
            <div className={sessionStyles.emptyState}>No sessions found in Supabase.</div>
          )}
        </div>
      )}

      {selectedSession ? (
        <div className={sessionStyles.sessionModalOverlay} onClick={() => setSelectedSession(null)} role="presentation">
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={sessionStyles.sessionModal}
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            onClick={(event) => event.stopPropagation()}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className={sessionStyles.sessionModalHeader}>
              <h3 className={sessionStyles.sessionModalTitle}>{selectedSession.title ?? "Untitled session"}</h3>
              <button className={sessionStyles.sessionModalClose} onClick={() => setSelectedSession(null)} type="button">
                Close
              </button>
            </div>

            <div className={sessionStyles.sessionModalBody}>
              <div>
                <p className={sessionStyles.cardMetaTitle}>Instructor</p>
                <p className={sessionStyles.sessionModalValue}>{selectedSession.instructor_name ?? "Unassigned"}</p>
              </div>
              <div>
                <p className={sessionStyles.cardMetaTitle}>Status</p>
                <span className={`${sessionStyles.cardStatusPill} ${getSessionStatusClass(selectedSession.status)}`}>
                  {selectedSession.status ?? "pending"}
                </span>
              </div>
              <div>
                <p className={sessionStyles.cardMetaTitle}>Date</p>
                <p className={sessionStyles.sessionModalValue}>{formatSessionDate(selectedSession.session_date)}</p>
              </div>
              <div>
                <p className={sessionStyles.cardMetaTitle}>Time</p>
                <p className={sessionStyles.sessionModalValue}>{formatSessionStartTime(selectedSession.start_time)}</p>
              </div>
            </div>

            <div className={sessionStyles.sessionModalActions}>
              {selectedSessionAction?.type === "enroll" ? (
                <button
                  className={`${sessionStyles.cardActionBase} ${selectedActionClassName}`}
                  disabled={enrollingSessionId === selectedSession.id}
                  onClick={() => onEnroll(selectedSession)}
                  type="button"
                >
                  {enrollingSessionId === selectedSession.id ? "Enrolling..." : selectedSessionAction.label}
                </button>
              ) : selectedSessionAction?.type === "join" ? (
                <Link className={`${sessionStyles.cardActionBase} ${selectedActionClassName}`} href={selectedSessionDetailHref}>
                  {selectedSessionAction.label}
                </Link>
              ) : (
                <span className={`${sessionStyles.cardActionBase} ${selectedActionClassName}`}>
                  {selectedSessionAction?.label ?? "View"}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      ) : null}
    </motion.section>
  );
}
