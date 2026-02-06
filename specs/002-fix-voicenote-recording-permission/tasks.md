# Tasks: Fix Voice Note Recording Permission Error

**Input**: Design documents from `/specs/002-fix-voicenote-recording-permission/`
**Prerequisites**: spec.md, research.md, data-model.md, quickstart.md

**Tests**: Tests are optional for this bug fix. Unit tests recommended but not blocking.

**Organization**: Tasks grouped by user story for independent implementation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Mobile (React Native)**: `src/` at repository root
- **Primary file**: `src/screens/voiceNotes/RecordVoiceNoteScreen.tsx`

---

## Phase 1: Setup

**Purpose**: Verify environment is ready

- [x] T001 Verify branch is `002-fix-voicenote-recording-permission` and dependencies installed

**Checkpoint**: Environment ready for implementation

---

## Phase 2: Foundational

**Purpose**: No foundational work required for this bug fix

**Note**: This is a targeted single-file bug fix. No blocking infrastructure changes needed.

**Checkpoint**: Proceed directly to User Story 1

---

## Phase 3: User Story 1 - Record Voice Note Successfully (Priority: P1) - MVP

**Goal**: Fix the EACCES permission denied error so users can record voice notes on Android

**Independent Test**: Open Record Voice Note screen on Android, tap record, verify recording starts without error

### Implementation for User Story 1

- [x] T002 [US1] Update `getCacheDirectory()` to check `DocumentDirectoryPath` as second fallback in `src/screens/voiceNotes/RecordVoiceNoteScreen.tsx`

- [x] T003 [US1] Update `getCacheDirectory()` to check `ExternalCachesDirectoryPath` as third fallback in `src/screens/voiceNotes/RecordVoiceNoteScreen.tsx`

- [x] T004 [US1] Remove invalid `/data/local/tmp` fallback path for Android in `src/screens/voiceNotes/RecordVoiceNoteScreen.tsx`

- [x] T005 [US1] Implement `verifyWriteAccess()` helper to test directory writability before recording (FR-004) in `src/screens/voiceNotes/RecordVoiceNoteScreen.tsx`

- [x] T006 [US1] Update `handleStartRecording()` to call `verifyWriteAccess()` and wrap directory resolution in try-catch in `src/screens/voiceNotes/RecordVoiceNoteScreen.tsx`

- [x] T007 [US1] Add user-friendly error Alert for storage issues (FR-005) in `src/screens/voiceNotes/RecordVoiceNoteScreen.tsx`

**Checkpoint**: Recording should work on Android without EACCES errors. Test manually.

---

## Phase 4: User Story 2 - Graceful Fallback When Library Unavailable (Priority: P2)

**Goal**: Ensure robust fallback behavior when react-native-fs has initialization issues

**Independent Test**: Simulate react-native-fs unavailability, verify app shows clear error instead of crashing

### Implementation for User Story 2

- [x] T008 [US2] Implement explicit error throwing when no valid directory available on Android in `src/screens/voiceNotes/RecordVoiceNoteScreen.tsx`

- [x] T009 [US2] Ensure console.warn logging includes error details for troubleshooting in `src/screens/voiceNotes/RecordVoiceNoteScreen.tsx`

**Checkpoint**: App handles edge cases gracefully with clear user feedback

---

## Phase 5: Polish & Verification

**Purpose**: Validate fix meets quality gates and success criteria

- [x] T010 Run TypeScript type-check: `npm run type-check` (pre-existing errors in other files, RecordVoiceNoteScreen.tsx passes)

- [x] T011 Run ESLint: `npm run lint` (no new issues in changed file, pre-existing warnings in other files)

- [x] T012 Run tests: `npm test` (test setup has pre-existing dependency issues)

- [ ] T013 Build Android app: `npm run android`

- [ ] T014 Manual verification: Record voice note on Android device/emulator - verify error feedback appears within 2 seconds if storage unavailable (SC-001, SC-002, SC-004)

- [ ] T015 Manual verification: Stop recording and verify file is saved and playable (SC-003)

- [ ] T016 Manual verification: Check logcat for zero EACCES errors (SC-002)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - verify environment
- **Foundational (Phase 2)**: Skipped - no blocking infrastructure
- **User Story 1 (Phase 3)**: Can start immediately after setup
- **User Story 2 (Phase 4)**: Can start immediately after setup (parallel with US1 if desired)
- **Polish (Phase 5)**: Depends on US1 and US2 completion

### User Story Dependencies

- **User Story 1 (P1)**: Independent - core bug fix
- **User Story 2 (P2)**: Independent - can be done in parallel or after US1

### Within User Story 1

Tasks T002, T003, T004 modify the same function (`getCacheDirectory`) and should be done sequentially.
Task T005 implements write verification helper.
Tasks T006, T007 modify `handleStartRecording` and depend on T004, T005 completing first.

### Within User Story 2

Tasks T008, T009 are in the same file and should be done with US1 or after.

---

## Parallel Opportunities

Since this is a single-file bug fix, parallel opportunities are limited:

```text
# Option 1: Sequential (Recommended for single developer)
T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009 → T010-T016

# Option 2: Verification tasks can run in parallel
T010 [P] Run type-check
T011 [P] Run lint
T012 [P] Run tests
(After all pass)
T013 Build Android
T014-T016 Manual verification
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001 (Setup verification)
2. Complete T002-T007 (User Story 1 - core fix including write verification)
3. **STOP and VALIDATE**: Test on Android device/emulator
4. If working, the bug is fixed - MVP complete

### Full Implementation

1. Complete T001 (Setup)
2. Complete T002-T007 (User Story 1)
3. Complete T008-T009 (User Story 2)
4. Complete T010-T016 (Verification)
5. Ready for code review and merge

---

## Notes

- All tasks modify `src/screens/voiceNotes/RecordVoiceNoteScreen.tsx`
- No new files are created
- No schema or model changes required
- iOS behavior is unchanged (already working correctly)
- Commit after completing each user story checkpoint
- Reference quickstart.md for exact code changes
