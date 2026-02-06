/**
 * Upload Slice
 * Manages upload queue and activity log state (FR-008 to FR-016)
 */

import { StateCreator } from 'zustand';
import type {
  UploadTask,
  CreateUploadTaskInput,
  ActivityLogEntry,
  CreateActivityLogEntryInput,
} from '../../models';
import {
  createUploadTask,
  createActivityLogEntry,
  shouldRetainEntry,
  MAX_CONCURRENT_UPLOADS,
} from '../../models';

export interface UploadSlice {
  // Queue state
  uploadQueue: UploadTask[];
  activeUploads: UploadTask[];

  // Activity log
  activityLog: ActivityLogEntry[];

  // Summary for badge
  activeCount: number;
  failedCount: number;

  // Actions
  enqueueUpload: (input: CreateUploadTaskInput) => string;
  startUpload: (taskId: string) => void;
  updateUploadProgress: (taskId: string, progress: number) => void;
  completeUpload: (taskId: string, remoteUrl: string, remoteFileId: string) => void;
  failUpload: (taskId: string, error: string) => void;
  retryUpload: (taskId: string) => void;
  cancelUpload: (taskId: string) => void;
  removeFromQueue: (taskId: string) => void;

  // Activity log actions
  addActivityEntry: (input: CreateActivityLogEntryInput) => string;
  updateActivityProgress: (entryId: string, progress: number) => void;
  updateActivityStatus: (
    entryId: string,
    status: ActivityLogEntry['status'],
    duration?: number,
  ) => void;
  clearOldActivity: () => void;
  dismissActivity: (entryId: string) => void;

  // Bulk operations
  setUploadQueue: (queue: UploadTask[]) => void;
  setActivityLog: (log: ActivityLogEntry[]) => void;
  clearAllUploads: () => void;
}

export const createUploadSlice: StateCreator<UploadSlice> = (set, _get) => ({
  // Initial state
  uploadQueue: [],
  activeUploads: [],
  activityLog: [],
  activeCount: 0,
  failedCount: 0,

  // Upload Queue Actions
  enqueueUpload: input => {
    const task = createUploadTask(input);
    set(state => ({
      uploadQueue: [...state.uploadQueue, task],
    }));
    return task.id;
  },

  startUpload: taskId =>
    set(state => {
      const task = state.uploadQueue.find(t => t.id === taskId);
      if (!task || state.activeUploads.length >= MAX_CONCURRENT_UPLOADS) {
        return state;
      }

      const updatedTask: UploadTask = {
        ...task,
        status: 'uploading',
        startedAt: Date.now(),
      };

      return {
        uploadQueue: state.uploadQueue.filter(t => t.id !== taskId),
        activeUploads: [...state.activeUploads, updatedTask],
        activeCount: state.activeUploads.length + 1,
      };
    }),

  updateUploadProgress: (taskId, progress) =>
    set(state => ({
      activeUploads: state.activeUploads.map(t =>
        t.id === taskId ? { ...t, progress: Math.min(100, Math.max(0, progress)) } : t,
      ),
    })),

  completeUpload: (taskId, remoteUrl, remoteFileId) =>
    set(state => {
      const task = state.activeUploads.find(t => t.id === taskId);
      if (!task) return state;

      // Note: completedTask built for potential activity logging integration
      const _completedTask: UploadTask = {
        ...task,
        status: 'completed',
        progress: 100,
        completedAt: Date.now(),
        remoteUrl,
        remoteFileId,
      };

      return {
        activeUploads: state.activeUploads.filter(t => t.id !== taskId),
        activeCount: Math.max(0, state.activeCount - 1),
      };
    }),

  failUpload: (taskId, error) =>
    set(state => {
      const task = state.activeUploads.find(t => t.id === taskId);
      if (!task) return state;

      const failedTask: UploadTask = {
        ...task,
        status: 'failed',
        completedAt: Date.now(),
        errorMessage: error,
      };

      return {
        activeUploads: state.activeUploads.filter(t => t.id !== taskId),
        uploadQueue: [...state.uploadQueue, failedTask],
        activeCount: Math.max(0, state.activeCount - 1),
        failedCount: state.failedCount + 1,
      };
    }),

  retryUpload: taskId =>
    set(state => {
      const task = state.uploadQueue.find(t => t.id === taskId);
      if (!task || task.status !== 'failed') return state;

      const retriedTask: UploadTask = {
        ...task,
        status: 'queued',
        retryCount: task.retryCount + 1,
        errorMessage: null,
        progress: 0,
        startedAt: null,
        completedAt: null,
      };

      return {
        uploadQueue: state.uploadQueue.map(t => (t.id === taskId ? retriedTask : t)),
        failedCount: Math.max(0, state.failedCount - 1),
      };
    }),

  cancelUpload: taskId =>
    set(state => {
      const inQueue = state.uploadQueue.find(t => t.id === taskId);
      const inActive = state.activeUploads.find(t => t.id === taskId);

      if (inQueue) {
        return {
          uploadQueue: state.uploadQueue.filter(t => t.id !== taskId),
          failedCount:
            inQueue.status === 'failed' ? Math.max(0, state.failedCount - 1) : state.failedCount,
        };
      }

      if (inActive) {
        return {
          activeUploads: state.activeUploads.filter(t => t.id !== taskId),
          activeCount: Math.max(0, state.activeCount - 1),
        };
      }

      return state;
    }),

  removeFromQueue: taskId =>
    set(state => ({
      uploadQueue: state.uploadQueue.filter(t => t.id !== taskId),
      activeUploads: state.activeUploads.filter(t => t.id !== taskId),
    })),

  // Activity Log Actions
  addActivityEntry: input => {
    const entry = createActivityLogEntry(input);
    set(state => ({
      activityLog: [entry, ...state.activityLog],
    }));
    return entry.id;
  },

  updateActivityProgress: (entryId, progress) =>
    set(state => ({
      activityLog: state.activityLog.map(e =>
        e.id === entryId ? { ...e, progress: Math.min(100, Math.max(0, progress)) } : e,
      ),
    })),

  updateActivityStatus: (entryId, status, duration) =>
    set(state => ({
      activityLog: state.activityLog.map(e =>
        e.id === entryId
          ? {
              ...e,
              status,
              duration: duration ?? e.duration,
              progress: status === 'success' ? 100 : e.progress,
            }
          : e,
      ),
    })),

  clearOldActivity: () =>
    set(state => ({
      activityLog: state.activityLog.filter(shouldRetainEntry),
    })),

  dismissActivity: entryId =>
    set(state => ({
      activityLog: state.activityLog.filter(e => e.id !== entryId),
    })),

  // Bulk operations
  setUploadQueue: queue =>
    set({
      uploadQueue: queue.filter(t => t.status !== 'uploading'),
      activeCount: 0,
      failedCount: queue.filter(t => t.status === 'failed').length,
    }),

  setActivityLog: log => set({ activityLog: log.filter(shouldRetainEntry) }),

  clearAllUploads: () =>
    set({
      uploadQueue: [],
      activeUploads: [],
      activityLog: [],
      activeCount: 0,
      failedCount: 0,
    }),
});

// Selectors
export const selectUploadQueue = (state: UploadSlice): UploadTask[] => state.uploadQueue;

export const selectActiveUploads = (state: UploadSlice): UploadTask[] => state.activeUploads;

export const selectAllUploads = (state: UploadSlice): UploadTask[] => [
  ...state.activeUploads,
  ...state.uploadQueue,
];

export const selectQueuedUploads = (state: UploadSlice): UploadTask[] =>
  state.uploadQueue.filter(t => t.status === 'queued');

export const selectFailedUploads = (state: UploadSlice): UploadTask[] =>
  state.uploadQueue.filter(t => t.status === 'failed');

export const selectActivityLog = (state: UploadSlice): ActivityLogEntry[] => state.activityLog;

export const selectActiveActivityCount = (state: UploadSlice): number =>
  state.activityLog.filter(e => e.status === 'in_progress').length;

export const selectHasActiveUploads = (state: UploadSlice): boolean => state.activeCount > 0;

export const selectHasFailedUploads = (state: UploadSlice): boolean => state.failedCount > 0;

export const selectUploadById = (state: UploadSlice, taskId: string): UploadTask | undefined =>
  state.activeUploads.find(t => t.id === taskId) || state.uploadQueue.find(t => t.id === taskId);
