import type { SupabaseClient } from "@supabase/supabase-js";

export type DashboardSubjectCard = {
  id: string;
  title: string;
  standard: string;
  chapters: string;
  chapterHighlight: string;
  progress: string;
  accent: string;
};

export type DashboardSubjectRecord = {
  id: string;
  standard: string | null;
  subject_name: string | null;
  chapters: { id: string; name: string | null }[] | null;
  questionCount?: number;
  quizCount?: number;
};

export type ExploreSubjectCard = {
  id: string;
  badge: string;
  title: string;
  standard: string | null;
  chapterCount: number;
  totalQuestions: number;
  totalQuizzes: number;
  progress: string;
  accent: string;
};

const dashboardAccentPalette = ["#9d7cff", "#c59d18", "#38bdf8", "#22c55e", "#fb7185", "#f97316", "#14b8a6"];
const exploreAccentPalette = ["#9d7cff", "#38bdf8", "#22c55e", "#f97316", "#14b8a6", "#fb7185"];
const resolvedCountTableCache = new Map<string, string>();

export function toTitleCase(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function parseTimeStrToSeconds(val: string | number): number {
  if (typeof val === "number") return val;
  if (!val) return 0;
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

export function processDashboardMetrics(subjects: DashboardSubjectRecord[]): DashboardSubjectCard[] {
  const maxChapterCount = Math.max(1, ...subjects.map((subject) => subject.chapters?.length ?? 0));

  return subjects.map((subject, index) => {
    const chapterCount = subject.chapters?.length ?? 0;
    const progressValue = Math.max(8, Math.round((chapterCount / maxChapterCount) * 100));
    const latestChapter = subject.chapters?.[chapterCount - 1]?.name?.trim();

    return {
      id: subject.id,
      title: toTitleCase(subject.subject_name?.trim() || "Untitled Subject"),
      standard: `Standard ${subject.standard ?? "N/A"}`,
      chapters: `${chapterCount} ${chapterCount === 1 ? "Chapter" : "Chapters"}`,
      chapterHighlight: latestChapter || "No chapters yet",
      progress: `${progressValue}%`,
      accent: dashboardAccentPalette[index % dashboardAccentPalette.length],
    };
  });
}

export function mapSubjectToExploreCard(subject: DashboardSubjectRecord, index: number): ExploreSubjectCard {
  const title = toTitleCase(subject.subject_name?.trim() || "Untitled Subject");
  const chapters = subject.chapters ?? [];
  const chapterCount = chapters.length;
  const progressValue = chapterCount > 0 ? Math.min(100, Math.max(10, chapterCount * 25)) : 0;

  return {
    id: subject.id,
    badge: `Standard ${subject.standard ?? "N/A"}`,
    title,
    standard: subject.standard ?? null,
    chapterCount,
    totalQuestions: subject.questionCount ?? 0,
    totalQuizzes: subject.quizCount ?? 0,
    progress: `${progressValue}%`,
    accent: exploreAccentPalette[index % exploreAccentPalette.length],
  };
}

export async function countRowsForChapters(
  supabaseClient: SupabaseClient,
  tableNames: string[],
  chapterIds: string[],
) {
  if (chapterIds.length === 0) {
    return 0;
  }

  const tableKey = tableNames.join("|");
  const cachedTable = resolvedCountTableCache.get(tableKey);

  if (cachedTable) {
    const { count, error } = await supabaseClient
      .from(cachedTable)
      .select("id", { count: "exact", head: true })
      .in("chapter_id", chapterIds);

    if (!error) {
      return count ?? 0;
    }

    resolvedCountTableCache.delete(tableKey);
  }

  for (const tableName of tableNames) {
    const { count, error } = await supabaseClient
      .from(tableName)
      .select("id", { count: "exact", head: true })
      .in("chapter_id", chapterIds);

    if (!error) {
      resolvedCountTableCache.set(tableKey, tableName);
      return count ?? 0;
    }
  }

  return 0;
}

export async function withQuestionCounts(
  supabaseClient: SupabaseClient,
  subjects: DashboardSubjectRecord[],
) {
  return Promise.all(
    subjects.map(async (subject) => {
      const chapterIds = (subject.chapters ?? []).map((chapter) => chapter.id);
      const [questionCount, quizCount] = await Promise.all([
        countRowsForChapters(supabaseClient, ["questions", "quiz_questions"], chapterIds),
        countRowsForChapters(supabaseClient, ["quizzes"], chapterIds),
      ]);

      return {
        ...subject,
        questionCount,
        quizCount,
      };
    }),
  );
}

export type CourseProgressItem = {
  id: string;
  question_id: string;
  updated_at: string;
  status: string;
  question_title: string;
  subject_id: string;
  subject_name: string;
  subject_standard: string | null;
  video_id: string | null;
  video_duration: number | null;
  watched_seconds: number;
};

export async function fetchUserCoursesProgress(
  supabaseClient: SupabaseClient,
  userId: string
): Promise<CourseProgressItem[]> {
  try {
    const { data, error } = await supabaseClient
      .from("user_questions_progress")
      .select(`
        ID,
        Users_ID,
        Questions_ID,
        videos_id,
        watched_seconds,
        updated_at,
        status,
        questions (
          id,
          question,
          subject_id,
          subjects (
            id,
            subject_name,
            standard
          )
        ),
        videos (
          id,
          duration_seconds,
          video_url
        )
      `)
      .eq("Users_ID", userId)
      .gt("watched_seconds", 0)
      .neq("status", "Resolved")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    if (!data) return [];

    return data
      .filter((row: any) => row.questions && row.questions.subjects)
      .map((row: any) => {
        const q = row.questions;
        const s = q.subjects;
        const v = row.videos;
        return {
          id: row.ID,
          question_id: row.Questions_ID,
          updated_at: row.updated_at,
          status: row.status,
          question_title: q.question || "Untitled Question",
          subject_id: q.subject_id,
          subject_name: s.subject_name || "Subject",
          subject_standard: s.standard,
          video_id: row.videos_id,
          video_duration: v ? (v.duration_seconds || null) : null,
          watched_seconds: row.watched_seconds || 0,
        };
      });
  } catch (err) {
    console.error("Failed to fetch user courses progress from Supabase:", err);
    return [];
  }
}
