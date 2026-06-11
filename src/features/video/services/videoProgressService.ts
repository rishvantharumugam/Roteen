import { supabase } from "@/lib/supabase/client";

export interface ResolvedVideo {
  url: string | null;
  videoId: string | null;
}

export function parseTimeStrToSeconds(val: string | number): number {
  if (typeof val === "number") return val;
  if (!val) return 0;
  // If it is a direct float string from DB
  if (!val.includes(":")) return parseFloat(val) || 0;
  
  const parts = val.split(":");
  if (parts.length === 3) {
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    const s = parseFloat(parts[2]) || 0;
    return h * 3600 + m * 60 + s;
  }
  return 0;
}

export function formatSecondsToTimeStr(seconds: number | string): string {
  const num = typeof seconds === "string" ? parseFloat(seconds) : seconds;
  if (isNaN(num)) return "00:00:00";
  const h = Math.floor(num / 3600);
  const m = Math.floor((num % 3600) / 60);
  const s = Math.floor(num % 60);
  const ms = Math.floor((num - Math.floor(num)) * 1000);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`;
}

function normalizeVideoUrl(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getQuestionIdCandidates(questionId: string): Array<string | number> {
  const normalized = questionId.trim();
  if (!normalized) {
    return [];
  }
  if (/^\d+$/.test(normalized)) {
    return [normalized, Number(normalized)];
  }
  return [normalized];
}

export async function fetchQuestionLevel(questionId: string): Promise<number> {
  const candidates = getQuestionIdCandidates(questionId);
  if (candidates.length === 0) return 0;

  const { data, error } = await supabase
    .from("questions")
    .select("level")
    .in("id", candidates)
    .limit(1);

  if (!error && data && data.length > 0) {
    return Number(data[0].level) || 0;
  }
  return 0;
}

export async function fetchVideoUrlFromSupabase(
  questionId: string,
  subjectId: string | null
): Promise<ResolvedVideo> {
  console.log("[fetchVideoUrlFromSupabase] starting with:", { questionId, subjectId });
  const candidates = getQuestionIdCandidates(questionId);
  if (candidates.length === 0) {
    console.log("[fetchVideoUrlFromSupabase] no candidates found for:", questionId);
    return { url: null, videoId: null };
  }
  console.log("[fetchVideoUrlFromSupabase] candidates:", candidates);

  // Query videos table and questions table in parallel to reduce database loading latency
  const videosPromise = (async () => {
    console.log("[fetchVideoUrlFromSupabase] videosPromise querying...");
    let query = supabase
      .from("videos")
      .select("id, video_url")
      .in("question_id", candidates);
    
    if (subjectId) {
      const { data, error } = await query.eq("subject_id", subjectId);
      console.log("[fetchVideoUrlFromSupabase] videosPromise query with subject_id result:", { data, error });
      if (!error && data && data.length > 0) {
        const match = data.find((v) => normalizeVideoUrl(v.video_url));
        if (match) {
          console.log("[fetchVideoUrlFromSupabase] videosPromise matched with subject_id:", match);
          return { url: normalizeVideoUrl(match.video_url), videoId: match.id ? String(match.id) : null };
        }
      }
      
      if (error && (error.code === "PGRST204" || error.code === "42703")) {
        console.log("[fetchVideoUrlFromSupabase] videosPromise error 42703, running fallback...");
        const fallbackQuery = supabase
          .from("videos")
          .select("id, video_url")
          .in("question_id", candidates);
        const fallbackResult = await fallbackQuery;
        console.log("[fetchVideoUrlFromSupabase] videosPromise fallback result:", fallbackResult);
        if (!fallbackResult.error && fallbackResult.data && fallbackResult.data.length > 0) {
          const match = fallbackResult.data.find((v) => normalizeVideoUrl(v.video_url));
          if (match) {
            console.log("[fetchVideoUrlFromSupabase] videosPromise fallback matched:", match);
            return { url: normalizeVideoUrl(match.video_url), videoId: match.id ? String(match.id) : null };
          }
        }
      }
    } else {
      const { data, error } = await query;
      console.log("[fetchVideoUrlFromSupabase] videosPromise query without subject_id result:", { data, error });
      if (!error && data && data.length > 0) {
        const match = data.find((v) => normalizeVideoUrl(v.video_url));
        if (match) {
          console.log("[fetchVideoUrlFromSupabase] videosPromise matched without subject_id:", match);
          return { url: normalizeVideoUrl(match.video_url), videoId: match.id ? String(match.id) : null };
        }
      }
    }
    return null;
  })();

  const questionsPromise = (async () => {
    console.log("[fetchVideoUrlFromSupabase] questionsPromise querying...");
    let query = supabase
      .from("questions")
      .select("video_url")
      .in("id", candidates);

    if (subjectId) {
      const { data, error } = await query.eq("subject_id", subjectId);
      console.log("[fetchVideoUrlFromSupabase] questionsPromise query with subject_id result:", { data, error });
      if (!error && data && data.length > 0) {
        const match = data.find((q) => normalizeVideoUrl(q.video_url));
        if (match) {
          console.log("[fetchVideoUrlFromSupabase] questionsPromise matched with subject_id:", match);
          return { url: normalizeVideoUrl(match.video_url), videoId: null };
        }
      }

      if (error && (error.code === "PGRST204" || error.code === "42703")) {
        console.log("[fetchVideoUrlFromSupabase] questionsPromise error 42703, running fallback...");
        const fallbackQuery = supabase
          .from("questions")
          .select("video_url")
          .in("id", candidates);
        const fallbackResult = await fallbackQuery;
        console.log("[fetchVideoUrlFromSupabase] questionsPromise fallback result:", fallbackResult);
        if (!fallbackResult.error && fallbackResult.data && fallbackResult.data.length > 0) {
          const match = fallbackResult.data.find((q) => normalizeVideoUrl(q.video_url));
          if (match) {
            console.log("[fetchVideoUrlFromSupabase] questionsPromise fallback matched:", match);
            return { url: normalizeVideoUrl(match.video_url), videoId: null };
          }
        }
      }
    } else {
      const { data, error } = await query;
      console.log("[fetchVideoUrlFromSupabase] questionsPromise query without subject_id result:", { data, error });
      if (!error && data && data.length > 0) {
        const match = data.find((q) => normalizeVideoUrl(q.video_url));
        if (match) {
          console.log("[fetchVideoUrlFromSupabase] questionsPromise matched without subject_id:", match);
          return { url: normalizeVideoUrl(match.video_url), videoId: null };
        }
      }
    }
    return null;
  })();

  const [videosResult, questionsResult] = await Promise.all([videosPromise, questionsPromise]);
  console.log("[fetchVideoUrlFromSupabase] final results:", { videosResult, questionsResult });

  return videosResult || questionsResult || { url: null, videoId: null };
}

export async function trackVideoEngagement(
  userId: string,
  questionId: string,
  videoId: string | null,
  event: "play" | "pause" | "ended" | "complete" | "incomplete"
): Promise<void> {
  if (!userId || !questionId) return;

  try {
    const now = new Date().toISOString();

    const query = supabase
      .from("user_questions_progress")
      .select("ID, status")
      .eq("Users_ID", userId)
      .eq("Questions_ID", questionId);

    const { data, error } = await query;
    if (error) throw error;

    const record = data && data.length > 0 ? data[0] : null;

    if (record) {
      const updatePayload: any = {
        videos_id: videoId || null,
        updated_at: now
      };

      if (event === "complete") {
        updatePayload.status = "Resolved";
        updatePayload.completed_at = now;
      } else if (event === "incomplete") {
        updatePayload.status = "In_Progress";
        updatePayload.completed_at = null;
      }

      const { error: updateError } = await supabase
        .from("user_questions_progress")
        .update(updatePayload)
        .eq("ID", record.ID);

      if (updateError) throw updateError;
    } else {
      let status = "In_Progress";
      let completedAt: string | null = null;

      if (event === "complete") {
        status = "Resolved";
        completedAt = now;
      }

      const insertPayload = {
        Users_ID: userId,
        Questions_ID: questionId,
        videos_id: videoId || null,
        status: status,
        created_at: now,
        updated_at: now,
        completed_at: completedAt
      };

      const { error: insertError } = await supabase
        .from("user_questions_progress")
        .insert(insertPayload);

      if (insertError) throw insertError;
    }
  } catch (err) {
    console.error("Failed to persist learning state to Supabase:", err);
  }
}

export async function fetchVideoWatchedSeconds(
  userId: string,
  questionId: string,
  videoId: string | null
): Promise<number> {
  if (!userId || !questionId) return 0;

  try {
    const query = supabase
      .from("user_questions_progress")
      .select("watched_seconds")
      .eq("Users_ID", userId)
      .eq("Questions_ID", questionId);

    const { data, error } = await query;
    if (error) throw error;

    if (data && data.length > 0 && data[0].watched_seconds !== null) {
      return Number(data[0].watched_seconds);
    }
  } catch (err) {
    console.error("Failed to fetch video watched seconds from Supabase:", err);
  }
  return 0;
}

export async function updateVideoWatchedSeconds(
  userId: string,
  questionId: string,
  videoId: string | null,
  watchedSeconds: number
): Promise<void> {
  if (!userId || !questionId) return;

  try {
    const now = new Date().toISOString();

    const query = supabase
      .from("user_questions_progress")
      .select("ID")
      .eq("Users_ID", userId)
      .eq("Questions_ID", questionId);

    const { data, error } = await query;
    if (error) throw error;

    const record = data && data.length > 0 ? data[0] : null;

    if (record) {
      const { error: updateError } = await supabase
        .from("user_questions_progress")
        .update({
          watched_seconds: watchedSeconds,
          videos_id: videoId || null,
          updated_at: now
        })
        .eq("ID", record.ID);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from("user_questions_progress")
        .insert({
          Users_ID: userId,
          Questions_ID: questionId,
          videos_id: videoId || null,
          watched_seconds: watchedSeconds,
          status: "In_Progress",
          created_at: now,
          updated_at: now
        });

      if (insertError) throw insertError;
    }
  } catch (err) {
    console.error("Failed to update video watched seconds in Supabase:", err);
  }
}

