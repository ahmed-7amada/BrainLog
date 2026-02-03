/**
 * User Settings Model
 * Represents user preferences and configuration
 */

export interface UserSettings {
  id: string; // Same as user_id
  user_id: string;
  theme: ThemeMode;
  notifications_enabled: boolean;
  daily_reminder_time: string; // HH:mm format (24-hour)
  habit_reminder_time: string; // HH:mm format (24-hour)
  weekly_review_day: WeekDay;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export type WeekDay =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';
