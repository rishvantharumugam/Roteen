import { supabase } from '@/lib/supabase/client';

export interface NavItem {
  id: string;
  label: string;
}

export interface Topic {
  id: string;
  title: string;
  mark?: string;
}

export interface Chapter {
  id: string;
  label: string;
  title: string;
  completion: number;
  topics: Topic[];
}

export interface VideoData {
  brand: string;
  menu: NavItem[];
  subject: string;
  chapterCounter: string;
  chapters: Chapter[];
  theoryTitle: string;
  theoryDescription: string;
}

export interface VideoState {
  activeChapterId: string;
  activeCenterTab: "notes" | "assistant";
  activeRightTab: "theory" | "discussion" | "quick_revision";
  notes: string;
  selectedQuestionId: string | null;
  selectedQuizId: string | null;
  completedQuestions: string[];
  likes: number;
  dislikes: number;
  disliked: boolean;
}

export interface SubjectWithChapters {
  subjectId: string;
  subjectName: string;
  chapters: Chapter[];
}

export type QuestionMode = "Bookback" | "Interior";

export type VideoAction =
  | { type: "chapter"; payload: string }
  | { type: "question-select"; payload: string | null }
  | { type: "quiz-select"; payload: string | null }
  | { type: "center-tab"; payload: "notes" | "assistant" }
  | { type: "right-tab"; payload: "theory" | "discussion" | "quick_revision" }
  | { type: "notes"; payload: string }
  | { type: "mark-complete" }
  | { type: "like" }
  | { type: "toggle-dislike" };



type RowRecord = Record<string, unknown>;

function getRowValue(row: RowRecord, keys: string[]): unknown {
  for (const key of keys) {
    if (key in row) {
      return row[key];
    }
  }
  return undefined;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function toChapter(row: RowRecord, index: number): Chapter {
  const chapterNo = toNumber(getRowValue(row, ["chapter_no", "chapterNo", "number"]), index + 1);
  const chapterTitle = String(
    getRowValue(row, ["title", "chapter_title", "chapter_name", "name"]) ?? `Chapter ${chapterNo}`,
  );
  const chapterId = String(getRowValue(row, ["id", "chapter_id"]) ?? `chapter-${chapterNo}`);
  const completion = toNumber(
    getRowValue(row, ["completion", "completion_percentage", "progress"]),
    0,
  );

  return {
    id: chapterId,
    label: `CHAPTER ${chapterNo}`,
    title: chapterTitle,
    completion,
    topics: [],
  };
}

function toTopic(row: RowRecord, index: number): Topic {
  const topicId = String(getRowValue(row, ["id", "question_id", "topic_id"]) ?? `topic-${index + 1}`);
  const topicTitle = String(
    getRowValue(row, ["question_name", "title", "question", "question_text", "topic_title", "name"]) ?? `Question ${index + 1}`,
  );
  const markValue = getRowValue(row, ["mark", "marks"]);

  return {
    id: topicId,
    title: topicTitle,
    ...(markValue !== undefined && markValue !== null ? { mark: String(markValue).toUpperCase() } : {}),
  };
}

function subjectMatchesStandard(row: RowRecord, standard: number): boolean {
  const standardValue = getRowValue(row, ["standard", "std", "grade", "class", "standard_no"]);

  if (standardValue === undefined || standardValue === null) {
    return true;
  }

  return String(standardValue).toLowerCase().includes(String(standard));
}

export function getVideoData(): VideoData {
  return {
    brand: "Roteen",
    menu: [
      { id: "home", label: "Home" },
      { id: "dashboard", label: "Dashboard" },
      { id: "notes", label: "Notes" },
      { id: "revision", label: "Revision" },
      { id: "sessions-link", label: "Sessions" },
      { id: "profile", label: "Profile" },
    ],
    subject: "Math",
    chapterCounter: "1/3",
    chapters: [
      {
        id: "chapter-1",
        label: "CHAPTER 1",
        title: "Mathematical Induction",
        completion: 0,
        topics: [
          { id: "topic-1", title: "What is Mathematical Induction" },
          { id: "topic-2", title: "What is Adjacent Angle" },
        ],
      },
      { id: "chapter-2", label: "CHAPTER 2", title: "Graph", completion: 0, topics: [] },
      { id: "chapter-3", label: "CHAPTER 3", title: "chapter-03", completion: 0, topics: [] },
    ],
    theoryTitle: "Mathematical Induction",
    theoryDescription: "A focused theory workspace with premium motion and soft visual depth.",
  };
}

interface SubjectRow {
  id: string | number;
  standard: number | string | null;
  subject_name: string | null;
}

interface ChapterRow {
  id: string | number;
  chapter_no: number | string | null;
  name: string | null;
}

interface QuestionRow {
  id: string | number;
  chapter_id: string | number | null;
  question_name: string | null;
  mode: string | null;
  standard?: number | string | null;
}

export interface SubjectQuestionItem {
  id: string;
  question_name: string;
  mode: QuestionMode;
}

export interface ChapterQuestionsGroup {
  chapter_id: string;
  chapter_name: string;
  chapter_no: number;
  questions: SubjectQuestionItem[];
}

export interface SubjectQuestionsByMode {
  subject_id: string;
  subject_name: string;
  standard: number;
  chapters: ChapterQuestionsGroup[];
}

export interface SubjectChapterListData {
  subject_id: string;
  subject_name: string;
  standard: number;
  chapters: Chapter[];
}

function isStandardTen(value: unknown): boolean {
  return String(value ?? "").trim() === "10";
}

export async function fetchSubjectChaptersQuestionsByMode(
  mode: QuestionMode,
): Promise<SubjectQuestionsByMode | null> {
  const { data: subjectRows, error: subjectError } = await supabase
    .from("subjects")
    .select("id, standard, subject_name")
    .eq("subject_name", "Math");

  if (subjectError) {
    throw new Error(`Failed to fetch subject: ${subjectError.message}`);
  }

  const subjects = (subjectRows ?? []) as SubjectRow[];
  const subject = subjects.find((row) => isStandardTen(row.standard));

  if (!subject) {
    return null;
  }

  const subjectId = String(subject.id);

  const { data: chapterRows, error: chapterError } = await supabase
    .from("chapters")
    .select("id, chapter_no, name")
    .eq("subject_id", subjectId)
    .order("chapter_no", { ascending: true });

  if (chapterError) {
    throw new Error(`Failed to fetch chapters: ${chapterError.message}`);
  }

  const chapters = ((chapterRows ?? []) as ChapterRow[]).map((row, index) => ({
    chapter_id: String(row.id).trim().toLowerCase(),
    chapter_name: String(row.name ?? ""),
    chapter_no: toNumber(row.chapter_no, index + 1),
    questions: [],
  })) as ChapterQuestionsGroup[];

  const { data: questionRows, error: questionError } = await supabase
    .from("questions")
    .select("*")
    .eq("subject_id", subjectId)
    .order("chapter_id", { ascending: true })
    .order("id", { ascending: true });

  if (questionError) {
    throw new Error(`Failed to fetch questions: ${questionError.message}`);
  }

  const requestedMode = mode.toLowerCase();

  const groupedQuestions = ((questionRows ?? []) as QuestionRow[]).reduce(
    (accumulator, row) => {
      const chapterId = String(row.chapter_id ?? "").trim().toLowerCase();
      if (!chapterId) {
        return accumulator;
      }

      const rowStandard = String(row.standard ?? "").trim().toLowerCase();
      if (rowStandard !== "10" && rowStandard !== "10th") {
        return accumulator;
      }

      const rowMode = String(row.mode ?? "").trim().toLowerCase();
      if (rowMode !== requestedMode) {
        return accumulator;
      }

      const nextQuestions = accumulator.get(chapterId) ?? [];
      const normalizedMode: QuestionMode = rowMode === "interior" ? "Interior" : "Bookback";
      
      // Handle varied schema columns for question text
      const rawRow = row as any;
      const questionNameStr = String(
        rawRow.question_name || rawRow.title || rawRow.question || rawRow.question_text || rawRow.name || rawRow.text || ""
      );

      nextQuestions.push({
        id: String(row.id),
        question_name: questionNameStr,
        mode: normalizedMode,
      });
      accumulator.set(chapterId, nextQuestions);
      return accumulator;
    },
    new Map<string, SubjectQuestionItem[]>(),
  );

  const chaptersWithQuestions = chapters.map((chapter) => ({
    ...chapter,
    questions: groupedQuestions.get(chapter.chapter_id) ?? [],
  }));

  return {
    subject_id: subjectId,
    subject_name: String(subject.subject_name ?? "Math"),
    standard: 10,
    chapters: chaptersWithQuestions,
  };
}

export async function fetchStandardTenMathChapters(): Promise<SubjectChapterListData | null> {
  const { data: subjectRows, error: subjectError } = await supabase
    .from("subjects")
    .select("id, standard, subject_name")
    .eq("subject_name", "Math");

  if (subjectError) {
    throw new Error(`Failed to fetch subject: ${subjectError.message}`);
  }

  const subjects = (subjectRows ?? []) as SubjectRow[];
  const subject = subjects.find((row) => isStandardTen(row.standard));

  if (!subject) {
    return null;
  }

  const selectedSubjectId = String(subject.id);

  const { data: chapterRows, error: chapterError } = await supabase
    .from("chapters")
    .select("id, chapter_no, name")
    .eq("subject_id", selectedSubjectId)
    .order("chapter_no", { ascending: true });

  if (chapterError) {
    throw new Error(`Failed to fetch chapters: ${chapterError.message}`);
  }

  const chapters = ((chapterRows ?? []) as ChapterRow[]).map((row, index) => {
    const chapterNo = toNumber(row.chapter_no, index + 1);
    return {
      id: String(row.id),
      label: `Chapter ${chapterNo}`,
      title: String(row.name ?? ""),
      completion: 0,
      topics: [],
    };
  });

  return {
    subject_id: selectedSubjectId,
    subject_name: String(subject.subject_name ?? "Math"),
    standard: 10,
    chapters,
  };
}

export async function getSubjectsAndChapters(
  subjectName = "Math",
  standard = 10,
  mode: QuestionMode = "Bookback",
): Promise<SubjectWithChapters> {
  if (!supabase) {
    throw new Error(
      "Supabase client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const { data: subjects, error: subjectError } = await supabase
    .from("subjects")
    .select("*");

  if (subjectError) {
    throw new Error(`Failed to fetch subjects: ${subjectError.message}`);
  }

  const normalizedTarget = subjectName.trim().toLowerCase();
  const subjectRows = (subjects ?? []) as RowRecord[];

  const matchedSubject = subjectRows.find((row) => {
    const name = String(getRowValue(row, ["name", "subject", "subject_name"]) ?? "").trim().toLowerCase();
    if (name !== normalizedTarget) {
      return false;
    }

    return subjectMatchesStandard(row, standard);
  });

  if (!matchedSubject) {
    throw new Error(`Subject '${subjectName}' for Standard ${standard} not found.`);
  }

  const subjectId = String(getRowValue(matchedSubject, ["id", "subject_id"]) ?? "");
  if (!subjectId) {
    throw new Error("Subject id is missing in subjects table row.");
  }

  const { data: chapterRows, error: chapterError } = await supabase
    .from("chapters")
    .select("*")
    .eq("subject_id", subjectId)
    .order("chapter_no", { ascending: true });

  if (chapterError) {
    throw new Error(`Failed to fetch chapters: ${chapterError.message}`);
  }

  const chapters = ((chapterRows ?? []) as RowRecord[]).map((row, index) => toChapter(row, index));
  const chaptersById = new Map(chapters.map((chapter) => [chapter.id, chapter] as const));

  const { data: questionRows, error: questionError } = await supabase
    .from("questions")
    .select("*")
    .eq("subject_id", subjectId)
    .eq("mode", mode)
    .order("chapter_no", { ascending: true })
    .order("question_no", { ascending: true });

  if (questionError) {
    throw new Error(`Failed to fetch questions: ${questionError.message}`);
  }

  ((questionRows ?? []) as RowRecord[]).forEach((row, index) => {
    const chapterId = String(getRowValue(row, ["chapter_id", "chapterId"]) ?? "");
    if (!chapterId) {
      return;
    }

    const chapter = chaptersById.get(chapterId);
    if (!chapter) {
      return;
    }

    chapter.topics.push(toTopic(row, index));
  });

  return {
    subjectId,
    subjectName: String(getRowValue(matchedSubject, ["name", "subject", "subject_name"]) ?? subjectName),
    chapters,
  };
}

export async function getQuestionsByMode(mode: QuestionMode): Promise<Chapter[]> {
  if (!supabase) {
    throw new Error(
      "Supabase client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const { data: subjectRows, error: subjectError } = await supabase
    .from("subjects")
    .select("id, standard, subject_name")
    .eq("subject_name", "Math");

  if (subjectError) {
    throw new Error(`Failed to fetch subject: ${subjectError.message}`);
  }

  const mathSubject = ((subjectRows ?? []) as RowRecord[]).find((row) => {
    const standard = String(getRowValue(row, ["standard"]) ?? "").trim();
    return standard === "10" || standard.toLowerCase() === "10th";
  });

  if (!mathSubject) {
    return [];
  }

  const subjectId = String(getRowValue(mathSubject, ["id"]) ?? "");
  if (!subjectId) {
    return [];
  }

  const { data: chapterRows, error: chapterError } = await supabase
    .from("chapters")
    .select("id, chapter_no, name")
    .eq("subject_id", subjectId)
    .order("chapter_no", { ascending: true });

  if (chapterError) {
    throw new Error(`Failed to fetch chapters: ${chapterError.message}`);
  }

  const { data: questionRows, error } = await supabase
    .from("questions")
    .select("*")
    .eq("subject_id", subjectId)
    .eq("mode", mode)
    .order("chapter_id", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch questions: ${error.message}`);
  }

  const chapterMap = new Map<string, Chapter>();

  ((chapterRows ?? []) as RowRecord[]).forEach((row, index) => {
    const chapterId = String(getRowValue(row, ["id"]) ?? "");
    if (!chapterId) {
      return;
    }

    const chapterNo = toNumber(getRowValue(row, ["chapter_no"]), index + 1);
    const chapterName = String(getRowValue(row, ["name"]) ?? `Chapter ${chapterNo}`);
    chapterMap.set(chapterId, {
      id: chapterId,
      label: `CHAPTER ${chapterNo}`,
      title: chapterName,
      completion: 0,
      topics: [],
    });
  });

  ((questionRows ?? []) as RowRecord[]).forEach((row, index) => {
    const chapterId = String(getRowValue(row, ["chapter_id"]) ?? "");
    const chapter = chapterMap.get(chapterId);
    if (!chapter) {
      return;
    }

    chapter.topics.push(toTopic(row, index));
  });

  return Array.from(chapterMap.values());
}

export async function getStandardTenMathChapters(): Promise<Chapter[]> {
  if (!supabase) {
    throw new Error(
      "Supabase client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const { data: subjectRows, error: subjectError } = await supabase
    .from("subjects")
    .select("id, standard, subject_name")
    .eq("subject_name", "Math");

  if (subjectError) {
    throw new Error(`Failed to fetch subject: ${subjectError.message}`);
  }

  const mathSubject = ((subjectRows ?? []) as RowRecord[]).find((row) => {
    const standard = String(getRowValue(row, ["standard"]) ?? "").trim();
    return standard === "10" || standard.toLowerCase() === "10th";
  });

  if (!mathSubject) {
    return [];
  }

  const subjectId = String(getRowValue(mathSubject, ["id"]) ?? "");
  if (!subjectId) {
    return [];
  }

  const { data: chapterRows, error: chapterError } = await supabase
    .from("chapters")
    .select("id, chapter_no, name")
    .eq("subject_id", subjectId)
    .order("chapter_no", { ascending: true });

  if (chapterError) {
    throw new Error(`Failed to fetch chapters: ${chapterError.message}`);
  }

  const { data: questionRows, error } = await supabase
    .from("questions")
    .select("*")
    .eq("subject_id", subjectId)
    .order("chapter_id", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch questions: ${error.message}`);
  }

  const chapterMap = new Map<string, Chapter>();

  ((chapterRows ?? []) as RowRecord[]).forEach((row, index) => {
    const chapterId = String(getRowValue(row, ["id"]) ?? "");
    if (!chapterId) {
      return;
    }

    const chapterNo = toNumber(getRowValue(row, ["chapter_no"]), index + 1);
    const chapterName = String(getRowValue(row, ["name"]) ?? `Chapter ${chapterNo}`);
    chapterMap.set(chapterId, {
      id: chapterId,
      label: `CHAPTER ${chapterNo}`,
      title: chapterName,
      completion: 0,
      topics: [],
    });
  });

  ((questionRows ?? []) as RowRecord[]).forEach((row, index) => {
    const chapterId = String(getRowValue(row, ["chapter_id"]) ?? "");
    const chapter = chapterMap.get(chapterId);
    if (!chapter) {
      return;
    }

    chapter.topics.push(toTopic(row, index));
  });

  return Array.from(chapterMap.values());
}

export function createInitialState(data: VideoData): VideoState {
  return {
    activeChapterId: data.chapters[0]?.id ?? "",
    activeCenterTab: "notes",
    activeRightTab: "theory",
    notes: "",
    selectedQuestionId: null,
    selectedQuizId: null,
    completedQuestions: [],
    likes: 0,
    dislikes: 0,
    disliked: false,
  };
}

export function setNotesValue(state: VideoState, notes: string): VideoState {
  return { ...state, notes };
}

export function markVideoCompleted(state: VideoState): VideoState {
  if (state.selectedQuestionId === null) {
    return state;
  }

  if (state.completedQuestions.includes(state.selectedQuestionId)) {
    return {
      ...state,
      completedQuestions: state.completedQuestions.filter(
        (questionId) => questionId !== state.selectedQuestionId,
      ),
    };
  }

  return {
    ...state,
    completedQuestions: [...state.completedQuestions, state.selectedQuestionId],
  };
}

export function reduceVideoState(state: VideoState, action: VideoAction): VideoState {
  switch (action.type) {
    case "mark-complete":
      return markVideoCompleted(state);
    case "notes":
      return setNotesValue(state, action.payload);
    case "chapter":
      return { ...state, activeChapterId: action.payload };
    case "question-select":
      return { ...state, selectedQuestionId: action.payload, selectedQuizId: null };
    case "quiz-select":
      return { ...state, selectedQuizId: action.payload, selectedQuestionId: null };
    case "center-tab":
      return { ...state, activeCenterTab: action.payload };
    case "right-tab":
      return { ...state, activeRightTab: action.payload };
    case "like":
      return { ...state, likes: state.likes + 1 };
    case "toggle-dislike":
      if (state.disliked) {
        return {
          ...state,
          disliked: false,
          dislikes: Math.max(0, state.dislikes - 1),
        };
      }
      return { ...state, disliked: true, dislikes: state.dislikes + 1 };
    default:
      return state;
  }
}
