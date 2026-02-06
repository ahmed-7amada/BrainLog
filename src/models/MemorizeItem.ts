/**
 * Memorize Item Model
 * Represents any content registered for spaced repetition review (FR-045 through FR-049)
 */

import type { QualityRating } from './Flashcard';

export type MemorizeItemType = 'note' | 'concept' | 'vocabulary' | 'custom';

export interface MemorizeItem {
  id: string;
  userId: string;
  title: string;
  contentSummary: string;
  type: MemorizeItemType;
  sourceReferenceType?: string;
  sourceReferenceId?: string;
  tags: string[];

  // SM-2 algorithm parameters (same as Flashcard)
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string; // ISO date YYYY-MM-DD
  lastReviewDate?: string;
  lastQualityRating?: QualityRating;

  createdAt: number;
  updatedAt: number;
}

export interface CreateMemorizeItemInput {
  userId: string;
  title: string;
  contentSummary: string;
  type: MemorizeItemType;
  sourceReferenceType?: string;
  sourceReferenceId?: string;
  tags?: string[];
}

export const createMemorizeItem = (input: CreateMemorizeItemInput): MemorizeItem => {
  const today = new Date().toISOString().split('T')[0];
  return {
    id: generateId(),
    ...input,
    tags: input.tags || [],
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    nextReviewDate: today,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
