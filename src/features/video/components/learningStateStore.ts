import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase/client";

export type LearningMode = "Bookback" | "Interior";
export type LearningLanguage = "English" | "Tamil" | string;

export interface LearningState {
  subjectId: string;
  subjectType?: LearningMode;
  mode: LearningMode;
  chapterId: string;
  topicId?: string;
  quizId?: string;
  questionIndex?: number;
  currentQuestion?: number;
  currentView: "topic" | "quiz" | "quiz_result";
  activeTab?: string;
  notesTab?: string;
  language?: LearningLanguage;
  theoryView?: boolean;
  scrollPosition?: number;
  videoPosition?: number;
  selectedAnswers?: Record<string, string>;
  visitedQuestions?: number[];
  markedQuestions?: number[];
  completedQuestions?: string[];
  updatedAt?: string | number;
}

interface LearningStoreState extends Partial<LearningState> {
  setLearningState: (data: Partial<LearningState>) => void;
}

export const useLearningStore = create<LearningStoreState>()(
  persist(
    (set) => ({
      setLearningState: (data) =>
        set((state) => ({
          ...state,
          ...data,
          updatedAt: new Date().toISOString(),
        })),
    }),
    {
      name: "learning-state",
    }
  )
);

export function readLearningState(): LearningState | null {
  const state = useLearningStore.getState();
  if (!state.subjectId || !state.mode || !state.chapterId || !state.currentView) {
    return null;
  }
  return state as LearningState;
}

export function writeLearningState(state: LearningState) {
  useLearningStore.getState().setLearningState(state);
}

export async function fetchRemoteLearningState(userId: string): Promise<LearningState | null> {
  const { data, error } = await supabase
    .from("user_learning_progress")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.warn("Failed to fetch remote learning state", error.message || error);
    return null;
  }

  if (!data) return null;

  return {
    subjectId: data.subject_id,
    mode: data.mode as LearningMode,
    subjectType: data.mode as LearningMode,
    chapterId: data.chapter_id,
    topicId: data.topic_id ?? undefined,
    quizId: data.quiz_id ?? undefined,
    questionIndex: data.question_index ?? 0,
    currentQuestion: data.question_index ?? 0,
    // Infer the view from the presence of quiz vs topic
    currentView: data.quiz_id ? "quiz" : "topic",
    updatedAt: data.updated_at,
  } as LearningState;
}

export async function persistRemoteLearningState(userId: string, state: LearningState) {
  const { error } = await supabase.from("user_learning_progress").upsert(
    {
      user_id: userId,
      subject_id: state.subjectId,
      mode: state.mode,
      chapter_id: state.chapterId,
      topic_id: state.topicId ?? null,
      quiz_id: state.quizId ?? null,
      question_index: state.questionIndex ?? 0,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" } // Upsert based on user_id assuming one active state per user
  );

  if (error) {
    console.warn("Failed to persist learning state to Supabase", error.message || error);
  }
}
