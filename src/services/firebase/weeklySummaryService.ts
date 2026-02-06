/**
 * Weekly Summary Service
 * Firebase integration for weekly insights (FR-034, FR-035)
 */

import { getCurrentUserId, getDatabase, ref, get, set } from '../../config/firebase';
import type { WeeklySummary } from '../../models/WeeklySummary';
import { startOfWeek, endOfWeek, subWeeks, getWeek, getYear, format } from 'date-fns';
import { getProgressForDateRange } from './progressService';
import { calculateHabitCompletionRate } from './habitService';
import { getMostForgottenCards } from './flashcardService';

const getWeekKey = (date: Date = new Date()): string => {
  const year = getYear(date);
  const week = getWeek(date, { weekStartsOn: 1 });
  return `${year}-W${week.toString().padStart(2, '0')}`;
};

/**
 * Generate weekly summary for current week
 */
export const generateWeeklySummary = async (): Promise<WeeklySummary> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const weekKey = getWeekKey();
  const now = new Date();

  // Calculate week boundaries
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const startDate = format(weekStart, 'yyyy-MM-dd');
  const endDate = format(weekEnd, 'yyyy-MM-dd');

  // Get daily progress for this week
  const dailyProgress = await getProgressForDateRange(startDate, endDate);

  // Aggregate stats from daily progress
  let totalCardsReviewed = 0;
  let newCardsLearned = 0;
  let totalStudyMinutes = 0;
  let xpEarned = 0;
  let streakDays = 0;

  dailyProgress.forEach(day => {
    totalCardsReviewed += day.cardsReviewedCount || 0;
    newCardsLearned += day.newCardsCount || 0;
    totalStudyMinutes += day.studyMinutes || 0;
    xpEarned += day.xpEarned || 0;
    // Count days with activity as streak days
    if (day.cardsReviewedCount > 0 || day.habitsCompletedCount > 0) {
      streakDays++;
    }
  });

  // Get habit completion rate for the week
  const habitCompletionRate = await calculateHabitCompletionRate(startDate, endDate);

  // Get previous week for comparison
  const prevWeekKey = getWeekKey(subWeeks(now, 1));
  const prevSummary = await getWeeklySummaryByKey(prevWeekKey);

  // Calculate comparison if previous week exists
  let comparison: WeeklySummary['comparison'];
  if (prevSummary) {
    const cardsReviewedDiff = totalCardsReviewed - prevSummary.totalCardsReviewed;
    const studyTimeDiff = totalStudyMinutes - prevSummary.totalStudyMinutes;

    let trend: 'improved' | 'declined' | 'stable' = 'stable';
    if (cardsReviewedDiff > 10 || studyTimeDiff > 30) {
      trend = 'improved';
    } else if (cardsReviewedDiff < -10 || studyTimeDiff < -30) {
      trend = 'declined';
    }

    comparison = { cardsReviewedDiff, studyTimeDiff, trend };
  }

  // Get cards with highest error rates (most forgotten)
  const forgottenCardsData = await getMostForgottenCards(5);
  const mostForgottenCards = forgottenCardsData.map(card => ({
    id: card.id,
    front: card.frontText,
    incorrectCount: card.incorrectCount,
  }));

  const summary: WeeklySummary = {
    id: `summary_${userId}_${weekKey}`,
    userId,
    weekKey,
    totalCardsReviewed,
    newCardsLearned,
    mostForgottenCards,
    totalStudyMinutes,
    streakDays,
    habitCompletionRate,
    xpEarned,
    comparison,
    generatedAt: Date.now(),
  };

  const summaryRef = ref(getDatabase(), `users/${userId}/weeklySummaries/${weekKey}`);
  await set(summaryRef, summary);
  return summary;
};

/**
 * Get weekly summary by key
 */
export const getWeeklySummaryByKey = async (weekKey: string): Promise<WeeklySummary | null> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const summaryRef = ref(getDatabase(), `users/${userId}/weeklySummaries/${weekKey}`);
  const snapshot = await get(summaryRef);
  return snapshot.exists() ? (snapshot.val() as WeeklySummary) : null;
};

/**
 * Get current week's summary
 */
export const getCurrentWeekSummary = async (): Promise<WeeklySummary | null> => {
  const weekKey = getWeekKey();
  return getWeeklySummaryByKey(weekKey);
};

/**
 * Get all weekly summaries
 */
export const getAllWeeklySummaries = async (): Promise<WeeklySummary[]> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const summariesRef = ref(getDatabase(), `users/${userId}/weeklySummaries`);
  const snapshot = await get(summariesRef);
  if (!snapshot.exists()) return [];

  const data = snapshot.val();
  return Object.values(data) as WeeklySummary[];
};

/**
 * Update weekly summary stats
 */
export const updateWeeklySummary = async (
  weekKey: string,
  updates: Partial<WeeklySummary>,
): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const existing = await getWeeklySummaryByKey(weekKey);
  if (existing) {
    const summaryRef = ref(getDatabase(), `users/${userId}/weeklySummaries/${weekKey}`);
    await set(summaryRef, {
      ...existing,
      ...updates,
    });
  }
};

/**
 * Calculate comparison with previous week
 */
export const calculateComparison = (
  current: WeeklySummary,
  previous: WeeklySummary,
): WeeklySummary['comparison'] => {
  const cardsReviewedDiff = current.totalCardsReviewed - previous.totalCardsReviewed;
  const studyTimeDiff = current.totalStudyMinutes - previous.totalStudyMinutes;

  let trend: 'improved' | 'declined' | 'stable' = 'stable';
  if (cardsReviewedDiff > 10 || studyTimeDiff > 30) {
    trend = 'improved';
  } else if (cardsReviewedDiff < -10 || studyTimeDiff < -30) {
    trend = 'declined';
  }

  return { cardsReviewedDiff, studyTimeDiff, trend };
};
