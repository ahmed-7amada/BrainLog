/**
 * Real-time Sync Service
 * Firebase Realtime Database listener management (FR-001, FR-002, FR-004)
 */

import { getDatabase, ref, onValue, get } from '../../config/firebase';
import type { Note } from '../../models/Note';
import type { Flashcard } from '../../models/Flashcard';
import type { VoiceNote } from '../../models/VoiceNote';
import { useStore } from '../../store';

export type EntityType = 'notes' | 'flashcards' | 'voiceNotes';

export interface ListenerConfig {
  path: string;
  entityType: EntityType;
}

export interface SyncCallbacks<T> {
  onData: (items: T[]) => void;
  onError: (error: Error) => void;
}

// Map to track active listeners
const activeListeners = new Map<string, () => void>();

/**
 * Generic subscription to Firebase entity path
 */
export const subscribeToEntity = <T extends { id: string; updatedAt?: number }>(
  path: string,
  callbacks: SyncCallbacks<T>,
): (() => void) => {
  const dbRef = ref(getDatabase(), path);

  const unsubscribe = onValue(
    dbRef,
    snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const items: T[] = Object.entries(data).map(([id, item]: [string, any]) => ({
          ...item,
          id,
        }));
        // Sort by updatedAt descending
        items.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        callbacks.onData(items);
      } else {
        callbacks.onData([]);
      }
    },
    error => {
      callbacks.onError(error);
    },
  );

  return unsubscribe;
};

/**
 * Subscribe to notes for a user
 */
export const subscribeToNotes = (userId: string, callbacks: SyncCallbacks<Note>): (() => void) => {
  const path = `users/${userId}/notes`;

  const unsubscribe = subscribeToEntity<Note>(path, {
    onData: notes => {
      callbacks.onData(notes);
      // Update sync timestamp outside of render cycle
      setTimeout(() => useStore.getState().setLastSyncAt(Date.now()), 0);
    },
    onError: error => {
      callbacks.onError(error);
      useStore.getState().setSyncError(error.message);
    },
  });

  // Store cleanup function in local Map (not Zustand state)
  activeListeners.set(path, unsubscribe);

  return () => {
    unsubscribe();
    activeListeners.delete(path);
  };
};

/**
 * Subscribe to flashcards for a user
 */
export const subscribeToFlashcards = (
  userId: string,
  callbacks: SyncCallbacks<Flashcard>,
): (() => void) => {
  const path = `users/${userId}/flashcards`;

  const unsubscribe = subscribeToEntity<Flashcard>(path, {
    onData: flashcards => {
      callbacks.onData(flashcards);
      // Update sync timestamp outside of render cycle
      setTimeout(() => useStore.getState().setLastSyncAt(Date.now()), 0);
    },
    onError: error => {
      callbacks.onError(error);
      useStore.getState().setSyncError(error.message);
    },
  });

  activeListeners.set(path, unsubscribe);

  return () => {
    unsubscribe();
    activeListeners.delete(path);
  };
};

/**
 * Subscribe to voice notes for a user
 */
export const subscribeToVoiceNotes = (
  userId: string,
  callbacks: SyncCallbacks<VoiceNote>,
): (() => void) => {
  const path = `users/${userId}/voice_notes`;

  const unsubscribe = subscribeToEntity<VoiceNote>(path, {
    onData: voiceNotes => {
      callbacks.onData(voiceNotes);
      // Update sync timestamp outside of render cycle
      setTimeout(() => useStore.getState().setLastSyncAt(Date.now()), 0);
    },
    onError: error => {
      callbacks.onError(error);
      useStore.getState().setSyncError(error.message);
    },
  });

  activeListeners.set(path, unsubscribe);

  return () => {
    unsubscribe();
    activeListeners.delete(path);
  };
};

/**
 * Force refresh data for a path (bypasses cache)
 */
export const forceRefresh = async <T>(path: string): Promise<T[]> => {
  const dbRef = ref(getDatabase(), path);
  const snapshot = await get(dbRef);

  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.entries(data).map(([id, item]: [string, any]) => ({
      ...item,
      id,
    }));
  }
  return [];
};

/**
 * Force refresh notes for a user
 */
export const forceRefreshNotes = async (userId: string): Promise<Note[]> => {
  return forceRefresh<Note>(`users/${userId}/notes`);
};

/**
 * Force refresh flashcards for a user
 */
export const forceRefreshFlashcards = async (userId: string): Promise<Flashcard[]> => {
  return forceRefresh<Flashcard>(`users/${userId}/flashcards`);
};

/**
 * Force refresh voice notes for a user
 */
export const forceRefreshVoiceNotes = async (userId: string): Promise<VoiceNote[]> => {
  return forceRefresh<VoiceNote>(`users/${userId}/voice_notes`);
};

/**
 * Subscribe to Firebase connection state
 */
export const subscribeToConnectionState = (
  onConnected: () => void,
  onDisconnected: () => void,
): (() => void) => {
  const connectedRef = ref(getDatabase(), '.info/connected');

  const unsubscribe = onValue(connectedRef, snapshot => {
    if (snapshot.val() === true) {
      onConnected();
    } else {
      onDisconnected();
    }
  });

  return unsubscribe;
};

/**
 * Unsubscribe from all active listeners
 */
export const unsubscribeAll = (): void => {
  activeListeners.forEach(unsubscribe => {
    unsubscribe();
  });
  activeListeners.clear();
};

/**
 * Get count of active listeners
 */
export const getActiveListenerCount = (): number => {
  return activeListeners.size;
};

/**
 * Check if a specific path has an active listener
 */
export const isListenerActive = (path: string): boolean => {
  return activeListeners.has(path);
};
