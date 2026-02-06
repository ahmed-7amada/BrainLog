/**
 * Video Model
 * Represents uploaded or recorded learning video (FR-012, FR-017)
 */

export interface Video {
  id: string;
  userId: string;
  title: string;
  description?: string;
  googleDriveFileId: string;
  googleDriveUrl: string;
  resolution?: string; // e.g., "1920x1080"
  bitrate?: number; // bps
  format?: string; // e.g., "h264"
  durationSeconds: number;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  tags: string[];
  createdAt: number;
}

export interface CreateVideoInput {
  title: string;
  description?: string;
  googleDriveFileId: string;
  googleDriveUrl: string;
  resolution?: string;
  bitrate?: number;
  format?: string;
  durationSeconds: number;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  tags?: string[];
}

export const createVideo = (input: CreateVideoInput, userId: string): Video => ({
  id: generateId(),
  userId,
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
