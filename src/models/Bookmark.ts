/**
 * Bookmark Model
 * Represents a saved external link (FR-011)
 */

export type BookmarkType = 'video' | 'article' | 'course' | 'documentation' | 'other';

export interface Bookmark {
  id: string;
  userId: string;
  title: string;
  url: string;
  type: BookmarkType;
  tags: string[];
  notes?: string;
  createdAt: number;
}

export interface CreateBookmarkInput {
  userId: string;
  title: string;
  url: string;
  type: BookmarkType;
  tags?: string[];
  notes?: string;
}

export const createBookmark = (input: CreateBookmarkInput): Bookmark => ({
  id: generateId(),
  ...input,
  tags: input.tags || [],
  createdAt: Date.now(),
});

const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
