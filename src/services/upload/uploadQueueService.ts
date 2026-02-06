/**
 * Upload Queue Service
 * FIFO queue management with max 3 concurrent uploads (FR-008 to FR-012)
 */

import { useStore } from '../../store';
import { uploadFileResumable } from './uploadProgressTracker';
import { MAX_CONCURRENT_UPLOADS, MAX_RETRY_ATTEMPTS } from '../../models/UploadTask';
import type { CreateUploadTaskInput, UploadTask } from '../../models/UploadTask';
import type { CreateActivityLogEntryInput } from '../../models/ActivityLogEntry';
import { getGoogleTokens } from '../firebase/authService';
import { completeVoiceNoteUpload } from '../firebase/voiceNoteService';

// Queue processing interval
const QUEUE_PROCESS_INTERVAL = 1000;
let queueProcessorInterval: ReturnType<typeof setInterval> | null = null;
let isProcessing = false;

/**
 * Start the queue processor
 */
export const startQueueProcessor = (): void => {
  if (queueProcessorInterval) return;

  queueProcessorInterval = setInterval(processQueue, QUEUE_PROCESS_INTERVAL);
  // Process immediately on start
  processQueue();
};

/**
 * Stop the queue processor
 */
export const stopQueueProcessor = (): void => {
  if (queueProcessorInterval) {
    clearInterval(queueProcessorInterval);
    queueProcessorInterval = null;
  }
};

/**
 * Process the upload queue
 */
export const processQueue = async (): Promise<void> => {
  if (isProcessing) return;

  const store = useStore.getState();
  const { uploadQueue, activeUploads, startUpload } = store;
  const isOnline = store.isOnline;

  // Don't process if offline
  if (!isOnline) return;

  // Check if we can start more uploads
  const availableSlots = MAX_CONCURRENT_UPLOADS - activeUploads.length;
  if (availableSlots <= 0) return;

  // Get queued tasks (FIFO order)
  const queuedTasks = uploadQueue.filter(task => task.status === 'queued').slice(0, availableSlots);

  if (queuedTasks.length === 0) return;

  isProcessing = true;

  try {
    // Start uploads for available slots
    for (const task of queuedTasks) {
      startUpload(task.id);
      executeUpload(task);
    }
  } finally {
    isProcessing = false;
  }
};

/**
 * Execute a single upload
 */
const executeUpload = async (task: UploadTask): Promise<void> => {
  const store = useStore.getState();
  const {
    updateUploadProgress,
    completeUpload,
    failUpload,
    addActivityEntry,
    updateActivityProgress,
    updateActivityStatus,
  } = store;

  // Create activity log entry
  const activityInput: CreateActivityLogEntryInput = {
    userId: task.userId,
    type: 'upload',
    action: 'upload',
    taskId: task.id,
    entityType: task.entityType ?? undefined,
    entityId: task.entityId ?? undefined,
    entityName: task.fileName,
  };
  const activityId = addActivityEntry(activityInput);
  const startTime = Date.now();

  try {
    // Get Google access token for authentication
    const tokens = await getGoogleTokens();
    if (!tokens?.accessToken) {
      throw new Error('No Google access token available. Please sign in again.');
    }

    const uploadUrl = getUploadUrl(task);

    const result = await uploadFileResumable({
      url: uploadUrl,
      filePath: task.filePath,
      fileName: task.fileName,
      mimeType: task.mimeType,
      accessToken: tokens.accessToken,
      onProgress: (progress: number) => {
        updateUploadProgress(task.id, progress);
        updateActivityProgress(activityId, progress);
      },
    });

    if (result.success && result.fileId) {
      // Construct URL if not returned by Google Drive
      const driveUrl = result.url || `https://drive.google.com/file/d/${result.fileId}/view`;

      completeUpload(task.id, driveUrl, result.fileId);
      updateActivityStatus(activityId, 'success', Date.now() - startTime);

      // Update the entity (voice note, etc.) with Google Drive info
      if (task.entityType === 'voiceNote' && task.entityId) {
        try {
          await completeVoiceNoteUpload(task.entityId, result.fileId, driveUrl);
        } catch {
          // Voice note update failed, but upload succeeded
        }
      }
    } else {
      throw new Error(result.error || 'Upload failed');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';

    // Check if we should auto-retry
    if (task.retryCount < MAX_RETRY_ATTEMPTS) {
      failUpload(task.id, errorMessage);
      scheduleRetry(task.id, task.retryCount);
    } else {
      failUpload(task.id, `Failed after ${MAX_RETRY_ATTEMPTS} attempts: ${errorMessage}`);
    }

    updateActivityStatus(activityId, 'error', Date.now() - startTime);
  }
};

/**
 * Schedule a retry with exponential backoff
 */
const scheduleRetry = (taskId: string, currentRetryCount: number): void => {
  // Exponential backoff: 1s, 2s, 4s
  const delay = Math.pow(2, currentRetryCount) * 1000;

  setTimeout(() => {
    const store = useStore.getState();
    store.retryUpload(taskId);
    processQueue();
  }, delay);
};

/**
 * Get upload URL for a task
 * This would typically point to your cloud storage service
 */
const getUploadUrl = (_task: UploadTask): string => {
  // This would be configured based on your backend
  // For Google Drive, you would use the resumable upload endpoint
  return 'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable';
};

/**
 * Enqueue a new upload
 */
export const enqueueUpload = (input: CreateUploadTaskInput): string => {
  const store = useStore.getState();
  const taskId = store.enqueueUpload(input);

  // Start processing if not already running
  if (!queueProcessorInterval) {
    startQueueProcessor();
  }

  // Process immediately
  processQueue();

  return taskId;
};

/**
 * Cancel an upload
 */
export const cancelUpload = (taskId: string): void => {
  const store = useStore.getState();
  store.cancelUpload(taskId);
};

/**
 * Retry a failed upload
 */
export const retryUpload = (taskId: string): void => {
  const store = useStore.getState();
  store.retryUpload(taskId);
  processQueue();
};

/**
 * Get queue status
 */
export const getQueueStatus = (): {
  queued: number;
  active: number;
  failed: number;
  total: number;
} => {
  const store = useStore.getState();
  const { uploadQueue, activeUploads } = store;

  return {
    queued: uploadQueue.filter(t => t.status === 'queued').length,
    active: activeUploads.length,
    failed: uploadQueue.filter(t => t.status === 'failed').length,
    total: uploadQueue.length + activeUploads.length,
  };
};

/**
 * Check if there are any active or pending uploads
 */
export const hasActiveUploads = (): boolean => {
  const { queued, active } = getQueueStatus();
  return queued > 0 || active > 0;
};

/**
 * Pause all uploads (network offline)
 */
export const pauseAllUploads = (): void => {
  stopQueueProcessor();
};

/**
 * Resume all uploads (network back online)
 */
export const resumeAllUploads = (): void => {
  startQueueProcessor();
};
