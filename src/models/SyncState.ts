/**
 * SyncState Model
 * Represents the synchronization status of data items (FR-001, FR-002, FR-004)
 */

export type SyncStatus = 'synced' | 'pending' | 'error';

export interface SyncState {
  status: SyncStatus;
  lastSyncedAt: number | null;
  localVersion: number;
  serverVersion: number | null;
  pendingChanges: boolean;
  errorMessage: string | null;
}

/**
 * Create initial sync state for a new item
 */
export const createInitialSyncState = (): SyncState => ({
  status: 'pending',
  lastSyncedAt: null,
  localVersion: 1,
  serverVersion: null,
  pendingChanges: true,
  errorMessage: null,
});

/**
 * Create synced state after successful server confirmation
 */
export const createSyncedState = (serverVersion: number): SyncState => ({
  status: 'synced',
  lastSyncedAt: Date.now(),
  localVersion: serverVersion,
  serverVersion,
  pendingChanges: false,
  errorMessage: null,
});

/**
 * Create error state after sync failure
 */
export const createErrorState = (previousState: SyncState, errorMessage: string): SyncState => ({
  ...previousState,
  status: 'error',
  errorMessage,
});

/**
 * Mark state as pending after local change
 */
export const markAsPending = (previousState: SyncState): SyncState => ({
  ...previousState,
  status: 'pending',
  localVersion: previousState.localVersion + 1,
  pendingChanges: true,
  errorMessage: null,
});
