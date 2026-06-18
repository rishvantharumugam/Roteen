import { supabase } from "@/lib/supabase/client";

const quizQuestionsCache = new Map<string, QuizQuestionRecord[]>();
const chapterQuizzesCache = new Map<string, ChapterQuizRecord[]>();
const quizByIdCache = new Map<string, ChapterQuizRecord | null>();
const quizProgressCache = new Map<string, QuizProgressRecord | null>();

function getRowValue(row: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== "") {
      return row[key];
    }
  }
  return undefined;
}

function toNumberValue(value: unknown, fallback = 0): number {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }
  if (typeof value === "string") {
    const num = Number(value);
    if (!Number.isNaN(num)) {
      return num;
    }
  }
  return fallback;
}

function toStringValue(value: unknown, fallback = ""): string {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" && !Number.isNaN(value)) {
    return String(value);
  }
  return fallback;
}

type RowRecord = Record<string, unknown>;

export interface QuizQuestionOption {
  id: string;
  label: string;
  text: string;
}

export interface QuizQuestionRecord {
  id: string;
  questionText: string;
  options: QuizQuestionOption[];
  correctOptionId: string;
}

export interface ChapterQuizRecord {
  id: string;
  subjectId: string;
  chapterId: string;
  title: string;
  totalQuestions: number;
  mode: string;
}

function normalizeQuizRow(row: RowRecord): ChapterQuizRecord | null {
  const id = toStringValue(getRowValue(row, ["id"]));
  if (!id) {
    return null;
  }

  return {
    id: toStringValue(getRowValue(row, ["id"])),
    subjectId: toStringValue(getRowValue(row, ["subject_id", "subjectId"])),
    chapterId: toStringValue(getRowValue(row, ["chapter_id", "chapterId"])),
    title: toStringValue(getRowValue(row, ["title", "name"]), "Chapter Quiz"),
    totalQuestions: toNumberValue(getRowValue(row, ["total_questions", "totalQuestions"]), 0),
    mode: toStringValue(getRowValue(row, ["mode"]), "MCQ"),
  };
}

function normalizeCorrectOptionId(
  correctRaw: string,
  options: QuizQuestionOption[],
): string {
  const normalized = correctRaw.trim().toLowerCase();
  if (!normalized) {
    return options[0]?.id ?? "";
  }

  const byId = options.find((option) => option.id.toLowerCase() === normalized);
  if (byId) {
    return byId.id;
  }

  const byLabel = options.find((option) => option.label.toLowerCase() === normalized);
  if (byLabel) {
    return byLabel.id;
  }

  const byTextExact = options.find((option) => option.text.toLowerCase() === normalized);
  if (byTextExact) {
    return byTextExact.id;
  }

  const byPrefix = options.find((option) => normalized.startsWith(`${option.label.toLowerCase()})`));
  if (byPrefix) {
    return byPrefix.id;
  }

  const numericIndex = Number(normalized);
  if (Number.isFinite(numericIndex) && numericIndex >= 0 && numericIndex < options.length) {
    return options[numericIndex].id;
  }

  return options[0]?.id ?? "";
}

function buildOptionsFromRow(row: RowRecord): QuizQuestionOption[] {
  const optionKeys = ["option_a", "option_b", "option_c", "option_d", "option_e", "option_f"];
  const labels = ["A", "B", "C", "D", "E", "F"];
  const options: QuizQuestionOption[] = [];

  optionKeys.forEach((key, index) => {
    const text = toStringValue(getRowValue(row, [key, `${key.replace("_", "")}`]));
    if (text) {
      options.push({
        id: text,
        label: labels[index],
        text,
      });
    }
  });

  if (options.length > 0) {
    return options;
  }

  const optionsJson = getRowValue(row, ["options", "choices"]);
  if (Array.isArray(optionsJson)) {
    return optionsJson
      .map((entry, index) => {
        if (typeof entry === "string") {
          return {
            id: entry,
            label: labels[index] ?? String(index + 1),
            text: entry,
          };
        }

        if (entry && typeof entry === "object") {
          const optionRow = entry as RowRecord;
          const label = toStringValue(
            getRowValue(optionRow, ["label", "id", "key"]),
            labels[index] ?? String(index + 1),
          );
          const text = toStringValue(getRowValue(optionRow, ["text", "value", "option", "title"]));
          if (!text) {
            return null;
          }
          return { id: text, label, text };
        }

        return null;
      })
      .filter((option): option is QuizQuestionOption => option !== null);
  }

  return [];
}

function normalizeQuizQuestionRow(row: RowRecord, index: number): QuizQuestionRecord | null {
  const questionText = toStringValue(
    getRowValue(row, ["question_text", "question", "text", "title", "question_name"]),
  );
  if (!questionText) {
    return null;
  }

  const options = buildOptionsFromRow(row);
  if (options.length === 0) {
    return null;
  }

  const correctRaw = toStringValue(
    getRowValue(row, ["correct_answer", "correct_option", "answer", "correct"]),
  );

  return {
    id: toStringValue(getRowValue(row, ["id"]), `quiz-question-${index + 1}`),
    questionText,
    options,
    correctOptionId: normalizeCorrectOptionId(correctRaw, options),
  };
}

export async function fetchChapterQuiz(
  subjectId: string,
  chapterId: string,
): Promise<ChapterQuizRecord | null> {
  if (!subjectId || !chapterId) {
    return null;
  }

  const { data, error } = await supabase
    .from("quizzes")
    .select("id, subject_id, chapter_id, title, total_questions, mode")
    .eq("subject_id", subjectId)
    .eq("chapter_id", chapterId)
    .limit(1);

  if (error) {
    throw error;
  }

  const row = (data ?? [])[0] as RowRecord | undefined;
  if (!row) {
    return null;
  }

  return normalizeQuizRow(row);
}

export async function fetchChapterQuizzes(
  subjectId: string,
  chapterId: string,
): Promise<ChapterQuizRecord[]> {
  if (!subjectId || !chapterId) {
    return [];
  }

  const cacheKey = `${subjectId}_${chapterId}`;
  if (chapterQuizzesCache.has(cacheKey)) {
    return chapterQuizzesCache.get(cacheKey)!;
  }

  const { data, error } = await supabase
    .from("quizzes")
    .select("id, subject_id, chapter_id, title, total_questions, mode")
    .eq("subject_id", subjectId)
    .eq("chapter_id", chapterId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const results = (data ?? [])
    .map((row) => normalizeQuizRow(row as RowRecord))
    .filter((row): row is ChapterQuizRecord => row !== null);

  chapterQuizzesCache.set(cacheKey, results);
  return results;
}

export async function fetchQuizById(quizId: string): Promise<ChapterQuizRecord | null> {
  if (!quizId) {
    return null;
  }

  if (quizByIdCache.has(quizId)) {
    return quizByIdCache.get(quizId)!;
  }

  const { data, error } = await supabase
    .from("quizzes")
    .select("id, subject_id, chapter_id, title, total_questions, mode")
    .eq("id", quizId)
    .limit(1);

  if (error) {
    throw error;
  }

  const row = (data ?? [])[0] as RowRecord | undefined;
  if (!row) {
    quizByIdCache.set(quizId, null);
    return null;
  }

  const quiz = normalizeQuizRow(row);
  quizByIdCache.set(quizId, quiz);
  return quiz;
}

export async function fetchQuizQuestions(quizId: string): Promise<QuizQuestionRecord[]> {
  if (!quizId) {
    return [];
  }

  if (quizQuestionsCache.has(quizId)) {
    return quizQuestionsCache.get(quizId)!;
  }

  const columns = "id, question, option_a, option_b, option_c, option_d, correct_option, quizzes_id, created_at";

  const primary = await supabase
    .from("quiz_questions")
    .select(columns)
    .eq("quizzes_id", quizId)
    .order("created_at", { ascending: true });

  let rows = primary.data;
  let error = primary.error;

  if (error && (error.code === "42703" || error.code === "PGRST204")) {
    const fallback = await supabase
      .from("quiz_questions")
      .select(columns)
      .eq("quizzes_id", quizId);
    rows = fallback.data;
    error = fallback.error;
  }

  if (error) {
    throw error;
  }

  const results = (rows ?? [])
    .map((row, index) => normalizeQuizQuestionRow(row, index))
    .filter((row): row is QuizQuestionRecord => row !== null);

  quizQuestionsCache.set(quizId, results);
  return results;
}

export async function saveQuizAnswers(
  userId: string,
  quizId: string,
  answers: { questionId: string; selectedOption: string | undefined; isCorrect: boolean }[]
): Promise<void> {
  if (!userId || !quizId || !answers || answers.length === 0) {
    return;
  }

  const payload = answers.map((ans) => ({
    users_id: userId,
    quizzes_id: quizId,
    quiz_questions_id: ans.questionId,
    selected_option: ans.selectedOption ?? null,
    is_correct: ans.isCorrect,
  }));

  const { error } = await supabase.from("user_quizzes_answers").insert(payload);
  
  if (error) {
    throw error;
  }
}

export interface QuizProgressRecord {
  id: string;
  usersId: string;
  quizzesId: string;
  score: number;
  iscompleted: "In_Progress" | "Resolved";
  startedAt?: string | null;
  completedAt?: string | null;
}

type QuizProgressPayload = {
  users_id?: string;
  quizzes_id?: string;
  score: number;
  iscompleted: "In_Progress" | "Resolved";
  started_at?: string;
  completed_at?: string;
};

export async function fetchQuizAnswers(
  userId: string,
  quizId: string
): Promise<Record<string, string>> {
  if (!userId || !quizId) return {};

  const { data, error } = await supabase
    .from("user_quizzes_answers")
    .select("quiz_questions_id, selected_option, id")
    .eq("users_id", userId)
    .eq("quizzes_id", quizId)
    .order("id", { ascending: false });

  if (error) {
    console.error("Error fetching quiz answers:", error?.message || JSON.stringify(error));
    return {};
  }

  const answers: Record<string, string> = {};
  for (const row of data || []) {
    if (row.quiz_questions_id && !answers[row.quiz_questions_id]) {
      if (row.selected_option !== null && row.selected_option !== undefined) {
        answers[row.quiz_questions_id] = row.selected_option;
      }
    }
  }

  return answers;
}

export async function fetchQuizProgress(
  userId: string,
  quizId: string
): Promise<QuizProgressRecord | null> {
  if (!userId || !quizId) return null;

  const cacheKey = `${userId}_${quizId}`;
  if (quizProgressCache.has(cacheKey)) {
    return quizProgressCache.get(cacheKey)!;
  }

  // Fetch the latest RESOLVED quiz progress so the UI shows the overview of the last completed attempt
  const { data, error } = await supabase
    .from("user_quiz_progress")
    .select("id, users_id, quizzes_id, score, iscompleted, started_at, completed_at")
    .eq("users_id", userId)
    .eq("quizzes_id", quizId)
    .eq("iscompleted", "Resolved")
    .limit(1);

  if (error) {
    console.error("Error fetching quiz progress:", error?.message || JSON.stringify(error));
    return null;
  }
  
  const latest = data?.[0];
  if (!latest) {
    quizProgressCache.set(cacheKey, null);
    return null;
  }

  const progress = {
    id: latest.id,
    usersId: latest.users_id,
    quizzesId: latest.quizzes_id,
    score: latest.score,
    iscompleted: latest.iscompleted,
    startedAt: latest.started_at,
    completedAt: latest.completed_at,
  };

  quizProgressCache.set(cacheKey, progress);
  return progress;
}

export async function insertQuizProgress(
  userId: string,
  quizId: string,
  score: number,
  iscompleted: "In_Progress" | "Resolved",
  startedAt?: string,
  completedAt?: string
): Promise<QuizProgressRecord | null> {
  if (!userId || !quizId) return null;

  const cacheKey = `${userId}_${quizId}`;
  quizProgressCache.delete(cacheKey); // Invalidate cache

  const payload: QuizProgressPayload = {
    users_id: userId,
    quizzes_id: quizId,
    score,
    iscompleted,
    started_at: startedAt || new Date().toISOString(),
  };

  if (iscompleted === "Resolved") {
    payload.completed_at = completedAt || new Date().toISOString();
  }

  const { error } = await supabase
    .from("user_quiz_progress")
    .insert(payload);

  if (error) {
    console.error("Error inserting quiz progress:", error?.message || JSON.stringify(error));
    return null;
  }

  return {
    id: "",
    usersId: userId,
    quizzesId: quizId,
    score,
    iscompleted,
    startedAt: payload.started_at,
    completedAt: payload.completed_at ?? null,
  };
}

export async function updateQuizProgress(
  userId: string,
  quizId: string,
  score: number,
  iscompleted: "In_Progress" | "Resolved",
  startedAt?: string,
  completedAt?: string
): Promise<QuizProgressRecord | null> {
  if (!userId || !quizId) return null;

  const cacheKey = `${userId}_${quizId}`;
  quizProgressCache.delete(cacheKey); // Invalidate cache

  const payload: QuizProgressPayload = { score, iscompleted };

  let resolvedStartedAt = startedAt;
  if (!resolvedStartedAt && iscompleted === "Resolved") {
    const { data, error } = await supabase
      .from("user_quiz_progress")
      .select("started_at")
      .eq("users_id", userId)
      .eq("quizzes_id", quizId)
      .eq("iscompleted", "In_Progress")
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching quiz start time:", error?.message || JSON.stringify(error));
    } else {
      resolvedStartedAt = data?.started_at ?? undefined;
    }
  }

  if (resolvedStartedAt || iscompleted === "Resolved") {
    payload.started_at = resolvedStartedAt || new Date().toISOString();
  }
  if (iscompleted === "Resolved") {
    payload.completed_at = completedAt || new Date().toISOString();
  }

  // We update the In_Progress attempt to Resolved
  const { error, count } = await supabase
    .from("user_quiz_progress")
    .update(payload, { count: "exact" })
    .eq("users_id", userId)
    .eq("quizzes_id", quizId)
    .eq("iscompleted", "In_Progress");

  if (error) {
    console.error("Error updating quiz progress:", error?.message || JSON.stringify(error));
    return null;
  }

  if (count === 0 && iscompleted === "Resolved") {
    return insertQuizProgress(
      userId,
      quizId,
      score,
      iscompleted,
      payload.started_at,
      payload.completed_at,
    );
  }

  return {
    id: "",
    usersId: userId,
    quizzesId: quizId,
    score,
    iscompleted,
    startedAt: payload.started_at ?? null,
    completedAt: payload.completed_at ?? null,
  };
}
