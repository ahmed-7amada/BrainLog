/**
 * Settings Slice
 * Manages user settings and app preferences
 */

import { StateCreator } from 'zustand';
import type { UserSettings, Theme } from '../../models/UserSettings';

export interface SettingsSlice {
  // State
  settings: UserSettings | null;
  systemColorScheme: 'light' | 'dark';

  // Actions
  setSettings: (settings: UserSettings | null) => void;
  updateSettings: (updates: Partial<UserSettings>) => void;
  setTheme: (theme: Theme) => void;
  toggleNotifications: () => void;
  setDailyReminderTime: (time: string) => void;
  setHabitReminderTime: (time: string) => void;
  setSystemColorScheme: (scheme: 'light' | 'dark') => void;
  clearSettings: () => void;
}

export const createSettingsSlice: StateCreator<SettingsSlice> = (set, _get) => ({
  // Initial state
  settings: null,
  systemColorScheme: 'light',

  // Actions
  setSettings: settings => set({ settings }),

  updateSettings: updates =>
    set(state => {
      if (!state.settings) return state;
      return {
        settings: {
          ...state.settings,
          ...updates,
          updatedAt: Date.now(),
        },
      };
    }),

  setTheme: theme =>
    set(state => {
      if (!state.settings) return state;
      return {
        settings: {
          ...state.settings,
          theme,
          updatedAt: Date.now(),
        },
      };
    }),

  toggleNotifications: () =>
    set(state => {
      if (!state.settings) return state;
      return {
        settings: {
          ...state.settings,
          notificationsEnabled: !state.settings.notificationsEnabled,
          updatedAt: Date.now(),
        },
      };
    }),

  setDailyReminderTime: dailyReminderTime =>
    set(state => {
      if (!state.settings) return state;
      return {
        settings: {
          ...state.settings,
          dailyReminderTime,
          updatedAt: Date.now(),
        },
      };
    }),

  setHabitReminderTime: habitReminderTime =>
    set(state => {
      if (!state.settings) return state;
      return {
        settings: {
          ...state.settings,
          habitReminderTime,
          updatedAt: Date.now(),
        },
      };
    }),

  setSystemColorScheme: systemColorScheme => set({ systemColorScheme }),

  clearSettings: () => set({ settings: null }),
});

// Selectors
export const selectEffectiveTheme = (state: SettingsSlice): 'light' | 'dark' => {
  if (!state.settings) return state.systemColorScheme;

  if (state.settings.theme === 'system') {
    return state.systemColorScheme;
  }

  return state.settings.theme;
};
