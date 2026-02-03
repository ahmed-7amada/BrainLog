/**
 * Daily Log Model
 * Represents a day's learning journal entry
 */

export interface DailyLog {
  id: string; // Format: {userId}_{YYYY-MM-DD}
  user_id: string;
  date_key: string; // YYYY-MM-DD

  // Free-text journal sections
  learned_text?: string; // What I learned today
  challenges_text?: string; // What I struggled with
  plan_text?: string; // Plan for tomorrow

  // Auto-generated summary
  summary: DailyLogSummary;

  // Linked items (references to notes/cards/videos)
  linked_item_ids: string[];

  created_at: number; // Timestamp
  updated_at: number; // Timestamp
}

export interface DailyLogSummary {
  cards_reviewed: number;
  new_cards_created: number;
  notes_created: number;
  study_minutes: number;
  habits_completed: number;
  habits_total: number;
}
