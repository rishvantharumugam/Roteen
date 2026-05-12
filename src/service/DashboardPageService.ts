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
