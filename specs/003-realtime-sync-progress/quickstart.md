# Quickstart: Real-time Sync and Upload Progress

**Feature**: 003-realtime-sync-progress
**Date**: 2026-02-05

## Quick Reference

### Key Files to Create

| File | Purpose |
|------|---------|
| `src/services/sync/realtimeSyncService.ts` | Firebase listener management |
| `src/services/sync/conflictResolver.ts` | Last-write-wins conflict handling |
| `src/services/sync/optimisticUpdateManager.ts` | Optimistic UI tracking |
| `src/services/upload/uploadQueueService.ts` | Upload queue with MMKV persistence |
| `src/services/upload/uploadProgressTracker.ts` | Progress tracking per upload |
| `src/store/slices/syncSlice.ts` | Sync state in Zustand |
| `src/store/slices/uploadSlice.ts` | Upload queue state in Zustand |
| `src/hooks/useRealtimeSync.ts` | Hook for subscribing to entity updates |
| `src/hooks/useUploadManager.ts` | Hook for managing uploads |
| `src/hooks/useNetworkStatus.ts` | Hook for network connectivity |
| `src/components/common/RefreshableList.tsx` | Pull-to-refresh wrapper |
| `src/components/common/Toast.tsx` | Toast notification component |
| `src/components/upload/UploadStatusBadge.tsx` | Tab bar floating badge |
| `src/components/upload/ActivityLogSheet.tsx` | Upload activity log modal |
| `src/models/SyncState.ts` | SyncState type definition |
| `src/models/UploadTask.ts` | UploadTask type definition |
| `src/models/ActivityLogEntry.ts` | ActivityLogEntry type definition |

### Key Patterns

#### 1. Real-time Listener Setup

```typescript
// In a screen or provider component
const { notes, isLoading, error } = useRealtimeSync('notes');

// Hook internally manages:
// - Subscribe on mount
// - Unsubscribe on unmount
// - Update store on data change
```

#### 2. Optimistic Create

```typescript
const createNote = async (data: NoteInput) => {
  const tempId = `temp_${Date.now()}`;

  // 1. Immediately add to store
  store.addNote({ id: tempId, ...data, _optimistic: true });

  try {
    // 2. Write to Firebase
    const note = await noteService.create(data);
    // 3. Replace temp with real
    store.replaceNote(tempId, note);
  } catch (error) {
    // 4. Rollback
    store.removeNote(tempId);
    showToast('Failed to create note');
  }
};
```

#### 3. Upload with Progress

```typescript
const uploadVoiceNote = async (filePath: string) => {
  // 1. Add to queue
  const taskId = store.enqueueUpload({
    fileName: 'Recording.m4a',
    filePath,
    fileSize: await getFileSize(filePath),
    mimeType: 'audio/m4a',
  });

  // 2. Upload manages itself via uploadQueueService
  // Progress updates flow through uploadSlice → UI
};
```

#### 4. Pull-to-Refresh

```typescript
<RefreshableList
  data={notes}
  onRefresh={async () => {
    const fresh = await noteService.forceRefresh();
    store.setNotes(fresh);
  }}
  renderItem={...}
/>
```

#### 5. Network Status

```typescript
const { isOnline } = useNetworkStatus();

// Show offline banner when !isOnline
// Disable submit buttons when !isOnline
// Queue operations when !isOnline (handled by Firebase)
```

### Store Integration

Add new slices to store/index.ts:

```typescript
export type AppStore = AuthSlice &
  FlashcardsSlice &
  NotesSlice &
  ProgressSlice &
  SettingsSlice &
  SyncSlice &      // NEW
  UploadSlice;     // NEW
```

Persist upload queue:

```typescript
partialize: (state) => ({
  // ... existing
  uploadQueue: state.uploadQueue,
  activityLog: state.activityLog,
}),
```

### Testing Checklist

- [ ] Real-time listener subscribes on mount
- [ ] Real-time listener unsubscribes on unmount
- [ ] Optimistic create shows item immediately
- [ ] Optimistic create rolls back on error
- [ ] Upload progress updates UI without freezing
- [ ] Upload continues when navigating away
- [ ] Upload queue persists across app restart
- [ ] Failed upload shows retry option
- [ ] Pull-to-refresh fetches fresh data
- [ ] Toast appears on conflict resolution
- [ ] Offline indicator shows when disconnected

### Performance Targets

| Metric | Target | How to Verify |
|--------|--------|---------------|
| Local UI update | <100ms | Time between action and UI change |
| Remote sync | <2s | Time between server write and UI update |
| Pull-to-refresh | <3s for 95% | Measure refresh operation duration |
| Upload progress | 60fps | Profile animation frame rate |

### Common Gotchas

1. **Listener cleanup**: Always return unsubscribe in useEffect cleanup
2. **Optimistic IDs**: Use `temp_` prefix to distinguish from real IDs
3. **Timestamp comparison**: Use `updatedAt` not `createdAt` for conflicts
4. **Upload queue persistence**: Store only metadata, not file contents
5. **Progress throttling**: Update UI max every 100ms to avoid re-render storm

### Files to Modify

| Existing File | Changes Needed |
|---------------|----------------|
| `src/store/index.ts` | Add SyncSlice, UploadSlice |
| `src/models/Note.ts` | Add `syncState?`, `updatedAt`, `_optimistic?` |
| `src/models/Flashcard.ts` | Add `syncState?`, `updatedAt`, `_optimistic?` |
| `src/models/VoiceNote.ts` | Add `syncState?`, `updatedAt`, `_optimistic?`, `uploadTaskId?` |
| `src/navigation/MainTabs.tsx` | Add UploadStatusBadge overlay |
| List screens (Notes, Flashcards, etc.) | Wrap with RefreshableList |

### Dependencies

No new dependencies required. Uses existing:
- `@react-native-firebase/database` - Real-time listeners
- `zustand` - State management
- `react-native-mmkv` - Persistence
- `@react-native-community/netinfo` - Network status
- `react-native-reanimated` - Toast animations

### Implementation Order (by Priority)

**P1 - Core (implement first)**:
1. SyncSlice + realtimeSyncService + useRealtimeSync
2. UploadSlice + uploadQueueService + useUploadManager
3. Integrate listeners into existing screens
4. Add progress tracking to voice note upload

**P2 - Enhanced UX**:
5. RefreshableList + pull-to-refresh on all lists
6. UploadStatusBadge + ActivityLogSheet
7. Toast component + conflict notifications

**P3 - Polish**:
8. Optimistic update manager
9. Network status hook + offline indicator
10. Error handling improvements
