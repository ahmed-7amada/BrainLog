/**
 * Settings Slice
 * Manages user settings and preferences
 */

import {StateCreator} from 'zustand';
import {ThemeMode, WeekDay} from '@/models/UserSettings';

export interface SettingsSlice {
  theme: ThemeMode;
  notificationsEnabled: boolean;
  dailyReminderTime: string;
  habitReminderTime: string;
  weeklyReviewDay: WeekDay;

  // Actions
  setTheme: (theme: ThemeMode) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setDailyReminderTime: (time: string) => void;
  setHabitReminderTime: (time: string) => void;
  setWeeklyReviewDay: (day: WeekDay) => void;
  loadSettings: (settings: Partial<SettingsSlice>) => void;
}

export const createSettingsSlice: StateCreator<SettingsSlice> = set => ({
  theme: 'system',
  notificationsEnabled: true,
  dailyReminderTime: '09:00',
  habitReminderTime: '20:00',
  weeklyReviewDay: 'sunday',

  setTheme: theme => set({theme}),

  setNotificationsEnabled: enabled => set({notificationsEnabled: enabled}),

  setDailyReminderTime: time => set({dailyReminderTime: time}),

  setHabitReminderTime: time => set({habitReminderTime: time}),

  setWeeklyReviewDay: day => set({weeklyReviewDay: day}),

  loadSettings: settings => set(state => ({...state, ...settings})),
});
