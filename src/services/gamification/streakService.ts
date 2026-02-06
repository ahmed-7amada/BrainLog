/**
 * Streak Service
 * Track consecutive learning days (FR-043, FR-044)
 */

import { getCurrentUserId, getDatabase, ref, get, update } from '../../config/firebase';
import { format, differenceInCalendarDays, isYesterday, isToday, subDays } from 'date-fns';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  streakFreezeAvailable: boolean;
  streakFreezeUsedThisWeek: boolean;
  streakFreezeLastUsed: string | null;
}

/**
 * Get user's streak data
 */
export const getStreakData = async (): Promise<StreakData> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const streakRef = ref(getDatabase(), `users/${userId}/streak`);
  const snapshot = await get(streakRef);
  const data = snapshot.val();

  if (!data) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      streakFreezeAvailable: true,
      streakFreezeUsedThisWeek: false,
      streakFreezeLastUsed: null,
    };
  }

  return {
    currentStreak: data.currentStreak || 0,
    longestStreak: data.longestStreak || 0,
    lastActiveDate: data.lastActiveDate || null,
    streakFreezeAvailable: data.streakFreezeAvailable !== false,
    streakFreezeUsedThisWeek: data.streakFreezeUsedThisWeek || false,
    streakFreezeLastUsed: data.streakFreezeLastUsed || null,
  };
};

/**
 * Update streak based on today's activity
 * Call this when user completes a learning activity
 */
export const updateStreak = async (): Promise<{
  streakUpdated: boolean;
  newStreak: number;
  isNewRecord: boolean;
  streakBroken: boolean;
}> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const streakRef = ref(getDatabase(), `users/${userId}/streak`);
  const snapshot = await get(streakRef);
  const data = snapshot.val() || {};

  const today = format(new Date(), 'yyyy-MM-dd');
  const lastActiveDate = data.lastActiveDate;
  let currentStreak = data.currentStreak || 0;
  let longestStreak = data.longestStreak || 0;
  let streakBroken = false;
  let streakUpdated = false;

  // Already active today
  if (lastActiveDate === today) {
    return {
      streakUpdated: false,
      newStreak: currentStreak,
      isNewRecord: false,
      streakBroken: false,
    };
  }

  if (!lastActiveDate) {
    // First activity ever
    currentStreak = 1;
    streakUpdated = true;
  } else {
    const lastDate = new Date(lastActiveDate);
    const daysSinceLastActive = differenceInCalendarDays(new Date(), lastDate);

    if (daysSinceLastActive === 1) {
      // Consecutive day - increment streak
      currentStreak += 1;
      streakUpdated = true;
    } else if (
      daysSinceLastActive === 2 &&
      data.streakFreezeAvailable &&
      !data.streakFreezeUsedThisWeek
    ) {
      // Missed one day but streak freeze available
      // Use the freeze and maintain streak
      currentStreak += 1;
      streakUpdated = true;
      await update(streakRef, {
        streakFreezeAvailable: false,
        streakFreezeUsedThisWeek: true,
        streakFreezeLastUsed: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
      });
    } else if (daysSinceLastActive > 1) {
      // Streak broken
      currentStreak = 1;
      streakBroken = true;
      streakUpdated = true;
    }
  }

  // Check for new record
  const isNewRecord = currentStreak > longestStreak;
  if (isNewRecord) {
    longestStreak = currentStreak;
  }

  // Update in database
  await update(streakRef, {
    currentStreak,
    longestStreak,
    lastActiveDate: today,
  });

  // Update user profile as well
  const profileRef = ref(getDatabase(), `users/${userId}/profile`);
  await update(profileRef, {
    currentStreak,
  });

  return {
    streakUpdated,
    newStreak: currentStreak,
    isNewRecord,
    streakBroken,
  };
};

/**
 * Check if streak is at risk (no activity today)
 */
export const isStreakAtRisk = async (): Promise<boolean> => {
  const streakData = await getStreakData();

  if (!streakData.lastActiveDate || streakData.currentStreak === 0) {
    return false;
  }

  const lastDate = new Date(streakData.lastActiveDate);
  return !isToday(lastDate) && isYesterday(lastDate);
};

/**
 * Use streak freeze manually
 */
export const useStreakFreeze = async (): Promise<boolean> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const streakData = await getStreakData();

  if (!streakData.streakFreezeAvailable || streakData.streakFreezeUsedThisWeek) {
    return false;
  }

  const today = format(new Date(), 'yyyy-MM-dd');

  const streakRef = ref(getDatabase(), `users/${userId}/streak`);
  await update(streakRef, {
    streakFreezeAvailable: false,
    streakFreezeUsedThisWeek: true,
    streakFreezeLastUsed: today,
    lastActiveDate: today, // Mark as active to preserve streak
  });

  return true;
};

/**
 * Reset weekly streak freeze (call on Sunday/Monday)
 */
export const resetWeeklyStreakFreeze = async (): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const streakRef = ref(getDatabase(), `users/${userId}/streak`);
  await update(streakRef, {
    streakFreezeAvailable: true,
    streakFreezeUsedThisWeek: false,
  });
};

/**
 * Get streak milestones (7, 30, 100, 365 days)
 */
export const getStreakMilestones = (currentStreak: number): number[] => {
  const milestones = [7, 30, 100, 365];
  return milestones.filter(m => currentStreak >= m);
};

/**
 * Get next streak milestone
 */
export const getNextMilestone = (currentStreak: number): number | null => {
  const milestones = [7, 30, 100, 365];
  return milestones.find(m => m > currentStreak) || null;
};
