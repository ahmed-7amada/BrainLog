# LearnTracker — Personal Learning & Development Tracker

A mobile application for developers and knowledge workers to track daily learning progress, memorize concepts using spaced repetition (SM-2 algorithm), manage study materials, and build consistent learning habits.

## 🚀 Project Status

**Current Phase**: Phase 1 - Environment Setup & Project Initialization

### ✅ Completed Setup Tasks

- [x] **T001**: Node.js 20.x+ installed (v24.13.0 ✓)
- [x] **T009**: Git installed and configured (v2.51.0 ✓)
- [x] **T010-T011**: React Native project initialized with TypeScript
- [x] **T012**: .gitignore configured
- [x] **T013**: Git repository initialized
- [x] **T014**: Feature branch `001-learntracker-app` created
- [x] **T015-T020**: Project directory structure created
- [x] **T021-T034**: All npm dependencies added to package.json
- [x] **T047-T049**: Environment configuration files created
- [x] **T053-T061**: Linting, formatting, and testing configuration complete

### 🔄 In Progress

- [ ] **npm install**: Installing all dependencies (running in background)

### ⏳ Pending Manual Setup

The following tasks require manual action before implementation can continue:

#### Development Tools (if not already installed)
- [ ] **T002**: React Native CLI global installation
- [ ] **T003**: Watchman (macOS/Linux)
- [ ] **T004**: JDK 17 with JAVA_HOME
- [ ] **T005**: Android Studio with SDK
- [ ] **T007-T008**: Xcode 15.x and CocoaPods (macOS only)

#### Native Configuration
- [ ] **T035-T046**: iOS and Android native setup
- [ ] **T062-T081**: Firebase and Google Cloud Console setup

## 📦 Technology Stack

- **Language**: TypeScript 5.x
- **Framework**: React Native 0.76.5
- **State Management**: Zustand
- **Database**: Firebase Realtime Database + WatermelonDB (offline)
- **Authentication**: Google Sign-In + Firebase Auth
- **Storage**: Google Drive API (media files)
- **Navigation**: React Navigation
- **Testing**: Jest, React Native Testing Library, Detox

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── flashcards/      # Flashcard-specific components
│   ├── common/          # Common UI elements
│   ├── dashboard/       # Dashboard widgets
│   └── navigation/      # Navigation components
├── screens/             # Screen-level components
│   ├── auth/            # Authentication screens
│   ├── flashcards/      # Flashcard screens
│   ├── notes/           # Note screens
│   ├── dashboard/       # Dashboard screen
│   ├── calendar/        # Calendar screens
│   ├── habits/          # Habit tracking screens
│   └── profile/         # Profile and settings
├── services/            # Business logic
│   ├── firebase/        # Firebase integration
│   ├── googleDrive/     # Google Drive API
│   ├── spacedRepetition/# SM-2 algorithm
│   ├── sync/            # Offline sync
│   ├── notifications/   # Push notifications
│   └── media/           # Video compression
├── models/              # TypeScript interfaces
├── hooks/               # Custom React hooks
├── store/               # Zustand state management
├── navigation/          # React Navigation config
├── utils/               # Utility functions
└── config/              # Configuration files

__tests__/               # Test files
├── unit/                # Unit tests
├── integration/         # Integration tests
└── e2e/                 # End-to-end tests
```

## 🧪 Available Scripts

```bash
# Development
npm start                # Start Metro bundler
npm run android          # Run Android app
npm run ios              # Run iOS app (macOS only)

# Testing
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run E2E tests with Detox

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format code with Prettier
```

## 📝 Next Steps

1. **Wait for npm install to complete**
2. **Configure Firebase Project** (see [quickstart.md](specs/001-learntracker-app/quickstart.md))
3. **Configure Google Drive API** (see [quickstart.md](specs/001-learntracker-app/quickstart.md))
4. **Setup Native Platforms** (iOS and Android)
5. **Begin Phase 2: Foundational Infrastructure**

## 📚 Documentation

- [Feature Specification](specs/001-learntracker-app/spec.md)
- [Implementation Plan](specs/001-learntracker-app/plan.md)
- [Technical Research](specs/001-learntracker-app/research.md)
- [Data Model](specs/001-learntracker-app/data-model.md)
- [API Contracts](specs/001-learntracker-app/contracts/)
- [Development Setup Guide](specs/001-learntracker-app/quickstart.md)
- [Task List](specs/001-learntracker-app/tasks.md)

## 🤝 Development Workflow

This project follows a structured implementation approach:
- **Phase 1**: Setup (T001-T093)
- **Phase 2**: Foundational Infrastructure (T094-T161)
- **Phase 3-10**: User Stories (P1 → P2 → P3)
- **Phase 11**: Polish & Production Readiness

Refer to [tasks.md](specs/001-learntracker-app/tasks.md) for the complete task breakdown.

---

**Generated by**: Claude Code Implementation
**Last Updated**: 2026-02-03
