/**
 * Weekly Summary Model
 * Represents auto-generated weekly insights
 */

export interface WeeklySummary {
  id: string; // Format: {userId}_{YYYY-Www}
  user_id: string;
  week_key: string; // YYYY-Www format (e.g., "2026-W05")

  // Aggregated metrics
  total_cards_reviewed: number;
  new_cards_learned_count: number;
  most_forgotten_card_ids: string[]; // Cards with quality == 0 multiple times
  total_study_minutes: number;
  streak_days_count: number; // Days active this week (0-7)
  habit_completion_rate: number; // Percentage (0-100)
  xp_earned: number;

  // Comparison with previous week
  comparison: WeeklySummaryComparison;

  generated_at: number; // Timestamp
}

export interface WeeklySummaryComparison {
  cards_reviewed_diff: number; // Positive = improvement
  study_time_diff_minutes: number;
  trend: 'improved' | 'declined' | 'stable';
}
