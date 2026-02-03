/**
 * Habit Definition Model
 * Represents a daily habit the user wants to track
 */

export interface HabitDefinition {
  id: string;
  user_id: string;
  name: string;
  display_order: number; // For sorting in UI
  is_active: boolean;
  created_at: number; // Timestamp
}
