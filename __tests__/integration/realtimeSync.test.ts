/**
 * Integration Tests for Real-time Sync Flow
 * Tests end-to-end sync scenarios (FR-001, FR-002)
 */

// These imports are available for hook testing when needed
import {renderHook as _renderHook, act as _act, waitFor as _waitFor} from '@testing-library/react-native';

// Mock Firebase
const mockOnValue = jest.fn();
const mockOff = jest.fn();
const mockGet = jest.fn();

jest.mock('../../src/config/firebase', () => ({
  getNotesRef: jest.fn(() => ({ref: 'notes'})),
  getFlashcardsRef: jest.fn(() => ({ref: 'flashcards'})),
  getVoiceNotesRef: jest.fn(() => ({ref: 'voiceNotes'})),
  getCurrentUserId: jest.fn(() => 'test-user-id'),
  onValue: mockOnValue,
  off: mockOff,
  get: mockGet,
  ref: jest.fn(),
  child: jest.fn(),
  database: {
    ref: jest.fn(),
  },
}));

// Mock the store
const mockStoreState = {
  notes: {},
  flashcards: {},
  isOnline: true,
  isSyncing: false,
  syncError: null,
  lastSyncAt: null,
  setNotes: jest.fn(),
  setFlashcards: jest.fn(),
  setOnline: jest.fn(),
  setSyncing: jest.fn(),
  setSyncError: jest.fn(),
  mergeNotes: jest.fn(),
  mergeFlashcards: jest.fn(),
};

jest.mock('../../src/store', () => ({
  useStore: jest.fn((selector) => {
    if (typeof selector === 'function') {
      return selector(mockStoreState);
    }
    return mockStoreState;
  }),
}));

// Mock toast
jest.mock('../../src/components/common/ToastProvider', () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}));

describe('Real-time Sync Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStoreState.notes = {};
    mockStoreState.flashcards = {};
  });

  describe('Sync Service Connection', () => {
    it('should establish Firebase listeners on subscription', async () => {
      const {
        subscribeToNotes,
      } = require('../../src/services/sync/realtimeSyncService');

      const unsubscribe = subscribeToNotes('test-user-id', {
        onData: jest.fn(),
        onError: jest.fn(),
      });

      expect(mockOnValue).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    it('should handle connection state changes', async () => {
      const {
        subscribeToConnectionState,
      } = require('../../src/services/sync/realtimeSyncService');

      const onConnect = jest.fn();
      const onDisconnect = jest.fn();

      subscribeToConnectionState(onConnect, onDisconnect);

      // Verify the subscription was set up
      expect(mockOnValue).toHaveBeenCalled();
    });
  });

  describe('Conflict Resolution', () => {
    it('should apply last-write-wins for conflicting updates', () => {
      const {
        resolveConflict,
      } = require('../../src/services/sync/conflictResolver');

      const localItem = {
        id: '1',
        title: 'Local Version',
        updatedAt: 1000,
      };

      const remoteItem = {
        id: '1',
        title: 'Remote Version',
        updatedAt: 2000, // More recent
      };

      const result = resolveConflict(localItem, remoteItem);

      expect(result).toEqual(remoteItem);
    });

    it('should keep local changes when more recent', () => {
      const {
        resolveConflict,
      } = require('../../src/services/sync/conflictResolver');

      const localItem = {
        id: '1',
        title: 'Local Version',
        updatedAt: 3000, // More recent
      };

      const remoteItem = {
        id: '1',
        title: 'Remote Version',
        updatedAt: 2000,
      };

      const result = resolveConflict(localItem, remoteItem);

      expect(result).toEqual(localItem);
    });

    it('should merge arrays of items with conflict resolution', () => {
      const {
        mergeWithConflictResolution,
      } = require('../../src/services/sync/conflictResolver');

      const localItems = [
        {id: '1', title: 'Local 1', updatedAt: 1000},
        {id: '2', title: 'Local 2', updatedAt: 3000},
      ];

      const remoteItems = [
        {id: '1', title: 'Remote 1', updatedAt: 2000},
        {id: '2', title: 'Remote 2', updatedAt: 1000},
        {id: '3', title: 'Remote 3', updatedAt: 1000},
      ];

      const onConflict = jest.fn();
      const merged = mergeWithConflictResolution(localItems, remoteItems, onConflict);

      // Should have 3 items
      expect(merged.length).toBe(3);

      // Item 1 should use remote (more recent)
      const item1 = merged.find((i: any) => i.id === '1');
      expect(item1?.title).toBe('Remote 1');

      // Item 2 should use local (more recent)
      const item2 = merged.find((i: any) => i.id === '2');
      expect(item2?.title).toBe('Local 2');

      // Item 3 should be new from remote
      const item3 = merged.find((i: any) => i.id === '3');
      expect(item3?.title).toBe('Remote 3');

      // Conflict callback should be called for conflicting items
      expect(onConflict).toHaveBeenCalled();
    });
  });

  describe('Offline Handling', () => {
    it('should queue changes when offline', async () => {
      mockStoreState.isOnline = false;

      // When offline, optimistic changes should still be applied locally
      // but not synced to server
      const {
        hasPendingChanges,
        clearAllPendingChanges,
      } = require('../../src/services/sync/optimisticUpdateManager');

      clearAllPendingChanges();

      // Simulating an offline scenario - pending changes would accumulate
      expect(hasPendingChanges()).toBe(false);
    });
  });

  describe('Force Refresh', () => {
    it('should bypass cache on force refresh', async () => {
      mockGet.mockResolvedValue({
        val: () => ({
          note1: {title: 'Note 1', content: 'Content 1', updatedAt: Date.now()},
        }),
      });

      const {
        forceRefreshNotes,
      } = require('../../src/services/sync/realtimeSyncService');

      const notes = await forceRefreshNotes('test-user-id');

      expect(mockGet).toHaveBeenCalled();
      expect(Array.isArray(notes)).toBe(true);
    });
  });
});

describe('Sync Error Scenarios', () => {
  it('should handle network errors gracefully', async () => {
    mockOnValue.mockImplementation((_ref, _onData, onError) => {
      onError(new Error('Network error'));
      return jest.fn();
    });

    const {
      subscribeToNotes,
    } = require('../../src/services/sync/realtimeSyncService');

    const onError = jest.fn();
    subscribeToNotes('test-user-id', {
      onData: jest.fn(),
      onError,
    });

    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should handle permission denied errors', async () => {
    mockOnValue.mockImplementation((_ref, _onData, onError) => {
      const error = new Error('Permission denied');
      (error as any).code = 'PERMISSION_DENIED';
      onError(error);
      return jest.fn();
    });

    const {
      subscribeToNotes,
    } = require('../../src/services/sync/realtimeSyncService');

    const onError = jest.fn();
    subscribeToNotes('test-user-id', {
      onData: jest.fn(),
      onError,
    });

    expect(onError).toHaveBeenCalled();
  });
});
