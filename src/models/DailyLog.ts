/**
 * Daily Log Model
 * Represents a day's learning journal entry (FR-036 through FR-038)
 */

export interface LinkedItem {
  type: 'flashcard' | 'note' | 'video';
  id: string;
}

export interface DailyLogSummary {
  cardsReviewed: number;
  newCards: number;
  notesCreated: number;
  studyMinutes: number;
  habitsCompleted: number;
  habitsTotal: number;
}

export interface DailyLog {
  id: string;
  userId: string;
  dateKey: string; // YYYY-MM-DD

  // Journal entries
  learned: string; // "What I learned"
  challenges: string; // "What I struggled with"
  plan: string; // "Plan for tomorrow"

  // Auto-generated summary
  summary: DailyLogSummary;

  // Legacy fields (for compatibility)
  cardsReviewedCount: number;
  newCardsCount: number;
  notesCreatedCount: number;
  studyMinutes: number;
  habitsCompletedCount: number;
  habitsTotalCount: number;

  linkedItems: LinkedItem[];
  createdAt: number;
  updatedAt: number;
}

export interface CreateDailyLogInput {
  userId: string;
  dateKey: string;
  learned?: string;
  challenges?: string;
  plan?: string;
}

export const createDailyLog = (input: CreateDailyLogInput): DailyLog => ({
  id: generateId(),
  userId: input.userId,
  dateKey: input.dateKey,
  learned: input.learned || '',
  challenges: input.challenges || '',
  plan: input.plan || '',
  summary: {
    cardsReviewed: 0,
    newCards: 0,
    notesCreated: 0,
    studyMinutes: 0,
    habitsCompleted: 0,
    habitsTotal: 0,
  },
  cardsReviewedCount: 0,
  newCardsCount: 0,
  notesCreatedCount: 0,
  studyMinutes: 0,
  habitsCompletedCount: 0,
  habitsTotalCount: 0,
  linkedItems: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
