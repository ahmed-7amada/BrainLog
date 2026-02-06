# Quickstart: Android-Only Codebase Cleanup with Maestro E2E Testing

**Feature**: 004-android-cleanup-e2e
**Date**: 2026-02-06
**Estimated Setup Time**: 15 minutes

## Prerequisites

- Node.js 20+
- Android SDK with emulator
- Java 17+ (for Android builds)
- Git

## Initial Setup

### 1. Install Maestro CLI

**Windows (PowerShell as Administrator):**
```powershell
# Option A: Using PowerShell (recommended)
iwr -useb https://get.maestro.mobile.dev | iex

# Option B: Using Chocolatey
choco install maestro
```

**macOS/Linux:**
```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

**Verify Installation:**
```bash
maestro --version
# Expected: maestro version X.X.X
```

### 2. Project Setup

```bash
# Clone and checkout feature branch
git checkout 004-android-cleanup-e2e

# Install dependencies
npm install

# Verify TypeScript compilation
npm run type-check

# Verify linting
npm run lint
```

### 3. Android Emulator Setup

```bash
# List available emulators
emulator -list-avds

# Start emulator (replace with your AVD name)
emulator -avd Pixel_6_API_33

# Verify ADB connection
adb devices
# Expected: List with your emulator
```

### 4. Build Android App

```bash
# Debug build (for development/testing)
npx react-native run-android

# Or build APK directly
cd android
./gradlew assembleDebug
cd ..

# APK location: android/app/build/outputs/apk/debug/app-debug.apk
```

## Running E2E Tests

### Run Single Flow

```bash
# Run a specific test flow
maestro test .maestro/flows/auth/login_success.yaml
```

### Run Feature Suite

```bash
# Run all auth tests
maestro test .maestro/flows/auth/

# Run all notes tests
maestro test .maestro/flows/notes/
```

### Run Full Test Suite

```bash
# Run master suite (all tests)
maestro test .maestro/suite.yaml
```

### Run with Studio (Visual Mode)

```bash
# Open Maestro Studio for visual test creation
maestro studio
```

## Development Workflow

### Adding testID to Components

```tsx
// Before
<TouchableOpacity onPress={handleLogin}>
  <Text>Login</Text>
</TouchableOpacity>

// After
<TouchableOpacity
  testID="login_button_submit"
  onPress={handleLogin}
>
  <Text>Login</Text>
</TouchableOpacity>
```

### Creating New Test Flow

```yaml
# .maestro/flows/feature/new_flow.yaml
appId: com.brainlog
---
- launchApp
- waitForAnimationToEnd

# Navigate and interact
- tapOn:
    id: "screenName_button_action"

# Assert result
- assertVisible:
    id: "screenName_text_result"
```

### testID Naming Convention

```
Pattern: {screenName}_{elementType}_{identifier}

screenName: lowercase, no "Screen" suffix
  - LoginScreen → login
  - DashboardScreen → dashboard

elementType: button, input, text, card, list, item, modal, toggle

identifier: camelCase purpose descriptor
  - submit, cancel, email, password
```

## Validation Commands

### Code Quality

```bash
# TypeScript check
npm run type-check

# ESLint
npm run lint

# Prettier
npm run format:check

# Fix formatting
npm run format
```

### Android Build

```bash
# Clean build
cd android && ./gradlew clean && cd ..

# Debug build
npx react-native run-android

# Release build
cd android && ./gradlew assembleRelease && cd ..
```

### E2E Tests

```bash
# Run all E2E tests
maestro test .maestro/suite.yaml

# Run with verbose output
maestro test --debug-output .maestro/suite.yaml
```

## Troubleshooting

### Maestro Can't Find Element

```yaml
# Add explicit wait before tap
- waitForAnimationToEnd
- tapOn:
    id: "element_id"
    retryTapIfNoChange: true
```

### Android Build Fails After iOS Removal

```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleDebug
cd ..
```

### Metro Bundler Issues

```bash
# Clear Metro cache
npx react-native start --reset-cache
```

### TypeScript Errors

```bash
# Check for type errors
npm run type-check

# Common fix: ensure testID is typed
// In component props interface:
interface Props {
  testID?: string;
}
```

## File Structure Reference

```
.maestro/
├── config.yaml           # Global config
├── suite.yaml            # Master suite
└── flows/
    ├── auth/             # Authentication tests
    ├── notes/            # Notes CRUD tests
    ├── flashcards/       # Flashcard tests
    └── [feature]/        # Other feature tests

src/screens/
├── auth/                 # testID prefix: login_
├── dashboard/            # testID prefix: dashboard_
├── notes/                # testID prefix: noteList_, noteDetail_, etc.
└── [feature]/            # testID prefix: {screenName}_
```

## Quick Reference

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Type check | `npm run type-check` |
| Lint | `npm run lint` |
| Format | `npm run format` |
| Build Android | `npx react-native run-android` |
| Run E2E | `maestro test .maestro/suite.yaml` |
| Maestro Studio | `maestro studio` |
