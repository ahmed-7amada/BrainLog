/**
 * Tag Service
 * Unified tagging system across all content types (FR-015, FR-016)
 */

import {
  getCurrentUserId,
  getDatabase,
  ref,
  get,
  set,
  remove,
  query,
  orderByChild,
  equalTo,
  runTransaction,
} from '../../config/firebase';
import type { Tag } from '../../models/Tag';

/**
 * Get all tags for current user
 */
export const getAllTags = async (): Promise<Tag[]> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const tagsRef = ref(getDatabase(), `users/${userId}/tags`);
  const snapshot = await get(tagsRef);
  if (!snapshot.exists()) return [];

  const data = snapshot.val();
  return Object.values(data) as Tag[];
};

/**
 * Get tag by name
 */
export const getTagByName = async (name: string): Promise<Tag | null> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const normalizedName = name.toLowerCase().trim();
  const tagsRef = ref(getDatabase(), `users/${userId}/tags`);
  const queryRef = query(tagsRef, orderByChild('normalizedName'), equalTo(normalizedName));
  const snapshot = await get(queryRef);

  if (!snapshot.exists()) return null;

  const data = snapshot.val();
  const tags = Object.values(data) as Tag[];
  return tags[0] || null;
};

/**
 * Create or get existing tag
 */
export const getOrCreateTag = async (name: string): Promise<Tag> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const normalizedName = name.toLowerCase().trim();
  const displayName = name.trim();

  // Check if tag exists
  const existing = await getTagByName(normalizedName);
  if (existing) {
    return existing;
  }

  // Create new tag
  const id = `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const tag: Tag = {
    id,
    userId,
    name: displayName,
    normalizedName,
    usageCount: 0,
    createdAt: Date.now(),
  };

  const tagRef = ref(getDatabase(), `users/${userId}/tags/${id}`);
  await set(tagRef, tag);
  return tag;
};

/**
 * Increment tag usage count
 */
export const incrementTagCount = async (tagName: string): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const tag = await getOrCreateTag(tagName);

  const countRef = ref(getDatabase(), `users/${userId}/tags/${tag.id}/usageCount`);
  await runTransaction(countRef, (currentCount: number | null) => {
    return (currentCount || 0) + 1;
  });
};

/**
 * Decrement tag usage count
 */
export const decrementTagCount = async (tagName: string): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const tag = await getTagByName(tagName);
  if (!tag) return;

  const countRef = ref(getDatabase(), `users/${userId}/tags/${tag.id}/usageCount`);
  await runTransaction(countRef, (currentCount: number | null) => {
    return Math.max(0, (currentCount || 0) - 1);
  });
};

/**
 * Get frequent tags for autocomplete
 */
export const getFrequentTags = async (limit: number = 20): Promise<Tag[]> => {
  const tags = await getAllTags();
  return tags.sort((a, b) => b.usageCount - a.usageCount).slice(0, limit);
};

/**
 * Search tags by prefix
 */
export const searchTags = async (prefix: string): Promise<Tag[]> => {
  const tags = await getAllTags();
  const normalizedPrefix = prefix.toLowerCase().trim();

  return tags
    .filter(t => t.normalizedName.startsWith(normalizedPrefix))
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 10);
};

/**
 * Update tags for an item
 * Handles incrementing/decrementing counts when tags change
 */
export const updateItemTags = async (oldTags: string[], newTags: string[]): Promise<void> => {
  const removedTags = oldTags.filter(t => !newTags.includes(t));
  const addedTags = newTags.filter(t => !oldTags.includes(t));

  // Decrement counts for removed tags
  for (const tag of removedTags) {
    await decrementTagCount(tag);
  }

  // Increment counts for added tags
  for (const tag of addedTags) {
    await incrementTagCount(tag);
  }
};

/**
 * Get tag suggestions based on content type
 */
export const getTagSuggestions = async (
  contentType: 'flashcard' | 'note' | 'bookmark' | 'video' | 'voiceNote',
): Promise<string[]> => {
  // Default suggestions based on content type
  const defaultSuggestions: Record<string, string[]> = {
    flashcard: ['vocabulary', 'grammar', 'concepts', 'formulas', 'definitions'],
    note: ['lecture', 'summary', 'ideas', 'reference', 'todo'],
    bookmark: ['article', 'tutorial', 'documentation', 'video', 'course'],
    video: ['tutorial', 'lecture', 'demo', 'explanation', 'practice'],
    voiceNote: ['idea', 'reminder', 'practice', 'reflection', 'question'],
  };

  // Get user's frequent tags
  const frequentTags = await getFrequentTags(10);
  const frequentTagNames = frequentTags.map(t => t.name);

  // Combine with defaults, prioritizing user's tags
  const defaults = defaultSuggestions[contentType] || [];
  const combined = [...frequentTagNames, ...defaults.filter(d => !frequentTagNames.includes(d))];

  return combined.slice(0, 10);
};

/**
 * Delete unused tags (usageCount = 0)
 */
export const cleanupUnusedTags = async (): Promise<number> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const tags = await getAllTags();
  const unusedTags = tags.filter(t => t.usageCount === 0);

  for (const tag of unusedTags) {
    const tagRef = ref(getDatabase(), `users/${userId}/tags/${tag.id}`);
    await remove(tagRef);
  }

  return unusedTags.length;
};
