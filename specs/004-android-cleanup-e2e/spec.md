# Feature Specification: Android-Only Codebase Cleanup with Maestro E2E Testing

**Feature Branch**: `004-android-cleanup-e2e`
**Created**: 2026-02-06
**Status**: Draft
**Input**: User description: "Senior Engineer takeover - audit and clean codebase, remove iOS completely, set up Maestro E2E testing with comprehensive test coverage for all screens"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Clean Codebase with No Technical Debt (Priority: P1)

As a development team, we need a codebase that follows clean code principles, SOLID patterns, and best practices so that future development is faster, safer, and more maintainable.

**Why this priority**: Technical debt compounds over time. A clean foundation enables all subsequent development work and reduces bugs. This must happen first before any other changes.

**Independent Test**: Can be validated by running TypeScript compiler with strict mode, ESLint, and Prettier checks - all must pass with zero errors/warnings.

**Acceptance Scenarios**:

1. **Given** the codebase has TypeScript files, **When** running `tsc --noEmit`, **Then** zero type errors are reported
2. **Given** the codebase has JavaScript/TypeScript files, **When** running `npm run lint`, **Then** zero ESLint errors or warnings are reported
3. **Given** source files exist, **When** running `npm run format:check`, **Then** all files pass formatting check
4. **Given** the src directory structure exists, **When** reviewing folder organization, **Then** all files are logically grouped by feature/domain
5. **Given** dependencies are listed in package.json, **When** analyzing usage, **Then** no unused dependencies exist

---

### User Story 2 - Android-Only Application (Priority: P1)

As a development team, we need the application to target Android exclusively so that we can eliminate iOS maintenance overhead, reduce complexity, and focus development resources on a single platform.

**Why this priority**: Removing iOS eliminates half the platform-specific code, reduces build times, simplifies CI/CD, and ensures the team isn't maintaining unused code. Critical for development velocity.

**Independent Test**: Can be validated by confirming iOS directory is removed, no iOS-specific code exists in source files, and the Android build succeeds.

**Acceptance Scenarios**:

1. **Given** the project has an ios/ directory, **When** iOS removal is complete, **Then** the ios/ directory no longer exists
2. **Given** package.json has iOS-related scripts, **When** iOS removal is complete, **Then** only Android-related scripts remain
3. **Given** source files may have Platform.OS checks, **When** iOS removal is complete, **Then** no Platform.OS === 'ios' conditionals exist in source code
4. **Given** package.json has iOS-specific dependencies, **When** iOS removal is complete, **Then** no iOS-only dependencies remain (cli-platform-ios, CocoaPods references, etc.)
5. **Given** the project targets Android only, **When** running the build, **Then** the Android application builds successfully without errors
6. **Given** the Android build succeeds, **When** launching on an emulator/device, **Then** the application runs and all screens are navigable

---

### User Story 3 - Comprehensive E2E Test Coverage with Maestro (Priority: P2)

As a development team, we need comprehensive end-to-end tests using Maestro that cover every screen and feature so that we can catch regressions, validate user flows, and ensure application quality before releases.

**Why this priority**: E2E tests provide confidence in application behavior. While code cleanup and iOS removal are prerequisites, E2E tests are essential for maintaining quality going forward.

**Independent Test**: Can be validated by running the Maestro test suite - all tests must pass, and coverage must include all 38 screens and their interactive elements.

**Acceptance Scenarios**:

1. **Given** Maestro is not installed, **When** setup is complete, **Then** Maestro CLI is available and configured for Android testing
2. **Given** screens have interactive elements, **When** E2E setup is complete, **Then** every interactive element has a unique testID following the convention `screenName_elementType_identifier`
3. **Given** Maestro test files exist, **When** reviewing coverage, **Then** every screen has at least one dedicated test flow
4. **Given** authentication flows exist, **When** running auth tests, **Then** login, logout, and error states are covered
5. **Given** navigation exists between screens, **When** running navigation tests, **Then** all navigation paths are tested
6. **Given** forms exist in the application, **When** running form tests, **Then** all form submissions and validations are covered
7. **Given** error states can occur, **When** running error tests, **Then** invalid inputs, network errors, and empty states are handled
8. **Given** all test files exist, **When** running the master test suite, **Then** all flows execute successfully in sequence

---

### User Story 4 - Validated Production-Ready Build (Priority: P3)

As a development team, we need confirmation that all changes are validated and the application is in a production-ready state so that we can confidently deploy or continue development.

**Why this priority**: Validation ensures all previous stories are truly complete and working together. This is the final quality gate.

**Independent Test**: Can be validated by running the Android build, all E2E tests, and generating a summary report of all changes.

**Acceptance Scenarios**:

1. **Given** all code changes are complete, **When** running Android build, **Then** APK/AAB is generated without errors
2. **Given** the build succeeds, **When** running all Maestro E2E tests, **Then** all tests pass
3. **Given** all validation passes, **When** reviewing the summary report, **Then** it documents: cleaned items, removed iOS artifacts, created tests, and any issues found
4. **Given** all work is complete, **When** reviewing git history, **Then** commits are logical and well-named

---

### Edge Cases

- What happens when a screen has no interactive elements? Test navigation and display only.
- What happens when a test fails due to timing? Maestro flows should include appropriate wait conditions.
- What happens when Platform.OS conditionals have complex logic? Simplify to Android-only path, removing the conditional entirely.
- What happens when removing an iOS dependency breaks Android? Verify each dependency's cross-platform usage before removal.
- What happens when testID conflicts occur? The naming convention prevents conflicts by including screen and element context.

## Requirements *(mandatory)*

### Functional Requirements

#### Phase 1: Audit & Clean

- **FR-001**: System MUST pass TypeScript strict mode compilation with zero errors
- **FR-002**: System MUST pass ESLint checks with zero errors or warnings
- **FR-003**: System MUST pass Prettier formatting checks
- **FR-004**: Codebase MUST have no unused imports in any source file
- **FR-005**: Codebase MUST have no unused dependencies in package.json
- **FR-006**: Codebase MUST have no duplicated logic (DRY principle)
- **FR-007**: Folder structure MUST follow feature-based organization with clear separation of concerns
- **FR-008**: All code MUST follow SOLID principles where applicable

#### Phase 2: Remove iOS

- **FR-009**: The ios/ directory MUST be completely removed from the project
- **FR-010**: Package.json MUST NOT contain iOS-specific scripts (ios, pod-install, etc.)
- **FR-011**: Package.json MUST NOT contain iOS-only dependencies (@react-native-community/cli-platform-ios, etc.)
- **FR-012**: Source code MUST NOT contain Platform.OS === 'ios' conditional checks
- **FR-013**: Metro config MUST NOT contain iOS-specific configurations
- **FR-014**: Babel config MUST NOT contain iOS-specific configurations
- **FR-015**: Android build MUST succeed after iOS removal

#### Phase 3: Maestro E2E Testing

- **FR-016**: Maestro MUST be configured for Android E2E testing
- **FR-017**: All interactive elements MUST have testID props with naming convention: `screenName_elementType_identifier`
- **FR-018**: E2E tests MUST cover all 38 screens in the application:
  - Auth: LoginScreen
  - Dashboard: DashboardScreen
  - Notes: NoteListScreen, NoteDetailScreen, CreateNoteScreen, EditNoteScreen
  - Flashcards: FlashcardListScreen, FlashcardDetailScreen, CreateFlashcardScreen, EditFlashcardScreen, ReviewSessionScreen, ReviewCompleteScreen
  - Bookmarks: BookmarkListScreen, BookmarkDetailScreen, CreateBookmarkScreen
  - Voice Notes: VoiceNoteListScreen, VoiceNoteDetailScreen, RecordVoiceNoteScreen
  - Videos: VideoListScreen, VideoDetailScreen, UploadVideoScreen
  - Memorize: MemorizeListScreen, MemorizeDetailScreen, CreateMemorizeItemScreen, MemorizeReviewScreen
  - Calendar: CalendarScreen, DayDetailScreen
  - Profile: ProfileScreen, SettingsScreen, BadgesScreen, StatisticsScreen, HabitsScreen, CreateHabitScreen, EditHabitScreen
  - Search: SearchScreen
  - Daily Log: DailyLogScreen
  - Insights: WeeklySummaryListScreen, WeeklySummaryScreen
- **FR-019**: E2E tests MUST cover authentication flows (login, logout, error handling)
- **FR-020**: E2E tests MUST cover navigation between all screens
- **FR-021**: E2E tests MUST cover all form inputs and submissions
- **FR-022**: E2E tests MUST cover error states (invalid inputs, empty states)
- **FR-023**: E2E tests MUST cover edge cases (back button, permission dialogs)
- **FR-024**: Test files MUST be organized in a `.maestro/` directory with clear naming
- **FR-025**: A master test suite MUST exist that runs all flows in sequence

#### Phase 4: Validation

- **FR-026**: Android build MUST produce a successful APK/AAB
- **FR-027**: All Maestro E2E tests MUST pass
- **FR-028**: A summary report MUST document all changes made
- **FR-029**: Git commits MUST be logical and well-named

### Key Entities

- **Screen**: A distinct view in the application with its own navigation route and UI components (38 total identified)
- **Interactive Element**: Any UI component that responds to user interaction (buttons, inputs, cards, modals, navigation items, toggles, dropdowns)
- **TestID**: A unique identifier prop on React Native components enabling E2E test targeting
- **Maestro Flow**: A YAML file defining a sequence of user interactions and assertions
- **Test Suite**: A collection of related Maestro flows that can be run together

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: TypeScript, ESLint, and Prettier checks pass with zero errors/warnings
- **SC-002**: No unused dependencies remain in package.json after cleanup
- **SC-003**: iOS directory and all iOS-specific configurations are completely removed
- **SC-004**: Android build completes successfully
- **SC-005**: 100% of screens (38) have at least one E2E test flow
- **SC-006**: 100% of interactive elements across all screens have testID props
- **SC-007**: All Maestro E2E tests pass on Android emulator
- **SC-008**: Master test suite completes execution without failures
- **SC-009**: Summary report is generated documenting all cleanup actions, removals, and test coverage

## Assumptions

- The existing codebase follows React Native 0.83.1 patterns and is buildable before changes
- Maestro is the appropriate E2E testing tool for Android (standard industry choice)
- testID props are the standard mechanism for element identification in React Native E2E tests
- The Android emulator or device is available for testing
- All 38 identified screens represent the complete set of application screens
- Senior engineering decisions favor simplicity, maintainability, and best practices
- Ambiguous implementation choices default to Android platform conventions
- The `.maestro/` directory is the conventional location for Maestro test flows
