/**
 * SM-2 Spaced Repetition Algorithm Implementation
 * Based on SuperMemo 2 algorithm (FR-002 through FR-006)
 *
 * Parameters:
 * - Initial ease factor: 2.5
 * - Minimum ease factor: 1.3
 * - First interval: 1 day
 * - Second interval: 6 days
 * - Subsequent intervals: previous interval × ease factor
 *
 * Quality ratings (FR-004):
 * - 0 (Again): Complete failure, reset card
 * - 3 (Hard): Correct with difficulty
 * - 4 (Good): Correct with minor hesitation
 * - 5 (Easy): Perfect recall
 */

import type { QualityRating, Flashcard } from '../../models/Flashcard';

export interface SM2ReviewResult {
  nextReviewDate: string; // ISO date YYYY-MM-DD
  interval: number; // days
  easeFactor: number;
  repetitions: number;
  isCorrect: boolean;
}

export interface SM2State {
  easeFactor: number;
  interval: number;
  repetitions: number;
}

const MIN_EASE_FACTOR = 1.3;
const MAX_EASE_FACTOR = 10.0;
const INITIAL_EASE_FACTOR = 2.5;
const FIRST_INTERVAL = 1;
const SECOND_INTERVAL = 6;

/**
 * Calculate the next review parameters based on quality rating
 *
 * @param currentState - Current SM-2 state (easeFactor, interval, repetitions)
 * @param quality - Quality rating (0, 3, 4, 5)
 * @returns New SM-2 state and next review date
 */
export const calculateNextReview = (
  currentState: SM2State,
  quality: QualityRating,
): SM2ReviewResult => {
  const { easeFactor, interval, repetitions } = currentState;
  const today = new Date();

  // If quality < 3, reset the card (Again)
  if (quality === 0) {
    const nextReviewDate = addDays(today, FIRST_INTERVAL);
    return {
      nextReviewDate: formatDateToISO(nextReviewDate),
      interval: FIRST_INTERVAL,
      easeFactor: Math.max(MIN_EASE_FACTOR, easeFactor - 0.2),
      repetitions: 0,
      isCorrect: false,
    };
  }

  // Calculate new ease factor
  // EF' = EF + (0.1 - (5 - q) × (0.08 + (5 - q) × 0.02))
  const newEaseFactor = calculateNewEaseFactor(easeFactor, quality);

  // Calculate new interval
  let newInterval: number;
  const newRepetitions = repetitions + 1;

  if (newRepetitions === 1) {
    // First successful review
    newInterval = FIRST_INTERVAL;
  } else if (newRepetitions === 2) {
    // Second successful review
    newInterval = SECOND_INTERVAL;
  } else {
    // Subsequent reviews: interval × ease factor
    newInterval = Math.round(interval * newEaseFactor);
  }

  // Adjust interval based on quality
  if (quality === 3) {
    // Hard - slightly reduce interval
    newInterval = Math.max(1, Math.round(newInterval * 0.8));
  } else if (quality === 5) {
    // Easy - slightly increase interval
    newInterval = Math.round(newInterval * 1.3);
  }

  const nextReviewDate = addDays(today, newInterval);

  return {
    nextReviewDate: formatDateToISO(nextReviewDate),
    interval: newInterval,
    easeFactor: newEaseFactor,
    repetitions: newRepetitions,
    isCorrect: true,
  };
};

/**
 * Calculate new ease factor using SM-2 formula
 */
const calculateNewEaseFactor = (currentEF: number, quality: QualityRating): number => {
  // SM-2 formula: EF' = EF + (0.1 - (5 - q) × (0.08 + (5 - q) × 0.02))
  const qFactor = 5 - quality;
  const delta = 0.1 - qFactor * (0.08 + qFactor * 0.02);
  const newEF = currentEF + delta;

  // Clamp to valid range
  return Math.max(MIN_EASE_FACTOR, Math.min(MAX_EASE_FACTOR, newEF));
};

/**
 * Get preview of next review intervals for all quality ratings
 * Used to display interval estimates on rating buttons (FR-005)
 */
export const getIntervalPreviews = (currentState: SM2State): Record<QualityRating, string> => {
  const ratings: QualityRating[] = [0, 3, 4, 5];
  const previews: Record<QualityRating, string> = {
    0: '',
    3: '',
    4: '',
    5: '',
  };

  for (const rating of ratings) {
    const result = calculateNextReview(currentState, rating);
    previews[rating] = formatIntervalDisplay(result.interval);
  }

  return previews;
};

/**
 * Format interval for display (e.g., "1 day", "2 weeks", "3 months")
 */
export const formatIntervalDisplay = (days: number): string => {
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  if (days === 7) return '1 week';
  if (days < 30) {
    const weeks = Math.round(days / 7);
    return weeks === 1 ? '1 week' : `${weeks} weeks`;
  }
  if (days < 365) {
    const months = Math.round(days / 30);
    return months === 1 ? '1 month' : `${months} months`;
  }
  const years = Math.round(days / 365);
  return years === 1 ? '1 year' : `${years} years`;
};

/**
 * Apply review result to a flashcard
 */
export const applyReviewToFlashcard = (flashcard: Flashcard, quality: QualityRating): Flashcard => {
  const currentState: SM2State = {
    easeFactor: flashcard.easeFactor,
    interval: flashcard.interval,
    repetitions: flashcard.repetitions,
  };

  const result = calculateNextReview(currentState, quality);
  const today = formatDateToISO(new Date());

  return {
    ...flashcard,
    easeFactor: result.easeFactor,
    interval: result.interval,
    repetitions: result.repetitions,
    nextReviewDate: result.nextReviewDate,
    lastReviewDate: today,
    lastQualityRating: quality,
    totalReviews: flashcard.totalReviews + 1,
    correctReviews: result.isCorrect ? flashcard.correctReviews + 1 : flashcard.correctReviews,
    incorrectReviews: result.isCorrect
      ? flashcard.incorrectReviews
      : flashcard.incorrectReviews + 1,
    updatedAt: Date.now(),
  };
};

/**
 * Check if a flashcard is due for review
 */
export const isDueForReview = (flashcard: Flashcard): boolean => {
  const today = formatDateToISO(new Date());
  return flashcard.nextReviewDate <= today;
};

/**
 * Get initial SM-2 state for new cards
 */
export const getInitialSM2State = (): SM2State => ({
  easeFactor: INITIAL_EASE_FACTOR,
  interval: FIRST_INTERVAL,
  repetitions: 0,
});

// Helper functions
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const formatDateToISO = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export { MIN_EASE_FACTOR, MAX_EASE_FACTOR, INITIAL_EASE_FACTOR, FIRST_INTERVAL, SECOND_INTERVAL };
