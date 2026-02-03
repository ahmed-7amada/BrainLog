/**
 * Bookmark Model
 * Represents a saved external link with metadata
 */

export interface Bookmark {
  id: string;
  user_id: string;
  title: string;
  url: string;
  type: BookmarkType;
  tags: string[];
  personal_notes?: string;
  created_at: number; // Timestamp
}

export type BookmarkType = 'video' | 'article' | 'course' | 'documentation' | 'other';
