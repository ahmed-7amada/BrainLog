/**
 * Real-time Sync Service Tests
 * T029 - Unit tests for realtimeSyncService
 */

import {
  subscribeToEntity,
  forceRefresh,
  getActiveListenerCount,
  isListenerActive,
  unsubscribeAll,
} from '../../../src/services/sync/realtimeSyncService';

// Mock Firebase
jest.mock('../../../src/config/firebase', () => ({
  getDatabase: jest.fn(() => ({})),
  ref: jest.fn((_db, path) => ({path})),
  onValue: jest.fn((ref, onData, _onError) => {
    // Simulate immediate callback with empty data
    setTimeout(() => {
      onData({
        exists: () => false,
        val: () => null,
      });
    }, 0);
    // Return unsubscribe function
    return jest.fn();
  }),
  get: jest.fn(() =>
    Promise.resolve({
      exists: () => false,
      val: () => null,
    }),
  ),
}));

// Mock store
jest.mock('../../../src/store', () => ({
  useStore: {
    getState: jest.fn(() => ({
      setActiveListener: jest.fn(),
      setLastSyncAt: jest.fn(),
      setSyncError: jest.fn(),
      clearSyncState: jest.fn(),
    })),
  },
}));

describe('realtimeSyncService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    unsubscribeAll();
  });

  describe('subscribeToEntity', () => {
    it('should call onData with empty array when no data exists', async () => {
      const onData = jest.fn();
      const onError = jest.fn();

      const unsubscribe = subscribeToEntity('test/path', {
        onData,
        onError,
      });

      // Wait for async callback
      await new Promise<void>(resolve => setTimeout(resolve, 10));

      expect(onData).toHaveBeenCalledWith([]);
      expect(onError).not.toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    it('should return unsubscribe function', () => {
      const unsubscribe = subscribeToEntity('test/path', {
        onData: jest.fn(),
        onError: jest.fn(),
      });

      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('forceRefresh', () => {
    it('should return empty array when no data exists', async () => {
      const result = await forceRefresh('test/path');
      expect(result).toEqual([]);
    });
  });

  describe('getActiveListenerCount', () => {
    it('should return 0 when no listeners are active', () => {
      expect(getActiveListenerCount()).toBe(0);
    });
  });

  describe('isListenerActive', () => {
    it('should return false for non-existent listener', () => {
      expect(isListenerActive('non/existent/path')).toBe(false);
    });
  });

  describe('unsubscribeAll', () => {
    it('should clear all listeners', () => {
      unsubscribeAll();
      expect(getActiveListenerCount()).toBe(0);
    });
  });
});
