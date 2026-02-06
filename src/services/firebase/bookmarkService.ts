/**
 * Bookmark Service
 * Firebase integration for bookmark operations (FR-011)
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
import type { Bookmark, BookmarkType } from '../../models/Bookmark';

/**
 * Create a new bookmark
 */
export const createBookmark = async (
  title: string,
  url: string,
  type: BookmarkType,
  tags?: string[],
  notes?: string,
): Promise<Bookmark> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const id = `bookmark_${Date.now()}`;
  const bookmark: Bookmark = {
    id,
    userId,
    title,
    url,
    type,
    tags: tags || [],
    notes,
    createdAt: Date.now(),
  };

  const bookmarkRef = ref(getDatabase(), `users/${userId}/bookmarks/${id}`);
  await set(bookmarkRef, bookmark);
  return bookmark;
};

/**
 * Get all bookmarks for current user
 */
export const getAllBookmarks = async (): Promise<Bookmark[]> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const bookmarksRef = ref(getDatabase(), `users/${userId}/bookmarks`);
  const snapshot = await get(bookmarksRef);
  if (!snapshot.exists()) return [];

  const data = snapshot.val();
  return Object.values(data) as Bookmark[];
};

/**
 * Get bookmark by ID
 */
export const getBookmarkById = async (id: string): Promise<Bookmark | null> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const bookmarkRef = ref(getDatabase(), `users/${userId}/bookmarks/${id}`);
  const snapshot = await get(bookmarkRef);
  return snapshot.exists() ? (snapshot.val() as Bookmark) : null;
};

/**
 * Update bookmark
 */
export const updateBookmark = async (id: string, updates: Partial<Bookmark>): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const bookmarkRef = ref(getDatabase(), `users/${userId}/bookmarks/${id}`);
  await update(bookmarkRef, updates);
};

/**
 * Delete bookmark
 */
export const deleteBookmark = async (id: string): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const bookmarkRef = ref(getDatabase(), `users/${userId}/bookmarks/${id}`);
  await remove(bookmarkRef);
};

/**
 * Search bookmarks by tag
 */
export const getBookmarksByTag = async (tag: string): Promise<Bookmark[]> => {
  const bookmarks = await getAllBookmarks();
  return bookmarks.filter(b => b.tags.includes(tag));
};

/**
 * Search bookmarks by type
 */
export const getBookmarksByType = async (type: BookmarkType): Promise<Bookmark[]> => {
  const bookmarks = await getAllBookmarks();
  return bookmarks.filter(b => b.type === type);
};

/**
 * Search bookmarks by title/notes
 */
export const searchBookmarks = async (searchQuery: string): Promise<Bookmark[]> => {
  const bookmarks = await getAllBookmarks();
  const lowerQuery = searchQuery.toLowerCase();
  return bookmarks.filter(
    b =>
      b.title.toLowerCase().includes(lowerQuery) ||
      b.url.toLowerCase().includes(lowerQuery) ||
      (b.notes && b.notes.toLowerCase().includes(lowerQuery)),
  );
};
