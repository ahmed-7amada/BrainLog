/**
 * Daily Progress Model
 * Represents aggregated daily statistics
 */

export interface DailyProgress {
  id: string; // Format: {userId}_{YYYY-MM-DD}
  user_id: string;
  date_key: string; // YYYY-MM-DD

  // Flashcard metrics
  cards_reviewed_count: number;
  cards_correct_count: number;
  cards_incorrect_count: number;
  new_cards_count: number;

  // Content metrics
  notes_created_count: number;
  videos_added_count: number;
  voice_notes_count: number;
  bookmarks_added_count: number;

  // Activity metrics
  study_minutes: number;
  xp_earned: number;

  // Habit metrics
  habits_completed_count: number;
  habits_total_count: number;

  created_at: number; // Timestamp
  updated_at: number; // Timestamp
}
