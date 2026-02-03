/**
 * Note Model
 * Represents written study material with rich text content
 */

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string; // Rich text or markdown
  tags: string[];
  category: string;
  folder?: string;
  voice_note_id?: string; // Optional attached voice note
  is_pinned: boolean;
  created_at: number; // Timestamp
  updated_at: number; // Timestamp
}

export type NoteCategory =
  | 'programming'
  | 'language'
  | 'concepts'
  | 'tutorials'
  | 'documentation'
  | 'other';
