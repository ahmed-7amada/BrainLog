# Data Model: Real-time Sync and Upload Progress

**Feature**: 003-realtime-sync-progress
**Date**: 2026-02-05

## Overview

This document defines the data entities required for real-time synchronization and upload progress tracking. These entities extend the existing BrainLog data model.

## New Entities

### SyncState

Represents the synchronization status attached to any syncable entity.

```typescript
interface SyncState {
  status: 'synced' | 'pending' | 'error';
  lastSyncedAt: number | null;      // Unix timestamp
  localVersion: number;              // Incrementing version for conflict detection
  serverVersion: number | null;      // Version from server
  pendingChanges: boolean;           // Has unsaved local changes
  errorMessage: string | null;       // Last sync error message
}
```

**Usage**: Attached to Notes, Flashcards, VoiceNotes, etc. via composition.

**Validation Rules**:
- `status` must be one of the enum values
- `lastSyncedAt` is null until first successful sync
- `localVersion` starts at 1, increments on each local change
- `serverVersion` is null for new items not yet saved to server

**State Transitions**:
```
[new item] → pending → synced
                    ↘ error → pending (on retry) → synced
[edit] synced → pending → synced
                       ↘ error
[server update] synced → synced (with new serverVersion)
```

---

### UploadTask

Represents a file upload operation in the queue.

```typescript
interface UploadTask {
  id: string;                        // Unique task ID (e.g., upload_1234567890)
  userId: string;                    // Owner user ID
  fileName: string;                  // Display name of file
  filePath: string;                  // Local file path
  fileSize: number;                  // Size in bytes
  mimeType: string;                  // e.g., 'audio/m4a'

  // Status tracking
  status: 'queued' | 'uploading' | 'completed' | 'failed' | 'cancelled';
  progress: number;                  // 0-100 percentage

  // Timing
  createdAt: number;                 // When added to queue
  startedAt: number | null;          // When upload began
  completedAt: number | null;        // When upload finished

  // Result
  remoteUrl: string | null;          // Google Drive URL after success
  remoteFileId: string | null;       // Google Drive file ID
  errorMessage: string | null;       // Error details if failed

  // Retry tracking
  retryCount: number;                // Number of retry attempts (max 3)

  // Association (optional)
  entityType: 'voiceNote' | 'attachment' | null;
  entityId: string | null;           // ID of associated entity
}
```

**Validation Rules**:
- `id` must be unique across all tasks
- `progress` must be 0-100
- `retryCount` must be 0-3
- `fileSize` must be positive and < 100MB (104857600 bytes)
- `status` transitions follow defined flow

**State Transitions**:
```
queued → uploading → completed
                  ↘ failed → queued (retry, max 3) → failed (permanent)
                  ↘ cancelled
```

---

### ActivityLogEntry

Represents a logged upload activity for the activity log UI.

```typescript
interface ActivityLogEntry {
  id: string;                        // Unique entry ID
  userId: string;                    // Owner user ID

  // Activity details
  type: 'upload' | 'sync' | 'conflict';
  action: 'started' | 'completed' | 'failed' | 'retried' | 'resolved';

  // Reference
  taskId: string | null;             // Reference to UploadTask if type='upload'
  entityType: string | null;         // e.g., 'voiceNote', 'note'
  entityId: string | null;
  entityName: string;                // Display name for UI

  // Status
  status: 'in_progress' | 'success' | 'error';
  progress: number | null;           // Current progress if in_progress (0-100)
  errorMessage: string | null;

  // Timing
  timestamp: number;                 // When this entry was created
  duration: number | null;           // Duration in ms if completed

  // UI metadata
  canRetry: boolean;                 // Show retry button
  canDismiss: boolean;               // Show dismiss button
}
```

**Validation Rules**:
- `id` must be unique
- `progress` null unless status is 'in_progress'
- `duration` null unless action is 'completed' or 'failed'
- `timestamp` required, must be positive

**Retention**: Entries older than 7 days are automatically purged.

---

### ConflictRecord

Represents a detected data conflict for potential future advanced resolution.

```typescript
interface ConflictRecord {
  id: string;                        // Unique conflict ID
  userId: string;

  // Conflict context
  entityType: string;                // e.g., 'note', 'flashcard'
  entityId: string;

  // Versions
  localVersion: object;              // Local data at conflict time
  serverVersion: object;             // Server data that won
  resolvedVersion: object;           // Final resolved data

  // Resolution
  resolution: 'server_wins' | 'local_wins' | 'merged';
  resolvedAt: number;
  wasNotified: boolean;              // User was shown toast

  // Timing
  detectedAt: number;
}
```

**Usage**: For audit/debugging. Currently all conflicts resolve as 'server_wins' per spec.

---

## Extended Entities

Existing entities gain optional SyncState tracking:

### Note (extended)

```typescript
interface Note {
  // ... existing fields ...

  // NEW: Sync metadata
  syncState?: SyncState;
  updatedAt: number;                 // Required for conflict resolution
  _optimistic?: boolean;             // True if not yet confirmed by server
}
```

### Flashcard (extended)

```typescript
interface Flashcard {
  // ... existing fields ...

  // NEW: Sync metadata
  syncState?: SyncState;
  updatedAt: number;
  _optimistic?: boolean;
}
```

### VoiceNote (extended)

```typescript
interface VoiceNote {
  // ... existing fields ...

  // NEW: Sync and upload metadata
  syncState?: SyncState;
  uploadTaskId?: string;             // Reference to upload task if still uploading
  updatedAt: number;
  _optimistic?: boolean;
}
```

---

## Store State Shape

### syncSlice

```typescript
interface SyncSlice {
  // Connection state
  isOnline: boolean;
  lastOnlineAt: number | null;

  // Listener state
  activeListeners: Record<string, boolean>;  // path → isActive

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
  setSyncError: (error: string | null) => void;
  updatePendingCount: (entityType: string, count: number) => void;
}
```

### uploadSlice

```typescript
interface UploadSlice {
  // Queue state
  uploadQueue: UploadTask[];
  activeUploads: UploadTask[];       // Max 3

  // Activity log
  activityLog: ActivityLogEntry[];

  // Summary for badge
  activeCount: number;
  failedCount: number;

  // Actions
  enqueueUpload: (task: Omit<UploadTask, 'id' | 'createdAt' | 'status' | 'progress'>) => string;
  updateUploadProgress: (taskId: string, progress: number) => void;
  completeUpload: (taskId: string, remoteUrl: string, remoteFileId: string) => void;
  failUpload: (taskId: string, error: string) => void;
  retryUpload: (taskId: string) => void;
  cancelUpload: (taskId: string) => void;

  // Activity log actions
  addActivityEntry: (entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => void;
  updateActivityProgress: (entryId: string, progress: number) => void;
  clearOldActivity: () => void;      // Remove entries > 7 days
}
```

---

## Firebase Database Structure

```
users/
  {userId}/
    notes/
      {noteId}: Note
    flashcards/
      {flashcardId}: Flashcard
    voiceNotes/
      {voiceNoteId}: VoiceNote
    ... (existing entities)

    # NEW: Local-only, not synced to Firebase
    # Stored in MMKV instead:
    # - uploadQueue
    # - activityLog
    # - conflictRecords
```

**Note**: Upload queue and activity log are stored locally in MMKV, not Firebase, because:
1. They're device-specific (upload paths are local)
2. Reduces Firebase read/write costs
3. Faster access for UI updates

---

## Indexes and Queries

### Firebase Indexes Required

None additional - existing structure supports real-time listeners per entity path.

### Local MMKV Keys

```
brainlog-upload-queue     → UploadTask[]
brainlog-activity-log     → ActivityLogEntry[]
brainlog-conflict-records → ConflictRecord[]
brainlog-last-sync-at     → number
```

---

## Migration Notes

1. **Existing entities**: No schema migration needed. New fields (`syncState`, `updatedAt`, `_optimistic`) are optional.

2. **First sync**: On app upgrade, existing items will have `syncState: undefined`. Treat as `synced` with `serverVersion` = current data.

3. **Activity log**: Starts empty. No historical data migration.
