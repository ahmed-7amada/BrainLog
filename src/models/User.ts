/**
 * User Profile Model
 * Represents a learner using the app
 */

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  xp_points: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  last_active_date: string; // YYYY-MM-DD
  streak_freeze_available: boolean;
  earned_badges: string[]; // Array of badge IDs
  created_at: number; // Timestamp
  updated_at: number; // Timestamp
}

export interface UserProfile extends User {
  // Additional computed properties
  nextLevelXP?: number;
  levelProgress?: number; // Percentage to next level
}
