# Implementation Plan: Real-time Sync and Upload Progress

**Branch**: `003-realtime-sync-progress` | **Date**: 2026-02-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-realtime-sync-progress/spec.md`

## Summary

Implement real-time data synchronization between Firebase and the UI, non-blocking upload progress tracking with activity logging, pull-to-refresh functionality, and optimistic UI updates. The feature ensures users always see current data without manual refresh, can track file uploads without UI freezing, and have full visibility into upload activity.

## Technical Context

**Language/Version**: TypeScript 5.8.3, React Native 0.83.1
**Primary Dependencies**: @react-native-firebase/database (real-time listeners), zustand (state management), react-native-mmkv (persistence), @react-native-community/netinfo (connectivity)
**Storage**: Firebase Realtime Database (cloud), MMKV (local persistence), Google Drive (file storage)
**Testing**: Jest with react-test-renderer
**Target Platform**: iOS 15+, Android API 24+
**Project Type**: Mobile (React Native)
**Performance Goals**: 100ms local UI updates, 2s remote sync, 60fps during uploads, 3s pull-to-refresh
**Constraints**: <200MB memory, offline-capable basic mode, max 3 concurrent uploads
**Scale/Scope**: Single user per device, ~1000 items per entity type, files <100MB

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality - TypeScript Strict | ✅ PASS | Project already uses strict mode |
| I. Code Quality - Single Responsibility | ✅ PASS | New sync/upload services will be separate modules |
| I. Code Quality - Error Handling | ✅ PASS | Spec requires FR-020, FR-021, FR-022 error handling |
| II. Testing Standards - Coverage | ✅ PASS | Critical paths will have tests per spec acceptance scenarios |
| II. Testing Standards - Mocking | ✅ PASS | Firebase will be mocked in tests |
| III. UX Consistency - Loading States | ✅ PASS | FR-006, FR-019 require loading indicators |
| III. UX Consistency - Error Feedback | ✅ PASS | FR-020 requires user-friendly error messages |
| III. UX Consistency - Offline Awareness | ✅ PASS | FR-022 requires offline indication |
| IV. Performance - List Performance | ✅ PASS | Existing FlatList patterns will be maintained |
| IV. Performance - Animation Smoothness | ✅ PASS | Progress indicators will use native driver |
| IV. Performance - Query Optimization | ✅ PASS | Firebase listeners will be scoped per entity |
| Development Workflow - Spec-First | ✅ PASS | Spec completed and clarified |
| Development Workflow - Incremental | ✅ PASS | User stories prioritized P1→P2→P3 |

**Gate Status**: ✅ PASSED - No violations

## Project Structure

### Documentation (this feature)

```text
specs/003-realtime-sync-progress/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── firebase-realtime-operations.md
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── common/
│   │   ├── RefreshableList.tsx       # Pull-to-refresh wrapper (NEW)
│   │   ├── ProgressIndicator.tsx     # Upload progress UI (NEW)
│   │   └── Toast.tsx                 # Toast notification (NEW)
│   └── upload/
│       ├── UploadStatusBadge.tsx     # Floating tab bar badge (NEW)
│       └── ActivityLogSheet.tsx      # Upload activity log modal (NEW)
├── hooks/
│   ├── useRealtimeSync.ts            # Real-time Firebase listener hook (NEW)
│   ├── useUploadManager.ts           # Upload queue management hook (NEW)
│   └── useNetworkStatus.ts           # Network connectivity hook (NEW)
├── services/
│   ├── sync/
│   │   ├── realtimeSyncService.ts    # Firebase real-time listener management (NEW)
│   │   ├── conflictResolver.ts       # Last-write-wins conflict handling (NEW)
│   │   └── optimisticUpdateManager.ts # Optimistic UI update tracking (NEW)
│   └── upload/
│       ├── uploadQueueService.ts     # Upload queue with persistence (NEW)
│       └── uploadProgressTracker.ts  # Progress tracking per upload (NEW)
├── store/
│   └── slices/
│       ├── syncSlice.ts              # Sync state management (NEW)
│       └── uploadSlice.ts            # Upload queue state management (NEW)
└── models/
    ├── SyncState.ts                  # Sync status types (NEW)
    ├── UploadTask.ts                 # Upload task model (NEW)
    └── ActivityLogEntry.ts           # Activity log entry model (NEW)

__tests__/
├── unit/
│   ├── services/
│   │   ├── realtimeSyncService.test.ts
│   │   ├── uploadQueueService.test.ts
│   │   └── conflictResolver.test.ts
│   └── hooks/
│       ├── useRealtimeSync.test.ts
│       └── useUploadManager.test.ts
└── integration/
    ├── realtimeSync.test.ts
    └── uploadFlow.test.ts
```

**Structure Decision**: Mobile single-app structure following existing patterns. New services organized into `sync/` and `upload/` subdirectories. New components in `components/common/` for reusable UI and `components/upload/` for upload-specific UI.

## Complexity Tracking

> No violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
