import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  selectedAnswers?: Record<string, string>;
  visitedQuestions?: number[];
  markedQuestions?: number[];
  completedQuestions?: string[];
  updatedAt?: string | number;
}

interface LearningStoreState extends Partial<LearningState> {
  setLearningState: (data: Partial<LearningState>) => void;
  clearLearningState: () => void;
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
      clearLearningState: () =>
        set(() => ({
          subjectId: undefined,
          subjectType: undefined,
          mode: undefined,
          chapterId: undefined,
          topicId: undefined,
          quizId: undefined,
          questionIndex: undefined,
          currentQuestion: undefined,
          currentView: undefined,
          activeTab: undefined,
          notesTab: undefined,
          language: undefined,
          theoryView: undefined,
          scrollPosition: undefined,
          selectedAnswers: undefined,
          visitedQuestions: undefined,
          markedQuestions: undefined,
          completedQuestions: undefined,
          updatedAt: undefined,
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

export function clearLocalLearningState() {
  useLearningStore.getState().clearLearningState();
}
