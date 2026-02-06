/**
 * UploadTask Model
 * Represents a file upload operation with progress tracking (FR-008 to FR-012)
 */

export type UploadStatus = 'queued' | 'uploading' | 'completed' | 'failed' | 'cancelled';

export type UploadEntityType = 'voiceNote' | 'attachment' | null;

export interface UploadTask {
  id: string;
  userId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;

  // Status tracking
  status: UploadStatus;
  progress: number; // 0-100

  // Timing
  createdAt: number;
  startedAt: number | null;
  completedAt: number | null;

  // Result
  remoteUrl: string | null;
  remoteFileId: string | null;
  errorMessage: string | null;

  // Retry tracking
  retryCount: number;

  // Association
  entityType: UploadEntityType;
  entityId: string | null;
}

export interface CreateUploadTaskInput {
  userId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  entityType?: UploadEntityType;
  entityId?: string;
}

/**
 * Create a new upload task
 */
export const createUploadTask = (input: CreateUploadTaskInput): UploadTask => ({
  id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  userId: input.userId,
  fileName: input.fileName,
  filePath: input.filePath,
  fileSize: input.fileSize,
  mimeType: input.mimeType,
  status: 'queued',
  progress: 0,
  createdAt: Date.now(),
  startedAt: null,
  completedAt: null,
  remoteUrl: null,
  remoteFileId: null,
  errorMessage: null,
  retryCount: 0,
  entityType: input.entityType ?? null,
  entityId: input.entityId ?? null,
});

/**
 * Maximum concurrent uploads allowed
 */
export const MAX_CONCURRENT_UPLOADS = 3;

/**
 * Maximum retry attempts for failed uploads
 */
export const MAX_RETRY_ATTEMPTS = 3;

/**
 * Maximum file size (100MB in bytes)
 */
export const MAX_FILE_SIZE = 104857600;
