/**
 * Voice Note Service
 * Firebase integration for voice note management (FR-013)
 * Integrated with upload queue for background uploads (Feature 003)
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
import { enqueueUpload } from '../upload/uploadQueueService';
import type { VoiceNote, AttachmentType } from '../../models/VoiceNote';
import type { CreateUploadTaskInput } from '../../models/UploadTask';

/**
 * Create voice note metadata entry
 */
export const createVoiceNote = async (
  title: string,
  durationSeconds: number,
  googleDriveFileId: string,
  googleDriveUrl: string,
  attachmentType?: AttachmentType,
  attachedToId?: string,
  tags?: string[],
): Promise<VoiceNote> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const id = `voicenote_${Date.now()}`;
  const voiceNote: VoiceNote = {
    id,
    userId,
    title,
    durationSeconds,
    googleDriveFileId,
    googleDriveUrl,
    attachmentType,
    attachedToId,
    tags: tags || [],
    createdAt: Date.now(),
  };

  const voiceNoteRef = ref(getDatabase(), `users/${userId}/voiceNotes/${id}`);
  await set(voiceNoteRef, voiceNote);
  return voiceNote;
};

/**
 * Get all voice notes for current user
 */
export const getAllVoiceNotes = async (): Promise<VoiceNote[]> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const voiceNotesRef = ref(getDatabase(), `users/${userId}/voiceNotes`);
  const snapshot = await get(voiceNotesRef);
  if (!snapshot.exists()) return [];

  const data = snapshot.val();
  return Object.values(data) as VoiceNote[];
};

/**
 * Get voice note by ID
 */
export const getVoiceNoteById = async (id: string): Promise<VoiceNote | null> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const voiceNoteRef = ref(getDatabase(), `users/${userId}/voiceNotes/${id}`);
  const snapshot = await get(voiceNoteRef);
  return snapshot.exists() ? (snapshot.val() as VoiceNote) : null;
};

/**
 * Update voice note
 */
export const updateVoiceNote = async (id: string, updates: Partial<VoiceNote>): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const voiceNoteRef = ref(getDatabase(), `users/${userId}/voiceNotes/${id}`);
  await update(voiceNoteRef, updates);
};

/**
 * Delete voice note
 */
export const deleteVoiceNote = async (id: string): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const voiceNoteRef = ref(getDatabase(), `users/${userId}/voiceNotes/${id}`);
  await remove(voiceNoteRef);
};

/**
 * Get voice notes by attachment type
 */
export const getVoiceNotesByAttachment = async (
  type: AttachmentType,
  refId?: string,
): Promise<VoiceNote[]> => {
  const voiceNotes = await getAllVoiceNotes();
  return voiceNotes.filter(vn => {
    if (!vn.attachmentType) return type === 'standalone';
    if (vn.attachmentType !== type) return false;
    if (refId && vn.attachedToId !== refId) return false;
    return true;
  });
};

/**
 * Get voice notes for a specific item
 */
export const getVoiceNotesForItem = async (
  type: 'flashcard' | 'note' | 'dailyLog',
  itemId: string,
): Promise<VoiceNote[]> => {
  const voiceNotes = await getAllVoiceNotes();
  return voiceNotes.filter(vn => vn.attachmentType === type && vn.attachedToId === itemId);
};

/**
 * Create voice note with background upload (Feature 003)
 * Enqueues the file for upload and creates metadata entry
 */
export const createVoiceNoteWithUpload = async (
  title: string,
  durationSeconds: number,
  localFilePath: string,
  fileSize: number,
  attachmentType?: AttachmentType,
  attachedToId?: string,
  tags?: string[],
): Promise<{ voiceNoteId: string; uploadTaskId: string }> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const id = `voicenote_${Date.now()}`;

  // Create initial voice note entry with pending upload state
  const voiceNote: VoiceNote = {
    id,
    userId,
    title,
    durationSeconds,
    localFilePath, // Store local path for playback before upload completes
    googleDriveFileId: '', // Will be updated after upload
    googleDriveUrl: '', // Will be updated after upload
    attachmentType,
    attachedToId,
    tags: tags || [],
    createdAt: Date.now(),
    syncState: {
      status: 'pending',
      lastSyncedAt: null,
      localVersion: 1,
      serverVersion: null,
      pendingChanges: true,
      errorMessage: null,
    },
    _optimistic: true,
  };

  // Save initial metadata to Firebase
  const voiceNoteRef = ref(getDatabase(), `users/${userId}/voiceNotes/${id}`);
  await set(voiceNoteRef, voiceNote);

  // Enqueue upload task
  const uploadInput: CreateUploadTaskInput = {
    userId,
    fileName: `${title}.m4a`,
    filePath: localFilePath,
    fileSize,
    mimeType: 'audio/m4a',
    entityType: 'voiceNote',
    entityId: id,
  };

  const uploadTaskId = enqueueUpload(uploadInput);

  // Update voice note with upload task reference
  await update(voiceNoteRef, { uploadTaskId });

  return { voiceNoteId: id, uploadTaskId };
};

/**
 * Update voice note after successful upload
 */
export const completeVoiceNoteUpload = async (
  voiceNoteId: string,
  googleDriveFileId: string,
  googleDriveUrl: string,
): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const voiceNoteRef = ref(getDatabase(), `users/${userId}/voiceNotes/${voiceNoteId}`);
  await update(voiceNoteRef, {
    googleDriveFileId,
    googleDriveUrl,
    updatedAt: Date.now(),
    syncState: {
      status: 'synced',
      lastSyncedAt: Date.now(),
      localVersion: 1,
      serverVersion: 1,
      pendingChanges: false,
      errorMessage: null,
    },
    _optimistic: false,
    uploadTaskId: null,
  });
};

/**
 * Mark voice note upload as failed
 */
export const failVoiceNoteUpload = async (
  voiceNoteId: string,
  errorMessage: string,
): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const voiceNoteRef = ref(getDatabase(), `users/${userId}/voiceNotes/${voiceNoteId}`);
  await update(voiceNoteRef, {
    updatedAt: Date.now(),
    syncState: {
      status: 'error',
      lastSyncedAt: null,
      localVersion: 1,
      serverVersion: null,
      pendingChanges: true,
      errorMessage,
    },
  });
};
