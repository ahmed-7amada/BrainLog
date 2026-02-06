/**
 * Memorize Service
 * Firebase integration for memorize system (FR-045 to FR-049)
 */

import {
  getCurrentUserId,
  getDatabase,
  ref,
  get,
  set,
  update,
  remove,
} from '../../config/firebase';
import type { MemorizeItem } from '../../models/MemorizeItem';
import type { QualityRating } from '../../models/Flashcard';
import { calculateNextReview } from '../spacedRepetition/SM2Algorithm';

/**
 * Create memorize item
 */
export const createMemorizeItem = async (
  title: string,
  contentSummary: string,
  type: MemorizeItem['type'],
  sourceReferenceType?: string,
  sourceReferenceId?: string,
  tags?: string[],
): Promise<MemorizeItem> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const today = new Date().toISOString().split('T')[0];
  const id = `memorize_${Date.now()}`;
  const memorizeItem: MemorizeItem = {
    id,
    userId,
    title,
    contentSummary,
    type,
    sourceReferenceType,
    sourceReferenceId,
    tags: tags || [],
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    nextReviewDate: today,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const memorizeRef = ref(getDatabase(), `users/${userId}/memorizeItems/${id}`);
  await set(memorizeRef, memorizeItem);
  return memorizeItem;
};

/**
 * Get all memorize items for current user
 */
export const getAllMemorizeItems = async (): Promise<MemorizeItem[]> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const memorizeRef = ref(getDatabase(), `users/${userId}/memorizeItems`);
  const snapshot = await get(memorizeRef);
  if (!snapshot.exists()) return [];

  const data = snapshot.val();
  return Object.values(data) as MemorizeItem[];
};

/**
 * Get memorize item by ID
 */
export const getMemorizeItemById = async (id: string): Promise<MemorizeItem | null> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const memorizeRef = ref(getDatabase(), `users/${userId}/memorizeItems/${id}`);
  const snapshot = await get(memorizeRef);
  return snapshot.exists() ? (snapshot.val() as MemorizeItem) : null;
};

/**
 * Get due memorize items
 */
export const getDueMemorizeItems = async (): Promise<MemorizeItem[]> => {
  const items = await getAllMemorizeItems();
  const today = new Date().toISOString().split('T')[0];
  return items.filter(item => item.nextReviewDate <= today);
};

/**
 * Review memorize item with quality rating
 */
export const reviewMemorizeItem = async (
  id: string,
  quality: 0 | 3 | 4 | 5,
): Promise<MemorizeItem> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const item = await getMemorizeItemById(id);
  if (!item) throw new Error('Memorize item not found');

  const result = calculateNextReview(
    {
      easeFactor: item.easeFactor,
      interval: item.interval,
      repetitions: item.repetitions,
    },
    quality as QualityRating,
  );

  const today = new Date().toISOString().split('T')[0];
  const updates: Partial<MemorizeItem> = {
    easeFactor: result.easeFactor,
    interval: result.interval,
    repetitions: result.repetitions,
    nextReviewDate: result.nextReviewDate,
    lastReviewDate: today,
    lastQualityRating: quality as QualityRating,
    updatedAt: Date.now(),
  };

  const memorizeRef = ref(getDatabase(), `users/${userId}/memorizeItems/${id}`);
  await update(memorizeRef, updates);
  return { ...item, ...updates };
};

/**
 * Update memorize item
 */
export const updateMemorizeItem = async (
  id: string,
  updates: Partial<MemorizeItem>,
): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const memorizeRef = ref(getDatabase(), `users/${userId}/memorizeItems/${id}`);
  await update(memorizeRef, {
    ...updates,
    updatedAt: Date.now(),
  });
};

/**
 * Delete memorize item
 */
export const deleteMemorizeItem = async (id: string): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const memorizeRef = ref(getDatabase(), `users/${userId}/memorizeItems/${id}`);
  await remove(memorizeRef);
};

/**
 * Get mastery percentage
 */
export const getMasteryPercentage = async (): Promise<number> => {
  const items = await getAllMemorizeItems();
  if (items.length === 0) return 0;

  const masteredItems = items.filter(item => item.interval >= 30);
  return Math.round((masteredItems.length / items.length) * 100);
};

/**
 * Get items by type
 */
export const getMemorizeItemsByType = async (
  type: MemorizeItem['type'],
): Promise<MemorizeItem[]> => {
  const items = await getAllMemorizeItems();
  return items.filter(item => item.type === type);
};
