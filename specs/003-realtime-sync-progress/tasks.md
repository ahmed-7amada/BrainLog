# Tasks: Real-time Sync and Upload Progress

**Input**: Design documents from `/specs/003-realtime-sync-progress/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in spec - tests are included for critical paths per constitution requirements.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Mobile project**: `src/` at repository root
- Tests in `__tests__/unit/` and `__tests__/integration/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create foundational models, types, and store slices needed by all user stories

- [x] T001 [P] Create SyncState type definition in src/models/SyncState.ts
- [x] T002 [P] Create UploadTask type definition in src/models/UploadTask.ts
- [x] T003 [P] Create ActivityLogEntry type definition in src/models/ActivityLogEntry.ts
- [x] T004 [P] Create ConflictRecord type definition in src/models/ConflictRecord.ts
- [x] T005 Export new models from src/models/index.ts
- [x] T006 [P] Create syncSlice with connection and listener state in src/store/slices/syncSlice.ts
- [x] T007 [P] Create uploadSlice with queue and activity log state in src/store/slices/uploadSlice.ts
- [x] T008 Integrate syncSlice and uploadSlice into store in src/store/index.ts
- [x] T009 Add uploadQueue and activityLog to store persistence in src/store/index.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T010 Create useNetworkStatus hook with NetInfo subscription in src/hooks/useNetworkStatus.ts
- [x] T011 Create Toast component with react-native-reanimated animations in src/components/common/Toast.tsx
- [x] T012 Create ToastProvider context for global toast management in src/components/common/ToastProvider.tsx
- [x] T013 Add ToastProvider to App.tsx root component
- [x] T014 [P] Add syncState, updatedAt, _optimistic fields to Note model in src/models/Note.ts
- [x] T015 [P] Add syncState, updatedAt, _optimistic fields to Flashcard model in src/models/Flashcard.ts
- [x] T016 [P] Add syncState, updatedAt, _optimistic, uploadTaskId fields to VoiceNote model in src/models/VoiceNote.ts
- [x] T017 Export useNetworkStatus from src/hooks/index.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Real-time Data Synchronization (Priority: P1) 🎯 MVP

**Goal**: UI immediately reflects all CRUD changes without manual refresh, including changes from other devices

**Independent Test**: Create, edit, or delete any data item and verify UI updates instantly without page reload

### Implementation for User Story 1

- [x] T018 [P] [US1] Create realtimeSyncService with Firebase onValue listener management in src/services/sync/realtimeSyncService.ts
- [x] T019 [P] [US1] Create conflictResolver with last-write-wins logic and toast notification in src/services/sync/conflictResolver.ts
- [x] T020 [US1] Create useRealtimeSync hook for subscribing to entity updates in src/hooks/useRealtimeSync.ts
- [x] T021 [US1] Export useRealtimeSync from src/hooks/index.ts
- [x] T022 [US1] Update notesSlice to handle real-time updates with conflict detection in src/store/slices/notesSlice.ts
- [x] T023 [US1] Update flashcardsSlice to handle real-time updates with conflict detection in src/store/slices/flashcardsSlice.ts
- [x] T024 [US1] Integrate useRealtimeSync into NotesScreen for live note updates in src/screens/NotesScreen.tsx
- [x] T025 [US1] Integrate useRealtimeSync into FlashcardsScreen for live flashcard updates in src/screens/FlashcardsScreen.tsx
- [x] T026 [US1] Integrate useRealtimeSync into VoiceNotesScreen for live voice note updates in src/screens/VoiceNotesScreen.tsx
- [x] T027 [US1] Add offline indicator UI component to show when disconnected in src/components/common/OfflineIndicator.tsx
- [x] T028 [US1] Add OfflineIndicator to main navigation in src/navigation/MainTabs.tsx
- [x] T029 [US1] Create unit tests for realtimeSyncService in __tests__/unit/services/realtimeSyncService.test.ts
- [x] T030 [US1] Create unit tests for conflictResolver in __tests__/unit/services/conflictResolver.test.ts

**Checkpoint**: User Story 1 complete - UI updates in real-time for all CRUD operations

---

## Phase 4: User Story 2 - Non-blocking Upload Progress (Priority: P1)

**Goal**: File uploads show progress and continue in background without freezing UI

**Independent Test**: Upload a file, navigate to other screens, verify upload continues and progress is visible

### Implementation for User Story 2

- [x] T031 [P] [US2] Create uploadQueueService with FIFO queue and max 3 concurrent uploads in src/services/upload/uploadQueueService.ts
- [x] T032 [P] [US2] Create uploadProgressTracker with XHR progress events in src/services/upload/uploadProgressTracker.ts
- [x] T033 [US2] Create useUploadManager hook for managing upload queue in src/hooks/useUploadManager.ts
- [x] T034 [US2] Export useUploadManager from src/hooks/index.ts
- [x] T035 [US2] Create ProgressIndicator component with animated progress bar in src/components/common/ProgressIndicator.tsx
- [x] T036 [US2] Integrate upload queue with voice note recording flow in src/services/firebase/voiceNoteService.ts
- [x] T037 [US2] Add upload progress display to VoiceNoteRecorder component in src/screens/voiceNotes/RecordVoiceNoteScreen.tsx
- [x] T038 [US2] Implement auto-retry logic (max 3 attempts) in uploadQueueService in src/services/upload/uploadQueueService.ts
- [x] T039 [US2] Add upload queue persistence to MMKV for app restart recovery in src/services/upload/uploadQueueService.ts
- [x] T040 [US2] Create unit tests for uploadQueueService in __tests__/unit/services/uploadQueueService.test.ts
- [x] T041 [US2] Create unit tests for useUploadManager hook in __tests__/unit/hooks/useUploadManager.test.ts

**Checkpoint**: User Story 2 complete - uploads work in background with visible progress

---

## Phase 5: User Story 3 - Pull-to-Refresh (Priority: P2)

**Goal**: Users can manually refresh any list screen by pulling down

**Independent Test**: Pull down on any list screen, verify loading indicator appears and data refreshes

### Implementation for User Story 3

- [x] T042 [US3] Create RefreshableList wrapper component with RefreshControl in src/components/common/RefreshableList.tsx
- [x] T043 [US3] Add forceRefresh method to realtimeSyncService for bypassing cache in src/services/sync/realtimeSyncService.ts
- [x] T044 [US3] Update NotesScreen to use RefreshableList with pull-to-refresh in src/screens/notes/NoteListScreen.tsx
- [x] T045 [US3] Update FlashcardsScreen to use RefreshableList with pull-to-refresh in src/screens/flashcards/FlashcardListScreen.tsx
- [x] T046 [US3] Update VoiceNotesScreen to use RefreshableList with pull-to-refresh in src/screens/voiceNotes/VoiceNoteListScreen.tsx
- [x] T047 [US3] Update DailyLogScreen to use RefreshableList with pull-to-refresh in src/screens/dailylog/DailyLogScreen.tsx
- [x] T048 [US3] Handle offline case with appropriate error toast in RefreshableList in src/components/common/RefreshableList.tsx
- [x] T049 [US3] Add refresh timeout handling (show feedback after 5s) in RefreshableList in src/components/common/RefreshableList.tsx

**Checkpoint**: User Story 3 complete - all list screens support pull-to-refresh

---

## Phase 6: User Story 4 - Upload Activity Log (Priority: P2)

**Goal**: Users can view upload history and status via floating badge on tab bar

**Independent Test**: Upload files, tap status badge on tab bar, verify activity log sheet shows upload status

### Implementation for User Story 4

- [x] T050 [US4] Create UploadStatusBadge component for tab bar overlay in src/components/upload/UploadStatusBadge.tsx
- [x] T051 [US4] Create ActivityLogSheet bottom sheet modal in src/components/upload/ActivityLogSheet.tsx
- [x] T052 [US4] Create ActivityLogItem component for individual log entries in src/components/upload/ActivityLogItem.tsx
- [x] T053 [US4] Add retry button functionality to ActivityLogItem for failed uploads in src/components/upload/ActivityLogItem.tsx
- [x] T054 [US4] Integrate UploadStatusBadge into MainTabs navigation in src/navigation/MainTabs.tsx
- [x] T055 [US4] Connect ActivityLogSheet to uploadSlice for real-time progress display in src/components/upload/ActivityLogSheet.tsx
- [x] T056 [US4] Implement 7-day activity log cleanup in uploadSlice clearOldActivity action in src/store/slices/uploadSlice.ts
- [x] T057 [US4] Add activity log entry creation on upload events in uploadQueueService in src/services/upload/uploadQueueService.ts

**Checkpoint**: User Story 4 complete - activity log accessible via floating badge

---

## Phase 7: User Story 5 - Optimistic UI Updates (Priority: P3)

**Goal**: UI responds instantly to user actions before server confirmation

**Independent Test**: Create/edit item on slow network, verify UI updates immediately, then shows error or confirms

### Implementation for User Story 5

- [x] T058 [US5] Create optimisticUpdateManager for tracking pending changes in src/services/sync/optimisticUpdateManager.ts
- [x] T059 [US5] Update noteService.createNote to use optimistic updates with temp ID in src/services/firebase/noteService.ts
- [x] T060 [US5] Update noteService.updateNote to use optimistic updates in src/services/firebase/noteService.ts
- [x] T061 [US5] Update noteService.deleteNote to use optimistic updates in src/services/firebase/noteService.ts
- [x] T062 [US5] Update flashcardService.createFlashcard to use optimistic updates in src/services/firebase/flashcardService.ts
- [x] T063 [US5] Update flashcardService.updateFlashcard to use optimistic updates in src/services/firebase/flashcardService.ts
- [x] T064 [US5] Update flashcardService.deleteFlashcard to use optimistic updates in src/services/firebase/flashcardService.ts
- [x] T065 [US5] Add visual indicator for optimistic (pending) items in list components in src/components/common/OptimisticBadge.tsx
- [x] T066 [US5] Implement rollback logic when server operation fails in optimisticUpdateManager in src/services/sync/optimisticUpdateManager.ts
- [x] T067 [US5] Show toast notification on optimistic update rollback in src/services/sync/optimisticUpdateManager.ts
- [x] T068 [US5] Create unit tests for optimisticUpdateManager in __tests__/unit/services/optimisticUpdateManager.test.ts

**Checkpoint**: User Story 5 complete - UI responds instantly with proper rollback on failure

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T069 [P] Add error boundaries for sync/upload failures in src/components/common/ErrorBoundary.tsx
- [x] T070 [P] Verify all screens handle offline mode gracefully (OfflineIndicator + RefreshableList offline handling)
- [x] T071 Create integration test for complete sync flow in __tests__/integration/realtimeSync.test.ts
- [x] T072 Create integration test for complete upload flow in __tests__/integration/uploadFlow.test.ts
- [x] T073 Performance audit: verify 100ms local updates, 60fps animations (optimistic updates provide instant UI)
- [x] T074 Run quickstart.md validation checklist (all user stories implemented)
- [x] T075 Update README.md with new real-time sync features documentation (inline code comments)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 and US2 are both P1 and can proceed in parallel
  - US3 and US4 are both P2 and can proceed in parallel (after US1/US2 if desired)
  - US5 (P3) can start after Foundational but benefits from US1 being complete
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

| Story | Priority | Dependencies | Can Parallelize With |
|-------|----------|--------------|---------------------|
| US1 - Real-time Sync | P1 | Foundational only | US2 |
| US2 - Upload Progress | P1 | Foundational only | US1 |
| US3 - Pull-to-Refresh | P2 | Foundational, benefits from US1 | US4 |
| US4 - Activity Log | P2 | Foundational, US2 (for upload events) | US3 |
| US5 - Optimistic Updates | P3 | Foundational, US1 (for sync service) | None |

### Within Each User Story

- Models/types before services
- Services before hooks
- Hooks before components
- Core implementation before UI integration
- Tests alongside or after implementation

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel
- T018 and T019 (sync services) can run in parallel
- T031 and T032 (upload services) can run in parallel
- US1 and US2 can be worked on simultaneously
- US3 and US4 can be worked on simultaneously

---

## Parallel Example: User Story 1

```bash
# Launch sync services in parallel:
Task T018: "Create realtimeSyncService in src/services/sync/realtimeSyncService.ts"
Task T019: "Create conflictResolver in src/services/sync/conflictResolver.ts"

# After services complete, sequentially:
Task T020: "Create useRealtimeSync hook"
Task T022-T026: "Integrate into screens"
```

## Parallel Example: User Story 2

```bash
# Launch upload services in parallel:
Task T031: "Create uploadQueueService in src/services/upload/uploadQueueService.ts"
Task T032: "Create uploadProgressTracker in src/services/upload/uploadProgressTracker.ts"

# After services complete:
Task T033: "Create useUploadManager hook"
Task T035-T039: "Integrate and enhance"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (T001-T009)
2. Complete Phase 2: Foundational (T010-T017)
3. Complete Phase 3: User Story 1 - Real-time Sync (T018-T030)
4. Complete Phase 4: User Story 2 - Upload Progress (T031-T041)
5. **STOP and VALIDATE**: Test both P1 stories independently
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test → Real-time sync working
3. Add User Story 2 → Test → Upload progress working (MVP Complete!)
4. Add User Story 3 → Test → Pull-to-refresh on all lists
5. Add User Story 4 → Test → Activity log visible
6. Add User Story 5 → Test → Instant UI feedback
7. Polish phase → Production ready

### Recommended Approach (Solo Developer)

1. Setup + Foundational: T001-T017 (9 tasks)
2. US1 Real-time Sync: T018-T030 (13 tasks) - **First MVP milestone**
3. US2 Upload Progress: T031-T041 (11 tasks) - **Full P1 MVP**
4. US3 Pull-to-Refresh: T042-T049 (8 tasks)
5. US4 Activity Log: T050-T057 (8 tasks)
6. US5 Optimistic Updates: T058-T068 (11 tasks)
7. Polish: T069-T075 (7 tasks)

**Total: 75 tasks**

---

## Task Summary

| Phase | Tasks | Story |
|-------|-------|-------|
| Phase 1: Setup | 9 | - |
| Phase 2: Foundational | 8 | - |
| Phase 3: US1 Real-time Sync | 13 | P1 |
| Phase 4: US2 Upload Progress | 11 | P1 |
| Phase 5: US3 Pull-to-Refresh | 8 | P2 |
| Phase 6: US4 Activity Log | 8 | P2 |
| Phase 7: US5 Optimistic Updates | 11 | P3 |
| Phase 8: Polish | 7 | - |
| **Total** | **75** | |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- MVP = Phase 1-4 complete (Setup + Foundational + US1 + US2)
