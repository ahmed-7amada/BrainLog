/**
 * Unified Review Service
 * Combines flashcards and memorize items into a single review queue
 * T433 - Merge memorize items with flashcards in unified review queue
 */

import { getDueFlashcards, reviewFlashcard } from '../firebase/flashcardService';
import { getDueMemorizeItems, reviewMemorizeItem } from '../firebase/memorizeService';
import type { Flashcard, QualityRating } from '../../models/Flashcard';
import type { MemorizeItem } from '../../models/MemorizeItem';

/**
 * Unified review item that can be either a flashcard or memorize item
 */
export interface UnifiedReviewItem {
  id: string;
  type: 'flashcard' | 'memorize';
  /** Front content for flashcards, title for memorize items */
  frontContent: string;
  /** Back content for flashcards, content summary for memorize items */
  backContent: string;
  /** Source type for memorize items */
  sourceType?: string;
  /** Source reference ID for memorize items */
  sourceReferenceId?: string;
  /** Deck name for flashcards */
  deck?: string;
  /** Tags */
  tags: string[];
  /** SM-2 parameters */
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
  /** Statistics */
  totalReviews?: number;
  correctReviews?: number;
  incorrectReviews?: number;
  /** Original item reference */
  _original: Flashcard | MemorizeItem;
}

/**
 * Get all items due for review (flashcards + memorize items)
 */
export const getUnifiedDueItems = async (): Promise<UnifiedReviewItem[]> => {
  const [dueFlashcards, dueMemorizeItems] = await Promise.all([
    getDueFlashcards(),
    getDueMemorizeItems(),
  ]);

  const flashcardItems: UnifiedReviewItem[] = dueFlashcards.map(flashcard => ({
    id: flashcard.id,
    type: 'flashcard',
    frontContent: flashcard.frontText,
    backContent: flashcard.backText,
    deck: flashcard.deck,
    tags: flashcard.tags,
    easeFactor: flashcard.easeFactor,
    interval: flashcard.interval,
    repetitions: flashcard.repetitions,
    nextReviewDate: flashcard.nextReviewDate,
    totalReviews: flashcard.totalReviews,
    correctReviews: flashcard.correctReviews,
    incorrectReviews: flashcard.incorrectReviews,
    _original: flashcard,
  }));

  const memorizeItems: UnifiedReviewItem[] = dueMemorizeItems.map(item => ({
    id: item.id,
    type: 'memorize',
    frontContent: item.title,
    backContent: item.contentSummary,
    sourceType: item.sourceReferenceType,
    sourceReferenceId: item.sourceReferenceId,
    tags: item.tags || [],
    easeFactor: item.easeFactor,
    interval: item.interval,
    repetitions: item.repetitions,
    nextReviewDate: item.nextReviewDate,
    _original: item,
  }));

  // Combine and shuffle the items for varied review experience
  const allItems = [...flashcardItems, ...memorizeItems];
  return shuffleArray(allItems);
};

/**
 * Get count of all due items (flashcards + memorize items)
 */
export const getUnifiedDueCount = async (): Promise<{
  total: number;
  flashcards: number;
  memorizeItems: number;
}> => {
  const [dueFlashcards, dueMemorizeItems] = await Promise.all([
    getDueFlashcards(),
    getDueMemorizeItems(),
  ]);

  return {
    total: dueFlashcards.length + dueMemorizeItems.length,
    flashcards: dueFlashcards.length,
    memorizeItems: dueMemorizeItems.length,
  };
};

/**
 * Review a unified item with quality rating
 */
export const reviewUnifiedItem = async (
  item: UnifiedReviewItem,
  quality: QualityRating,
): Promise<void> => {
  if (item.type === 'flashcard') {
    await reviewFlashcard(item._original as Flashcard, quality);
  } else {
    await reviewMemorizeItem(item.id, quality as 0 | 3 | 4 | 5);
  }
};

/**
 * Get items grouped by type
 */
export const getDueItemsGrouped = async (): Promise<{
  flashcards: UnifiedReviewItem[];
  memorizeItems: UnifiedReviewItem[];
}> => {
  const allItems = await getUnifiedDueItems();

  return {
    flashcards: allItems.filter(item => item.type === 'flashcard'),
    memorizeItems: allItems.filter(item => item.type === 'memorize'),
  };
};

/**
 * Get next review item from queue
 */
export const getNextReviewItem = async (
  excludeIds: string[] = [],
): Promise<UnifiedReviewItem | null> => {
  const allItems = await getUnifiedDueItems();
  const availableItems = allItems.filter(item => !excludeIds.includes(item.id));

  return availableItems.length > 0 ? availableItems[0] : null;
};

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default {
  getUnifiedDueItems,
  getUnifiedDueCount,
  reviewUnifiedItem,
  getDueItemsGrouped,
  getNextReviewItem,
};
