import { supabase } from "@/lib/supabaseClient";
import {
  sessionDashboardState,
  type SessionDashboardState,
  type SessionRecord,
  type SessionStat,
} from "@/store/session/sessionStore";
import { normalizeSessionStatus } from "@/store/session/sessionUtils";

export interface MeetingEnrollment {
  id: string;
  session_id: string;
  created_at: string | null;
  enrolled_at?: string | boolean | null;
}

type SessionStatusCounts = {
  active: number;
  completed: number;
  pending: number;
  total: number;
};

function getSessionStatusCounts(records: Pick<SessionRecord, "status">[]): SessionStatusCounts {
  return records.reduce<SessionStatusCounts>(
    (counts, session) => {
      const status = normalizeSessionStatus(session.status);

      counts.total += 1;

      if (["on live", "live", "active", "in progress", "ongoing"].includes(status)) {
        counts.active += 1;
        return counts;
      }

      if (["completed", "complete", "finished"].includes(status)) {
        counts.completed += 1;
        return counts;
      }

      if (["not started", "pending", "upcoming", "scheduled"].includes(status)) {
        counts.pending += 1;
      }

      return counts;
    },
    {
      active: 0,
      completed: 0,
      pending: 0,
      total: 0,
    },
  );
}

function getDynamicStats(counts: SessionStatusCounts): SessionStat[] {
  return sessionDashboardState.stats.map((stat) => {
    if (stat.id === "total") {
      return {
        ...stat,
        value: counts.total,
        detail: `${counts.total} sessions fetched from Supabase`,
      };
    }

    if (stat.id === "active") {
      return {
        ...stat,
        value: counts.active,
        detail: `${counts.active} active sessions`,
      };
    }

    if (stat.id === "completed") {
      return {
        ...stat,
        value: counts.completed,
        detail: `${counts.completed} completed sessions`,
      };
    }

    if (stat.id === "pending") {
      return {
        ...stat,
        value: counts.pending,
        detail: `${counts.pending} pending sessions`,
      };
    }

    return stat;
  });
}

export async function fetchSessionDashboard(): Promise<SessionDashboardState> {
  const { data, error } = await supabase.from("sessions").select("status");

  if (error) {
    throw new Error(error.message);
  }

  const counts = getSessionStatusCounts((data as Pick<SessionRecord, "status">[]) ?? []);

  return {
    ...sessionDashboardState,
    stats: getDynamicStats(counts),
  };
}

export async function fetchSessionRecords(): Promise<SessionRecord[]> {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .order("title", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data as SessionRecord[]) ?? [];
}

export async function fetchMeetingEnrollments(): Promise<MeetingEnrollment[]> {
  const { data, error } = await supabase
    .from("meeting_enrollments")
    .select("id, session_id, created_at, enrolled_at");

  if (error) {
    throw new Error(error.message);
  }

  return (data as MeetingEnrollment[]) ?? [];
}

export async function enrollInMeetingSession(sessionId: string): Promise<MeetingEnrollment> {
  const { data: existingEnrollment, error: existingEnrollmentError } = await supabase
    .from("meeting_enrollments")
    .select("id, session_id, created_at, enrolled_at")
    .eq("session_id", sessionId)
    .limit(1)
    .maybeSingle();

  if (existingEnrollmentError) {
    throw new Error(existingEnrollmentError.message);
  }

  if (existingEnrollment) {
    return existingEnrollment as MeetingEnrollment;
  }

  const { data, error } = await supabase
    .from("meeting_enrollments")
    .insert({
      session_id: sessionId,
      enrolled_at: true,
    })
    .select("id, session_id, created_at, enrolled_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as MeetingEnrollment;
}

export async function fetchSessionRecordById(id: string): Promise<SessionRecord | null> {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as SessionRecord | null) ?? null;
}
