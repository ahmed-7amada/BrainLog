/**
 * useRealtimeSync Hook
 * Manages Firebase real-time subscriptions for entities (FR-001, FR-002)
 */

import { useEffect, useCallback, useRef } from 'react';
import { useStore } from '../store';
import {
  subscribeToNotes,
  subscribeToFlashcards,
  subscribeToVoiceNotes,
  subscribeToConnectionState,
  forceRefreshNotes,
  forceRefreshFlashcards,
  forceRefreshVoiceNotes,
  unsubscribeAll,
} from '../services/sync/realtimeSyncService';
import { mergeWithConflictResolution, getConflictMessage } from '../services/sync/conflictResolver';
import { useToast } from '../components/common/ToastProvider';
import type { Note } from '../models/Note';
import type { Flashcard } from '../models/Flashcard';

export type EntityType = 'notes' | 'flashcards' | 'voiceNotes' | 'all';

export interface UseRealtimeSyncOptions {
  /** Which entity types to subscribe to */
  entities?: EntityType[];
  /** Whether to show toast on conflicts */
  showConflictToast?: boolean;
  /** Whether to auto-connect on mount */
  autoConnect?: boolean;
}

export interface UseRealtimeSyncResult {
  /** Whether the sync connection is active */
  isConnected: boolean;
  /** Whether currently syncing data */
  isSyncing: boolean;
  /** Last sync error if any */
  error: string | null;
  /** Timestamp of last successful sync */
  lastSyncAt: number | null;
  /** Manually trigger a refresh */
  refresh: (entityType?: EntityType) => Promise<void>;
  /** Disconnect all listeners */
  disconnect: () => void;
  /** Reconnect all listeners */
  reconnect: () => void;
}

const defaultOptions: UseRealtimeSyncOptions = {
  entities: ['all'],
  showConflictToast: true,
  autoConnect: true,
};

export const useRealtimeSync = (
  userId: string | null,
  options: UseRealtimeSyncOptions = {},
): UseRealtimeSyncResult => {
  const mergedOptions = { ...defaultOptions, ...options };
  const { entities, showConflictToast, autoConnect } = mergedOptions;

  const unsubscribersRef = useRef<(() => void)[]>([]);
  const { showToast } = useToast();

  // Store state - use selectors for reactive state only
  const isOnline = useStore(state => state.isOnline);
  const isSyncing = useStore(state => state.isSyncing);
  const syncError = useStore(state => state.syncError);
  const lastSyncAt = useStore(state => state.lastSyncAt);

  // Actions are stable - get them once from store.getState() to avoid re-renders
  const { setOnline, setSyncing, setSyncError, setNotes, setFlashcards } = useStore.getState();

  const shouldSubscribe = useCallback(
    (entity: EntityType): boolean => {
      if (!entities) return true;
      return entities.includes('all') || entities.includes(entity);
    },
    [entities],
  );

  const handleConflict = useCallback(
    (entityType: string) => {
      if (showConflictToast) {
        showToast(getConflictMessage(entityType), 'info');
      }
    },
    [showConflictToast, showToast],
  );

  const setupSubscriptions = useCallback(() => {
    if (!userId) return;

    const unsubscribers: (() => void)[] = [];

    // Subscribe to Firebase connection state
    const connUnsubscribe = subscribeToConnectionState(
      () => setOnline(true),
      () => setOnline(false),
    );
    unsubscribers.push(connUnsubscribe);

    // Subscribe to notes
    if (shouldSubscribe('notes')) {
      const notesUnsubscribe = subscribeToNotes(userId, {
        onData: remoteNotes => {
          // Read current state at callback time to avoid stale closures
          const currentNotes = useStore.getState().notes;
          const localNotes = Object.values(currentNotes);
          const merged = mergeWithConflictResolution<Note>(localNotes, remoteNotes, () =>
            handleConflict('note'),
          );
          setNotes(merged);
        },
        onError: error => {
          setSyncError(error.message);
        },
      });
      unsubscribers.push(notesUnsubscribe);
    }

    // Subscribe to flashcards
    if (shouldSubscribe('flashcards')) {
      const flashcardsUnsubscribe = subscribeToFlashcards(userId, {
        onData: remoteFlashcards => {
          // Read current state at callback time to avoid stale closures
          const currentFlashcards = useStore.getState().flashcards;
          const localFlashcards = Object.values(currentFlashcards);
          const merged = mergeWithConflictResolution<Flashcard>(
            localFlashcards,
            remoteFlashcards,
            () => handleConflict('flashcard'),
          );
          setFlashcards(merged);
        },
        onError: error => {
          setSyncError(error.message);
        },
      });
      unsubscribers.push(flashcardsUnsubscribe);
    }

    // Subscribe to voice notes
    if (shouldSubscribe('voiceNotes')) {
      // VoiceNotes are typically stored in a separate slice
      // For now, we just set up the listener
      const voiceNotesUnsubscribe = subscribeToVoiceNotes(userId, {
        onData: _voiceNotes => {
          // Voice notes would be handled by a voiceNotesSlice
          // This is a placeholder for when that slice is implemented
        },
        onError: error => {
          setSyncError(error.message);
        },
      });
      unsubscribers.push(voiceNotesUnsubscribe);
    }

    unsubscribersRef.current = unsubscribers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, shouldSubscribe, handleConflict]); // Store actions are stable via getState()

  const disconnect = useCallback(() => {
    unsubscribersRef.current.forEach(unsubscribe => unsubscribe());
    unsubscribersRef.current = [];
    unsubscribeAll();
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    setupSubscriptions();
  }, [disconnect, setupSubscriptions]);

  const refresh = useCallback(
    async (entityType: EntityType = 'all'): Promise<void> => {
      if (!userId) return;

      setSyncing(true);
      setSyncError(null);

      try {
        if (entityType === 'all' || entityType === 'notes') {
          if (shouldSubscribe('notes')) {
            const refreshedNotes = await forceRefreshNotes(userId);
            setNotes(refreshedNotes);
          }
        }

        if (entityType === 'all' || entityType === 'flashcards') {
          if (shouldSubscribe('flashcards')) {
            const refreshedFlashcards = await forceRefreshFlashcards(userId);
            setFlashcards(refreshedFlashcards);
          }
        }

        if (entityType === 'all' || entityType === 'voiceNotes') {
          if (shouldSubscribe('voiceNotes')) {
            await forceRefreshVoiceNotes(userId);
            // Would update voiceNotesSlice when available
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to refresh data';
        setSyncError(errorMessage);
        showToast('Failed to refresh. Check your connection.', 'error');
      } finally {
        setSyncing(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId, shouldSubscribe, showToast], // Store actions are stable via getState()
  );

  // Set up subscriptions on mount
  useEffect(() => {
    if (autoConnect && userId) {
      setupSubscriptions();
    }

    return () => {
      disconnect();
    };
  }, [userId, autoConnect, setupSubscriptions, disconnect]);

  return {
    isConnected: isOnline,
    isSyncing,
    error: syncError,
    lastSyncAt,
    refresh,
    disconnect,
    reconnect,
  };
};

export default useRealtimeSync;
