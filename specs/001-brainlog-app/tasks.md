# Tasks: BrainLog — Personal Learning & Development Tracker

**Input**: Design documents from `/specs/001-brainlog-app/`
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md)

**Tests**: Tests are included for critical business logic (spaced repetition algorithm, data synchronization) as specified in the constitution check.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- React Native mobile project structure at repository root
- Source code in `src/` directory
- Platform-specific code in `ios/` and `android/` directories
- Tests in `__tests__/` directory

---

## Phase 1: Environment Setup & Project Initialization

**Purpose**: Install required software, create React Native project, and configure development environment

### 1.1 Development Tools Installation

- [x] T001 [P] Install Node.js 20.x LTS from nodejs.org and verify with `node --version` and `npm --version`
- [x] T002 [P] Install React Native CLI globally with `npm install -g react-native-cli` and verify
- [x] T003 [P] Install Watchman (macOS/Linux) with `brew install watchman` or skip on Windows
- [x] T004 [P] Install JDK 17 for Android development and set JAVA_HOME environment variable
- [x] T005 Install Android Studio with Android SDK, Android SDK Platform, and Android Virtual Device components
- [x] T006 Configure Android SDK environment variables (ANDROID_HOME, PATH) per quickstart.md
- [ ] T007 [P] (macOS only) Install Xcode 15.x from App Store and run `sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer`
- [ ] T008 [P] (macOS only) Install CocoaPods with `sudo gem install cocoapods`
- [x] T009 [P] Install Git version control and configure user name/email

### 1.2 Project Initialization

- [x] T010 Initialize React Native project with TypeScript template: `npx react-native@latest init BrainLog --template react-native-template-typescript`
- [x] T011 Navigate to project directory and verify basic structure matches plan.md
- [x] T012 Create `.gitignore` file with Node, React Native, iOS, Android, and environment file patterns
- [x] T013 Initialize Git repository with `git init` and make initial commit
- [x] T014 Create feature branch `001-brainlog-app` with `git checkout -b 001-brainlog-app`

### 1.3 Project Structure Setup

- [x] T015 [P] Create `src/` directory structure per plan.md: components/, screens/, services/, models/, hooks/, store/, navigation/, utils/, config/
- [x] T016 [P] Create `src/components/` subdirectories: flashcards/, common/, dashboard/, navigation/
- [x] T017 [P] Create `src/screens/` subdirectories: auth/, flashcards/, notes/, dashboard/, calendar/, habits/, profile/
- [x] T018 [P] Create `src/services/` subdirectories: firebase/, googleDrive/, spacedRepetition/, sync/, notifications/, media/
- [x] T019 [P] Create `__tests__/` directory structure: unit/, integration/, e2e/
- [x] T020 [P] Create `assets/` subdirectories: images/, fonts/, icons/

### 1.4 Core Dependencies Installation

- [x] T021 Install React Native Firebase packages: `npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/database @react-native-firebase/messaging`
- [x] T022 Install Google Sign-In: `npm install @react-native-google-signin/google-signin`
- [ ] T023 Install WatermelonDB for offline storage: `npm install @nozbe/watermelondb @nozbe/watermelondb/adapters/sqlite` *(SKIPPED - using Firebase directly)*
- [x] T024 Install Zustand for state management: `npm install zustand`
- [x] T025 Install React Navigation packages: `npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack react-native-safe-area-context react-native-screens react-native-gesture-handler react-native-reanimated`
- [x] T026 Install media handling packages: `npm install react-native-compressor react-native-image-picker react-native-fs`
- [x] T027 Install notifications: `npm install @notifee/react-native`
- [x] T028 Install utility packages: `npm install date-fns`
- [x] T029 Install Google APIs client: `npm install googleapis`

### 1.5 Development Dependencies

- [x] T030 [P] Install TypeScript types: `npm install --save-dev @types/react @types/react-native`
- [ ] T031 [P] Install testing libraries: `npm install --save-dev jest @testing-library/react-native @testing-library/jest-native`
- [ ] T032 [P] Install Detox for E2E testing: `npm install --save-dev detox`
- [x] T033 [P] Install ESLint and Prettier: `npm install --save-dev eslint prettier eslint-plugin-react eslint-plugin-react-hooks @typescript-eslint/parser @typescript-eslint/eslint-plugin`
- [x] T034 [P] Install additional dev tools: `npm install --save-dev ts-node typescript react-native-dotenv`

### 1.6 iOS Native Dependencies (macOS only)

- [ ] T035 Navigate to `ios/` directory and run `pod install` to install CocoaPods dependencies
- [ ] T036 Add Firebase iOS configuration: Download `GoogleService-Info.plist` from Firebase Console
- [ ] T037 Move `GoogleService-Info.plist` to `ios/BrainLog/` directory
- [ ] T038 Open `ios/BrainLog.xcworkspace` in Xcode and add `GoogleService-Info.plist` to project
- [ ] T039 Configure Firebase in `ios/Podfile`: Add Firebase pods (Core, Auth, Database, Messaging)
- [ ] T040 Run `cd ios && pod install && cd ..` to update iOS dependencies

### 1.7 Android Native Dependencies

- [x] T041 Add Firebase Android configuration: Download `google-services.json` from Firebase Console
- [x] T042 Move `google-services.json` to `android/app/` directory
- [x] T043 Configure Firebase in `android/build.gradle`: Add Google Services classpath dependency
- [x] T044 Apply Google Services plugin in `android/app/build.gradle`
- [x] T045 Update `android/app/build.gradle`: Set minSdkVersion to 24, compileSdkVersion to 34, targetSdkVersion to 34
- [x] T046 Add Firebase dependencies to `android/app/build.gradle`: firebase-auth, firebase-database, firebase-messaging

### 1.8 Environment Configuration

- [ ] T047 Create `.env` file at project root with Firebase and Google OAuth configuration placeholders
- [x] T048 Add `.env` to `.gitignore` to prevent committing secrets
- [x] T049 Create `.env.example` file with placeholder values as template for team
- [ ] T050 Install react-native-config to load environment variables: `npm install react-native-config`
- [ ] T051 Configure react-native-config for iOS in Xcode build phases
- [ ] T052 Configure react-native-config for Android in `android/app/build.gradle`

### 1.9 Linting and Formatting Configuration

- [x] T053 [P] Create `.eslintrc.js` configuration file with React Native and TypeScript rules
- [x] T054 [P] Create `.prettierrc.js` configuration file with project formatting preferences
- [x] T055 [P] Create `.editorconfig` for consistent editor settings across team
- [x] T056 [P] Add lint scripts to `package.json`: "lint", "lint:fix", "format"
- [x] T057 [P] Configure TypeScript with `tsconfig.json`: strict mode, path aliases (@/ for src/)

### 1.10 Testing Configuration

- [x] T058 [P] Create `jest.config.js` with React Native preset and setup from quickstart.md
- [ ] T059 [P] Create `.detoxrc.js` for E2E testing configuration with iOS and Android configs
- [x] T060 [P] Add test scripts to `package.json`: "test", "test:watch", "test:coverage", "test:e2e"
- [x] T061 [P] Create `__tests__/setup.js` for Jest global setup and mocks

### 1.11 Firebase Project Setup (External)

- [ ] T062 Create Firebase project in Firebase Console named "brainlog-dev"
- [ ] T063 Register iOS app in Firebase with bundle ID `com.brainlog`
- [ ] T064 Register Android app in Firebase with package name `com.brainlog`
- [ ] T065 Enable Google Authentication provider in Firebase Console Authentication section
- [ ] T066 Create Firebase Realtime Database and set location (choose closest to target users)
- [ ] T067 Configure Firebase Realtime Database security rules from contracts/firebase-database-operations.md
- [ ] T068 Add database indexes for flashcards.next_review_date, notes.folder, notes.category per data-model.md
- [ ] T069 Enable Firebase Cloud Messaging (FCM) in Project Settings
- [ ] T070 (iOS only) Upload APNs authentication key to Firebase for push notifications

### 1.12 Google Drive API Setup (External)

- [ ] T071 Enable Google Drive API in Google Cloud Console for the Firebase project
- [ ] T072 Configure OAuth consent screen with app name "BrainLog" and required user support email
- [ ] T073 Add OAuth scopes: `https://www.googleapis.com/auth/drive.appdata` and `https://www.googleapis.com/auth/drive.file`
- [ ] T074 Create Web OAuth 2.0 Client ID and copy Client ID to `.env` as GOOGLE_WEB_CLIENT_ID
- [ ] T075 (macOS) Create iOS OAuth 2.0 Client ID with bundle ID `com.brainlog` and copy to `.env` as GOOGLE_IOS_CLIENT_ID
- [ ] T076 Create Android OAuth 2.0 Client ID with package name and debug keystore SHA-1 fingerprint
- [ ] T077 Generate Android debug keystore SHA-1 with `keytool -list -v -keystore ~/.android/debug.keystore`

### 1.13 Native Google Sign-In Configuration

- [ ] T078 (iOS) Configure Google Sign-In in `ios/BrainLog/AppDelegate.mm`: Import GoogleSignIn and add URL handler
- [ ] T079 (iOS) Update `ios/BrainLog/Info.plist`: Add CFBundleURLTypes with reversed iOS client ID
- [ ] T080 (iOS) Add GIDClientID key to Info.plist with iOS client ID value
- [ ] T081 (Android) Add Google Play Services version meta-data to `android/app/src/main/AndroidManifest.xml`

### 1.14 Firebase Emulator Setup (Development)

- [ ] T082 Install Firebase CLI globally: `npm install -g firebase-tools`
- [ ] T083 Login to Firebase CLI: `firebase login`
- [ ] T084 Initialize Firebase emulators: `firebase init emulators` (select Auth and Realtime Database)
- [ ] T085 Create `firebase.json` configuration file with emulator ports (Auth: 9099, Database: 9000)
- [ ] T086 Add emulator connection logic to Firebase config for development environment

### 1.15 First Run Verification

- [ ] T087 Run Metro bundler: `npm start` and verify it starts without errors
- [ ] T088 (macOS) Run iOS app: `npx react-native run-ios` and verify it launches in simulator
- [ ] T089 Run Android app: `npx react-native run-android` and verify it launches in emulator
- [ ] T090 Verify hot reload works: Make a text change and confirm it updates without full rebuild
- [ ] T091 Run linting: `npm run lint` and verify no errors
- [ ] T092 Run tests: `npm test` and verify Jest runs successfully
- [ ] T093 Commit setup completion: "chore: complete project setup and configuration"

**Checkpoint**: Development environment is fully configured. All tools installed, project initialized, dependencies installed, and basic app runs on both iOS and Android.

---

## Phase 2: Foundational Infrastructure

**Purpose**: Core architecture that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### 2.1 TypeScript Models & Interfaces

- [x] T094 [P] Create User model interface in `src/models/User.ts` with all fields from data-model.md
- [x] T095 [P] Create Flashcard model interface in `src/models/Flashcard.ts` with SM-2 parameters
- [x] T096 [P] Create Note model interface in `src/models/Note.ts`
- [x] T097 [P] Create Bookmark model interface in `src/models/Bookmark.ts`
- [x] T098 [P] Create Video model interface in `src/models/Video.ts`
- [x] T099 [P] Create VoiceNote model interface in `src/models/VoiceNote.ts`
- [x] T100 [P] Create MemorizeItem model interface in `src/models/MemorizeItem.ts`
- [x] T101 [P] Create DailyLog model interface in `src/models/DailyLog.ts`
- [x] T102 [P] Create HabitDefinition model interface in `src/models/HabitDefinition.ts`
- [x] T103 [P] Create HabitLogEntry model interface in `src/models/HabitLogEntry.ts`
- [x] T104 [P] Create DailyProgress model interface in `src/models/DailyProgress.ts`
- [x] T105 [P] Create WeeklySummary model interface in `src/models/WeeklySummary.ts`
- [x] T106 [P] Create Tag model interface in `src/models/Tag.ts`
- [x] T107 [P] Create UserSettings model interface in `src/models/UserSettings.ts`
- [x] T108 [P] Create index.ts in `src/models/` to export all model interfaces

### 2.2 WatermelonDB Schema Setup *(SKIPPED - Using Firebase Realtime Database directly)*

- [ ] T109 Create WatermelonDB schema file in `src/database/schema.ts` defining all 14 tables from data-model.md *(SKIPPED)*
- [ ] T110 Create WatermelonDB model classes in `src/database/models/` directory (one file per entity) *(SKIPPED)*
- [ ] T111 Implement User model class extending WatermelonDB Model in `src/database/models/User.ts` *(SKIPPED)*
- [ ] T112 [P] Implement Flashcard model class in `src/database/models/Flashcard.ts` *(SKIPPED)*
- [ ] T113 [P] Implement Note model class in `src/database/models/Note.ts` *(SKIPPED)*
- [ ] T114 [P] Implement remaining model classes (Bookmark, Video, VoiceNote, etc.) following same pattern *(SKIPPED)*
- [ ] T115 Create WatermelonDB database instance in `src/database/index.ts` with SQLite adapter *(SKIPPED)*
- [ ] T116 Configure WatermelonDB sync adapter for Firebase in `src/database/sync.ts` *(SKIPPED)*

### 2.3 Firebase Configuration

- [x] T117 Create Firebase configuration file in `src/config/firebase.ts` with initialization logic
- [x] T118 Load Firebase credentials from environment variables in `src/config/environment.ts`
- [x] T119 Configure Firebase emulator connection for development environment in firebase.ts
- [x] T120 Export Firebase auth, database, and messaging instances from firebase.ts
- [x] T121 Create Firebase error handler utility in `src/utils/firebaseErrorHandler.ts`

### 2.4 Google Sign-In Configuration

- [x] T122 Create Google Sign-In service in `src/services/firebase/authService.ts`
- [x] T123 Implement Google Sign-In configuration with OAuth scopes (drive.appdata, drive.file)
- [x] T124 Implement sign-in flow: Google Sign-In → Firebase credential → Firebase Auth
- [x] T125 Implement sign-out flow: Clear session and cached credentials
- [x] T126 Implement session persistence across app restarts
- [x] T127 Create authentication state hook in `src/hooks/useAuth.ts`

### 2.5 Zustand Store Setup

- [x] T128 Create Zustand store configuration in `src/store/index.ts`
- [x] T129 Create auth slice in `src/store/slices/authSlice.ts` for user and session state
- [x] T130 Create flashcards slice in `src/store/slices/flashcardsSlice.ts` for flashcard state
- [x] T131 [P] Create notes slice in `src/store/slices/notesSlice.ts`
- [x] T132 [P] Create progress slice in `src/store/slices/progressSlice.ts`
- [x] T133 [P] Create settings slice in `src/store/slices/settingsSlice.ts`
- [x] T134 Configure Zustand persistence middleware for offline caching

### 2.6 Navigation Structure

- [x] T135 Create root navigator in `src/navigation/AppNavigator.tsx` with auth state check
- [x] T136 Create authentication stack in `src/navigation/AuthStack.tsx` (Login screen only for MVP)
- [x] T137 Create main tab navigator in `src/navigation/MainTabs.tsx` with bottom tabs
- [x] T138 Configure navigation theme (light/dark mode support) in `src/config/theme.ts`
- [x] T139 Create navigation type definitions in `src/navigation/types.ts`

### 2.7 Common UI Components *(Using inline styles instead of separate component files)*

- [ ] T140 [P] Create Button component in `src/components/common/Button.tsx` with variants and accessibility *(SKIPPED - inline)*
- [ ] T141 [P] Create Input component in `src/components/common/Input.tsx` with validation *(SKIPPED - inline)*
- [ ] T142 [P] Create Card component in `src/components/common/Card.tsx` for content containers *(SKIPPED - inline)*
- [ ] T143 [P] Create Modal component in `src/components/common/Modal.tsx` for dialogs *(SKIPPED - inline)*
- [ ] T144 [P] Create LoadingSpinner component in `src/components/common/LoadingSpinner.tsx` *(SKIPPED - inline)*
- [ ] T145 [P] Create ErrorMessage component in `src/components/common/ErrorMessage.tsx` *(SKIPPED - inline)*
- [x] T146 Create theme constants in `src/config/theme.ts`: colors, typography, spacing

### 2.8 Utility Functions

- [x] T147 [P] Create date utility functions in `src/utils/dateUtils.ts`: formatDate, getDayKey, getWeekKey, etc.
- [x] T148 [P] Create validation utility in `src/utils/validation.ts`: email, required fields, etc.
- [x] T149 [P] Create constants file in `src/utils/constants.ts`: XP values, level thresholds, intervals
- [x] T150 [P] Create error handling utility in `src/utils/errorHandler.ts` with user-friendly messages
- [x] T151 [P] Create storage utility in `src/utils/storage.ts` for MMKV operations

### 2.9 Offline Sync Infrastructure

- [x] T152 Create sync service in `src/services/sync/syncService.ts` for Firebase sync
- [x] T153 Implement conflict resolution strategy (last-write-wins using timestamps)
- [x] T154 Create offline queue for write operations in `src/services/sync/offlineQueue.ts`
- [x] T155 Implement connectivity listener in `src/services/sync/connectivityListener.ts`
- [x] T156 Create sync status indicator component in `src/components/common/SyncStatusIndicator.tsx`

### 2.10 Testing Infrastructure

- [ ] T157 [P] Create Firebase emulator test setup in `__tests__/setup.js`
- [ ] T158 [P] Create mock factories for all models in `__tests__/factories/`
- [ ] T159 [P] Create test utilities in `__tests__/utils/`: renderWithProviders, createMockNavigation, etc.
- [ ] T160 [P] Write unit tests for date utilities in `__tests__/unit/utils/dateUtils.test.ts`
- [ ] T161 [P] Write unit tests for validation utilities in `__tests__/unit/utils/validation.test.ts`

**Checkpoint**: Foundation ready - all core infrastructure in place. User story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Spaced Repetition Learning System (Priority: P1) 🎯 MVP

**Goal**: Users can create flashcards, review them using spaced repetition (SM-2 algorithm), and see their progress

**Independent Test**: Create 10 flashcards, review them over 3 sessions rating with different quality scores, verify intervals increase correctly (1 day → 6 days → exponential), and statistics are accurate

### 3.1 Spaced Repetition Algorithm (Business Logic)

- [x] T162 Create SM-2 algorithm implementation in `src/services/spacedRepetition/SM2Algorithm.ts`
- [x] T163 Implement `calculateNextReview()` function with quality ratings (0, 3, 4, 5) per FR-002
- [x] T164 Implement ease factor calculation with min 1.3, initial 2.5 per spec
- [x] T165 Implement interval calculation: 1 day, 6 days, then interval × ease factor
- [ ] T166 Write unit tests for SM-2 algorithm in `__tests__/unit/services/spacedRepetition/SM2Algorithm.test.ts`
- [ ] T167 Test all quality rating scenarios (Again, Hard, Good, Easy) with property-based testing
- [ ] T168 Verify interval monotonicity: intervals increase for quality >= 3

### 3.2 Flashcard Models & Services

- [x] T169 [US1] Create Flashcard service in `src/services/firebase/flashcardService.ts`
- [x] T170 [US1] Implement createFlashcard() operation per contracts/firebase-database-operations.md
- [x] T171 [US1] Implement updateFlashcard() operation with review data
- [x] T172 [US1] Implement deleteFlashcard() operation
- [x] T173 [US1] Implement getDueFlashcards() query with date filtering
- [x] T174 [US1] Implement getFlashcardsByDeck() query
- [x] T175 [US1] Implement flashcard statistics tracking (total_reviews, correct_reviews, incorrect_reviews)

### 3.3 Flashcard Hooks

- [x] T176 [P] [US1] Create useFlashcards hook in `src/hooks/useFlashcards.ts` for CRUD operations
- [x] T177 [P] [US1] Create useSpacedRepetition hook in `src/hooks/useSpacedRepetition.ts` for review scheduling *(merged into useFlashcards)*
- [x] T178 [P] [US1] Create useReviewSession hook in `src/hooks/useReviewSession.ts` for review flow management *(merged into screens)*

### 3.4 Flashcard UI Components *(Implemented inline in screens)*

- [x] T179 [P] [US1] Create FlashCard component in `src/components/flashcards/FlashCard.tsx` (card flip animation)
- [x] T180 [P] [US1] Create RatingButtons component in `src/components/flashcards/RatingButtons.tsx` (Again, Hard, Good, Easy)
- [x] T181 [P] [US1] Create ReviewProgress component in `src/components/flashcards/ReviewProgress.tsx` (cards remaining)
- [x] T182 [P] [US1] Create CardStatistics component in `src/components/flashcards/CardStatistics.tsx` (reviews, accuracy)

### 3.5 Flashcard Screens

- [x] T183 [US1] Create CreateFlashcardScreen in `src/screens/flashcards/CreateFlashcardScreen.tsx`
- [x] T184 [US1] Implement form with front text, back text, deck selection, tags input
- [x] T185 [US1] Add form validation for required fields (front_text, back_text)
- [x] T186 [US1] Create ReviewSessionScreen in `src/screens/flashcards/ReviewSessionScreen.tsx`
- [x] T187 [US1] Implement review flow: load due cards → show front → reveal back → rate → next card
- [x] T188 [US1] Display next review interval estimates for each rating button (FR-005)
- [x] T189 [US1] Update flashcard with SM-2 calculation results on rating selection
- [x] T190 [US1] Show completion screen with session summary (cards reviewed, accuracy)
- [x] T191 [US1] Create FlashcardListScreen in `src/screens/flashcards/FlashcardListScreen.tsx`
- [x] T192 [US1] Display all flashcards with deck grouping and search/filter
- [x] T193 [US1] Create FlashcardDetailScreen in `src/screens/flashcards/FlashcardDetailScreen.tsx`
- [x] T194 [US1] Display full card details with statistics and edit/delete actions

### 3.6 User Story 1 Integration

- [x] T195 [US1] Add Flashcards tab to MainTabs navigator with card icon
- [x] T196 [US1] Create flashcard stack navigator with all flashcard screens
- [ ] T197 [US1] Integrate flashcard service with WatermelonDB for offline support *(SKIPPED - using Firebase)*
- [x] T198 [US1] Implement flashcard sync with Firebase (create, update, delete operations)
- [x] T199 [US1] Add error handling for flashcard operations per FR-000f, FR-000g, FR-000h
- [x] T200 [US1] Add loading states for async operations

### 3.7 User Story 1 Testing

- [ ] T201 [P] [US1] Write integration test for flashcard creation flow in `__tests__/integration/flashcards/createFlashcard.test.ts`
- [ ] T202 [P] [US1] Write integration test for review session flow in `__tests__/integration/flashcards/reviewSession.test.ts`
- [ ] T203 [P] [US1] Write E2E test for complete user journey in `__tests__/e2e/flashcards/spacedRepetition.e2e.ts`

**Checkpoint**: User Story 1 complete - Users can create flashcards, review them with spaced repetition, and track statistics. This is a fully functional MVP!

---

## Phase 4: User Story 2 - Content Organization & Knowledge Management (Priority: P1)

**Goal**: Users can create notes, save bookmarks, upload videos, record voice notes, tag all content, and search across all content types

**Independent Test**: Create 5 notes, 3 bookmarks, 1 video, 2 voice notes all tagged with "React", search for "React", verify all items appear in unified search results

### 4.1 Note Service & CRUD

- [x] T204 [US2] Create Note service in `src/services/firebase/noteService.ts`
- [x] T205 [US2] Implement createNote() operation with rich text content
- [x] T206 [US2] Implement updateNote() operation
- [x] T207 [US2] Implement deleteNote() operation
- [x] T208 [US2] Implement getNotesByFolder() query
- [x] T209 [US2] Implement getNotesByCategory() query

### 4.2 Bookmark Service

- [x] T210 [P] [US2] Create Bookmark service in `src/services/firebase/bookmarkService.ts`
- [x] T211 [P] [US2] Implement createBookmark() with URL, title, type, tags
- [x] T212 [P] [US2] Implement updateBookmark() operation
- [x] T213 [P] [US2] Implement deleteBookmark() operation
- [x] T214 [P] [US2] Implement getBookmarksByType() query

### 4.3 Video & Media Services

- [x] T215 [US2] Create Video compression service in `src/services/media/videoCompressionService.ts` *(integrated in screen)*
- [x] T216 [US2] Integrate react-native-compressor for video compression per research.md
- [x] T217 [US2] Implement compressVideo() with progress callbacks
- [x] T218 [US2] Create Google Drive upload service in `src/services/googleDrive/uploadService.ts` *(simplified)*
- [x] T219 [US2] Implement uploadVideoToGoogleDrive() per contracts/google-drive-api.md
- [x] T220 [US2] Implement uploadVoiceNoteToGoogleDrive() operation
- [x] T221 [US2] Implement downloadFileFromGoogleDrive() for offline playback
- [x] T222 [US2] Create Video service in `src/services/firebase/videoService.ts` for metadata
- [x] T223 [US2] Create VoiceNote service in `src/services/firebase/voiceNoteService.ts`

### 4.4 Voice Note Recording

- [x] T224 [P] [US2] Create Voice recording service in `src/services/media/voiceRecordingService.ts` *(using react-native-nitro-sound)*
- [x] T225 [P] [US2] Integrate react-native-audio-recorder for voice recording
- [x] T226 [P] [US2] Implement startRecording(), stopRecording(), playRecording()
- [x] T227 [P] [US2] Calculate audio duration from recorded file

### 4.5 Unified Tagging System

- [x] T228 [US2] Create Tag service in `src/services/firebase/tagService.ts`
- [x] T229 [US2] Implement incrementTagCount() operation per contracts/firebase-database-operations.md
- [x] T230 [US2] Implement getFrequentTags() for autocomplete
- [x] T231 [US2] Create tag autocomplete component in `src/components/common/TagInput.tsx` *(inline)*

### 4.6 Global Search Service

- [x] T232 [US2] Create Search service in `src/services/search/searchService.ts`
- [x] T233 [US2] Implement searchAllContent() that queries flashcards, notes, bookmarks, videos, voice notes
- [x] T234 [US2] Implement tag-based search across all content types (FR-015)
- [x] T235 [US2] Group results by content type for display

### 4.7 Note UI Components & Screens

- [x] T236 [P] [US2] Create NoteEditor component in `src/components/notes/NoteEditor.tsx` with rich text support *(inline)*
- [x] T237 [P] [US2] Create NoteCard component in `src/components/notes/NoteCard.tsx` for list view *(inline)*
- [x] T238 [US2] Create NoteEditorScreen in `src/screens/notes/NoteEditorScreen.tsx` *(CreateNoteScreen.tsx)*
- [x] T239 [US2] Implement rich text editing with markdown support
- [x] T240 [US2] Add folder and category selection
- [x] T241 [US2] Add tag input with autocomplete
- [x] T242 [US2] Create NoteListScreen in `src/screens/notes/NoteListScreen.tsx`
- [x] T243 [US2] Display notes with folder/category filtering
- [x] T244 [US2] Create NoteDetailScreen in `src/screens/notes/NoteDetailScreen.tsx`

### 4.8 Bookmark UI

- [x] T245 [P] [US2] Create BookmarkCard component in `src/components/common/BookmarkCard.tsx` *(inline)*
- [x] T246 [P] [US2] Create AddBookmarkScreen in `src/screens/bookmarks/AddBookmarkScreen.tsx` *(CreateBookmarkScreen.tsx)*
- [x] T247 [P] [US2] Create BookmarkListScreen in `src/screens/bookmarks/BookmarkListScreen.tsx`

### 4.9 Video Upload UI

- [x] T248 [US2] Create VideoUploadScreen in `src/screens/videos/VideoUploadScreen.tsx` *(UploadVideoScreen.tsx)*
- [x] T249 [US2] Integrate react-native-image-picker for video selection
- [x] T250 [US2] Show compression progress with progress bar
- [x] T251 [US2] Show upload progress to Google Drive
- [x] T252 [US2] Display video metadata after upload (resolution, size, duration)
- [x] T253 [US2] Create VideoListScreen in `src/screens/videos/VideoListScreen.tsx`
- [x] T254 [US2] Create VideoPlayerScreen in `src/screens/videos/VideoPlayerScreen.tsx` *(VideoDetailScreen.tsx)*

### 4.10 Voice Note UI

- [x] T255 [P] [US2] Create VoiceRecorder component in `src/components/common/VoiceRecorder.tsx` *(inline)*
- [x] T256 [P] [US2] Show recording duration and waveform visualization
- [x] T257 [P] [US2] Create VoiceNoteListScreen in `src/screens/voiceNotes/VoiceNoteListScreen.tsx`

### 4.11 Search UI

- [x] T258 [US2] Create SearchScreen in `src/screens/search/SearchScreen.tsx`
- [x] T259 [US2] Implement search bar with debounced input
- [x] T260 [US2] Display results grouped by content type (Flashcards, Notes, Bookmarks, Videos, Voice Notes)
- [x] T261 [US2] Add tag filter chips for quick filtering

### 4.12 User Story 2 Integration

- [x] T262 [US2] Add Notes, Bookmarks, Videos tabs to navigation
- [x] T263 [US2] Add global search button to navigation header
- [ ] T264 [US2] Integrate all content services with WatermelonDB for offline support *(SKIPPED)*
- [x] T265 [US2] Implement sync for all content types with Firebase
- [x] T266 [US2] Add error handling for media operations (quota exceeded, network failures)

**Checkpoint**: User Story 2 complete - Users can organize all study materials in one place with unified tagging and search

---

## Phase 5: User Story 3 - Daily Learning Dashboard & Progress Tracking (Priority: P2)

**Goal**: Users see their current learning status on a dashboard with due cards, habits, streak, XP, and quick actions

**Independent Test**: Open app and verify dashboard shows correct counts (due cards, habits, streak), complete a habit and verify it updates, perform learning activity and verify XP increases

### 5.1 Daily Progress Service

- [x] T267 [US3] Create DailyProgress service in `src/services/firebase/progressService.ts`
- [x] T268 [US3] Implement upsertDailyProgress() with transaction logic per contracts/firebase-database-operations.md
- [x] T269 [US3] Implement getProgressForDateRange() for calendar queries
- [x] T270 [US3] Create progress tracking hook in `src/hooks/useProgress.ts`

### 5.2 XP & Leveling System

- [x] T271 [US3] Create XP service in `src/services/gamification/xpService.ts`
- [x] T272 [US3] Implement awardXP() function with point values from FR-039
- [x] T273 [US3] Implement calculateLevel() based on XP thresholds from FR-040
- [x] T274 [US3] Update user profile with XP and level in Firebase
- [ ] T275 [US3] Write unit tests for XP calculations in `__tests__/unit/services/gamification/xpService.test.ts`

### 5.3 Streak Tracking

- [x] T276 [US3] Create Streak service in `src/services/gamification/streakService.ts`
- [x] T277 [US3] Implement updateStreak() logic: compare last_active_date with today
- [x] T278 [US3] Increment streak if consecutive, reset if missed (unless freeze used)
- [x] T279 [US3] Track longest streak and update when current exceeds it
- [x] T280 [US3] Implement streak freeze functionality (once per week per FR-044)

### 5.4 Dashboard Components *(Implemented inline in DashboardScreen)*

- [x] T281 [P] [US3] Create DashboardCard component in `src/components/dashboard/DashboardCard.tsx`
- [x] T282 [P] [US3] Create StreakCounter component in `src/components/dashboard/StreakCounter.tsx` with fire icon
- [x] T283 [P] [US3] Create XPBar component in `src/components/dashboard/XPBar.tsx` showing level progress
- [x] T284 [P] [US3] Create DueCardsWidget component in `src/components/dashboard/DueCardsWidget.tsx`
- [x] T285 [P] [US3] Create HabitsChecklistWidget component in `src/components/dashboard/HabitsChecklistWidget.tsx`
- [x] T286 [P] [US3] Create MiniActivityChart component in `src/components/dashboard/MiniActivityChart.tsx`
- [x] T287 [P] [US3] Create QuickActionButtons component in `src/components/dashboard/QuickActionButtons.tsx`

### 5.5 Dashboard Screen

- [x] T288 [US3] Create DashboardScreen in `src/screens/dashboard/DashboardScreen.tsx`
- [x] T289 [US3] Display personalized greeting based on time of day (FR-031)
- [x] T290 [US3] Show due cards count with "Start Review" button
- [x] T291 [US3] Show daily habits checklist with completion checkboxes
- [x] T292 [US3] Show current streak with fire icon and count
- [x] T293 [US3] Show XP bar with current level and progress to next level
- [x] T294 [US3] Show mini weekly activity chart (bar chart for last 7 days)
- [x] T295 [US3] Show "Continue where you left off" section with last edited item
- [x] T296 [US3] Add quick action buttons: Create Flashcard, Create Note, Save Bookmark, Record Voice Note
- [x] T297 [US3] Implement dashboard refresh on focus (update counts)
- [x] T298 [US3] Ensure dashboard loads in under 2 seconds (SC-013)

### 5.6 User Story 3 Integration

- [x] T299 [US3] Set Dashboard as default home screen in MainTabs
- [x] T300 [US3] Integrate XP awarding after completing learning activities (flashcard review, note creation, etc.)
- [x] T301 [US3] Integrate streak updates on daily activity
- [x] T302 [US3] Integrate progress tracking for all learning activities
- [x] T303 [US3] Add offline support for dashboard (cache latest data)

**Checkpoint**: User Story 3 complete - Dashboard provides motivational hub and shows current learning status

---

## Phase 6: User Story 4 - Learning Calendar & Historical Insights (Priority: P2)

**Goal**: Users can view a calendar showing their learning activity history and tap any date to see what they accomplished

**Independent Test**: View calendar showing last 30 days color-coded by activity, tap a past date, verify it shows accurate counts for that day (cards reviewed, notes created, study time)

### 6.1 Calendar Service

- [x] T304 [US4] Create Calendar service in `src/services/calendar/calendarService.ts` *(in dailyLogService)*
- [x] T305 [US4] Implement getCalendarData() to fetch daily progress for month range
- [x] T306 [US4] Implement getActivityLevel() to calculate color intensity based on activity
- [x] T307 [US4] Implement getDayDetail() to fetch full details for specific date

### 6.2 Daily Log Service

- [x] T308 [P] [US4] Create DailyLog service in `src/services/firebase/dailyLogService.ts`
- [x] T309 [P] [US4] Implement createOrUpdateDailyLog() for journal entries
- [x] T310 [P] [US4] Implement getDailyLog() by date key
- [x] T311 [P] [US4] Auto-populate summary statistics from daily progress

### 6.3 Calendar Components *(Implemented inline)*

- [x] T312 [P] [US4] Create CalendarGrid component in `src/components/calendar/CalendarGrid.tsx`
- [x] T313 [P] [US4] Implement day cells with color coding (green=active, yellow=partial, red=missed, gray=no data)
- [x] T314 [P] [US4] Create DayDetail component in `src/components/calendar/DayDetail.tsx`
- [x] T315 [P] [US4] Create ActivityLegend component showing color meanings

### 6.4 Calendar Screen

- [x] T316 [US4] Create CalendarScreen in `src/screens/calendar/CalendarScreen.tsx`
- [x] T317 [US4] Display calendar grid for current month with activity levels
- [x] T318 [US4] Add month navigation controls (previous/next month)
- [x] T319 [US4] Highlight today's date with clear indicator
- [x] T320 [US4] Make day cells tappable to view day detail
- [x] T321 [US4] Create DayDetailScreen in `src/screens/calendar/DayDetailScreen.tsx`
- [x] T322 [US4] Show cards reviewed with results (correct/incorrect)
- [x] T323 [US4] Show notes created, videos watched, habits completed
- [x] T324 [US4] Show total study time and XP earned
- [x] T325 [US4] Display user's daily log text if they wrote one

### 6.5 Daily Log Screen

- [x] T326 [P] [US4] Create DailyLogScreen in `src/screens/calendar/DailyLogScreen.tsx` *(src/screens/dailylog/DailyLogScreen.tsx)*
- [x] T327 [P] [US4] Add text areas: "What I learned", "Challenges faced", "Plan for tomorrow"
- [x] T328 [P] [US4] Auto-populate statistics section from daily progress
- [x] T329 [P] [US4] Add linked items section (references to notes/cards/videos)

### 6.6 User Story 4 Integration

- [x] T330 [US4] Add Calendar tab to MainTabs navigator
- [x] T331 [US4] Integrate calendar with daily progress data from Phase 5
- [x] T332 [US4] Add navigation from calendar to daily log editing
- [x] T333 [US4] Add visual streak indicators connecting consecutive active days

**Checkpoint**: User Story 4 complete - Users can review their learning history and reflect on past activities

---

## Phase 7: User Story 5 - Habit Formation & Consistency Tracking (Priority: P2)

**Goal**: Users can define daily habits, check them off each day, and view their completion patterns in a habit grid

**Independent Test**: Create 3 habits ("Review flashcards", "Read 15 min", "Write code"), check off 2 of them today, view habit grid showing weekly completion pattern

### 7.1 Habit Services

- [x] T334 [US5] Create Habit service in `src/services/firebase/habitService.ts`
- [x] T335 [US5] Implement createHabitDefinition() per contracts/firebase-database-operations.md
- [x] T336 [US5] Implement updateHabitCompletion() with transaction logic
- [x] T337 [US5] Implement getHabitsWithCompletionStatus() for today
- [x] T338 [US5] Implement getHabitGrid() for weekly/monthly view
- [x] T339 [US5] Implement calculateHabitCompletionRate() for statistics

### 7.2 Habit Components *(Implemented inline)*

- [x] T340 [P] [US5] Create HabitCheckbox component in `src/components/habits/HabitCheckbox.tsx`
- [x] T341 [P] [US5] Create HabitGrid component in `src/components/habits/HabitGrid.tsx` (matrix view)
- [x] T342 [P] [US5] Create HabitCompletionRate component in `src/components/habits/HabitCompletionRate.tsx`

### 7.3 Habit Screens

- [x] T343 [US5] Create HabitsScreen in `src/screens/habits/HabitsScreen.tsx` *(src/screens/profile/HabitsScreen.tsx)*
- [x] T344 [US5] Display list of active habits with checkboxes for today
- [x] T345 [US5] Show weekly habit grid (7 days × N habits matrix)
- [x] T346 [US5] Show weekly and monthly completion rate percentages
- [x] T347 [US5] Add "Add Habit" button to create new habits
- [x] T348 [US5] Create AddHabitScreen in `src/screens/habits/AddHabitScreen.tsx` *(CreateHabitScreen.tsx)*
- [x] T349 [US5] Implement habit name input with validation
- [x] T350 [US5] Add reorder functionality for display order
- [x] T351 [US5] Create EditHabitScreen in `src/screens/habits/EditHabitScreen.tsx` *(src/screens/profile/EditHabitScreen.tsx)*
- [x] T352 [US5] Allow editing habit name, deactivating, or deleting (preserves historical data per FR-028)

### 7.4 Habit Notifications

- [x] T353 [US5] Create Notification service in `src/services/notifications/notificationService.ts`
- [x] T354 [US5] Implement scheduleHabitReminder() for incomplete habits at user-configured time
- [x] T355 [US5] Implement cancelHabitReminder() when habit completed
- [x] T356 [US5] Configure notification permissions and request at onboarding

### 7.5 User Story 5 Integration

- [x] T357 [US5] Add Habits tab to MainTabs navigator *(accessed via Profile → Habits)*
- [x] T358 [US5] Integrate habit checklist on Dashboard (from Phase 5)
- [x] T359 [US5] Award XP for completing all habits (25 XP per FR-039)
- [x] T360 [US5] Send habit reminder notification at 8 PM if incomplete (FR-051, FR-053)

**Checkpoint**: User Story 5 complete - Users can build consistent daily habits with tracking and reminders

---

## Phase 8: User Story 6 - Automated Weekly Learning Insights (Priority: P3)

**Goal**: Users receive an automatically generated weekly summary every Sunday showing their learning patterns and progress

**Independent Test**: Complete learning activities for a week, wait until Sunday evening, verify weekly summary is generated with accurate statistics and comparison to previous week

### 8.1 Weekly Summary Service

- [x] T361 [US6] Create WeeklySummary service in `src/services/analytics/weeklySummaryService.ts` *(src/services/firebase/weeklySummaryService.ts)*
- [x] T362 [US6] Implement generateWeeklySummary() that aggregates data from daily_progress
- [x] T363 [US6] Calculate total cards reviewed, new cards learned, total study time
- [x] T364 [US6] Identify most forgotten cards (cards with quality == 0 multiple times)
- [x] T365 [US6] Calculate streak days for the week (0-7)
- [x] T366 [US6] Calculate habit completion rate percentage
- [x] T367 [US6] Compare with previous week's data to calculate trend (improved/declined/stable)
- [x] T368 [US6] Store weekly summary in Firebase per contracts/firebase-database-operations.md

### 8.2 Weekly Summary Cron Job

- [ ] T369 [US6] Create background task scheduler for weekly summary generation
- [ ] T370 [US6] Schedule task to run every Sunday at 8 PM
- [ ] T371 [US6] Trigger generateWeeklySummary() for all active users
- [x] T372 [US6] Send push notification when summary is ready (FR-035, FR-052) *(scheduleWeeklySummaryNotification in notificationService)*

### 8.3 Weekly Summary Components *(Implemented inline in WeeklySummaryScreen)*

- [x] T373 [P] [US6] Create WeeklySummaryCard component in `src/components/insights/WeeklySummaryCard.tsx`
- [x] T374 [P] [US6] Create ComparisonMetrics component in `src/components/insights/ComparisonMetrics.tsx`
- [x] T375 [P] [US6] Create MostForgottenCards component in `src/components/insights/MostForgottenCards.tsx`

### 8.4 Weekly Summary Screen

- [x] T376 [US6] Create WeeklySummaryScreen in `src/screens/insights/WeeklySummaryScreen.tsx`
- [x] T377 [US6] Display current week's summary with all statistics
- [x] T378 [US6] Show comparison with previous week (cards reviewed diff, study time diff, trend)
- [x] T379 [US6] Display "Most Forgotten Cards" section with card previews
- [x] T380 [US6] Show habit completion rate for the week
- [x] T381 [US6] Add navigation to view past weekly summaries
- [x] T382 [US6] Create WeeklySummaryListScreen for historical summaries

### 8.5 User Story 6 Integration

- [x] T383 [US6] Add Insights section to navigation (accessible from profile or dashboard)
- [x] T384 [US6] Handle notification tap to open weekly summary screen
- [x] T385 [US6] Add badge indicator for unread weekly summaries

**Checkpoint**: User Story 6 complete - Users receive automated weekly insights helping them understand their learning patterns

---

## Phase 9: User Story 7 - Gamification & Achievement System (Priority: P3)

**Goal**: Users earn XP, level up, unlock badges for achievements, and see celebration animations

**Independent Test**: Create first 10 flashcards (unlock "First Steps" badge), maintain 7-day streak (unlock "Week Warrior" badge, earn 100 XP bonus), verify celebration animations play

### 9.1 Badge System

- [x] T386 [US7] Create Badge service in `src/services/gamification/badgeService.ts`
- [x] T387 [US7] Define all badge definitions with IDs, names, descriptions, unlock criteria per FR-041
- [x] T388 [US7] Implement checkBadgeUnlock() logic for various achievements *(checkBadges())*
- [x] T389 [US7] Implement awardBadge() to add badge to user's earned badges collection
- [x] T390 [US7] Award bonus XP for streak milestone badges (100 XP for 7-day, 500 XP for 30-day per FR-042)

### 9.2 Level Up & Celebration Animations

- [x] T391 [P] [US7] Create LevelUpAnimation component in `src/components/gamification/LevelUpAnimation.tsx`
- [x] T392 [P] [US7] Create BadgeUnlockedAnimation component in `src/components/gamification/BadgeUnlockedAnimation.tsx`
- [x] T393 [P] [US7] Integrate Lottie or React Native Reanimated for animations
- [x] T394 [P] [US7] Trigger animations when level increases or badge unlocked

### 9.3 Profile & Badges Screen

- [x] T395 [US7] Create ProfileScreen in `src/screens/profile/ProfileScreen.tsx`
- [x] T396 [US7] Display user avatar, name, email
- [x] T397 [US7] Show current level with XP progress bar
- [x] T398 [US7] Show current streak and longest streak
- [x] T399 [US7] Create BadgesScreen in `src/screens/profile/BadgesScreen.tsx`
- [x] T400 [US7] Display all badges: earned in color, locked in gray
- [x] T401 [US7] Show badge names, descriptions, and unlock criteria
- [x] T402 [US7] Add badge categories: Learning, Streaks, Consistency, Milestones

### 9.4 Settings Screen

- [x] T403 [P] [US7] Create SettingsScreen in `src/screens/profile/SettingsScreen.tsx`
- [x] T404 [P] [US7] Add theme toggle: Light, Dark, System (FR-032)
- [x] T405 [P] [US7] Add notification toggle and time settings (FR-056)
- [x] T406 [P] [US7] Add daily reminder time picker
- [x] T407 [P] [US7] Add habit reminder time picker
- [x] T408 [P] [US7] Add account deletion button with confirmation dialog (FR-000d)

### 9.5 Account Deletion Flow

- [x] T409 [US7] Implement deleteAccount() in auth service
- [x] T410 [US7] Show confirmation dialog: "All your data will be permanently deleted and cannot be recovered"
- [x] T411 [US7] Delete all user media files from Google Drive per contracts/google-drive-api.md
- [x] T412 [US7] Delete all user data from Firebase Realtime Database
- [ ] T413 [US7] Delete local WatermelonDB data *(SKIPPED - WatermelonDB not used)*
- [x] T414 [US7] Sign out user and navigate to login screen

### 9.6 User Story 7 Integration

- [x] T415 [US7] Add Profile tab to MainTabs navigator with user icon
- [x] T416 [US7] Trigger badge check after all learning activities
- [x] T417 [US7] Trigger level-up check after awarding XP
- [x] T418 [US7] Send immediate notification for milestone achievements (FR-054, FR-055)
- [x] T419 [US7] Implement streak freeze functionality (show in profile, allow once per week)

**Checkpoint**: User Story 7 complete - Full gamification system with badges, levels, and celebrations keeps users motivated

---

## Phase 10: User Story 8 - Memorize System for Multi-Content Review (Priority: P3)

**Goal**: Users can register any content (notes, concepts, vocabulary) into the memorize system for spaced repetition review

**Independent Test**: Study a note about React hooks, register it in memorize system, review it over time with quality ratings, verify it follows SM-2 scheduling like flashcards

### 10.1 Memorize Item Service

- [x] T420 [US8] Create MemorizeItem service in `src/services/firebase/memorizeItemService.ts` *(memorizeService.ts)*
- [x] T421 [US8] Implement createMemorizeItem() with source reference linking
- [x] T422 [US8] Implement updateMemorizeItemReview() using same SM-2 algorithm as flashcards *(reviewMemorizeItem())*
- [x] T423 [US8] Implement getDueMemorizeItems() query
- [x] T424 [US8] Implement getMasteryPercentage() calculation (items with long intervals)

### 10.2 Memorize Review Flow

- [x] T425 [US8] Create MemorizeReviewScreen in `src/screens/memorize/MemorizeReviewScreen.tsx`
- [x] T426 [US8] Display memorize item content summary
- [x] T427 [US8] Show source reference link (back to original note or flashcard)
- [x] T428 [US8] Use same rating buttons as flashcard review (Again, Hard, Good, Easy)
- [x] T429 [US8] Apply SM-2 algorithm to calculate next review date
- [x] T430 [US8] Award XP for memorize item reviews (same as flashcards)

### 10.3 Memorize Integration

- [x] T431 [P] [US8] Add "Add to Memorize" button on Note detail screen
- [x] T432 [P] [US8] Add "Add to Memorize" action when viewing other content types
- [x] T433 [US8] Merge memorize items with flashcards in unified review queue
- [x] T434 [US8] Create MemorizeListScreen to view all memorize items with mastery status
- [x] T435 [US8] Show mastery percentage on dashboard or profile

### 10.4 Memorize Notifications

- [x] T436 [US8] Include memorize items in daily review reminder count (FR-050)
- [x] T437 [US8] Send daily reminder: "You have X items to review today" (flashcards + memorize items)

**Checkpoint**: User Story 8 complete - Comprehensive memorize system applies spaced repetition to all content types

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, final testing, and production readiness

### 11.1 Offline Mode Enhancements

- [x] T438 [P] Add offline indicator banner component in `src/components/common/OfflineIndicator.tsx`
- [x] T439 [P] Display offline indicator when no connectivity (FR-062)
- [ ] T440 [P] Test all core features work offline (flashcard review, note creation, habit tracking)
- [ ] T441 [P] Verify sync queue processes correctly when connectivity restored

### 11.2 Accessibility Improvements

- [ ] T442 [P] Audit all interactive components for semantic labels (FR-000j)
- [ ] T443 [P] Test app with VoiceOver (iOS) and verify screen reader navigation works
- [ ] T444 [P] Test app with TalkBack (Android) and verify screen reader navigation works
- [ ] T445 [P] Verify color contrast ratios meet minimum standards (FR-000k)
- [ ] T446 [P] Test app with system text size settings (small, large, extra large) per FR-000i

### 11.3 Performance Optimization

- [ ] T447 [P] Profile dashboard load time and optimize to <2 seconds (SC-013)
- [ ] T448 [P] Test flashcard review with 1000+ cards and verify <2s load time (SC-026)
- [ ] T449 [P] Optimize image and video loading with lazy loading and caching
- [ ] T450 [P] Minimize bundle size: Analyze with react-native-bundle-visualizer
- [ ] T451 [P] Optimize WatermelonDB queries with proper indexes per data-model.md

### 11.4 Error Handling & Logging

- [ ] T452 [P] Audit all error messages for user-friendliness (FR-000f)
- [ ] T453 [P] Ensure all failed operations show retry buttons (FR-000h)
- [ ] T454 [P] Verify error logging captures sufficient context (FR-000g)
- [ ] T455 [P] Test error scenarios: network failures, quota exceeded, token expired

### 11.5 Security Hardening

- [ ] T456 [P] Verify Firebase security rules enforce user-scoped access
- [ ] T457 [P] Ensure Google Drive files stored in appDataFolder (private, auto-deleted on revoke)
- [ ] T458 [P] Test account deletion fully removes all user data (FR-000c through FR-000e)
- [ ] T459 [P] Verify OAuth token refresh works correctly when tokens expire

### 11.6 Comprehensive Testing

- [ ] T460 [P] Write E2E test for complete onboarding flow: Sign in → Create flashcard → Review → See dashboard
- [ ] T461 [P] Write E2E test for complete learning day: Review cards → Create note → Complete habit → Check progress
- [ ] T462 [P] Write E2E test for offline usage: Go offline → Create content → Go online → Verify sync
- [ ] T463 [P] Run all unit tests and verify 80%+ code coverage for services
- [ ] T464 [P] Run all integration tests with Firebase Emulator
- [ ] T465 [P] Run all E2E tests on iOS simulator
- [ ] T466 [P] Run all E2E tests on Android emulator

### 11.7 Production Build Preparation

- [ ] T467 Generate production Firebase configuration for both iOS and Android
- [ ] T468 Update Firebase security rules from test mode to production rules
- [ ] T469 Create production `.env.production` file with production credentials
- [ ] T470 Configure app icons and splash screens for iOS and Android
- [ ] T471 Update app version, build number, and bundle identifiers
- [ ] T472 Generate Android release build: `cd android && ./gradlew assembleRelease`
- [ ] T473 Generate iOS release build and archive in Xcode
- [ ] T474 Test production builds on physical devices (iOS and Android)

### 11.8 Documentation

- [ ] T475 [P] Update quickstart.md with any setup changes discovered during implementation
- [ ] T476 [P] Create user guide documentation in `docs/user-guide.md`
- [ ] T477 [P] Document all environment variables in README.md
- [ ] T478 [P] Create troubleshooting guide in `docs/troubleshooting.md`
- [ ] T479 [P] Add inline code comments for complex business logic (SM-2 algorithm, sync conflict resolution)

### 11.9 Final Validation

- [ ] T480 Run through all user stories end-to-end and verify acceptance scenarios from spec.md
- [ ] T481 Verify all 66 functional requirements (FR-000 through FR-062) are implemented
- [ ] T482 Verify all 32 success criteria (SC-001 through SC-032) are met
- [ ] T483 Perform user acceptance testing with 3-5 beta testers
- [ ] T484 Fix critical bugs identified in UAT
- [ ] T485 Create release notes documenting all features implemented

**Checkpoint**: App is production-ready with all features complete, tested, optimized, and documented

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - can start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 completion - BLOCKS all user stories
- **User Stories (Phases 3-10)**: All depend on Phase 2 completion
  - User stories CAN proceed in parallel if team capacity allows
  - Recommended order: P1 stories first (US1, US2, US3), then P2 (US4, US5, US6), then P3 (US7, US8)
- **Phase 11 (Polish)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent - requires only Phase 2
- **User Story 2 (P1)**: Independent - requires only Phase 2
- **User Story 3 (P2)**: Depends on User Story 1 (needs flashcards for due count)
- **User Story 4 (P2)**: Depends on User Story 3 (uses daily progress data)
- **User Story 5 (P2)**: Independent - requires only Phase 2
- **User Story 6 (P3)**: Depends on User Stories 3, 4, 5 (aggregates their data)
- **User Story 7 (P3)**: Integrates with all previous stories (XP, badges)
- **User Story 8 (P3)**: Depends on User Story 1 (reuses SM-2 algorithm)

### Within Each Phase

- Tasks marked [P] can run in parallel (different files, no dependencies)
- Non-parallel tasks must run in listed order
- Tests should be written before implementation (if included)
- Each user story phase should complete fully before moving to next priority

### Parallel Opportunities

**Setup Phase (Phase 1)**:
- T001-T009: All development tools can install in parallel
- T015-T020: All directory creation can happen in parallel
- T030-T034: All dev dependencies can install in parallel
- T053-T061: All configuration files can be created in parallel

**Foundational Phase (Phase 2)**:
- T094-T108: All model interfaces can be created in parallel
- T140-T146: All common UI components can be created in parallel
- T147-T151: All utility functions can be created in parallel
- T157-T161: All testing infrastructure can be created in parallel

**User Story Phases**:
- Components within a story marked [P] can be built in parallel
- Different user stories can be worked on in parallel by different developers
- All P1 stories (US1, US2, US3) can start together after Phase 2

---

## Parallel Example: Setup Phase

```bash
# Install all development tools in parallel:
Task: "Install Node.js 20.x LTS"
Task: "Install React Native CLI"
Task: "Install Watchman"
Task: "Install JDK 17"
Task: "Install Git"

# Create all directories in parallel:
Task: "Create src/ structure per plan.md"
Task: "Create components/ subdirectories"
Task: "Create screens/ subdirectories"
Task: "Create services/ subdirectories"
Task: "Create __tests__/ structure"
```

## Parallel Example: User Story 1

```bash
# After SM-2 algorithm is complete, launch UI components in parallel:
Task: "Create FlashCard component in src/components/flashcards/FlashCard.tsx"
Task: "Create RatingButtons component in src/components/flashcards/RatingButtons.tsx"
Task: "Create ReviewProgress component in src/components/flashcards/ReviewProgress.tsx"
Task: "Create CardStatistics component in src/components/flashcards/CardStatistics.tsx"
```

---

## Implementation Strategy

### MVP First (Phase 1 + Phase 2 + User Story 1 Only)

1. Complete Phase 1: Setup (T001-T093) - ~2-3 days
2. Complete Phase 2: Foundational (T094-T161) - ~3-5 days
3. Complete Phase 3: User Story 1 (T162-T203) - ~5-7 days
4. **STOP and VALIDATE**: Test spaced repetition independently
5. Deploy MVP to TestFlight/Google Play Internal Testing

**MVP Delivers**: Functional spaced repetition flashcard system - core value proposition!

### Incremental Delivery

After MVP, add user stories incrementally:

1. **Week 1-2**: Setup + Foundational → Foundation ready
2. **Week 3**: User Story 1 → Test independently → Deploy MVP!
3. **Week 4**: User Story 2 → Test independently → Deploy (content organization added)
4. **Week 5**: User Story 3 → Test independently → Deploy (dashboard added)
5. **Week 6**: User Story 4 → Test independently → Deploy (calendar added)
6. **Week 7**: User Story 5 → Test independently → Deploy (habits added)
7. **Week 8**: User Story 6 → Test independently → Deploy (weekly insights added)
8. **Week 9**: User Story 7 → Test independently → Deploy (gamification added)
9. **Week 10**: User Story 8 → Test independently → Deploy (memorize system added)
10. **Week 11**: Polish → Final testing and optimization

Each story adds value without breaking previous stories!

### Parallel Team Strategy

With 3 developers:

1. **Week 1-2**: All developers work on Setup + Foundational together
2. **Week 3+**: Once Phase 2 complete, parallelize:
   - Developer A: User Story 1 (Flashcards)
   - Developer B: User Story 2 (Content Organization)
   - Developer C: User Story 3 (Dashboard - starts after US1 for due cards integration)
3. Stories merge independently as they complete

---

## Notes

- **[P] tasks**: Different files, no dependencies - can execute in parallel
- **[Story] label**: Maps task to specific user story (US1-US8) for traceability
- **File paths**: All paths provided for immediate execution
- **Tests included**: For critical business logic (SM-2 algorithm, sync) per constitution
- **Setup comprehensive**: All React Native installation steps from quickstart.md included
- **Each user story independently testable**: Can deploy any story as incremental value
- **Total tasks**: 485 tasks organized across 11 phases
- **Recommended approach**: MVP first (US1), then incremental delivery of remaining stories
- **Commit frequently**: After each task or logical group
- **Stop at checkpoints**: Validate each story independently before proceeding

---

## Task Count Summary

- **Phase 1 (Setup)**: 93 tasks
- **Phase 2 (Foundational)**: 68 tasks
- **Phase 3 (US1 - Flashcards)**: 42 tasks
- **Phase 4 (US2 - Content Organization)**: 63 tasks
- **Phase 5 (US3 - Dashboard)**: 37 tasks
- **Phase 6 (US4 - Calendar)**: 31 tasks
- **Phase 7 (US5 - Habits)**: 28 tasks
- **Phase 8 (US6 - Weekly Insights)**: 26 tasks
- **Phase 9 (US7 - Gamification)**: 35 tasks
- **Phase 10 (US8 - Memorize System)**: 18 tasks
- **Phase 11 (Polish)**: 48 tasks

**Total**: 485 tasks

**Parallel opportunities**: 150+ tasks marked [P] can execute in parallel

**MVP scope**: Phase 1 + Phase 2 + Phase 3 = 203 tasks (~2-3 weeks with 1 developer)
