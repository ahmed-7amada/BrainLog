/**
 * Habit Log Entry Model
 * Represents daily habit completion status
 */

export interface HabitLogEntry {
  id: string; // Format: {userId}_{YYYY-MM-DD}
  user_id: string;
  date_key: string; // YYYY-MM-DD
  habit_completions: {[habitId: string]: boolean}; // Map of habit ID to completion status
  created_at: number; // Timestamp
  updated_at: number; // Timestamp
}
