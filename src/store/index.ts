/**
 * Zustand Store Configuration
 * Combines all slices with MMKV persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';

import { AuthSlice, createAuthSlice } from './slices/authSlice';
import { FlashcardsSlice, createFlashcardsSlice } from './slices/flashcardsSlice';
import { NotesSlice, createNotesSlice } from './slices/notesSlice';
import { ProgressSlice, createProgressSlice } from './slices/progressSlice';
import { SettingsSlice, createSettingsSlice } from './slices/settingsSlice';
import { SyncSlice, createSyncSlice } from './slices/syncSlice';
import { UploadSlice, createUploadSlice } from './slices/uploadSlice';

// Try to initialize MMKV, fallback to memory storage if it fails
let zustandStorage: StateStorage;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMMKV } = require('react-native-mmkv');
  const storage = createMMKV({ id: 'brainlog-store' });

  zustandStorage = {
    getItem: (name: string): string | null => {
      const value = storage.getString(name);
      return value ?? null;
    },
    setItem: (name: string, value: string): void => {
      storage.set(name, value);
    },
    removeItem: (name: string): void => {
      storage.remove(name);
    },
  };
} catch (error) {
  console.warn('MMKV not available, using memory storage:', error);
  // Fallback to memory storage
  const memoryStorage: Record<string, string> = {};
  zustandStorage = {
    getItem: (name: string): string | null => {
      return memoryStorage[name] ?? null;
    },
    setItem: (name: string, value: string): void => {
      memoryStorage[name] = value;
    },
    removeItem: (name: string): void => {
      delete memoryStorage[name];
    },
  };
}

// Combined store type
export type AppStore = AuthSlice &
  FlashcardsSlice &
  NotesSlice &
  ProgressSlice &
  SettingsSlice &
  SyncSlice &
  UploadSlice;

// Create the combined store with persistence
export const useStore = create<AppStore>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createFlashcardsSlice(...a),
      ...createNotesSlice(...a),
      ...createProgressSlice(...a),
      ...createSettingsSlice(...a),
      ...createSyncSlice(...a),
      ...createUploadSlice(...a),
    }),
    {
      name: 'brainlog-storage',
      storage: createJSONStorage(() => zustandStorage),
      // Only persist specific parts of the state
      partialize: state => ({
        // Persist user data
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // Persist settings
        settings: state.settings,
        systemColorScheme: state.systemColorScheme,
        // Persist flashcards for offline access
        flashcards: state.flashcards,
        dueCount: state.dueCount,
        // Persist notes for offline access
        notes: state.notes,
        // Persist progress
        todayProgress: state.todayProgress,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        xpPoints: state.xpPoints,
        currentLevel: state.currentLevel,
        habits: state.habits,
        todayHabitLog: state.todayHabitLog,
        // T385 - Persist weekly summary tracking
        lastViewedWeekKey: state.lastViewedWeekKey,
        latestWeekKey: state.latestWeekKey,
        // Feature 003 - Persist upload queue and activity log
        uploadQueue: state.uploadQueue,
        activityLog: state.activityLog,
      }),
    },
  ),
);

// Export selectors from slices
export * from './slices/authSlice';
export * from './slices/flashcardsSlice';
export * from './slices/notesSlice';
export * from './slices/progressSlice';
export * from './slices/settingsSlice';
export * from './slices/syncSlice';
export * from './slices/uploadSlice';

// Convenience hooks for specific state slices
export const useAuth = () =>
  useStore(state => ({
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    error: state.error,
    setUser: state.setUser,
    updateUser: state.updateUser,
    logout: state.logout,
  }));

export const useFlashcards = () =>
  useStore(state => ({
    flashcards: state.flashcards,
    dueCount: state.dueCount,
    isLoading: state.isLoading,
    error: state.error,
    setFlashcards: state.setFlashcards,
    addFlashcard: state.addFlashcard,
    updateFlashcard: state.updateFlashcard,
    removeFlashcard: state.removeFlashcard,
    setDueCount: state.setDueCount,
  }));

export const useNotes = () =>
  useStore(state => ({
    notes: state.notes,
    isLoading: state.isLoading,
    error: state.error,
    setNotes: state.setNotes,
    addNote: state.addNote,
    updateNote: state.updateNote,
    removeNote: state.removeNote,
  }));

export const useProgress = () =>
  useStore(state => ({
    todayProgress: state.todayProgress,
    currentStreak: state.currentStreak,
    longestStreak: state.longestStreak,
    xpPoints: state.xpPoints,
    currentLevel: state.currentLevel,
    habits: state.habits,
    todayHabitLog: state.todayHabitLog,
    setTodayProgress: state.setTodayProgress,
    setStreak: state.setStreak,
    addXP: state.addXP,
    setHabits: state.setHabits,
    toggleHabitCompletion: state.toggleHabitCompletion,
  }));

export const useSettings = () =>
  useStore(state => ({
    settings: state.settings,
    systemColorScheme: state.systemColorScheme,
    setSettings: state.setSettings,
    updateSettings: state.updateSettings,
    setTheme: state.setTheme,
    toggleNotifications: state.toggleNotifications,
    setSystemColorScheme: state.setSystemColorScheme,
  }));

export const useSync = () =>
  useStore(state => ({
    isOnline: state.isOnline,
    isSyncing: state.isSyncing,
    syncError: state.syncError,
    lastSyncAt: state.lastSyncAt,
    pendingCounts: state.pendingCounts,
    setOnline: state.setOnline,
    setSyncing: state.setSyncing,
    setSyncError: state.setSyncError,
    setLastSyncAt: state.setLastSyncAt,
    setActiveListener: state.setActiveListener,
    updatePendingCount: state.updatePendingCount,
  }));

export const useUpload = () =>
  useStore(state => ({
    uploadQueue: state.uploadQueue,
    activeUploads: state.activeUploads,
    activityLog: state.activityLog,
    activeCount: state.activeCount,
    failedCount: state.failedCount,
    enqueueUpload: state.enqueueUpload,
    startUpload: state.startUpload,
    updateUploadProgress: state.updateUploadProgress,
    completeUpload: state.completeUpload,
    failUpload: state.failUpload,
    retryUpload: state.retryUpload,
    cancelUpload: state.cancelUpload,
    addActivityEntry: state.addActivityEntry,
    updateActivityProgress: state.updateActivityProgress,
    updateActivityStatus: state.updateActivityStatus,
    clearOldActivity: state.clearOldActivity,
  }));
