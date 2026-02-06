/**
 * Voice Note Model
 * Represents audio recording (FR-013)
 */

import type { SyncState } from './SyncState';

export type AttachmentType = 'flashcard' | 'note' | 'dailyLog' | 'standalone';

export interface VoiceNote {
  id: string;
  userId: string;
  title: string;
  durationSeconds: number;
  localFilePath?: string; // Local file path for playback before upload
  googleDriveFileId: string;
  googleDriveUrl: string;
  attachmentType?: AttachmentType;
  attachedToId?: string;
  tags: string[];
  createdAt: number;
  updatedAt?: number;

  // Feature 003: Sync and upload metadata
  syncState?: SyncState;
  uploadTaskId?: string;
  _optimistic?: boolean;
}

export interface CreateVoiceNoteInput {
  userId: string;
  title: string;
  durationSeconds: number;
  googleDriveFileId: string;
  googleDriveUrl: string;
  attachmentType?: AttachmentType;
  attachedToId?: string;
  tags?: string[];
}

export const createVoiceNote = (input: CreateVoiceNoteInput): VoiceNote => ({
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
