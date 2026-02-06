/**
 * User Settings Model
 * Represents user preferences (FR-056)
 */

export type Theme = 'light' | 'dark' | 'system';
export type WeekDay =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

export interface UserSettings {
  id: string;
  userId: string;
  theme: Theme;
  notificationsEnabled: boolean;
  dailyReminderTime: string; // HH:mm format
  habitReminderTime: string; // HH:mm format
  weeklySummaryDay: WeekDay;
  createdAt: number;
  updatedAt: number;
}

export interface CreateUserSettingsInput {
  userId: string;
  theme?: Theme;
  notificationsEnabled?: boolean;
  dailyReminderTime?: string;
  habitReminderTime?: string;
  weeklySummaryDay?: WeekDay;
}

export const createUserSettings = (input: CreateUserSettingsInput): UserSettings => ({
  id: generateId(),
  userId: input.userId,
  theme: input.theme || 'system',
  notificationsEnabled: input.notificationsEnabled ?? true,
  dailyReminderTime: input.dailyReminderTime || '09:00',
  habitReminderTime: input.habitReminderTime || '20:00',
  weeklySummaryDay: input.weeklySummaryDay || 'sunday',
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export const DEFAULT_SETTINGS: Omit<UserSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
  theme: 'system',
  notificationsEnabled: true,
  dailyReminderTime: '09:00',
  habitReminderTime: '20:00',
  weeklySummaryDay: 'sunday',
};

const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
