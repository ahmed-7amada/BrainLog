/**
 * useUploadManager Hook Tests
 * T041 - Unit tests for useUploadManager hook
 */

import {renderHook, act} from '@testing-library/react-native';

// Mock the store
const mockStoreState = {
  uploadQueue: [],
  activeUploads: [],
  activityLog: [],
  activeCount: 0,
  failedCount: 0,
  isOnline: true,
  retryUpload: jest.fn(),
  dismissActivity: jest.fn(),
  clearOldActivity: jest.fn(),
};

jest.mock('../../../src/store', () => ({
  useStore: jest.fn((selector) => {
    if (typeof selector === 'function') {
      return selector(mockStoreState);
    }
    return mockStoreState;
  }),
}));

// Mock upload queue service
jest.mock('../../../src/services/upload/uploadQueueService', () => ({
  enqueueUpload: jest.fn(() => 'task-123'),
  cancelUpload: jest.fn(),
  retryUpload: jest.fn(),
  startQueueProcessor: jest.fn(),
  stopQueueProcessor: jest.fn(),
  pauseAllUploads: jest.fn(),
  resumeAllUploads: jest.fn(),
  getQueueStatus: jest.fn(() => ({
    queued: 0,
    active: 0,
    failed: 0,
    total: 0,
  })),
  hasActiveUploads: jest.fn(() => false),
}));

// Import after mocks are set up
import {useUploadManager} from '../../../src/hooks/useUploadManager';
import {enqueueUpload, cancelUpload} from '../../../src/services/upload/uploadQueueService';

describe('useUploadManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial state', () => {
    const {result} = renderHook(() => useUploadManager());

    expect(result.current.uploads).toEqual([]);
    expect(result.current.activeUploads).toEqual([]);
    expect(result.current.queuedUploads).toEqual([]);
    expect(result.current.failedUploads).toEqual([]);
    expect(result.current.activeCount).toBe(0);
    expect(result.current.failedCount).toBe(0);
    expect(result.current.hasActive).toBe(false);
    expect(result.current.hasFailed).toBe(false);
  });

  it('should have upload function', () => {
    const {result} = renderHook(() => useUploadManager());

    expect(typeof result.current.upload).toBe('function');
  });

  it('should call enqueueUpload when upload is called', () => {
    const {result} = renderHook(() => useUploadManager());

    const input = {
      userId: 'user-123',
      fileName: 'test.m4a',
      filePath: '/path/to/file',
      fileSize: 1024,
      mimeType: 'audio/m4a',
      entityType: 'voiceNote' as const,
      entityId: 'vn-123',
    };

    act(() => {
      result.current.upload(input);
    });

    expect(enqueueUpload).toHaveBeenCalledWith(input);
  });

  it('should call cancelUpload when cancel is called', () => {
    const {result} = renderHook(() => useUploadManager());

    act(() => {
      result.current.cancel('task-123');
    });

    expect(cancelUpload).toHaveBeenCalledWith('task-123');
  });

  it('should have pause and resume functions', () => {
    const {result} = renderHook(() => useUploadManager());

    expect(typeof result.current.pause).toBe('function');
    expect(typeof result.current.resume).toBe('function');
  });

  it('should return status summary', () => {
    const {result} = renderHook(() => useUploadManager());

    expect(result.current.status).toEqual({
      queued: 0,
      active: 0,
      failed: 0,
      total: 0,
    });
  });
});
