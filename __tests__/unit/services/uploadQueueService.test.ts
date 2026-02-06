/**
 * Upload Queue Service Tests
 * T040 - Unit tests for uploadQueueService
 */

import {
  getQueueStatus,
  hasActiveUploads,
} from '../../../src/services/upload/uploadQueueService';

// Mock store
jest.mock('../../../src/store', () => ({
  useStore: {
    getState: jest.fn(() => ({
      uploadQueue: [],
      activeUploads: [],
      isOnline: true,
      enqueueUpload: jest.fn(() => 'task-123'),
      startUpload: jest.fn(),
      updateUploadProgress: jest.fn(),
      completeUpload: jest.fn(),
      failUpload: jest.fn(),
      retryUpload: jest.fn(),
      cancelUpload: jest.fn(),
      addActivityEntry: jest.fn(() => 'activity-123'),
      updateActivityProgress: jest.fn(),
      updateActivityStatus: jest.fn(),
    })),
  },
}));

// Mock upload progress tracker
jest.mock('../../../src/services/upload/uploadProgressTracker', () => ({
  uploadFile: jest.fn(() =>
    Promise.resolve({
      success: true,
      url: 'https://example.com/file',
      fileId: 'file-123',
    }),
  ),
}));

describe('uploadQueueService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getQueueStatus', () => {
    it('should return queue status with zeros when empty', () => {
      const status = getQueueStatus();

      expect(status).toEqual({
        queued: 0,
        active: 0,
        failed: 0,
        total: 0,
      });
    });
  });

  describe('hasActiveUploads', () => {
    it('should return false when no active uploads', () => {
      expect(hasActiveUploads()).toBe(false);
    });
  });
});
