/**
 * useUploadManager Hook
 * Manages upload queue and provides upload methods (FR-008 to FR-012)
 */

import { useCallback, useEffect } from 'react';
import { useStore } from '../store';
import {
  enqueueUpload,
  cancelUpload,
  retryUpload,
  startQueueProcessor,
  pauseAllUploads,
  resumeAllUploads,
  getQueueStatus,
} from '../services/upload/uploadQueueService';
import type { CreateUploadTaskInput, UploadTask } from '../models/UploadTask';
import type { ActivityLogEntry } from '../models/ActivityLogEntry';

export interface UseUploadManagerResult {
  /** All uploads (active + queued) */
  uploads: UploadTask[];
  /** Currently uploading tasks */
  activeUploads: UploadTask[];
  /** Queued and failed tasks */
  queuedUploads: UploadTask[];
  /** Failed uploads */
  failedUploads: UploadTask[];
  /** Activity log entries */
  activityLog: ActivityLogEntry[];
  /** Number of active uploads */
  activeCount: number;
  /** Number of failed uploads */
  failedCount: number;
  /** Whether there are any active uploads */
  hasActive: boolean;
  /** Whether there are any failed uploads */
  hasFailed: boolean;
  /** Queue status summary */
  status: {
    queued: number;
    active: number;
    failed: number;
    total: number;
  };

  // Actions
  /** Add a new upload to the queue */
  upload: (input: CreateUploadTaskInput) => string;
  /** Cancel an upload */
  cancel: (taskId: string) => void;
  /** Retry a failed upload */
  retry: (taskId: string) => void;
  /** Retry all failed uploads */
  retryAll: () => void;
  /** Clear all completed uploads from activity log */
  clearCompleted: () => void;
  /** Dismiss a specific activity entry */
  dismissActivity: (entryId: string) => void;
  /** Pause all uploads (e.g., when going offline) */
  pause: () => void;
  /** Resume all uploads (e.g., when coming back online) */
  resume: () => void;
}

export const useUploadManager = (): UseUploadManagerResult => {
  // Store state
  const uploadQueue = useStore(state => state.uploadQueue);
  const activeUploads = useStore(state => state.activeUploads);
  const activityLog = useStore(state => state.activityLog);
  const activeCount = useStore(state => state.activeCount);
  const failedCount = useStore(state => state.failedCount);
  const isOnline = useStore(state => state.isOnline);

  // Store actions
  const storeRetryUpload = useStore(state => state.retryUpload);
  const dismissActivityEntry = useStore(state => state.dismissActivity);
  const clearOldActivity = useStore(state => state.clearOldActivity);

  // Derived state
  const allUploads = [...activeUploads, ...uploadQueue];
  const queuedUploads = uploadQueue.filter(t => t.status === 'queued');
  const failedUploads = uploadQueue.filter(t => t.status === 'failed');
  const hasActive = activeCount > 0;
  const hasFailed = failedCount > 0;

  // Handle online/offline state changes
  useEffect(() => {
    if (isOnline) {
      resumeAllUploads();
    } else {
      pauseAllUploads();
    }
  }, [isOnline]);

  // Start queue processor on mount
  useEffect(() => {
    startQueueProcessor();

    return () => {
      // Don't stop processor on unmount to allow background uploads
      // stopQueueProcessor();
    };
  }, []);

  // Clean up old activity entries periodically
  useEffect(() => {
    const interval = setInterval(clearOldActivity, 60 * 60 * 1000); // Every hour
    return () => clearInterval(interval);
  }, [clearOldActivity]);

  const upload = useCallback((input: CreateUploadTaskInput): string => {
    return enqueueUpload(input);
  }, []);

  const cancel = useCallback((taskId: string): void => {
    cancelUpload(taskId);
  }, []);

  const retry = useCallback((taskId: string): void => {
    retryUpload(taskId);
  }, []);

  const retryAll = useCallback((): void => {
    failedUploads.forEach(task => {
      storeRetryUpload(task.id);
    });
  }, [failedUploads, storeRetryUpload]);

  const clearCompleted = useCallback((): void => {
    clearOldActivity();
  }, [clearOldActivity]);

  const dismissActivity = useCallback(
    (entryId: string): void => {
      dismissActivityEntry(entryId);
    },
    [dismissActivityEntry],
  );

  const pause = useCallback((): void => {
    pauseAllUploads();
  }, []);

  const resume = useCallback((): void => {
    resumeAllUploads();
  }, []);

  return {
    uploads: allUploads,
    activeUploads,
    queuedUploads,
    failedUploads,
    activityLog,
    activeCount,
    failedCount,
    hasActive,
    hasFailed,
    status: getQueueStatus(),

    upload,
    cancel,
    retry,
    retryAll,
    clearCompleted,
    dismissActivity,
    pause,
    resume,
  };
};

export default useUploadManager;
