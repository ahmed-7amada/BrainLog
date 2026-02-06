# Research: Real-time Sync and Upload Progress

**Feature**: 003-realtime-sync-progress
**Date**: 2026-02-05
**Status**: Complete

## Research Topics

### 1. Firebase Realtime Database Listeners

**Decision**: Use `onValue` listeners with proper cleanup and scope management

**Rationale**:
- Firebase RTDB provides `onValue` for real-time subscription to data changes
- Listeners automatically receive updates when data changes on server
- Must manage listener lifecycle (subscribe/unsubscribe) to prevent memory leaks
- Scope listeners per entity path (e.g., `users/{uid}/notes`) not entire database

**Alternatives Considered**:
- **Polling**: Rejected - wastes bandwidth, higher latency, battery drain
- **Firestore**: Rejected - project already uses RTDB, migration unnecessary
- **onChildAdded/Changed/Removed**: Considered for fine-grained updates, but `onValue` simpler for initial implementation; can optimize later

**Implementation Pattern**:
```typescript
// Service pattern for real-time listeners
const subscribeToEntity = (path: string, callback: (data: T[]) => void) => {
  const dbRef = ref(getDatabase(), path);
  const unsubscribe = onValue(dbRef, (snapshot) => {
    const data = snapshot.exists() ? Object.values(snapshot.val()) : [];
    callback(data);
  });
  return unsubscribe; // Return cleanup function
};
```

**Key Considerations**:
- Store unsubscribe functions and call on component unmount
- Handle offline state - Firebase queues writes and syncs when online
- Use `serverTimestamp()` for conflict resolution timestamps

---

### 2. React Native Upload Progress Tracking

**Decision**: Use XMLHttpRequest with progress events for file uploads, wrapped in Promise

**Rationale**:
- `fetch()` doesn't support upload progress events natively
- XMLHttpRequest provides `upload.onprogress` event with loaded/total bytes
- Can calculate percentage: `(loaded / total) * 100`
- Works with Google Drive API resumable uploads

**Alternatives Considered**:
- **fetch with ReadableStream**: Limited RN support, complex
- **Axios**: Additional dependency, XHR sufficient
- **react-native-background-upload**: Overkill for foreground uploads, adds complexity

**Implementation Pattern**:
```typescript
const uploadWithProgress = (
  url: string,
  file: Blob,
  onProgress: (percent: number) => void
): Promise<Response> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress((event.loaded / event.total) * 100);
      }
    };
    xhr.onload = () => resolve(xhr.response);
    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.open('POST', url);
    xhr.send(file);
  });
};
```

**Key Considerations**:
- Progress updates should throttle UI updates (every 100ms or 1% change)
- Store progress in Zustand for cross-component access
- Persist upload queue to MMKV for app restart recovery

---

### 3. Upload Queue Management

**Decision**: Implement queue with max 3 concurrent uploads, FIFO processing, MMKV persistence

**Rationale**:
- Concurrent limit prevents network saturation on slow connections
- FIFO ensures predictable order for users
- MMKV persistence allows resume after app restart
- Queue abstraction decouples UI from upload mechanics

**Alternatives Considered**:
- **No queue (immediate upload)**: Rejected - can't control concurrency
- **Background service**: Rejected - spec excludes background sync when app closed
- **Priority queue**: Rejected - adds complexity, FIFO sufficient for MVP

**Implementation Pattern**:
```typescript
interface UploadQueue {
  pending: UploadTask[];
  active: UploadTask[]; // Max 3
  completed: UploadTask[];
  failed: UploadTask[];
}

// Queue operations
const enqueue = (task: UploadTask) => { ... };
const processNext = () => { ... }; // Called when active < 3
const retry = (taskId: string) => { ... };
```

**Key Considerations**:
- Active uploads continue when navigating (managed in global store)
- Failed uploads stay in queue for manual retry
- Auto-retry up to 3 times with exponential backoff (1s, 2s, 4s)

---

### 4. Optimistic UI Updates

**Decision**: Immediate UI update with rollback on server error

**Rationale**:
- User perceives instant response (100ms target)
- Track pending changes with temporary IDs
- On server success: replace temp ID with real ID
- On server error: revert change and show toast

**Alternatives Considered**:
- **Wait for server**: Rejected - poor UX on slow networks
- **Offline-first with sync queue**: Rejected - out of scope per spec
- **CRDT**: Rejected - overkill for single-user app

**Implementation Pattern**:
```typescript
// Optimistic update flow
const createItemOptimistic = async (item: Partial<Item>) => {
  const tempId = `temp_${Date.now()}`;
  const optimisticItem = { ...item, id: tempId, _pending: true };

  // Immediately add to store
  store.addItem(optimisticItem);

  try {
    const realItem = await api.createItem(item);
    store.replaceItem(tempId, realItem);
  } catch (error) {
    store.removeItem(tempId);
    showToast('Failed to save. Please try again.');
  }
};
```

**Key Considerations**:
- Mark optimistic items with `_pending: true` for UI indication
- Don't persist optimistic items to MMKV until confirmed
- Handle conflict when server returns different data than expected

---

### 5. Conflict Resolution (Last-Write-Wins)

**Decision**: Use server timestamp comparison, notify user via toast when their change was overwritten

**Rationale**:
- Single-user app minimizes conflict likelihood
- Last-write-wins simple to implement and understand
- Toast notification keeps user informed without blocking
- No merge UI needed per spec (out of scope)

**Alternatives Considered**:
- **First-write-wins**: Rejected - frustrating for users
- **Manual merge**: Rejected - explicitly out of scope
- **Field-level merge**: Rejected - complex, unnecessary for MVP

**Implementation Pattern**:
```typescript
const resolveConflict = (local: Item, remote: Item): Item => {
  if (remote.updatedAt > local.updatedAt) {
    if (local._pending) {
      showToast('Your changes were synced with a newer version');
    }
    return remote;
  }
  return local;
};
```

---

### 6. Network Status Monitoring

**Decision**: Use @react-native-community/netinfo (already in project)

**Rationale**:
- Already a project dependency
- Provides connection type (wifi, cellular, none)
- Fires events on connection change
- Cross-platform (iOS/Android)

**Implementation Pattern**:
```typescript
import NetInfo from '@react-native-community/netinfo';

const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
    });
    return unsubscribe;
  }, []);

  return isConnected;
};
```

**Key Considerations**:
- Pause uploads when offline, resume when online
- Show offline indicator in UI (FR-022)
- Queue changes locally when offline (optimistic updates)

---

### 7. Pull-to-Refresh Implementation

**Decision**: Use React Native's RefreshControl with FlatList

**Rationale**:
- Native component, familiar gesture for users
- Built into React Native, no additional dependency
- Works with existing FlatList components

**Implementation Pattern**:
```typescript
<FlatList
  data={items}
  refreshControl={
    <RefreshControl
      refreshing={isRefreshing}
      onRefresh={handleRefresh}
      tintColor={theme.colors.primary}
    />
  }
  renderItem={...}
/>
```

**Key Considerations**:
- Refresh triggers force fetch from Firebase (bypass cache)
- Show spinner during refresh
- Handle offline case with error message
- Merge with ongoing real-time sync (don't duplicate data)

---

### 8. Toast Notifications

**Decision**: Create simple Toast component using react-native-reanimated for animations

**Rationale**:
- Project already uses react-native-reanimated
- Light-weight, no additional dependency
- Full control over styling and behavior
- Auto-dismiss after 3 seconds

**Alternatives Considered**:
- **react-native-toast-message**: Additional dependency
- **@notifee**: Overkill for simple toasts (it's for push notifications)
- **Alert.alert**: Blocks UI, poor UX

**Implementation Pattern**:
```typescript
// Global toast manager
const ToastContext = createContext<ToastAPI | null>(null);

const showToast = (message: string, type: 'info' | 'error' | 'success') => {
  // Add to queue, animate in, auto-dismiss
};
```

---

## Summary

All technical decisions have been made based on:
- Existing project dependencies and patterns
- Spec requirements (especially performance targets)
- Simplicity over complexity
- User experience priorities

No blockers or unresolved questions remain. Ready for Phase 1 design.
