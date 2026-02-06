/**
 * Flashcard Model
 * Represents a single learning card for spaced repetition (FR-001 through FR-009)
 */

import type { SyncState } from './SyncState';

export interface Flashcard {
  id: string;
  userId: string;
  frontText: string;
  backText: string;
  deck?: string;
  tags: string[];
  voiceNoteId?: string;

  // SM-2 algorithm parameters
  easeFactor: number; // default: 2.5, min: 1.3
  interval: number; // days until next review, default: 1
  repetitions: number; // successful reviews count, default: 0
  nextReviewDate: string; // ISO date YYYY-MM-DD
  lastReviewDate?: string; // ISO date YYYY-MM-DD
  lastQualityRating?: QualityRating;

  // Statistics
  totalReviews: number;
  correctReviews: number; // quality >= 3
  incorrectReviews: number; // quality == 0

  createdAt: number; // timestamp
  updatedAt: number; // timestamp

  // Feature 003: Sync metadata
  syncState?: SyncState;
  _optimistic?: boolean;
}

// Quality ratings per FR-004
export type QualityRating = 0 | 3 | 4 | 5;

export const QUALITY_LABELS: Record<QualityRating, string> = {
  0: 'Again',
  3: 'Hard',
  4: 'Good',
  5: 'Easy',
};

export interface CreateFlashcardInput {
  frontText: string;
  backText: string;
  deck?: string;
  tags?: string[];
  voiceNoteId?: string;
}

export const createFlashcard = (input: CreateFlashcardInput, userId: string): Flashcard => {
  const today = new Date().toISOString().split('T')[0];
  return {
    id: generateId(),
    userId,
    frontText: input.frontText,
    backText: input.backText,
    deck: input.deck,
    tags: input.tags || [],
    voiceNoteId: input.voiceNoteId,
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    nextReviewDate: today, // Due immediately for first review
    totalReviews: 0,
    correctReviews: 0,
    incorrectReviews: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

// Simple UUID generator
const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
