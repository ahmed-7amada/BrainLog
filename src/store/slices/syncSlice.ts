/**
 * Sync Slice
 * Manages real-time synchronization state (FR-001, FR-002, FR-004, FR-022)
 */

import { StateCreator } from 'zustand';

export interface SyncSlice {
  // Connection state
  isOnline: boolean;
  lastOnlineAt: number | null;

  // Listener state
  activeListeners: Record<string, boolean>;

  // Global sync state
  isSyncing: boolean;
  lastSyncAt: number | null;
  syncError: string | null;

  // Pending items count by entity type
  pendingCounts: Record<string, number>;

  // Actions
  setOnline: (online: boolean) => void;
  setActiveListener: (path: string, active: boolean) => void;
  setSyncing: (syncing: boolean) => void;
  setLastSyncAt: (timestamp: number) => void;
  setSyncError: (error: string | null) => void;
  updatePendingCount: (entityType: string, count: number) => void;
  clearSyncState: () => void;
}

export const createSyncSlice: StateCreator<SyncSlice> = set => ({
  // Initial state
  isOnline: true,
  lastOnlineAt: null,
  activeListeners: {},
  isSyncing: false,
  lastSyncAt: null,
  syncError: null,
  pendingCounts: {},

  // Actions
  setOnline: online =>
    set(state => ({
      isOnline: online,
      lastOnlineAt: online ? Date.now() : state.lastOnlineAt,
      syncError: online ? null : state.syncError,
    })),

  setActiveListener: (path, active) =>
    set(state => ({
      activeListeners: {
        ...state.activeListeners,
        [path]: active,
      },
    })),

  setSyncing: syncing => set({ isSyncing: syncing }),

  setLastSyncAt: timestamp => set({ lastSyncAt: timestamp }),

  setSyncError: error =>
    set({
      syncError: error,
      isSyncing: false,
    }),

  updatePendingCount: (entityType, count) =>
    set(state => ({
      pendingCounts: {
        ...state.pendingCounts,
        [entityType]: count,
      },
    })),

  clearSyncState: () =>
    set({
      activeListeners: {},
      isSyncing: false,
      syncError: null,
      pendingCounts: {},
    }),
});

// Selectors
export const selectIsOnline = (state: SyncSlice): boolean => state.isOnline;

export const selectIsSyncing = (state: SyncSlice): boolean => state.isSyncing;

export const selectSyncError = (state: SyncSlice): string | null => state.syncError;

export const selectTotalPendingCount = (state: SyncSlice): number =>
  Object.values(state.pendingCounts).reduce((sum, count) => sum + count, 0);

export const selectActiveListenerCount = (state: SyncSlice): number =>
  Object.values(state.activeListeners).filter(Boolean).length;

export const selectIsListenerActive = (state: SyncSlice, path: string): boolean =>
  state.activeListeners[path] ?? false;
