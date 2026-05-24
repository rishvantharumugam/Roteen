import {
  enrollInMeetingSession,
  fetchMeetingEnrollments,
  fetchSessionDashboard,
  fetchSessionRecordById,
  fetchSessionRecords,
  type MeetingEnrollment,
} from "@/service/session";
import type { SessionDashboardState, SessionRecord } from "@/store/session/sessionStore";

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

export async function getSessionRecords(): Promise<SessionRecord[]> {
  return fetchSessionRecords();
}

export async function getMeetingEnrollments(): Promise<MeetingEnrollment[]> {
  return fetchMeetingEnrollments();
}

export async function enrollSession(sessionId: string): Promise<MeetingEnrollment> {
  return enrollInMeetingSession(sessionId);
}

export async function getSessionRecordById(id: string): Promise<SessionRecord | null> {
  return fetchSessionRecordById(id);
}
