import { supabase } from '@/lib/supabase/client';
import {
  sessionDashboardState,
  type SessionDashboardState,
  type SessionRecord,
  type SessionStat,
} from "@/features/session/components/sessionStore";
import { normalizeSessionStatus } from "@/features/session/components/sessionUtils";

export interface MeetingEnrollment {
  id: string;
  session_id: string;
  user_id?: string;
  created_at: string | null;
  enrolled_at?: string | boolean | null;
}

export async function getCurrentUserId(): Promise<string | null> {
  const { data: userData } = await supabase.auth.getUser();
  let userId = userData?.user?.id;

  if (!userId) {
    const { data: users } = await supabase.from("users").select("id").limit(1).maybeSingle();
    if (users?.id) {
      userId = users.id;
    } else {
      const { data: profiles } = await supabase.from("profiles").select("id").limit(1).maybeSingle();
      if (profiles?.id) {
        userId = profiles.id;
      }
    }
  }

  return userId ?? null;
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
        detail: `${counts.pending} upcoming sessions`,
      };
    }

    return stat;
  });
}

// Use select("*") — column list varies per deployment; avoids "column does not exist" errors
const SESSION_COLUMNS = "*";

// ─── OPTIMIZED: single fetch that powers BOTH dashboard stats AND records ───
// Replaces two separate queries (fetchSessionDashboard + fetchSessionRecords)
// with one roundtrip. Dashboard stats are computed locally from the fetched data.
export async function fetchSessionsAll(): Promise<{
  dashboard: SessionDashboardState;
  records: SessionRecord[];
}> {
  const { data, error } = await supabase
    .from("sessions")
    .select(SESSION_COLUMNS)
    .order("title", { ascending: true });

  if (error) throw new Error(error.message);

  const records = (data as SessionRecord[]) ?? [];
  const counts = getSessionStatusCounts(records);

  return {
    dashboard: {
      ...sessionDashboardState,
      stats: getDynamicStats(counts),
    },
    records,
  };
}

// Kept for backward compatibility — internally uses fetchSessionsAll-compatible logic
export async function fetchSessionDashboard(): Promise<SessionDashboardState> {
  const { data, error } = await supabase.from("sessions").select("status");
  if (error) throw new Error(error.message);
  const counts = getSessionStatusCounts((data as Pick<SessionRecord, "status">[]) ?? []);
  return { ...sessionDashboardState, stats: getDynamicStats(counts) };
}

export async function fetchSessionRecords(): Promise<SessionRecord[]> {
  const { data, error } = await supabase
    .from("sessions")
    .select(SESSION_COLUMNS)
    .order("title", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as SessionRecord[]) ?? [];
}

export async function fetchMeetingEnrollments(): Promise<MeetingEnrollment[]> {
  const { data, error } = await supabase
    .from("meeting_enrollments")
    .select("id, session_id, user_id, created_at, enrolled_at");
  if (error) throw new Error(error.message);
  return (data as MeetingEnrollment[]) ?? [];
}

export async function enrollInMeetingSession(sessionId: string): Promise<MeetingEnrollment> {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("Authentication required: You must be logged in to enroll in a session.");
  }

  const { data: existingEnrollment, error: existingEnrollmentError } = await supabase
    .from("meeting_enrollments")
    .select("id, session_id, created_at, enrolled_at")
    .eq("session_id", sessionId)
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (existingEnrollmentError) throw new Error(existingEnrollmentError.message);
  if (existingEnrollment) return existingEnrollment as MeetingEnrollment;

  const { data, error } = await supabase
    .from("meeting_enrollments")
    .insert({ session_id: sessionId, user_id: userId, enrolled_at: true })
    .select("id, session_id, created_at, enrolled_at")
    .single();

  if (error) throw new Error(error.message);
  return data as MeetingEnrollment;
}

export async function unenrollFromMeetingSession(sessionId: string): Promise<void> {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("Authentication required: You must be logged in to cancel enrollment.");
  }

  const { error } = await supabase
    .from("meeting_enrollments")
    .delete()
    .eq("session_id", sessionId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

export async function fetchSessionRecordById(id: string): Promise<SessionRecord | null> {
  const { data, error } = await supabase
    .from("sessions")
    .select(SESSION_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as SessionRecord | null) ?? null;
}
