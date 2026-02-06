/**
 * Note Model
 * Represents written study material (FR-010, FR-016)
 */

import type { SyncState } from './SyncState';

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string; // Rich text or markdown
  tags: string[];
  category?: string;
  folder?: string;
  voiceNoteId?: string;
  isPinned: boolean;
  createdAt: number;
  updatedAt: number;

  // Feature 003: Sync metadata
  syncState?: SyncState;
  _optimistic?: boolean;
}

export interface CreateNoteInput {
  userId: string;
  title: string;
  content: string;
  tags?: string[];
  category?: string;
  folder?: string;
  voiceNoteId?: string;
  isPinned?: boolean;
}

export const createNote = (input: CreateNoteInput): Note => ({
  id: generateId(),
  ...input,
  tags: input.tags || [],
  isPinned: input.isPinned || false,
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
