/**
 * Daily Progress Model
 * Represents aggregated daily statistics (FR-018 through FR-023)
 */

export interface DailyProgress {
  id: string;
  userId: string;
  dateKey: string; // YYYY-MM-DD
  cardsReviewedCount: number;
  cardsCorrectCount: number;
  cardsIncorrectCount: number;
  newCardsCount: number;
  notesCreatedCount: number;
  videosAddedCount: number;
  voiceNotesCount: number;
  bookmarksAddedCount: number;
  studyMinutes: number;
  xpEarned: number;
  habitsCompletedCount: number;
  habitsTotalCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateDailyProgressInput {
  userId: string;
  dateKey: string;
}

export const createDailyProgress = (input: CreateDailyProgressInput): DailyProgress => ({
  id: generateId(),
  ...input,
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
});

// Calculate activity level for calendar color coding
export type ActivityLevel = 'none' | 'low' | 'medium' | 'high';

export const getActivityLevel = (progress: DailyProgress): ActivityLevel => {
  const activityScore =
    progress.cardsReviewedCount + progress.notesCreatedCount * 2 + progress.habitsCompletedCount;

  if (activityScore === 0) return 'none';
  if (activityScore < 5) return 'low';
  if (activityScore < 15) return 'medium';
  return 'high';
};

const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
