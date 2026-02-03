/**
 * Zustand Store
 * Combined store with all slices and persistence
 */

import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {createAuthSlice, AuthSlice} from './slices/authSlice';
import {createFlashcardsSlice, FlashcardsSlice} from './slices/flashcardsSlice';
import {createNotesSlice, NotesSlice} from './slices/notesSlice';
import {createProgressSlice, ProgressSlice} from './slices/progressSlice';
import {createSettingsSlice, SettingsSlice} from './slices/settingsSlice';

// Combined store type
export type AppStore = AuthSlice &
  FlashcardsSlice &
  NotesSlice &
  ProgressSlice &
  SettingsSlice;

// Create the store with persistence
export const useStore = create<AppStore>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createFlashcardsSlice(...a),
      ...createNotesSlice(...a),
      ...createProgressSlice(...a),
      ...createSettingsSlice(...a),
    }),
    {
      name: 'learntracker-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Persist only specific slices (exclude auth for security)
      partialize: state => ({
        // Auth - persist minimal data
        isAuthenticated: state.isAuthenticated,

        // Flashcards - persist for offline access
        flashcards: state.flashcards,
        dueFlashcards: state.dueFlashcards,

        // Notes - persist for offline access
        notes: state.notes,

        // Progress - persist for continuity
        todayProgress: state.todayProgress,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        xpPoints: state.xpPoints,
        currentLevel: state.currentLevel,

        // Settings - always persist
        theme: state.theme,
        notificationsEnabled: state.notificationsEnabled,
        dailyReminderTime: state.dailyReminderTime,
        habitReminderTime: state.habitReminderTime,
        weeklyReviewDay: state.weeklyReviewDay,
      }),
    },
  ),
);

// Selectors for easy access
export const selectAuth = (state: AppStore) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
});

export const selectFlashcards = (state: AppStore) => ({
  flashcards: state.flashcards,
  dueFlashcards: state.dueFlashcards,
  currentReviewSession: state.currentReviewSession,
  currentReviewIndex: state.currentReviewIndex,
  isReviewActive: state.isReviewActive,
});

export const selectNotes = (state: AppStore) => ({
  notes: state.notes,
  selectedFolder: state.selectedFolder,
  selectedCategory: state.selectedCategory,
});

export const selectProgress = (state: AppStore) => ({
  todayProgress: state.todayProgress,
  currentStreak: state.currentStreak,
  longestStreak: state.longestStreak,
  xpPoints: state.xpPoints,
  currentLevel: state.currentLevel,
});

export const selectSettings = (state: AppStore) => ({
  theme: state.theme,
  notificationsEnabled: state.notificationsEnabled,
  dailyReminderTime: state.dailyReminderTime,
  habitReminderTime: state.habitReminderTime,
  weeklyReviewDay: state.weeklyReviewDay,
});
