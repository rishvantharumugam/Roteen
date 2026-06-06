import { tutorialApiPath, tutorialProgressStorageKey } from "@/features/tutorial/types/tutorial";

export interface TutorialVideoRow {
  id?: string | number | null;
  title?: string | null;
  description?: string | null;
  instructor_name?: string | null;
  instructor_role?: string | null;
  instructor_avatar?: string | null;
  duration_seconds?: number | null;
  thumbnail_gradient?: string | null;
  thumbnail_url?: string | null;
  video_url?: string | null;
  tags?: string[] | string | null;
  views_count?: number | null;
  created_at?: string | null;
  is_published?: boolean | null;
  chapter_title?: string | null;
  chapter_id?: string | number | null;
  category?: string | null;
  sort_order?: number | null;
  progress_percent?: number | null;
  is_completed?: boolean | null;
}

export interface TutorialLesson {
  id: string;
  sequence: number;
  title: string;
  description: string;
  instructor: string;
  role: string;
  avatar: string;
  duration: string;
  durationSeconds: number;
  thumbnail: string;
  thumbnailUrl: string;
  videoUrl: string;
  tags: string[];
  viewsLabel: string;
  postedDate: string;
  fullDescription: string;
  chapterId: string;
  chapterTitle: string;
  progressPercent: number;
  isCompleted: boolean;
}

export interface TutorialChapter {
  id: string;
  title: string;
  lessons: TutorialLesson[];
  totalDurationLabel: string;
  progressPercent: number;
}

export interface TutorialPageData {
  lessons: TutorialLesson[];
  chapters: TutorialChapter[];
  featuredLessonId: string;
  continueLessonId: string;
  totalDurationLabel: string;
  completedLessonCount: number;
  progressPercent: number;
}

export interface TutorialServiceResult<T> {
  data: T;
  message: string;
}

export class TutorialServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = "TutorialServiceError";
    this.statusCode = statusCode;
  }
}

interface TutorialApiSuccess {
  success: true;
  count: number;
  data: TutorialPageData;
}

interface TutorialApiFailure {
  success?: false;
  message?: string;
  error?: string;
}

const defaultThumbnail =
  "linear-gradient(135deg,#6d28d9 0%,#2563eb 54%,#06b6d4 100%)";

function trimValue(value: string | null | undefined) {
  return (value ?? "").trim();
}

function toNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function toPercent(value: unknown) {
  return Math.max(0, Math.min(100, Math.round(toNumber(value))));
}

function normalizeTags(tags: TutorialVideoRow["tags"]) {
  if (Array.isArray(tags)) {
    return tags.map((tag) => trimValue(tag)).filter(Boolean);
  }

  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => trimValue(tag))
      .filter(Boolean);
  }

  return [];
}

function formatDuration(totalSeconds: number) {
  if (!totalSeconds) {
    return "0:00";
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatTotalDuration(totalSeconds: number) {
  if (!totalSeconds) {
    return "0 min";
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);

  if (!hours) {
    return `${minutes} min`;
  }

  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}

function formatPostedDate(value: string | null | undefined) {
  if (!value) {
    return "Recently added";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently added";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function normalizeChapter(row: TutorialVideoRow, index: number) {
  const chapterTitle =
    trimValue(row.chapter_title) ||
    trimValue(row.category) ||
    normalizeTags(row.tags)[0]?.replace(/^#/, "") ||
    "Featured Tutorials";
  const chapterId = trimValue(String(row.chapter_id ?? "")) ||
    chapterTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") ||
    `chapter-${index + 1}`;

  return {
    chapterId,
    chapterTitle,
  };
}

function createLesson(row: TutorialVideoRow, index: number): TutorialLesson {
  const sequence = index + 1;
  const durationSeconds = Math.max(0, Math.round(toNumber(row.duration_seconds)));
  const tags = normalizeTags(row.tags);
  const { chapterId, chapterTitle } = normalizeChapter(row, index);
  const id = trimValue(String(row.id ?? "")) || `lesson-${sequence}`;
  const title = trimValue(row.title) || `Tutorial ${sequence}`;
  const description = trimValue(row.description) || "Tutorial video";
  const progressPercent = toPercent(row.progress_percent);
  const isCompleted = Boolean(row.is_completed) || progressPercent >= 100;

  return {
    id,
    sequence,
    title,
    description,
    instructor: trimValue(row.instructor_name) || "Roteen Instructor",
    role: trimValue(row.instructor_role) || "Learning Mentor",
    avatar: trimValue(row.instructor_avatar) || "R",
    duration: formatDuration(durationSeconds),
    durationSeconds,
    thumbnail: trimValue(row.thumbnail_gradient) || defaultThumbnail,
    thumbnailUrl: trimValue(row.thumbnail_url),
    videoUrl: trimValue(row.video_url),
    tags,
    viewsLabel: `${toNumber(row.views_count).toLocaleString()} views`,
    postedDate: formatPostedDate(row.created_at),
    fullDescription: description,
    chapterId,
    chapterTitle,
    progressPercent,
    isCompleted,
  };
}

function createChapters(lessons: TutorialLesson[]): TutorialChapter[] {
  const chapters = new Map<string, TutorialChapter>();

  for (const lesson of lessons) {
    const current = chapters.get(lesson.chapterId) ?? {
      id: lesson.chapterId,
      title: lesson.chapterTitle,
      lessons: [],
      totalDurationLabel: "0 min",
      progressPercent: 0,
    };

    current.lessons.push(lesson);
    chapters.set(lesson.chapterId, current);
  }

  return Array.from(chapters.values()).map((chapter) => {
    const totalSeconds = chapter.lessons.reduce(
      (sum, lesson) => sum + lesson.durationSeconds,
      0,
    );
    const progressPercent = chapter.lessons.length
      ? Math.round(
          chapter.lessons.reduce((sum, lesson) => sum + lesson.progressPercent, 0) /
            chapter.lessons.length,
        )
      : 0;

    return {
      ...chapter,
      totalDurationLabel: formatTotalDuration(totalSeconds),
      progressPercent,
    };
  });
}

function buildPageData(rows: TutorialVideoRow[]): TutorialPageData {
  const lessons = rows
    .map(createLesson)
    .sort((first, second) => first.sequence - second.sequence);
  const chapters = createChapters(lessons);
  const continueLesson =
    lessons.find((lesson) => lesson.progressPercent > 0 && lesson.progressPercent < 100) ??
    lessons.find((lesson) => !lesson.isCompleted) ??
    lessons[0];
  const completedLessonCount = lessons.filter((lesson) => lesson.isCompleted).length;
  const totalDurationSeconds = lessons.reduce(
    (sum, lesson) => sum + lesson.durationSeconds,
    0,
  );
  const progressPercent = lessons.length
    ? Math.round((completedLessonCount / lessons.length) * 100)
    : 0;

  return {
    lessons,
    chapters,
    featuredLessonId: lessons[0]?.id ?? "",
    continueLessonId: continueLesson?.id ?? lessons[0]?.id ?? "",
    totalDurationLabel: formatTotalDuration(totalDurationSeconds),
    completedLessonCount,
    progressPercent,
  };
}

function createSupabaseHeaders(supabaseAccessKey: string) {
  return {
    apikey: supabaseAccessKey,
    Authorization: `Bearer ${supabaseAccessKey}`,
  };
}

function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new TutorialServiceError(
      "Supabase tutorial environment variables are missing.",
      500,
    );
  }

  return {
    supabaseUrl,
    supabaseAccessKey: supabaseServiceRoleKey || supabaseAnonKey,
  };
}

async function readErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { message?: string; error?: string };
    return payload.message || payload.error || "Supabase tutorial request failed.";
  } catch {
    return "Supabase tutorial request failed.";
  }
}

async function fetchPublishedTutorialRowsFromSupabase() {
  const { supabaseUrl, supabaseAccessKey } = getSupabaseConfig();
  const url = new URL("/rest/v1/tutorial_videos", supabaseUrl);

  url.searchParams.set("select", "*");
  url.searchParams.set("is_published", "eq.true");
  url.searchParams.set("order", "created_at.desc");

  const response = await fetch(url, {
    method: "GET",
    headers: createSupabaseHeaders(supabaseAccessKey),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new TutorialServiceError(await readErrorMessage(response), response.status);
  }

  return (await response.json()) as TutorialVideoRow[];
}

async function fetchTutorialPageFromApi() {
  const response = await fetch(tutorialApiPath, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    let message = "We could not load tutorials.";

    try {
      const payload = (await response.json()) as TutorialApiFailure;
      message = payload.message || payload.error || message;
    } catch {
      // Keep default message.
    }

    throw new TutorialServiceError(message, response.status);
  }

  const payload = (await response.json()) as TutorialApiSuccess;
  return payload.data;
}

export function readTutorialProgress(lessonIds: string[]) {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  try {
    const payload = window.localStorage.getItem(tutorialProgressStorageKey);
    const parsed = payload ? (JSON.parse(payload) as string[]) : [];
    const allowedLessonIds = new Set(lessonIds);
    return new Set(parsed.filter((lessonId) => allowedLessonIds.has(lessonId)));
  } catch {
    return new Set<string>();
  }
}

export function persistTutorialProgress(completedLessonIds: Set<string>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    tutorialProgressStorageKey,
    JSON.stringify(Array.from(completedLessonIds)),
  );
}

export function applyTutorialProgress(
  pageData: TutorialPageData,
  completedLessonIds: Set<string>,
) {
  const rows = pageData.lessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    instructor_name: lesson.instructor,
    instructor_role: lesson.role,
    instructor_avatar: lesson.avatar,
    duration_seconds: lesson.durationSeconds,
    thumbnail_gradient: lesson.thumbnail,
    thumbnail_url: lesson.thumbnailUrl,
    video_url: lesson.videoUrl,
    tags: lesson.tags,
    views_count: Number(lesson.viewsLabel.replace(/\D/g, "")),
    created_at: lesson.postedDate,
    chapter_id: lesson.chapterId,
    chapter_title: lesson.chapterTitle,
    progress_percent: completedLessonIds.has(lesson.id) ? 100 : lesson.progressPercent,
    is_completed: completedLessonIds.has(lesson.id) || lesson.isCompleted,
  }));

  return buildPageData(rows);
}

export const tutorialService = {
  async fetchTutorialPage(): Promise<TutorialServiceResult<TutorialPageData>> {
    const data = await fetchTutorialPageFromApi();

    return {
      data,
      message: "Tutorials loaded.",
    };
  },

  async fetchTutorialPageFromSupabase(): Promise<
    TutorialServiceResult<TutorialPageData>
  > {
    const rows = await fetchPublishedTutorialRowsFromSupabase();

    return {
      data: buildPageData(rows),
      message: "Tutorials loaded from Supabase.",
    };
  },
};
