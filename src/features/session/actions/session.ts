import {
  enrollInMeetingSession,
  fetchMeetingEnrollments,
  fetchSessionDashboard,
  fetchSessionRecordById,
  fetchSessionRecords,
  fetchSessionsAll,
  type MeetingEnrollment,
} from "@/features/session/services/session";
import type { SessionDashboardState, SessionRecord } from "@/features/session/components/sessionStore";

export async function getSessionDashboard(): Promise<SessionDashboardState> {
  const dashboard = await fetchSessionDashboard();

  return {
    ...dashboard,
    stats: dashboard.stats.map((stat) => ({
      ...stat,
      value: Math.max(0, stat.value),
    })),
  };
}

export async function getSessionsAll() {
  return fetchSessionsAll();
}

export async function getSessionRecords(): Promise<SessionRecord[]> {
  return fetchSessionRecords();
}

export async function getMeetingEnrollments(): Promise<MeetingEnrollment[]> {
  return fetchMeetingEnrollments();
}

export async function enrollSession(sessionId: string): Promise<MeetingEnrollment> {
  return enrollInMeetingSession(sessionId);
}

export async function unenrollSession(sessionId: string): Promise<void> {
  const { unenrollFromMeetingSession } = await import("@/features/session/services/session");
  return unenrollFromMeetingSession(sessionId);
}

export async function getSessionRecordById(id: string): Promise<SessionRecord | null> {
  return fetchSessionRecordById(id);
}

