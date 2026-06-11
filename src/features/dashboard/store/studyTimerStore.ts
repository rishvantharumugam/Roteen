import { create } from "zustand";
import { persist } from "zustand/middleware";

// Returns today's date as a stable "YYYY-MM-DD" string in local time.
function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface StudyTimerState {
  /** Seconds studied today */
  timeSpentSeconds: number;
  /** Daily goal in seconds */
  dailyGoalSeconds: number;
  /** The calendar date (YYYY-MM-DD) for which timeSpentSeconds applies */
  lastActiveDate: string;
  /** True if the user has already been shown the goal achieved modal today */
  hasShownGoalModal: boolean;

  incrementTime: () => void;
  setDailyGoalMinutes: (minutes: number) => void;
  setTimeSpentSeconds: (seconds: number) => void;
  setHasShownGoalModal: (val: boolean) => void;
  /** Called on app open — resets the timer if the stored date is not today */
  resetIfNewDay: () => void;
}

export const useStudyTimerStore = create<StudyTimerState>()(
  persist(
    (set, get) => ({
      timeSpentSeconds: 0,
      dailyGoalSeconds: 3600, // default 60 min
      lastActiveDate: getTodayKey(),
      hasShownGoalModal: false,

      incrementTime: () =>
        set((state) => ({
          timeSpentSeconds: state.timeSpentSeconds + 1,
          // Also keep lastActiveDate up to date as time ticks
          lastActiveDate: getTodayKey(),
        })),

      setDailyGoalMinutes: (minutes) =>
        set(() => ({
          dailyGoalSeconds: minutes * 60,
        })),

      setTimeSpentSeconds: (seconds) =>
        set(() => ({
          timeSpentSeconds: seconds,
        })),

      setHasShownGoalModal: (val) =>
        set(() => ({
          hasShownGoalModal: val,
        })),

      resetIfNewDay: () => {
        const today = getTodayKey();
        if (get().lastActiveDate !== today) {
          set({
            timeSpentSeconds: 0,
            hasShownGoalModal: false,
            lastActiveDate: today,
          });
        }
      },
    }),
    {
      name: "roteen-study-timer-state",
      // Only persist what matters; actions are excluded by Zustand automatically
    }
  )
);
