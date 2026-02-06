# API Contract: Firebase Realtime Operations

**Feature**: 003-realtime-sync-progress
**Date**: 2026-02-05

## Overview

This document defines the Firebase Realtime Database operations for real-time synchronization. All operations use the existing Firebase SDK (`@react-native-firebase/database`).

---

## Real-time Listener Operations

### subscribeToNotes

Subscribe to real-time updates for user's notes.

```typescript
/**
 * @param userId - The authenticated user's ID
 * @param onData - Callback fired when data changes
 * @param onError - Callback fired on error
 * @returns Unsubscribe function
 */
function subscribeToNotes(
  userId: string,
  onData: (notes: Note[]) => void,
  onError: (error: Error) => void
): () => void;
```

**Firebase Path**: `users/{userId}/notes`

**Behavior**:
- Initial call triggers with all existing notes
- Subsequent calls triggered on any add/update/delete
- Offline: Returns cached data, queues writes
- Online: Syncs immediately

**Example Usage**:
```typescript
useEffect(() => {
  const unsubscribe = subscribeToNotes(
    userId,
    (notes) => store.setNotes(notes),
    (error) => store.setSyncError(error.message)
  );
  return unsubscribe;
}, [userId]);
```

---

### subscribeToFlashcards

Subscribe to real-time updates for user's flashcards.

```typescript
function subscribeToFlashcards(
  userId: string,
  onData: (flashcards: Flashcard[]) => void,
  onError: (error: Error) => void
): () => void;
```

**Firebase Path**: `users/{userId}/flashcards`

---

### subscribeToVoiceNotes

Subscribe to real-time updates for user's voice notes.

```typescript
function subscribeToVoiceNotes(
  userId: string,
  onData: (voiceNotes: VoiceNote[]) => void,
  onError: (error: Error) => void
): () => void;
```

**Firebase Path**: `users/{userId}/voiceNotes`

---

### subscribeToEntity (Generic)

Generic subscription for any entity type.

```typescript
function subscribeToEntity<T>(
  path: string,
  onData: (items: T[]) => void,
  onError: (error: Error) => void
): () => void;
```

**Implementation**:
```typescript
const subscribeToEntity = <T>(
  path: string,
  onData: (items: T[]) => void,
  onError: (error: Error) => void
): (() => void) => {
  const dbRef = ref(getDatabase(), path);

  const unsubscribe = onValue(
    dbRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const items = Object.values(data) as T[];
        onData(items);
      } else {
        onData([]);
      }
    },
    (error) => {
      onError(error);
    }
  );

  return unsubscribe;
};
```

---

## Write Operations with Optimistic Updates

### createItemWithSync

Create an item with optimistic UI update.

```typescript
interface CreateResult<T> {
  optimisticId: string;      // Temp ID for immediate UI
  promise: Promise<T>;       // Resolves with server-confirmed item
}

function createItemWithSync<T extends { id: string }>(
  path: string,
  item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
  generateId: () => string
): CreateResult<T>;
```

**Flow**:
1. Generate temp ID (e.g., `temp_1234567890`)
2. Return optimistic item immediately
3. Write to Firebase with `serverTimestamp()`
4. On success: Replace temp ID with real ID in store
5. On error: Remove optimistic item, show toast

**Example**:
```typescript
const { optimisticId, promise } = createItemWithSync<Note>(
  `users/${userId}/notes`,
  { title: 'New Note', content: '' },
  () => `note_${Date.now()}`
);

// Optimistic: Add to store immediately
store.addNote({ id: optimisticId, ...item, _optimistic: true });

// Wait for server
try {
  const confirmedNote = await promise;
  store.replaceNote(optimisticId, confirmedNote);
} catch (error) {
  store.removeNote(optimisticId);
  showToast('Failed to create note');
}
```

---

### updateItemWithSync

Update an item with optimistic UI update.

```typescript
function updateItemWithSync<T extends { id: string; updatedAt: number }>(
  path: string,
  itemId: string,
  updates: Partial<T>
): Promise<T>;
```

**Conflict Detection**:
```typescript
// Server-side rule (pseudo-code)
if (incoming.updatedAt < existing.updatedAt) {
  // Reject update, client will receive newer version via listener
  throw new Error('CONFLICT');
}
```

**Client Handling**:
```typescript
try {
  await updateItemWithSync(path, id, updates);
} catch (error) {
  if (error.message === 'CONFLICT') {
    showToast('Your changes were synced with a newer version');
    // Listener will deliver server version
  } else {
    showToast('Failed to save changes');
  }
}
```

---

### deleteItemWithSync

Delete an item with optimistic UI update.

```typescript
function deleteItemWithSync(
  path: string,
  itemId: string
): Promise<void>;
```

**Flow**:
1. Mark item as `_deleting: true` in store (fade UI)
2. Remove from Firebase
3. On success: Remove from store (already done by listener)
4. On error: Restore item, show toast

---

## Refresh Operations

### forceRefresh

Force refresh all data for an entity type (pull-to-refresh).

```typescript
function forceRefresh<T>(
  path: string
): Promise<T[]>;
```

**Implementation**:
```typescript
const forceRefresh = async <T>(path: string): Promise<T[]> => {
  const dbRef = ref(getDatabase(), path);
  // Use get() for one-time fetch, bypasses local cache
  const snapshot = await get(dbRef);

  if (snapshot.exists()) {
    return Object.values(snapshot.val()) as T[];
  }
  return [];
};
```

**Usage with Pull-to-Refresh**:
```typescript
const handleRefresh = async () => {
  setRefreshing(true);
  try {
    const notes = await forceRefresh<Note>(`users/${userId}/notes`);
    store.setNotes(notes);
  } catch (error) {
    showToast('Failed to refresh. Check your connection.');
  } finally {
    setRefreshing(false);
  }
};
```

---

## Connection State

### subscribeToConnectionState

Monitor Firebase connection state.

```typescript
function subscribeToConnectionState(
  onConnected: () => void,
  onDisconnected: () => void
): () => void;
```

**Implementation**:
```typescript
const subscribeToConnectionState = (
  onConnected: () => void,
  onDisconnected: () => void
): (() => void) => {
  const connectedRef = ref(getDatabase(), '.info/connected');

  const unsubscribe = onValue(connectedRef, (snapshot) => {
    if (snapshot.val() === true) {
      onConnected();
    } else {
      onDisconnected();
    }
  });

  return unsubscribe;
};
```

---

## Error Codes

| Code | Description | User Message |
|------|-------------|--------------|
| `PERMISSION_DENIED` | User not authenticated or lacks access | "Please sign in again" |
| `NETWORK_ERROR` | No internet connection | "No internet connection" |
| `CONFLICT` | Data was modified on server | "Your changes were synced with a newer version" |
| `QUOTA_EXCEEDED` | Firebase quota limit hit | "Service temporarily unavailable" |
| `UNKNOWN` | Unexpected error | "Something went wrong. Please try again." |

---

## Timestamps

All entities use Unix timestamps (milliseconds) for consistency:

```typescript
// Client-generated (for optimistic updates)
const clientTimestamp = Date.now();

// Server-generated (for confirmed writes)
import { serverTimestamp } from '@react-native-firebase/database';
const serverTs = serverTimestamp();
```

**Conflict Resolution**: Compare `updatedAt` timestamps. Higher timestamp wins.
