/**
 * Optimistic Update Manager
 * Tracks pending changes and handles rollback on failure (FR-017)
 */

import { useStore } from '../../store';
import type { Note } from '../../models/Note';
import type { Flashcard } from '../../models/Flashcard';

export type EntityType = 'note' | 'flashcard' | 'voiceNote';
export type OperationType = 'create' | 'update' | 'delete';

export interface PendingChange<T = unknown> {
  id: string;
  entityType: EntityType;
  operationType: OperationType;
  tempId?: string; // For create operations
  entityId: string; // Real or temp ID
  originalData?: T; // For update/delete rollback
  optimisticData: T; // The optimistic data shown to user
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

// In-memory pending changes store
const pendingChanges = new Map<string, PendingChange>();

// Callback for toast notifications
let toastCallback: ((message: string, type: 'success' | 'error' | 'info') => void) | null = null;

/**
 * Set the toast callback for notifications
 */
export const setToastCallback = (
  callback: (message: string, type: 'success' | 'error' | 'info') => void,
): void => {
  toastCallback = callback;
};

/**
 * Generate a temporary ID for optimistic creates
 */
export const generateTempId = (): string => {
  return `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Check if an ID is a temporary ID
 */
export const isTempId = (id: string): boolean => {
  return id.startsWith('temp_');
};

/**
 * Track a pending optimistic change
 */
export const trackPendingChange = <T>(
  entityType: EntityType,
  operationType: OperationType,
  entityId: string,
  optimisticData: T,
  originalData?: T,
): string => {
  const changeId = `${entityType}_${operationType}_${entityId}_${Date.now()}`;

  const change: PendingChange<T> = {
    id: changeId,
    entityType,
    operationType,
    entityId,
    tempId: operationType === 'create' ? entityId : undefined,
    originalData,
    optimisticData,
    timestamp: Date.now(),
    retryCount: 0,
    maxRetries: 3,
  };

  pendingChanges.set(changeId, change as PendingChange);

  return changeId;
};

/**
 * Mark a pending change as complete (server confirmed)
 */
export const confirmChange = (changeId: string, confirmedId?: string): void => {
  const change = pendingChanges.get(changeId);

  if (change) {
    // If this was a create operation and we have a confirmed ID, update the entity
    if (change.operationType === 'create' && confirmedId && change.tempId) {
      const store = useStore.getState();

      if (change.entityType === 'note') {
        const confirmedNote = {
          ...(change.optimisticData as Note),
          id: confirmedId,
          _optimistic: false,
        };
        store.replaceNote(change.tempId, confirmedNote);
      } else if (change.entityType === 'flashcard') {
        const confirmedFlashcard = {
          ...(change.optimisticData as Flashcard),
          id: confirmedId,
          _optimistic: false,
        };
        store.replaceFlashcard(change.tempId, confirmedFlashcard);
      }
    } else {
      // For update/delete operations, just clear the optimistic flag
      const store = useStore.getState();

      if (change.entityType === 'note') {
        store.markNoteOptimistic(change.entityId, false);
      } else if (change.entityType === 'flashcard') {
        store.markFlashcardOptimistic(change.entityId, false);
      }
    }

    pendingChanges.delete(changeId);
  }
};

/**
 * Rollback a failed change
 */
export const rollbackChange = (changeId: string, errorMessage?: string): void => {
  const change = pendingChanges.get(changeId);

  if (!change) return;

  const store = useStore.getState();

  switch (change.operationType) {
    case 'create':
      // Remove the optimistically created entity
      if (change.entityType === 'note') {
        store.removeNote(change.entityId);
      } else if (change.entityType === 'flashcard') {
        store.removeFlashcard(change.entityId);
      }
      break;

    case 'update':
      // Restore the original data
      if (change.originalData) {
        if (change.entityType === 'note') {
          const originalNote = change.originalData as Note;
          store.updateNote(change.entityId, {
            ...originalNote,
            _optimistic: false,
          });
        } else if (change.entityType === 'flashcard') {
          const originalFlashcard = change.originalData as Flashcard;
          store.updateFlashcard(change.entityId, {
            ...originalFlashcard,
            _optimistic: false,
          });
        }
      }
      break;

    case 'delete':
      // Restore the deleted entity
      if (change.originalData) {
        if (change.entityType === 'note') {
          const restoredNote = {
            ...(change.originalData as Note),
            _optimistic: false,
          };
          store.addNote(restoredNote);
        } else if (change.entityType === 'flashcard') {
          const restoredFlashcard = {
            ...(change.originalData as Flashcard),
            _optimistic: false,
          };
          store.addFlashcard(restoredFlashcard);
        }
      }
      break;
  }

  // Show toast notification
  if (toastCallback) {
    const entityName = change.entityType.charAt(0).toUpperCase() + change.entityType.slice(1);
    const actionName = getActionName(change.operationType);
    const message =
      errorMessage || `Failed to ${actionName} ${entityName.toLowerCase()}. Changes reverted.`;
    toastCallback(message, 'error');
  }

  pendingChanges.delete(changeId);
};

/**
 * Get human-readable action name
 */
const getActionName = (operationType: OperationType): string => {
  switch (operationType) {
    case 'create':
      return 'create';
    case 'update':
      return 'save';
    case 'delete':
      return 'delete';
    default:
      return 'update';
  }
};

/**
 * Get all pending changes for an entity type
 */
export const getPendingChanges = (entityType?: EntityType): PendingChange[] => {
  const changes = Array.from(pendingChanges.values());

  if (entityType) {
    return changes.filter(c => c.entityType === entityType);
  }

  return changes;
};

/**
 * Check if there are any pending changes
 */
export const hasPendingChanges = (entityType?: EntityType): boolean => {
  return getPendingChanges(entityType).length > 0;
};

/**
 * Get a specific pending change
 */
export const getPendingChange = (changeId: string): PendingChange | undefined => {
  return pendingChanges.get(changeId);
};

/**
 * Clear all pending changes (use with caution)
 */
export const clearAllPendingChanges = (): void => {
  pendingChanges.clear();
};

/**
 * Execute an operation optimistically with automatic rollback on failure
 */
export const executeOptimistically = async <T, R>(options: {
  entityType: EntityType;
  operationType: OperationType;
  entityId: string;
  optimisticData: T;
  originalData?: T;
  applyOptimistic: () => void;
  serverOperation: () => Promise<R>;
  onSuccess?: (result: R, changeId: string) => void;
  onError?: (error: Error, changeId: string) => void;
}): Promise<R> => {
  const {
    entityType,
    operationType,
    entityId,
    optimisticData,
    originalData,
    applyOptimistic,
    serverOperation,
    onSuccess,
    onError,
  } = options;

  // Track the pending change
  const changeId = trackPendingChange(
    entityType,
    operationType,
    entityId,
    optimisticData,
    originalData,
  );

  // Apply the optimistic update immediately
  applyOptimistic();

  try {
    // Execute the server operation
    const result = await serverOperation();

    // Confirm the change
    if (
      operationType === 'create' &&
      typeof result === 'object' &&
      result !== null &&
      'id' in result
    ) {
      confirmChange(changeId, (result as { id: string }).id);
    } else {
      confirmChange(changeId);
    }

    onSuccess?.(result, changeId);
    return result;
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Operation failed');

    // Rollback the change
    rollbackChange(changeId, err.message);

    onError?.(err, changeId);
    throw err;
  }
};

export default {
  setToastCallback,
  generateTempId,
  isTempId,
  trackPendingChange,
  confirmChange,
  rollbackChange,
  getPendingChanges,
  hasPendingChanges,
  getPendingChange,
  clearAllPendingChanges,
  executeOptimistically,
};
