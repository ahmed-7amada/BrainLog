/**
 * Progress Firebase Service
 * Daily progress tracking (FR-018 through FR-023)
 */

import {
  getDailyProgressRef,
  getUserRef,
  getCurrentUserId,
  serverTimestamp,
  get,
  set,
  update,
  child,
  query,
  orderByKey,
  startAt,
  endAt,
  runTransaction,
} from '../../config/firebase';
import type { DailyProgress } from '../../models/DailyProgress';
import { createAppError, parseFirebaseError } from '../../utils/errorHandler';
import { getTodayKey } from '../../utils/dateUtils';
import { XP_VALUES, STREAK_BONUS_XP, LEVEL_THRESHOLDS } from '../../utils/constants';
import * as badgeService from '../gamification/badgeService';
import * as notificationService from '../notifications/notificationService';

/**
 * Get or create today's progress
 */
export const getOrCreateTodayProgress = async (): Promise<DailyProgress> => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw createAppError('auth/session-expired', 'User not authenticated');
  }

  const dateKey = getTodayKey();
  const progressRef = child(getDailyProgressRef(userId), dateKey);

  try {
    const snapshot = await get(progressRef);
    const data = snapshot.val();

    if (data) {
      return {
        id: dateKey,
        userId,
        dateKey,
        cardsReviewedCount: data.cardsReviewedCount || 0,
        cardsCorrectCount: data.cardsCorrectCount || 0,
        cardsIncorrectCount: data.cardsIncorrectCount || 0,
        newCardsCount: data.newCardsCount || 0,
        notesCreatedCount: data.notesCreatedCount || 0,
        videosAddedCount: data.videosAddedCount || 0,
        voiceNotesCount: data.voiceNotesCount || 0,
        bookmarksAddedCount: data.bookmarksAddedCount || 0,
        studyMinutes: data.studyMinutes || 0,
        xpEarned: data.xpEarned || 0,
        habitsCompletedCount: data.habitsCompletedCount || 0,
        habitsTotalCount: data.habitsTotalCount || 0,
        createdAt: data.createdAt || Date.now(),
        updatedAt: data.updatedAt || Date.now(),
      };
    }

    // Create new progress for today
    const newProgress: DailyProgress = {
      id: dateKey,
      userId,
      dateKey,
      cardsReviewedCount: 0,
      cardsCorrectCount: 0,
      cardsIncorrectCount: 0,
      newCardsCount: 0,
      notesCreatedCount: 0,
      videosAddedCount: 0,
      voiceNotesCount: 0,
      bookmarksAddedCount: 0,
      studyMinutes: 0,
      xpEarned: 0,
      habitsCompletedCount: 0,
      habitsTotalCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await set(progressRef, {
      ...newProgress,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return newProgress;
  } catch (error) {
    throw parseFirebaseError(error);
  }
};

/**
 * Increment a progress stat
 */
export const incrementProgressStat = async (
  stat: keyof Pick<
    DailyProgress,
    | 'cardsReviewedCount'
    | 'cardsCorrectCount'
    | 'cardsIncorrectCount'
    | 'newCardsCount'
    | 'notesCreatedCount'
    | 'videosAddedCount'
    | 'voiceNotesCount'
    | 'bookmarksAddedCount'
  >,
  amount: number = 1,
): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw createAppError('auth/session-expired', 'User not authenticated');
  }

  const dateKey = getTodayKey();
  const progressRef = child(getDailyProgressRef(userId), dateKey);

  try {
    const statRef = child(progressRef, stat);
    await runTransaction(statRef, currentValue => {
      return (currentValue || 0) + amount;
    });
    const updatedAtRef = child(progressRef, 'updatedAt');
    await set(updatedAtRef, serverTimestamp());
  } catch (error) {
    throw parseFirebaseError(error);
  }
};

/**
 * Add XP to today's progress and user profile
 */
export const addXP = async (amount: number): Promise<{ newXP: number; newLevel: number }> => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw createAppError('auth/session-expired', 'User not authenticated');
  }

  const dateKey = getTodayKey();
  const progressRef = child(getDailyProgressRef(userId), dateKey);
  const userRef = child(getUserRef(userId), 'profile');

  try {
    // Update daily progress
    const xpEarnedRef = child(progressRef, 'xpEarned');
    await runTransaction(xpEarnedRef, currentValue => {
      return (currentValue || 0) + amount;
    });

    // Update user total XP
    let newXP = 0;
    const xpPointsRef = child(userRef, 'xpPoints');
    await runTransaction(xpPointsRef, currentValue => {
      newXP = (currentValue || 0) + amount;
      return newXP;
    });

    // Calculate new level
    const newLevel = calculateLevel(newXP);

    // Update level if changed
    const levelRef = child(userRef, 'currentLevel');
    await set(levelRef, newLevel);

    return { newXP, newLevel };
  } catch (error) {
    throw parseFirebaseError(error);
  }
};

/**
 * Update streak
 */
export const updateStreak = async (): Promise<{
  currentStreak: number;
  longestStreak: number;
  bonusXP: number;
}> => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw createAppError('auth/session-expired', 'User not authenticated');
  }

  const userRef = child(getUserRef(userId), 'profile');
  const today = getTodayKey();

  try {
    const snapshot = await get(userRef);
    const userData = snapshot.val() || {};

    const lastActiveDate = userData.lastActiveDate;
    let currentStreak = userData.currentStreak || 0;
    let longestStreak = userData.longestStreak || 0;
    let bonusXP = 0;

    if (lastActiveDate === today) {
      // Already active today, no change
      return { currentStreak, longestStreak, bonusXP };
    }

    // Check if consecutive day
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split('T')[0];

    if (lastActiveDate === yesterdayKey) {
      // Consecutive day - increment streak
      currentStreak += 1;

      // Check for streak milestones
      if (STREAK_BONUS_XP[currentStreak as keyof typeof STREAK_BONUS_XP]) {
        bonusXP = STREAK_BONUS_XP[currentStreak as keyof typeof STREAK_BONUS_XP];
        await addXP(bonusXP);
      }
    } else if (lastActiveDate !== today && lastActiveDate) {
      // Check if missed exactly one day (streak freeze candidate)
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const twoDaysAgoKey = twoDaysAgo.toISOString().split('T')[0];

      const streakFreezeAvailable = userData.streakFreezeAvailable ?? true;
      const streakFreezeUsedThisWeek = userData.streakFreezeUsedThisWeek ?? false;

      if (
        lastActiveDate === twoDaysAgoKey &&
        streakFreezeAvailable &&
        !streakFreezeUsedThisWeek &&
        currentStreak > 0
      ) {
        // Missed exactly one day - auto-apply streak freeze
        currentStreak += 1;

        // Mark streak freeze as used
        await update(userRef, {
          streakFreezeAvailable: false,
          streakFreezeUsedThisWeek: true,
          streakFreezeLastUsed: yesterdayKey,
        });
      } else {
        // Streak broken - reset to 1
        currentStreak = 1;
      }
    } else if (!lastActiveDate) {
      // First activity ever
      currentStreak = 1;
    }

    // Update longest streak if needed
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    // Update user profile
    await update(userRef, {
      currentStreak,
      longestStreak,
      lastActiveDate: today,
      updatedAt: serverTimestamp(),
    });

    return { currentStreak, longestStreak, bonusXP };
  } catch (error) {
    throw parseFirebaseError(error);
  }
};

/**
 * Get progress for a date range
 */
export const getProgressForDateRange = async (
  startDate: string,
  endDate: string,
): Promise<DailyProgress[]> => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw createAppError('auth/session-expired', 'User not authenticated');
  }

  const progressRef = getDailyProgressRef(userId);

  try {
    const queryRef = query(progressRef, orderByKey(), startAt(startDate), endAt(endDate));
    const snapshot = await get(queryRef);

    const data = snapshot.val();
    if (!data) return [];

    return Object.entries(data).map(([dateKey, progress]: [string, any]) => ({
      id: dateKey,
      userId,
      dateKey,
      cardsReviewedCount: progress.cardsReviewedCount || 0,
      cardsCorrectCount: progress.cardsCorrectCount || 0,
      cardsIncorrectCount: progress.cardsIncorrectCount || 0,
      newCardsCount: progress.newCardsCount || 0,
      notesCreatedCount: progress.notesCreatedCount || 0,
      videosAddedCount: progress.videosAddedCount || 0,
      voiceNotesCount: progress.voiceNotesCount || 0,
      bookmarksAddedCount: progress.bookmarksAddedCount || 0,
      studyMinutes: progress.studyMinutes || 0,
      xpEarned: progress.xpEarned || 0,
      habitsCompletedCount: progress.habitsCompletedCount || 0,
      habitsTotalCount: progress.habitsTotalCount || 0,
      createdAt: progress.createdAt || Date.now(),
      updatedAt: progress.updatedAt || Date.now(),
    }));
  } catch (error) {
    throw parseFirebaseError(error);
  }
};

/**
 * Record flashcard review
 */
export const recordFlashcardReview = async (isCorrect: boolean): Promise<void> => {
  await incrementProgressStat('cardsReviewedCount');
  if (isCorrect) {
    await incrementProgressStat('cardsCorrectCount');
  } else {
    await incrementProgressStat('cardsIncorrectCount');
  }
  await addXP(XP_VALUES.FLASHCARD_REVIEW);
  const streakData = await updateStreak();

  // Check for badge achievements
  const progress = await getOrCreateTodayProgress();
  try {
    const awardedBadges = await badgeService.checkBadges({
      cardsReviewed: progress.cardsReviewedCount,
      reviewsCompleted: 1,
      streakDays: streakData.currentStreak,
    });

    // Send notification for new badges
    for (const badge of awardedBadges) {
      await notificationService.sendAchievementNotification('badge', {
        name: badge.name,
        description: badge.description,
      });
    }
  } catch (error) {
    console.error('Error checking badges:', error);
  }
};

/**
 * Record new flashcard created
 */
export const recordNewFlashcard = async (): Promise<void> => {
  await incrementProgressStat('newCardsCount');
  await addXP(XP_VALUES.NEW_FLASHCARD);
  await updateStreak();

  // Check for flashcard creation badges
  const progress = await getOrCreateTodayProgress();
  try {
    const awardedBadges = await badgeService.checkBadges({
      flashcardsCreated: progress.newCardsCount,
    });

    for (const badge of awardedBadges) {
      await notificationService.sendAchievementNotification('badge', {
        name: badge.name,
        description: badge.description,
      });
    }
  } catch (error) {
    console.error('Error checking badges:', error);
  }
};

/**
 * Record note created
 */
export const recordNoteCreated = async (): Promise<void> => {
  await incrementProgressStat('notesCreatedCount');
  await addXP(XP_VALUES.NOTE_CREATED);
  await updateStreak();

  // Check for note creation badges
  const progress = await getOrCreateTodayProgress();
  try {
    const awardedBadges = await badgeService.checkBadges({
      notesCreated: progress.notesCreatedCount,
    });

    for (const badge of awardedBadges) {
      await notificationService.sendAchievementNotification('badge', {
        name: badge.name,
        description: badge.description,
      });
    }
  } catch (error) {
    console.error('Error checking badges:', error);
  }
};

/**
 * Record bookmark added
 */
export const recordBookmarkAdded = async (): Promise<void> => {
  await incrementProgressStat('bookmarksAddedCount');
  await addXP(XP_VALUES.BOOKMARK);
  await updateStreak();
};

/**
 * Record study time in minutes
 */
export const recordStudyTime = async (minutes: number): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw createAppError('auth/session-expired', 'User not authenticated');
  }

  const dateKey = getTodayKey();
  const progressRef = child(getDailyProgressRef(userId), dateKey);

  try {
    const studyMinutesRef = child(progressRef, 'studyMinutes');
    await runTransaction(studyMinutesRef, currentValue => {
      return (currentValue || 0) + minutes;
    });
    const updatedAtRef = child(progressRef, 'updatedAt');
    await set(updatedAtRef, serverTimestamp());
  } catch (error) {
    throw parseFirebaseError(error);
  }
};

// Helper function
const calculateLevel = (xp: number): number => {
  let level = 1;
  for (let i = 10; i >= 1; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i;
      break;
    }
  }
  return level;
};
