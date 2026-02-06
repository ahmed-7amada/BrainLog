# Implementation Plan: Android-Only Codebase Cleanup with Maestro E2E Testing

**Branch**: `004-android-cleanup-e2e` | **Date**: 2026-02-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-android-cleanup-e2e/spec.md`

## Summary

This feature transforms the BrainLog codebase into an Android-only application with comprehensive E2E test coverage. The work spans four phases: (1) audit and clean the codebase to eliminate technical debt, (2) completely remove iOS platform support, (3) implement Maestro E2E testing with coverage for all 38 screens, and (4) validate the production-ready state. The technical approach prioritizes clean code principles, SOLID patterns, and automated quality assurance through E2E testing.

## Technical Context

**Language/Version**: TypeScript 5.8.3 (strict mode enabled)
**Primary Dependencies**: React Native 0.83.1, React 19.2.0, @react-native-firebase/*, zustand 5.0.11, react-native-reanimated 4.2.1
**Storage**: Firebase Realtime Database (cloud), react-native-mmkv 4.0.1 (local persistence)
**Testing**: Jest 29.6.3 (unit/integration), Maestro (E2E - to be added)
**Target Platform**: Android only (API 24+ / Android 7.0+)
**Project Type**: Mobile (React Native)
**Performance Goals**: <3s cold start, <300ms screen transitions, 60fps animations, <2MB JS bundle
**Constraints**: <200MB memory usage, offline-capable, virtualized lists for 100+ items
**Scale/Scope**: 38 screens, single mobile application

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality | PASS | FR-001 through FR-008 directly align with TypeScript strict mode, no dead code, consistent naming |
| II. Testing Standards | PASS | Maestro E2E tests (FR-016 to FR-025) complement existing Jest tests; 100% screen coverage target |
| III. User Experience Consistency | PASS | No UX changes in this feature; E2E tests verify existing UX patterns |
| IV. Performance Requirements | PASS | No performance-impacting changes; E2E tests can verify performance thresholds |
| Development Workflow | PASS | Feature branch (004-android-cleanup-e2e), atomic commits required (FR-029) |
| Quality Gates | **EXCEPTION** | Constitution says "build for both iOS and Android" - this feature removes iOS by design |

**Exception Justification**: The constitution's Quality Gates section requires "Production build MUST complete successfully for both iOS and Android." This feature explicitly removes iOS support per user directive. Post-feature, the constitution should be amended to reflect Android-only builds.

## Project Structure

### Documentation (this feature)

```text
specs/004-android-cleanup-e2e/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (E2E entities)
├── quickstart.md        # Phase 1 output (setup guide)
├── contracts/           # Phase 1 output (N/A - no new APIs)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
# Mobile Application (Android-only)
src/
├── components/          # Reusable UI components (16 files)
│   ├── common/          # Cross-feature components
│   ├── gamification/    # Achievement/badge animations
│   └── upload/          # File upload UI components
├── config/              # App configuration (firebase, theme)
├── hooks/               # Custom React hooks (12 files)
├── models/              # TypeScript data models (18 files)
├── navigation/          # React Navigation setup (4 files)
├── screens/             # Screen components (38 screens)
│   ├── auth/            # LoginScreen
│   ├── bookmarks/       # Bookmark CRUD screens
│   ├── calendar/        # Calendar views
│   ├── dailylog/        # Daily logging
│   ├── dashboard/       # Main dashboard
│   ├── flashcards/      # Flashcard CRUD + review
│   ├── insights/        # Weekly summaries
│   ├── memorize/        # Memorization features
│   ├── notes/           # Note CRUD screens
│   ├── profile/         # Profile, settings, habits
│   ├── search/          # Global search
│   ├── videos/          # Video management
│   └── voiceNotes/      # Voice note recording
├── services/            # Business logic services
│   ├── firebase/        # Firebase service layer (12 files)
│   ├── gamification/    # Points/achievements
│   ├── googleDrive/     # Cloud storage
│   ├── notifications/   # Push notifications
│   ├── review/          # Review scheduling
│   ├── search/          # Search functionality
│   ├── spacedRepetition/# Learning algorithms
│   ├── sync/            # Data synchronization
│   └── upload/          # File upload handling
├── store/               # Zustand state management
│   └── slices/          # State slices (7 files)
├── types/               # Global TypeScript types
└── utils/               # Utility functions (6 files)

# Testing Structure
__tests__/
├── unit/                # Unit tests
├── integration/         # Integration tests
└── e2e/                 # Existing test placeholder

.maestro/                # NEW: Maestro E2E tests
├── flows/               # Individual test flows
│   ├── auth/            # Authentication flows
│   ├── bookmarks/       # Bookmark flows
│   ├── calendar/        # Calendar flows
│   ├── dailylog/        # Daily log flows
│   ├── dashboard/       # Dashboard flows
│   ├── flashcards/      # Flashcard flows
│   ├── insights/        # Insights flows
│   ├── memorize/        # Memorize flows
│   ├── navigation/      # Navigation flows
│   ├── notes/           # Notes flows
│   ├── profile/         # Profile flows
│   ├── search/          # Search flows
│   ├── videos/          # Video flows
│   └── voiceNotes/      # Voice note flows
├── config.yaml          # Maestro configuration
└── suite.yaml           # Master test suite

android/                 # Android native code (preserved)
```

**Structure Decision**: Existing mobile structure preserved. New `.maestro/` directory added at repository root following Maestro conventions. The `ios/` directory will be completely removed. Test flows organized by feature domain matching screen directory structure.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Constitution amendment (iOS removal) | User explicitly requested Android-only to reduce maintenance overhead and focus development resources | Keeping iOS would contradict explicit user requirement and defeat feature purpose |
