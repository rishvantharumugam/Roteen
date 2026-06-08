import { supabase } from '@/lib/supabase/client';

export type VideoSubjectFilter = {
  subjectSlug?: string | null;
  subjectId?: string | null;
  standard?: string | null;
};

export type SubjectPanelCacheData = {
  subject: string;
  subjectId: string;
  standard: string | null;
  chapters: {
    id: string | number;
    chapter_no?: number | string | null;
    name?: string | null;
  }[];
  questions: {
    id: string | number;
    chapter_id: string | number | null;
    question_name?: string | null;
    mode?: string | null;
    standard?: string | number | null;
    question_marks?: string | null;
    questions_marks?: string | null;
  }[];
  quizzes?: {
    id: string;
    chapter_id: string | number | null;
    title?: string | null;
    mode?: string | null;
  }[];
};

const SUBJECT_NAME_ALIASES: Record<string, string> = {
  math: "Math",
  mathematics: "Math",
  physics: "Physics",
  chemistry: "Chemistry",
  biology: "Biology",
  javascript: "JavaScript",
  js: "JavaScript",
  react: "React",
  computer: "Computer Science",
  computerscience: "Computer Science",
  "computer-science": "Computer Science",
};

const memoryCache = new Map<string, SubjectPanelCacheData>();
const inflightSubjectPanelRequests = new Map<string, Promise<SubjectPanelCacheData>>();
const DEFAULT_STANDARD = 10;

export function titleToSubjectSlug(title: string): string {
  const normalized = title.trim().toLowerCase();

  if (normalized.includes("math")) return "math";
  if (normalized.includes("physics")) return "physics";
  if (normalized.includes("chem")) return "chemistry";
  if (normalized.includes("bio")) return "biology";
  if (normalized.includes("javascript") || normalized === "js") return "javascript";
  if (normalized.includes("react")) return "react";
  if (normalized.includes("computer")) return "computer";

  return normalized.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "math";
}

export function resolveSubjectNameFromSlug(slug: string): string | null {
  const compact = slug.trim().toLowerCase().replace(/-/g, "");
  if (SUBJECT_NAME_ALIASES[compact]) {
    return SUBJECT_NAME_ALIASES[compact];
  }

  const spaced = slug.trim().toLowerCase().replace(/-/g, " ");
  if (SUBJECT_NAME_ALIASES[spaced.replace(/\s/g, "")]) {
    return SUBJECT_NAME_ALIASES[spaced.replace(/\s/g, "")];
  }

  return null;
}

export function getSubjectPanelCacheKey(filter: VideoSubjectFilter): string {
  const standardSuffix = filter.standard?.trim() ? `|std:${filter.standard.trim()}` : "";

  if (filter.subjectId) {
    return `id:${filter.subjectId}${standardSuffix}_v3`;
  }

  if (filter.subjectSlug) {
    return `slug:${filter.subjectSlug.trim().toLowerCase()}${standardSuffix}_v3`;
  }

  return `default:math${standardSuffix || "|std:10"}_v3`;
}

export function readSubjectPanelCache(key: string): SubjectPanelCacheData | null {
  if (typeof window === "undefined") {
    return memoryCache.get(key) ?? null;
  }

  const memoryHit = memoryCache.get(key);
  if (memoryHit) {
    return memoryHit;
  }

  try {
    const cached = localStorage.getItem(`roteen_subject_data_${key}`);
    if (!cached) {
      return null;
    }

    const parsed = JSON.parse(cached) as SubjectPanelCacheData;
    memoryCache.set(key, parsed);
    return parsed;
  } catch {
    return null;
  }
}

export function writeSubjectPanelCache(key: string, data: SubjectPanelCacheData): void {
  memoryCache.set(key, data);

  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(`roteen_subject_data_${key}`, JSON.stringify(data));
  } catch {
    // Ignore quota errors; memory cache still helps during the session.
  }
}

export function formatVideoPageHeading(subjectName: string): string {
  const isCodingSubject = /javascript|react|programming|computer/i.test(subjectName);
  return isCodingSubject ? `${subjectName} Questions` : `${subjectName} Videos`;
}

function toStandardString(value: unknown): string | null {
  const normalized = String(value ?? "").trim();
  return normalized.length > 0 ? normalized : null;
}

function standardMatches(value: unknown, requestedStandard: string | null): boolean {
  if (!requestedStandard) {
    return true;
  }

  const normalizedValue = String(value ?? "").trim().toLowerCase();
  const normalizedRequested = requestedStandard.trim().toLowerCase();
  if (
    (normalizedRequested === "10" && normalizedValue === "10th") ||
    (normalizedRequested === "10th" && normalizedValue === "10")
  ) {
    return true;
  }
  return normalizedValue === normalizedRequested;
}

async function fetchSubjectRow(filter: VideoSubjectFilter) {
  const requestedStandard = toStandardString(filter.standard);
  const effectiveStandard = requestedStandard ?? String(DEFAULT_STANDARD);

  if (filter.subjectId) {
    let query = supabase
      .from("subjects")
      .select("id, subject_name, standard")
      .eq("id", filter.subjectId);

    if (requestedStandard) {
      query = query.eq("standard", requestedStandard);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      return data;
    }

    throw new Error("Selected subject is invalid for the requested standard.");
  }

  const slug = filter.subjectSlug?.trim().toLowerCase();
  if (!slug) {
    const { data, error } = await supabase
      .from("subjects")
      .select("id, subject_name, standard")
      .eq("subject_name", "Math")
      .eq("standard", effectiveStandard)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  }

  const resolvedName = resolveSubjectNameFromSlug(slug);
  if (resolvedName) {
    const { data, error } = await supabase
      .from("subjects")
      .select("id, subject_name, standard")
      .eq("subject_name", resolvedName)
      .eq("standard", effectiveStandard)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      return data;
    }
  }

  const fuzzyTerm = slug.replace(/-/g, " ");
  const { data: fuzzyRows, error: fuzzyError } = await supabase
    .from("subjects")
    .select("id, subject_name, standard")
    .ilike("subject_name", `%${fuzzyTerm}%`)
    .eq("standard", effectiveStandard)
    .limit(5);

  if (fuzzyError) {
    throw fuzzyError;
  }

  const fuzzyMatch = fuzzyRows?.find((row: any) => standardMatches(row.standard, effectiveStandard)) ?? fuzzyRows?.[0] ?? null;

  if (fuzzyMatch) {
    return fuzzyMatch;
  }

  return null;
}

export async function fetchSubjectPanelData(
  filter: VideoSubjectFilter,
  options?: { forceRefresh?: boolean },
): Promise<SubjectPanelCacheData> {
  const cacheKey = getSubjectPanelCacheKey(filter);
  const shouldUseCache = !options?.forceRefresh;
  const cached = shouldUseCache ? readSubjectPanelCache(cacheKey) : null;
  if (cached && shouldUseCache) {
    return cached;
  }

  const inflightKey = options?.forceRefresh ? `${cacheKey}|fresh` : cacheKey;
  const inflight = inflightSubjectPanelRequests.get(inflightKey);
  if (inflight) {
    return inflight;
  }

  const fetchPromise = (async () => {
    console.log("=== FILTER ===", filter);

    const subject = await fetchSubjectRow(filter);

    console.log("=== SUBJECT ===", subject);
    if (!subject) {
      throw new Error("Subject not found.");
    }

    const subjectId = String(subject.id);
    const subjectStandard = toStandardString(subject.standard) ?? null;

    const chapterQuery = supabase
      .from("chapters")
      .select("id, chapter_no, name")
      .eq("subject_id", subjectId)
      .order("chapter_no", { ascending: true });

    const buildQuestionQuery = () => {
      const query = supabase
        .from("questions")
        .select("*")
        .eq("subject_id", subjectId)
        .order("chapter_id", { ascending: true })
        .order("id", { ascending: true });

      return query;
    };

    const buildQuizQuery = () => {
      return supabase
        .from("quizzes")
        .select("id, chapter_id, title, mode")
        .eq("subject_id", subjectId);
    };

    const [chapterResult, initialQuestionResult, quizResult] = await Promise.all([
      chapterQuery,
      buildQuestionQuery(),
      buildQuizQuery(),
    ]);

    console.log("=== CHAPTER RESULT ===", chapterResult);
    console.log("=== QUESTION RESULT ===", initialQuestionResult);
    console.log("=== QUIZ RESULT ===", quizResult);

    let chapterRows = chapterResult.data;
    const chapterError = chapterResult.error;
    let questionRows = initialQuestionResult.data;
    const questionError = initialQuestionResult.error;
    let quizRows = quizResult.data;
    const quizError = quizResult.error;

    if (chapterError) {
      console.error("CHAPTER ERROR", chapterError);
      throw chapterError;
    }

    if (questionError) {
      console.error("QUESTION ERROR", questionError);
      throw questionError;
    }

    // Some questions can reference chapter ids that are not returned by the strict
    // subject_id chapter query (data mismatch or delayed sync). Pull those chapter
    // rows by id so the UI can render real chapter names instead of synthetic labels.
    const normalizedQuestionRows = (questionRows ?? []).map((row: any) => ({
      ...row,
      question_name: row.question_name || row.title || row.question || row.question_text || row.name || row.text || `Question ${row.id}`,
    })) as unknown as SubjectPanelCacheData["questions"];
    const existingChapterIds = new Set((chapterRows ?? []).map((chapter: any) => String(chapter.id)));
    const referencedChapterIds = Array.from(
      new Set(
        normalizedQuestionRows
          .map((question) => String(question.chapter_id ?? "").trim())
          .filter(Boolean),
      ),
    );
    const missingChapterIds = referencedChapterIds.filter((id) => !existingChapterIds.has(id));

    if (missingChapterIds.length > 0) {
      const { data: backfilledChapters, error: backfillError } = await supabase
        .from("chapters")
        .select("id, chapter_no, name")
        .in("id", missingChapterIds);

      if (!backfillError && backfilledChapters && backfilledChapters.length > 0) {
        chapterRows = [...(chapterRows ?? []), ...backfilledChapters];
      }
    }

    const payload: SubjectPanelCacheData = {
      subject: subject.subject_name || "Math",
      subjectId,
      standard: subjectStandard,
      chapters: chapterRows || [],
      questions: normalizedQuestionRows,
      quizzes: quizRows || [],
    };

    writeSubjectPanelCache(cacheKey, payload);

    console.log("=== PAYLOAD ===", {
      subjectId,
      chapters: chapterRows?.length,
      questions: questionRows?.length,
    });

    return payload;
  })();

  inflightSubjectPanelRequests.set(inflightKey, fetchPromise);

  try {
    return await fetchPromise;
  } finally {
    inflightSubjectPanelRequests.delete(inflightKey);
  }
}

export function prefetchSubjectPanelData(filter: VideoSubjectFilter): void {
  const cacheKey = getSubjectPanelCacheKey(filter);
  if (readSubjectPanelCache(cacheKey)) {
    return;
  }

  void fetchSubjectPanelData(filter).catch(() => {
    // Prefetch is best-effort.
  });
}
