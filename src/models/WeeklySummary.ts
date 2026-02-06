/**
 * Weekly Summary Model
 * Represents auto-generated weekly insights (FR-034, FR-035)
 */

export type Trend = 'improved' | 'declined' | 'stable';

export interface ForgottenCard {
  id: string;
  front: string;
  incorrectCount: number;
}

export interface WeeklySummary {
  id: string;
  userId: string;
  weekKey: string; // YYYY-Www (e.g., "2026-W05")
  totalCardsReviewed: number;
  newCardsLearned: number;
  mostForgottenCards: ForgottenCard[];
  totalStudyMinutes: number;
  streakDays: number; // 0-7
  habitCompletionRate: number; // 0-100
  xpEarned: number;
  comparison?: {
    cardsReviewedDiff: number;
    studyTimeDiff: number;
    trend: Trend;
  };
  generatedAt: number;
}

export interface CreateWeeklySummaryInput {
  userId: string;
  weekKey: string;
  totalCardsReviewed: number;
  newCardsLearned: number;
  mostForgottenCards?: ForgottenCard[];
  totalStudyMinutes: number;
  streakDays: number;
  habitCompletionRate: number;
  xpEarned: number;
  comparison?: {
    cardsReviewedDiff: number;
    studyTimeDiff: number;
    trend: Trend;
  };
}

export const createWeeklySummary = (input: CreateWeeklySummaryInput): WeeklySummary => {
  return {
    id: generateId(),
    ...input,
    mostForgottenCards: input.mostForgottenCards || [],
    generatedAt: Date.now(),
  };
};

// Get ISO week key from date
export const getWeekKey = (date: Date): string => {
  const d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNumber =
    1 +
    Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
};

const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
