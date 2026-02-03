/**
 * Progress Slice
 * Manages daily progress and streak state
 */

import {StateCreator} from 'zustand';
import {DailyProgress} from '@/models';

export interface ProgressSlice {
  todayProgress: DailyProgress | null;
  currentStreak: number;
  longestStreak: number;
  xpPoints: number;
  currentLevel: number;

  // Actions
  setTodayProgress: (progress: DailyProgress) => void;
  updateStreak: (current: number, longest: number) => void;
  updateXP: (xp: number, level: number) => void;
  incrementCardsReviewed: () => void;
  incrementNotesCreated: () => void;
  addXP: (amount: number) => void;
}

export const createProgressSlice: StateCreator<ProgressSlice> = set => ({
  todayProgress: null,
  currentStreak: 0,
  longestStreak: 0,
  xpPoints: 0,
  currentLevel: 1,

  setTodayProgress: progress => set({todayProgress: progress}),

  updateStreak: (current, longest) =>
    set({
      currentStreak: current,
      longestStreak: longest,
    }),

  updateXP: (xp, level) =>
    set({
      xpPoints: xp,
      currentLevel: level,
    }),

  incrementCardsReviewed: () =>
    set(state => ({
      todayProgress: state.todayProgress
        ? {
            ...state.todayProgress,
            cards_reviewed_count: state.todayProgress.cards_reviewed_count + 1,
          }
        : null,
    })),

  incrementNotesCreated: () =>
    set(state => ({
      todayProgress: state.todayProgress
        ? {
            ...state.todayProgress,
            notes_created_count: state.todayProgress.notes_created_count + 1,
          }
        : null,
    })),

  addXP: amount =>
    set(state => ({
      xpPoints: state.xpPoints + amount,
    })),
});
