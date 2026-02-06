/**
 * XP Service
 * Gamification system for awarding experience points (FR-039, FR-040)
 */

import { getCurrentUserId, getDatabase, ref, get, set, update, push } from '../../config/firebase';

// XP values per FR-039
export const XP_VALUES = {
  FLASHCARD_REVIEW: 5, // Per card reviewed
  FLASHCARD_CREATE: 10, // Per card created
  NOTE_CREATE: 10, // Per note created
  HABIT_COMPLETE: 5, // Per habit completed
  ALL_HABITS_COMPLETE: 25, // Bonus for completing all daily habits
  STREAK_7_DAY: 100, // 7-day streak bonus
  STREAK_30_DAY: 500, // 30-day streak bonus
  DAILY_LOGIN: 5, // Daily login bonus
};

// Level thresholds per FR-040
export const LEVEL_THRESHOLDS = [
  0, // Level 1: 0 XP
  100, // Level 2: 100 XP
  300, // Level 3: 300 XP
  600, // Level 4: 600 XP
  1000, // Level 5: 1000 XP
  1500, // Level 6: 1500 XP
  2100, // Level 7: 2100 XP
  2800, // Level 8: 2800 XP
  3600, // Level 9: 3600 XP
  4500, // Level 10: 4500 XP
  5500, // Level 11: 5500 XP
  6600, // Level 12: 6600 XP
  7800, // Level 13: 7800 XP
  9100, // Level 14: 9100 XP
  10500, // Level 15: 10500 XP
  12000, // Level 16+: continues...
];

/**
 * Calculate level from total XP
 */
export const calculateLevel = (totalXP: number): number => {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
};

/**
 * Calculate XP needed for next level
 */
export const getXPForNextLevel = (currentLevel: number): number => {
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    // Beyond defined levels, each level requires 1500 more XP
    return (
      LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] +
      (currentLevel - LEVEL_THRESHOLDS.length + 1) * 1500
    );
  }
  return LEVEL_THRESHOLDS[currentLevel];
};

/**
 * Calculate progress to next level (0-100)
 */
export const getLevelProgress = (totalXP: number): number => {
  const currentLevel = calculateLevel(totalXP);
  const currentLevelXP = currentLevel > 1 ? LEVEL_THRESHOLDS[currentLevel - 1] : 0;
  const nextLevelXP = getXPForNextLevel(currentLevel);
  const xpInLevel = totalXP - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  return Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));
};

/**
 * Award XP to user
 */
export const awardXP = async (
  amount: number,
  reason: string,
): Promise<{ newTotal: number; levelUp: boolean; newLevel: number }> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const userRef = ref(getDatabase(), `users/${userId}/profile`);
  const snapshot = await get(userRef);
  const profile = snapshot.val() || { xpPoints: 0, currentLevel: 1 };

  const oldLevel = profile.currentLevel || calculateLevel(profile.xpPoints || 0);
  const newTotal = (profile.xpPoints || 0) + amount;
  const newLevel = calculateLevel(newTotal);
  const levelUp = newLevel > oldLevel;

  await update(userRef, {
    xpPoints: newTotal,
    currentLevel: newLevel,
  });

  // Log XP transaction
  const historyRef = ref(getDatabase(), `users/${userId}/xpHistory`);
  const newHistoryRef = push(historyRef);
  await set(newHistoryRef, {
    amount,
    reason,
    timestamp: Date.now(),
    totalAfter: newTotal,
  });

  return { newTotal, levelUp, newLevel };
};

/**
 * Get user's current XP and level
 */
export const getUserXP = async (): Promise<{
  xpPoints: number;
  currentLevel: number;
  levelProgress: number;
  xpToNextLevel: number;
}> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const profileRef = ref(getDatabase(), `users/${userId}/profile`);
  const snapshot = await get(profileRef);
  const profile = snapshot.val() || { xpPoints: 0, currentLevel: 1 };

  const xpPoints = profile.xpPoints || 0;
  const currentLevel = calculateLevel(xpPoints);
  const levelProgress = getLevelProgress(xpPoints);
  const nextLevelXP = getXPForNextLevel(currentLevel);
  const xpToNextLevel = nextLevelXP - xpPoints;

  return {
    xpPoints,
    currentLevel,
    levelProgress,
    xpToNextLevel,
  };
};

/**
 * Award XP for flashcard review
 */
export const awardFlashcardReviewXP = async (cardsReviewed: number) => {
  const amount = cardsReviewed * XP_VALUES.FLASHCARD_REVIEW;
  return awardXP(amount, `Reviewed ${cardsReviewed} flashcard(s)`);
};

/**
 * Award XP for creating a flashcard
 */
export const awardFlashcardCreateXP = async () => {
  return awardXP(XP_VALUES.FLASHCARD_CREATE, 'Created a flashcard');
};

/**
 * Award XP for creating a note
 */
export const awardNoteCreateXP = async () => {
  return awardXP(XP_VALUES.NOTE_CREATE, 'Created a note');
};

/**
 * Award XP for completing a habit
 */
export const awardHabitCompleteXP = async (isAllComplete: boolean = false) => {
  let result = await awardXP(XP_VALUES.HABIT_COMPLETE, 'Completed a habit');

  if (isAllComplete) {
    result = await awardXP(XP_VALUES.ALL_HABITS_COMPLETE, 'Completed all daily habits');
  }

  return result;
};

/**
 * Award streak bonus XP
 */
export const awardStreakBonusXP = async (streakDays: number) => {
  if (streakDays === 7) {
    return awardXP(XP_VALUES.STREAK_7_DAY, '7-day learning streak');
  } else if (streakDays === 30) {
    return awardXP(XP_VALUES.STREAK_30_DAY, '30-day learning streak');
  }
  return null;
};
