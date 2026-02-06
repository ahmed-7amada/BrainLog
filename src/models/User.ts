/**
 * User Profile Model
 * Represents a learner using the app (FR-000 through FR-000l)
 */

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  xpPoints: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // ISO date YYYY-MM-DD
  streakFreezeAvailable: boolean;
  earnedBadges: string[]; // Array of badge IDs
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

export interface CreateUserInput {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export const defaultUser = (input: CreateUserInput): User => ({
  ...input,
  xpPoints: 0,
  currentLevel: 1,
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: new Date().toISOString().split('T')[0],
  streakFreezeAvailable: true,
  earnedBadges: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// XP thresholds for each level (FR-040)
export const XP_LEVEL_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 100,
  3: 300,
  4: 600,
  5: 1000,
  6: 1500,
  7: 2500,
  8: 4000,
  9: 6000,
  10: 10000,
};

export const calculateLevel = (xpPoints: number): number => {
  let level = 1;
  for (let i = 10; i >= 1; i--) {
    if (xpPoints >= XP_LEVEL_THRESHOLDS[i]) {
      level = i;
      break;
    }
  }
  return level;
};
