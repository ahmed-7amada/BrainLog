/**
 * Progress Slice
 * Manages daily progress and gamification state
 */

import { StateCreator } from 'zustand';
import type { DailyProgress } from '../../models/DailyProgress';
import type { HabitDefinition } from '../../models/HabitDefinition';
import type { HabitLogEntry } from '../../models/HabitLogEntry';

export interface ProgressSlice {
  // State
  todayProgress: DailyProgress | null;
  currentStreak: number;
  longestStreak: number;
  xpPoints: number;
  currentLevel: number;
  habits: HabitDefinition[];
  todayHabitLog: HabitLogEntry | null;
  // T385 - Track last viewed weekly summary for unread badge
  lastViewedWeekKey: string | null;
  latestWeekKey: string | null;

  // Actions
  setTodayProgress: (progress: DailyProgress | null) => void;
  updateTodayProgress: (updates: Partial<DailyProgress>) => void;
  incrementProgressStat: (
    stat: keyof Pick<
      DailyProgress,
      | 'cardsReviewedCount'
      | 'cardsCorrectCount'
      | 'cardsIncorrectCount'
      | 'newCardsCount'
      | 'notesCreatedCount'
      | 'videosAddedCount'
      | 'voiceNotesCount'
      | 'bookmarksAddedCount'
      | 'xpEarned'
    >,
  ) => void;
  setStreak: (streak: number) => void;
  setXP: (xp: number, level: number) => void;
  addXP: (amount: number) => void;
  setHabits: (habits: HabitDefinition[]) => void;
  setTodayHabitLog: (log: HabitLogEntry | null) => void;
  toggleHabitCompletion: (habitId: string) => void;
  clearProgress: () => void;
  // T385 - Weekly summary viewed tracking
  markWeeklySummaryViewed: (weekKey: string) => void;
  setLatestWeekKey: (weekKey: string) => void;
}

export const createProgressSlice: StateCreator<ProgressSlice> = (set, _get) => ({
  // Initial state
  todayProgress: null,
  currentStreak: 0,
  longestStreak: 0,
  xpPoints: 0,
  currentLevel: 1,
  habits: [],
  todayHabitLog: null,
  // T385 - Weekly summary tracking
  lastViewedWeekKey: null,
  latestWeekKey: null,

  // Actions
  setTodayProgress: todayProgress => set({ todayProgress }),

  updateTodayProgress: updates =>
    set(state => {
      if (!state.todayProgress) return state;
      return {
        todayProgress: {
          ...state.todayProgress,
          ...updates,
          updatedAt: Date.now(),
        },
      };
    }),

  incrementProgressStat: stat =>
    set(state => {
      if (!state.todayProgress) return state;
      return {
        todayProgress: {
          ...state.todayProgress,
          [stat]: (state.todayProgress[stat] as number) + 1,
          updatedAt: Date.now(),
        },
      };
    }),

  setStreak: currentStreak =>
    set(state => ({
      currentStreak,
      longestStreak: Math.max(state.longestStreak, currentStreak),
    })),

  setXP: (xpPoints, currentLevel) => set({ xpPoints, currentLevel }),

  addXP: amount =>
    set(state => {
      const newXP = state.xpPoints + amount;
      // Calculate new level based on XP thresholds
      const newLevel = calculateLevel(newXP);
      return {
        xpPoints: newXP,
        currentLevel: newLevel,
      };
    }),

  setHabits: habits => set({ habits }),

  setTodayHabitLog: todayHabitLog => set({ todayHabitLog }),

  toggleHabitCompletion: habitId =>
    set(state => {
      if (!state.todayHabitLog) return state;

      const currentValue = state.todayHabitLog.habitCompletions[habitId] || false;
      return {
        todayHabitLog: {
          ...state.todayHabitLog,
          habitCompletions: {
            ...state.todayHabitLog.habitCompletions,
            [habitId]: !currentValue,
          },
          updatedAt: Date.now(),
        },
      };
    }),

  clearProgress: () =>
    set({
      todayProgress: null,
      currentStreak: 0,
      longestStreak: 0,
      xpPoints: 0,
      currentLevel: 1,
      habits: [],
      todayHabitLog: null,
      lastViewedWeekKey: null,
      latestWeekKey: null,
    }),

  // T385 - Mark weekly summary as viewed
  markWeeklySummaryViewed: (weekKey: string) => set({ lastViewedWeekKey: weekKey }),

  setLatestWeekKey: (weekKey: string) => set({ latestWeekKey: weekKey }),
});

// XP Level calculation
const XP_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 100,
  3: 300,
  4: 600,
  5: 1000,
  6: 1500,
  7: 2500,
  8: 4000,
  9: 6000,
  10: 10000,
};

const calculateLevel = (xp: number): number => {
  let level = 1;
  for (let i = 10; i >= 1; i--) {
    if (xp >= XP_THRESHOLDS[i]) {
      level = i;
      break;
    }
  }
  return level;
};

// Selectors
export const selectCompletedHabitsCount = (state: ProgressSlice): number => {
  if (!state.todayHabitLog) return 0;
  return Object.values(state.todayHabitLog.habitCompletions).filter(Boolean).length;
};

export const selectHabitCompletionRate = (state: ProgressSlice): number => {
  if (!state.todayHabitLog || state.habits.length === 0) return 0;
  const completed = selectCompletedHabitsCount(state);
  return Math.round((completed / state.habits.length) * 100);
};

// T385 - Selector for unread weekly summary badge
export const selectHasUnreadWeeklySummary = (state: ProgressSlice): boolean => {
  if (!state.latestWeekKey) return false;
  return state.lastViewedWeekKey !== state.latestWeekKey;
};
