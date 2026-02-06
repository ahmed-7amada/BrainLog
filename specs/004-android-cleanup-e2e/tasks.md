# Tasks: Android-Only Codebase Cleanup with Maestro E2E Testing

**Input**: Design documents from `/specs/004-android-cleanup-e2e/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Maestro installation and project baseline verification

- [ ] T001 Verify project builds successfully before any changes with `npx react-native run-android`
- [ ] T002 Install Maestro CLI using `curl -Ls "https://get.maestro.mobile.dev" | bash` or `iwr -useb https://get.maestro.mobile.dev | iex` (Windows)
- [ ] T003 [P] Create `.maestro/` directory structure per plan.md
- [ ] T004 [P] Create `.maestro/config.yaml` with appId: com.brainlog and global Maestro configuration
- [ ] T005 Run `npx depcheck` to identify unused dependencies (output for US1)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Ensure TypeScript strict mode and tooling configuration is ready

**CRITICAL**: All code cleanup depends on proper tooling configuration

- [ ] T006 Update `tsconfig.json` to enable strict TypeScript options (noUnusedLocals, noUnusedParameters, noImplicitReturns, noFallthroughCasesInSwitch)
- [ ] T007 [P] Verify ESLint configuration in `.eslintrc.js` has @typescript-eslint/no-unused-vars rule enabled
- [ ] T008 [P] Verify Prettier configuration in `.prettierrc.js` is complete
- [ ] T009 Run `npm run type-check` to baseline current TypeScript errors

**Checkpoint**: Tooling ready - code cleanup can now begin

---

## Phase 3: User Story 1 - Clean Codebase with No Technical Debt (Priority: P1)

**Goal**: Codebase passes TypeScript strict mode, ESLint, and Prettier with zero errors/warnings

**Independent Test**: Run `npm run type-check && npm run lint && npm run format:check` - all must pass with zero errors

### Implementation for User Story 1

#### Config Files Cleanup
- [ ] T010 [US1] Fix TypeScript errors in `src/config/firebase.ts`
- [ ] T011 [P] [US1] Fix TypeScript errors in `src/config/theme.ts`

#### Models Cleanup (18 files)
- [ ] T012 [P] [US1] Fix TypeScript/lint issues in `src/models/Bookmark.ts`
- [ ] T013 [P] [US1] Fix TypeScript/lint issues in `src/models/DailyLog.ts`
- [ ] T014 [P] [US1] Fix TypeScript/lint issues in `src/models/DailyProgress.ts`
- [ ] T015 [P] [US1] Fix TypeScript/lint issues in `src/models/Flashcard.ts`
- [ ] T016 [P] [US1] Fix TypeScript/lint issues in `src/models/HabitDefinition.ts`
- [ ] T017 [P] [US1] Fix TypeScript/lint issues in `src/models/HabitLogEntry.ts`
- [ ] T018 [P] [US1] Fix TypeScript/lint issues in `src/models/MemorizeItem.ts`
- [ ] T019 [P] [US1] Fix TypeScript/lint issues in `src/models/Note.ts`
- [ ] T020 [P] [US1] Fix TypeScript/lint issues in `src/models/Tag.ts`
- [ ] T021 [P] [US1] Fix TypeScript/lint issues in `src/models/User.ts`
- [ ] T022 [P] [US1] Fix TypeScript/lint issues in `src/models/UserSettings.ts`
- [ ] T023 [P] [US1] Fix TypeScript/lint issues in `src/models/Video.ts`
- [ ] T024 [P] [US1] Fix TypeScript/lint issues in `src/models/VoiceNote.ts`
- [ ] T025 [P] [US1] Fix TypeScript/lint issues in `src/models/WeeklySummary.ts`
- [ ] T026 [P] [US1] Fix TypeScript/lint issues in `src/models/ActivityLogEntry.ts`
- [ ] T027 [P] [US1] Fix TypeScript/lint issues in `src/models/ConflictRecord.ts`
- [ ] T028 [P] [US1] Fix TypeScript/lint issues in `src/models/SyncState.ts`
- [ ] T029 [P] [US1] Fix TypeScript/lint issues in `src/models/UploadTask.ts`
- [ ] T030 [US1] Review and clean `src/models/index.ts` exports

#### Hooks Cleanup (12 files)
- [ ] T031 [P] [US1] Fix TypeScript/lint issues in `src/hooks/useAuth.ts`
- [ ] T032 [P] [US1] Fix TypeScript/lint issues in `src/hooks/useFlashcards.ts`
- [ ] T033 [P] [US1] Fix TypeScript/lint issues in `src/hooks/useGamification.ts`
- [ ] T034 [P] [US1] Fix TypeScript/lint issues in `src/hooks/useNetworkStatus.ts`
- [ ] T035 [P] [US1] Fix TypeScript/lint issues in `src/hooks/useNotes.ts`
- [ ] T036 [P] [US1] Fix TypeScript/lint issues in `src/hooks/useProgress.ts`
- [ ] T037 [P] [US1] Fix TypeScript/lint issues in `src/hooks/useRealtimeSync.ts`
- [ ] T038 [P] [US1] Fix TypeScript/lint issues in `src/hooks/useUploadManager.ts`
- [ ] T039 [US1] Review and clean `src/hooks/index.ts` exports

#### Navigation Cleanup
- [ ] T040 [P] [US1] Fix TypeScript/lint issues in `src/navigation/AppNavigator.tsx`
- [ ] T041 [P] [US1] Fix TypeScript/lint issues in `src/navigation/AuthStack.tsx`
- [ ] T042 [P] [US1] Fix TypeScript/lint issues in `src/navigation/MainTabs.tsx`
- [ ] T043 [P] [US1] Fix TypeScript/lint issues in `src/navigation/types.ts`

#### Store Cleanup
- [ ] T044 [P] [US1] Fix TypeScript/lint issues in `src/store/index.ts`
- [ ] T045 [P] [US1] Fix TypeScript/lint issues in `src/store/slices/authSlice.ts`
- [ ] T046 [P] [US1] Fix TypeScript/lint issues in `src/store/slices/flashcardsSlice.ts`
- [ ] T047 [P] [US1] Fix TypeScript/lint issues in `src/store/slices/notesSlice.ts`
- [ ] T048 [P] [US1] Fix TypeScript/lint issues in `src/store/slices/progressSlice.ts`
- [ ] T049 [P] [US1] Fix TypeScript/lint issues in `src/store/slices/settingsSlice.ts`
- [ ] T050 [P] [US1] Fix TypeScript/lint issues in `src/store/slices/syncSlice.ts`
- [ ] T051 [P] [US1] Fix TypeScript/lint issues in `src/store/slices/uploadSlice.ts`

#### Services Cleanup (Firebase - 12 files)
- [ ] T052 [P] [US1] Fix TypeScript/lint issues in `src/services/firebase/authService.ts`
- [ ] T053 [P] [US1] Fix TypeScript/lint issues in `src/services/firebase/bookmarkService.ts`
- [ ] T054 [P] [US1] Fix TypeScript/lint issues in `src/services/firebase/dailyLogService.ts`
- [ ] T055 [P] [US1] Fix TypeScript/lint issues in `src/services/firebase/flashcardService.ts`
- [ ] T056 [P] [US1] Fix TypeScript/lint issues in `src/services/firebase/habitService.ts`
- [ ] T057 [P] [US1] Fix TypeScript/lint issues in `src/services/firebase/memorizeService.ts`
- [ ] T058 [P] [US1] Fix TypeScript/lint issues in `src/services/firebase/noteService.ts`
- [ ] T059 [P] [US1] Fix TypeScript/lint issues in `src/services/firebase/progressService.ts`
- [ ] T060 [P] [US1] Fix TypeScript/lint issues in `src/services/firebase/tagService.ts`
- [ ] T061 [P] [US1] Fix TypeScript/lint issues in `src/services/firebase/videoService.ts`
- [ ] T062 [P] [US1] Fix TypeScript/lint issues in `src/services/firebase/voiceNoteService.ts`
- [ ] T063 [P] [US1] Fix TypeScript/lint issues in `src/services/firebase/weeklySummaryService.ts`

#### Services Cleanup (Other)
- [ ] T064 [P] [US1] Fix TypeScript/lint issues in all files under `src/services/gamification/`
- [ ] T065 [P] [US1] Fix TypeScript/lint issues in all files under `src/services/googleDrive/`
- [ ] T066 [P] [US1] Fix TypeScript/lint issues in all files under `src/services/notifications/`
- [ ] T067 [P] [US1] Fix TypeScript/lint issues in all files under `src/services/review/`
- [ ] T068 [P] [US1] Fix TypeScript/lint issues in all files under `src/services/search/`
- [ ] T069 [P] [US1] Fix TypeScript/lint issues in all files under `src/services/spacedRepetition/`
- [ ] T070 [P] [US1] Fix TypeScript/lint issues in all files under `src/services/sync/`
- [ ] T071 [P] [US1] Fix TypeScript/lint issues in all files under `src/services/upload/`

#### Utils Cleanup
- [ ] T072 [P] [US1] Fix TypeScript/lint issues in `src/utils/constants.ts`
- [ ] T073 [P] [US1] Fix TypeScript/lint issues in `src/utils/dateUtils.ts`
- [ ] T074 [P] [US1] Fix TypeScript/lint issues in `src/utils/errorHandler.ts`
- [ ] T075 [P] [US1] Fix TypeScript/lint issues in `src/utils/storage.ts`
- [ ] T076 [P] [US1] Fix TypeScript/lint issues in `src/utils/validation.ts`

#### Components Cleanup (16 files)
- [ ] T077 [P] [US1] Fix TypeScript/lint issues in `src/components/common/SyncStatusIndicator.tsx`
- [ ] T078 [P] [US1] Fix TypeScript/lint issues in `src/components/common/OfflineIndicator.tsx`
- [ ] T079 [P] [US1] Fix TypeScript/lint issues in `src/components/common/ToastProvider.tsx`
- [ ] T080 [P] [US1] Fix TypeScript/lint issues in `src/components/common/OptimisticBadge.tsx`
- [ ] T081 [P] [US1] Fix TypeScript/lint issues in `src/components/common/OptimisticToastConnector.tsx`
- [ ] T082 [P] [US1] Fix TypeScript/lint issues in `src/components/common/RefreshableList.tsx`
- [ ] T083 [P] [US1] Fix TypeScript/lint issues in `src/components/common/Toast.tsx`
- [ ] T084 [P] [US1] Fix TypeScript/lint issues in `src/components/common/ProgressIndicator.tsx`
- [ ] T085 [P] [US1] Fix TypeScript/lint issues in `src/components/common/ErrorBoundary.tsx`
- [ ] T086 [P] [US1] Fix TypeScript/lint issues in `src/components/common/SafeScreen.tsx`
- [ ] T087 [P] [US1] Fix TypeScript/lint issues in `src/components/gamification/LevelUpAnimation.tsx`
- [ ] T088 [P] [US1] Fix TypeScript/lint issues in `src/components/gamification/BadgeUnlockedAnimation.tsx`
- [ ] T089 [P] [US1] Fix TypeScript/lint issues in `src/components/gamification/GamificationAnimationManager.tsx`
- [ ] T090 [P] [US1] Fix TypeScript/lint issues in `src/components/upload/ActivityLogItem.tsx`
- [ ] T091 [P] [US1] Fix TypeScript/lint issues in `src/components/upload/ActivityLogSheet.tsx`
- [ ] T092 [P] [US1] Fix TypeScript/lint issues in `src/components/upload/UploadStatusBadge.tsx`

#### Root Files Cleanup
- [ ] T093 [P] [US1] Fix TypeScript/lint issues in `App.tsx`
- [ ] T094 [P] [US1] Fix TypeScript/lint issues in `index.js`

#### Dependency Cleanup
- [ ] T095 [US1] Remove unused dependencies from `package.json` based on depcheck output (T005)
- [ ] T096 [US1] Run `npm install` to update `package-lock.json` after dependency removal
- [ ] T097 [US1] Run `npm run format` to format all files with Prettier

#### DRY Review (FR-006 Coverage)
- [ ] T097A [US1] Review codebase for duplicated logic patterns (functions >10 lines duplicated across files); refactor to shared utilities

#### Final Verification
- [ ] T098 [US1] Run `npm run type-check` - must pass with zero errors
- [ ] T099 [US1] Run `npm run lint` - must pass with zero errors/warnings
- [ ] T100 [US1] Run `npm run format:check` - must pass
- [ ] T101 [US1] Commit: "refactor: clean codebase with strict TypeScript and lint compliance"

**Checkpoint**: User Story 1 complete - codebase passes all quality checks

---

## Phase 4: User Story 2 - Android-Only Application (Priority: P1)

**Goal**: iOS completely removed, Android build succeeds

**Independent Test**: Verify `ios/` directory doesn't exist, no Platform.OS === 'ios' in code, `npx react-native run-android` succeeds

### Implementation for User Story 2

#### iOS Directory Removal
- [ ] T102 [US2] Delete `ios/` directory entirely using `rm -rf ios/`
- [ ] T103 [P] [US2] Delete `Podfile.lock` if present at repository root

#### Package.json Cleanup
- [ ] T104 [US2] Remove `"ios": "react-native run-ios"` script from `package.json`
- [ ] T105 [P] [US2] Remove `@react-native-community/cli-platform-ios` from devDependencies in `package.json`
- [ ] T106 [US2] Run `npm install` to update `package-lock.json`

#### Source Code iOS Removal
- [ ] T107 [US2] Search all `src/` files for `Platform.OS === 'ios'` and remove iOS conditionals
- [ ] T108 [P] [US2] Search all `src/` files for `Platform.select` with iOS branches and simplify to Android-only
- [ ] T109 [US2] Review and update `src/navigation/` files for any iOS-specific navigation config
- [ ] T110 [US2] Review and update `src/components/` for any iOS-specific styling or behavior

#### Config Files Review
- [ ] T111 [P] [US2] Review `metro.config.js` for iOS-specific config (remove if present)
- [ ] T112 [P] [US2] Review `babel.config.js` for iOS-specific config (remove if present)
- [ ] T113 [P] [US2] Review `app.json` for iOS-specific config (remove if present)
- [ ] T114 [P] [US2] Review/remove `react-native.config.js` if it has iOS-specific config

#### Build Verification
- [ ] T115 [US2] Run `cd android && ./gradlew clean && cd ..` to clean Android build
- [ ] T116 [US2] Run `npx react-native run-android` to verify Android build succeeds
- [ ] T117 [US2] Manually verify app launches and all screens are navigable on emulator
- [ ] T118 [US2] Commit: "feat: remove iOS platform support for Android-only development"

**Checkpoint**: User Story 2 complete - iOS removed, Android builds successfully

---

## Phase 5: User Story 3 - Comprehensive E2E Test Coverage with Maestro (Priority: P2)

**Goal**: All 38 screens have testID props and Maestro E2E test flows

**Independent Test**: Run `maestro test .maestro/suite.yaml` - all tests must pass

### Maestro Setup

- [ ] T120 [P] [US3] Create `.maestro/helpers/auth_login.yaml` reusable login flow
- [ ] T121 [P] [US3] Create `.maestro/flows/` subdirectories (auth, navigation, notes, flashcards, bookmarks, voiceNotes, videos, memorize, calendar, profile, search, dailylog, insights)

### Auth Screens - testIDs and E2E Flows

- [ ] T122 [P] [US3] Add testIDs to `src/screens/auth/LoginScreen.tsx` per data-model.md registry
- [ ] T123 [P] [US3] Create `.maestro/flows/auth/login_google.yaml` for Google sign-in flow
- [ ] T124 [P] [US3] Create `.maestro/flows/auth/login_error.yaml` for login error handling
- [ ] T125 [P] [US3] Create `.maestro/flows/auth/logout.yaml` for logout flow

### Dashboard Screen - testIDs and E2E Flows

- [ ] T126 [P] [US3] Add testIDs to `src/screens/dashboard/DashboardScreen.tsx` per data-model.md registry
- [ ] T127 [P] [US3] Create `.maestro/flows/dashboard/dashboard_load.yaml` for dashboard display
- [ ] T128 [P] [US3] Create `.maestro/flows/dashboard/dashboard_navigation.yaml` for quick actions

### Navigation - testIDs and E2E Flows

- [ ] T129 [P] [US3] Add testIDs to `src/navigation/MainTabs.tsx` for tab navigation
- [ ] T130 [P] [US3] Create `.maestro/flows/navigation/tab_navigation.yaml` for tab switching

### Notes Screens - testIDs and E2E Flows (4 screens)

- [ ] T131 [P] [US3] Add testIDs to `src/screens/notes/NoteListScreen.tsx` per data-model.md registry
- [ ] T132 [P] [US3] Add testIDs to `src/screens/notes/NoteDetailScreen.tsx` per data-model.md registry
- [ ] T133 [P] [US3] Add testIDs to `src/screens/notes/CreateNoteScreen.tsx` per data-model.md registry
- [ ] T134 [P] [US3] Add testIDs to `src/screens/notes/EditNoteScreen.tsx` per data-model.md registry
- [ ] T135 [P] [US3] Create `.maestro/flows/notes/note_list.yaml` for list display and empty state
- [ ] T136 [P] [US3] Create `.maestro/flows/notes/create_note.yaml` for note creation
- [ ] T137 [P] [US3] Create `.maestro/flows/notes/edit_note.yaml` for note editing
- [ ] T138 [P] [US3] Create `.maestro/flows/notes/delete_note.yaml` for note deletion

### Flashcards Screens - testIDs and E2E Flows (6 screens)

- [ ] T139 [P] [US3] Add testIDs to `src/screens/flashcards/FlashcardListScreen.tsx` per data-model.md registry
- [ ] T140 [P] [US3] Add testIDs to `src/screens/flashcards/FlashcardDetailScreen.tsx` per data-model.md registry
- [ ] T141 [P] [US3] Add testIDs to `src/screens/flashcards/CreateFlashcardScreen.tsx` per data-model.md registry
- [ ] T142 [P] [US3] Add testIDs to `src/screens/flashcards/EditFlashcardScreen.tsx` per data-model.md registry
- [ ] T143 [P] [US3] Add testIDs to `src/screens/flashcards/ReviewSessionScreen.tsx` per data-model.md registry
- [ ] T144 [P] [US3] Add testIDs to `src/screens/flashcards/ReviewCompleteScreen.tsx` per data-model.md registry
- [ ] T145 [P] [US3] Create `.maestro/flows/flashcards/flashcard_list.yaml` for list display
- [ ] T146 [P] [US3] Create `.maestro/flows/flashcards/create_flashcard.yaml` for flashcard creation
- [ ] T147 [P] [US3] Create `.maestro/flows/flashcards/edit_flashcard.yaml` for flashcard editing
- [ ] T148 [P] [US3] Create `.maestro/flows/flashcards/delete_flashcard.yaml` for flashcard deletion
- [ ] T149 [P] [US3] Create `.maestro/flows/flashcards/review_session.yaml` for review session flow
- [ ] T150 [P] [US3] Create `.maestro/flows/flashcards/review_complete.yaml` for review completion

### Bookmarks Screens - testIDs and E2E Flows (3 screens)

- [ ] T151 [P] [US3] Add testIDs to `src/screens/bookmarks/BookmarkListScreen.tsx` per data-model.md registry
- [ ] T152 [P] [US3] Add testIDs to `src/screens/bookmarks/BookmarkDetailScreen.tsx` per data-model.md registry
- [ ] T153 [P] [US3] Add testIDs to `src/screens/bookmarks/CreateBookmarkScreen.tsx` per data-model.md registry
- [ ] T154 [P] [US3] Create `.maestro/flows/bookmarks/bookmark_list.yaml` for list display
- [ ] T155 [P] [US3] Create `.maestro/flows/bookmarks/create_bookmark.yaml` for bookmark creation
- [ ] T156 [P] [US3] Create `.maestro/flows/bookmarks/bookmark_detail.yaml` for bookmark viewing

### Voice Notes Screens - testIDs and E2E Flows (3 screens)

- [ ] T157 [P] [US3] Add testIDs to `src/screens/voiceNotes/VoiceNoteListScreen.tsx` per data-model.md registry
- [ ] T158 [P] [US3] Add testIDs to `src/screens/voiceNotes/VoiceNoteDetailScreen.tsx` per data-model.md registry
- [ ] T159 [P] [US3] Add testIDs to `src/screens/voiceNotes/RecordVoiceNoteScreen.tsx` per data-model.md registry
- [ ] T160 [P] [US3] Create `.maestro/flows/voiceNotes/voicenote_list.yaml` for list display
- [ ] T161 [P] [US3] Create `.maestro/flows/voiceNotes/record_voicenote.yaml` for recording flow
- [ ] T162 [P] [US3] Create `.maestro/flows/voiceNotes/voicenote_playback.yaml` for playback

### Videos Screens - testIDs and E2E Flows (3 screens)

- [ ] T163 [P] [US3] Add testIDs to `src/screens/videos/VideoListScreen.tsx` per data-model.md registry
- [ ] T164 [P] [US3] Add testIDs to `src/screens/videos/VideoDetailScreen.tsx` per data-model.md registry
- [ ] T165 [P] [US3] Add testIDs to `src/screens/videos/UploadVideoScreen.tsx` per data-model.md registry
- [ ] T166 [P] [US3] Create `.maestro/flows/videos/video_list.yaml` for list display
- [ ] T167 [P] [US3] Create `.maestro/flows/videos/upload_video.yaml` for upload flow
- [ ] T168 [P] [US3] Create `.maestro/flows/videos/video_playback.yaml` for playback

### Memorize Screens - testIDs and E2E Flows (4 screens)

- [ ] T169 [P] [US3] Add testIDs to `src/screens/memorize/MemorizeListScreen.tsx` per data-model.md registry
- [ ] T170 [P] [US3] Add testIDs to `src/screens/memorize/MemorizeDetailScreen.tsx` per data-model.md registry
- [ ] T171 [P] [US3] Add testIDs to `src/screens/memorize/CreateMemorizeItemScreen.tsx` per data-model.md registry
- [ ] T172 [P] [US3] Add testIDs to `src/screens/memorize/MemorizeReviewScreen.tsx` per data-model.md registry
- [ ] T173 [P] [US3] Create `.maestro/flows/memorize/memorize_list.yaml` for list display
- [ ] T174 [P] [US3] Create `.maestro/flows/memorize/create_memorize.yaml` for item creation
- [ ] T175 [P] [US3] Create `.maestro/flows/memorize/memorize_review.yaml` for review flow

### Calendar Screens - testIDs and E2E Flows (2 screens)

- [ ] T176 [P] [US3] Add testIDs to `src/screens/calendar/CalendarScreen.tsx` per data-model.md registry
- [ ] T177 [P] [US3] Add testIDs to `src/screens/calendar/DayDetailScreen.tsx` per data-model.md registry
- [ ] T178 [P] [US3] Create `.maestro/flows/calendar/calendar_navigation.yaml` for month/day navigation
- [ ] T179 [P] [US3] Create `.maestro/flows/calendar/day_detail.yaml` for day detail view

### Profile Screens - testIDs and E2E Flows (7 screens)

- [ ] T180 [P] [US3] Add testIDs to `src/screens/profile/ProfileScreen.tsx` per data-model.md registry
- [ ] T181 [P] [US3] Add testIDs to `src/screens/profile/SettingsScreen.tsx` per data-model.md registry
- [ ] T182 [P] [US3] Add testIDs to `src/screens/profile/BadgesScreen.tsx` per data-model.md registry
- [ ] T183 [P] [US3] Add testIDs to `src/screens/profile/StatisticsScreen.tsx` per data-model.md registry
- [ ] T184 [P] [US3] Add testIDs to `src/screens/profile/HabitsScreen.tsx` per data-model.md registry
- [ ] T185 [P] [US3] Add testIDs to `src/screens/profile/CreateHabitScreen.tsx` per data-model.md registry
- [ ] T186 [P] [US3] Add testIDs to `src/screens/profile/EditHabitScreen.tsx` per data-model.md registry
- [ ] T187 [P] [US3] Create `.maestro/flows/profile/profile_view.yaml` for profile display
- [ ] T188 [P] [US3] Create `.maestro/flows/profile/settings.yaml` for settings toggles
- [ ] T189 [P] [US3] Create `.maestro/flows/profile/badges.yaml` for badges view
- [ ] T190 [P] [US3] Create `.maestro/flows/profile/statistics.yaml` for statistics view
- [ ] T191 [P] [US3] Create `.maestro/flows/profile/habits_crud.yaml` for habit CRUD operations

### Search Screen - testIDs and E2E Flows (1 screen)

- [ ] T192 [P] [US3] Add testIDs to `src/screens/search/SearchScreen.tsx` per data-model.md registry
- [ ] T193 [P] [US3] Create `.maestro/flows/search/search_flow.yaml` for search functionality
- [ ] T194 [P] [US3] Create `.maestro/flows/search/search_empty.yaml` for empty results state

### Daily Log Screen - testIDs and E2E Flows (1 screen)

- [ ] T195 [P] [US3] Add testIDs to `src/screens/dailylog/DailyLogScreen.tsx` per data-model.md registry
- [ ] T196 [P] [US3] Create `.maestro/flows/dailylog/dailylog_entry.yaml` for adding entries

### Insights Screens - testIDs and E2E Flows (2 screens)

- [ ] T197 [P] [US3] Add testIDs to `src/screens/insights/WeeklySummaryListScreen.tsx` per data-model.md registry
- [ ] T198 [P] [US3] Add testIDs to `src/screens/insights/WeeklySummaryScreen.tsx` per data-model.md registry
- [ ] T199 [P] [US3] Create `.maestro/flows/insights/weekly_summary_list.yaml` for list display
- [ ] T200 [P] [US3] Create `.maestro/flows/insights/weekly_summary_detail.yaml` for detail view

### Common Components - testIDs

- [ ] T201 [P] [US3] Add testIDs to `src/components/common/Toast.tsx` per data-model.md registry
- [ ] T202 [P] [US3] Add testIDs to `src/components/common/ErrorBoundary.tsx` per data-model.md registry
- [ ] T203 [P] [US3] Add testIDs to `src/components/common/OfflineIndicator.tsx` per data-model.md registry

### Error and Edge Case Flows

- [ ] T204 [P] [US3] Create `.maestro/flows/common/error_state.yaml` for error handling tests
- [ ] T205 [P] [US3] Create `.maestro/flows/common/back_navigation.yaml` for back button behavior
- [ ] T206 [P] [US3] Create `.maestro/flows/common/empty_states.yaml` for empty state displays

### Master Test Suite

- [ ] T207 [US3] Create `.maestro/suite.yaml` that runs all flows in sequence
- [ ] T208 [US3] Run `maestro test .maestro/suite.yaml` to verify all tests pass
- [ ] T209 [US3] Commit: "feat: add comprehensive Maestro E2E test coverage for all 38 screens"

**Checkpoint**: User Story 3 complete - all screens have testIDs and E2E tests pass

---

## Phase 6: User Story 4 - Validated Production-Ready Build (Priority: P3)

**Goal**: Android build produces APK, all E2E tests pass, summary report generated

**Independent Test**: APK generated, maestro suite passes, report exists

### Implementation for User Story 4

- [ ] T210 [US4] Run `cd android && ./gradlew assembleRelease && cd ..` to build release APK
- [ ] T211 [US4] Verify APK exists at `android/app/build/outputs/apk/release/app-release.apk`
- [ ] T212 [US4] Run `maestro test .maestro/suite.yaml` for final E2E validation
- [ ] T213 [US4] Generate summary report at `specs/004-android-cleanup-e2e/SUMMARY_REPORT.md` documenting:
  - Files cleaned/fixed (count and list)
  - iOS artifacts removed (files and dependencies)
  - testIDs added (count per screen category)
  - Maestro flows created (count and list)
  - Any issues encountered and resolutions
- [ ] T214 [US4] Review git history for logical commit structure
- [ ] T215 [US4] Commit: "docs: add validation summary report for android-cleanup-e2e feature"

**Checkpoint**: User Story 4 complete - production-ready state validated

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and constitution compliance

- [ ] T216 Update `.specify/memory/constitution.md` Quality Gates section to reflect Android-only builds
- [ ] T217 Run final `npm run type-check && npm run lint && npm run format:check` verification
- [ ] T218 Run final `maestro test .maestro/suite.yaml` verification
- [ ] T219 Commit: "chore: finalize android-only cleanup with constitution update"

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Can run in parallel with US1 or after US1
- **User Story 3 (Phase 5)**: Depends on US1 and US2 completion (needs clean code and iOS removed)
- **User Story 4 (Phase 6)**: Depends on US1, US2, and US3 completion
- **Polish (Phase 7)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent - code cleanup
- **User Story 2 (P1)**: Independent - can run parallel with US1
- **User Story 3 (P2)**: Depends on US1+US2 - needs clean, Android-only codebase
- **User Story 4 (P3)**: Depends on all previous stories

### Within Each User Story

- Tasks marked [P] can run in parallel
- Non-[P] tasks should run sequentially
- Commit after each logical group of changes

### Parallel Opportunities by Phase

**Phase 3 (US1)**: All model, hook, service, component, and util tasks can run in parallel
**Phase 4 (US2)**: File removal and config review tasks can run in parallel
**Phase 5 (US3)**: All testID and flow creation tasks can run in parallel by screen domain

---

## Parallel Example: User Story 3 (Maestro Setup)

```bash
# Launch all Notes testID tasks together:
Task: "Add testIDs to src/screens/notes/NoteListScreen.tsx"
Task: "Add testIDs to src/screens/notes/NoteDetailScreen.tsx"
Task: "Add testIDs to src/screens/notes/CreateNoteScreen.tsx"
Task: "Add testIDs to src/screens/notes/EditNoteScreen.tsx"

# Launch all Notes flow tasks together:
Task: "Create .maestro/flows/notes/note_list.yaml"
Task: "Create .maestro/flows/notes/create_note.yaml"
Task: "Create .maestro/flows/notes/edit_note.yaml"
Task: "Create .maestro/flows/notes/delete_note.yaml"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Clean Code)
4. Complete Phase 4: User Story 2 (Remove iOS)
5. **STOP and VALIDATE**: Android builds, code is clean
6. Deploy/demo Android-only clean codebase

### Full Implementation

1. Complete Setup + Foundational + US1 + US2 (MVP)
2. Add User Story 3 (E2E Tests) - comprehensive test coverage
3. Add User Story 4 (Validation) - final quality gate
4. Polish phase - constitution update

### Parallel Team Strategy

With multiple developers:
1. Team completes Setup + Foundational together
2. Developer A: User Story 1 (code cleanup)
3. Developer B: User Story 2 (iOS removal)
4. Both join: User Story 3 (E2E tests - many parallel tasks)
5. Lead completes: User Story 4 (validation)

---

## Summary

| Phase | User Story | Task Count | Parallel Tasks |
|-------|------------|------------|----------------|
| 1 | Setup | 5 | 2 |
| 2 | Foundational | 4 | 2 |
| 3 | US1 - Clean Code | 93 | 85 |
| 4 | US2 - Remove iOS | 17 | 8 |
| 5 | US3 - E2E Testing | 90 | 86 |
| 6 | US4 - Validation | 6 | 0 |
| 7 | Polish | 4 | 0 |
| **Total** | | **219** | **183** |

---

## Notes

- [P] tasks = different files, no dependencies - can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group of changes
- testIDs follow convention: `screenName_elementType_identifier`
- Maestro flows reference testIDs via `id: "testID"` selector
