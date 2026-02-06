# QuickStart Guide: BrainLog Development Setup

**Feature**: BrainLog — Personal Learning & Development Tracker
**Date**: 2026-02-03
**Purpose**: Get development environment ready for implementation

## Prerequisites

### Required Software

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20.x LTS | JavaScript runtime |
| npm | 10.x | Package manager |
| React Native CLI | Latest | Mobile app development |
| Watchman | Latest | File watching (macOS/Linux) |
| JDK | 17 | Android development |
| Xcode | 15.x | iOS development (macOS only) |
| CocoaPods | Latest | iOS dependency manager |
| Git | Latest | Version control |

### Platform-Specific Requirements

**macOS** (for iOS development):
```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install required tools
brew install node watchman
brew install --cask adoptopenjdk17

# Install CocoaPods
sudo gem install cocoapods

# Install Xcode from App Store (15.x or later)
# After installation, run:
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

**Windows** (for Android development):
```powershell
# Install Node.js from https://nodejs.org (20.x LTS)
# Install JDK 17 from https://adoptopenjdk.net

# Install Android Studio from https://developer.android.com/studio
# During installation, select:
# - Android SDK
# - Android SDK Platform
# - Android Virtual Device
```

**Linux** (for Android development):
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install JDK 17
sudo apt-get install openjdk-17-jdk

# Install Android Studio from https://developer.android.com/studio
```

---

## Project Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd BrainLog
git checkout 001-brainlog-app
```

### 2. Install Dependencies

```bash
# Install JavaScript dependencies
npm install

# Install iOS dependencies (macOS only)
cd ios && pod install && cd ..
```

### 3. Environment Configuration

Create `.env` file in project root:

```bash
# .env
FIREBASE_API_KEY=<your-firebase-api-key>
FIREBASE_AUTH_DOMAIN=<your-project-id>.firebaseapp.com
FIREBASE_DATABASE_URL=https://<your-project-id>.firebaseio.com
FIREBASE_PROJECT_ID=<your-project-id>
FIREBASE_STORAGE_BUCKET=<your-project-id>.appspot.com
FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
FIREBASE_APP_ID=<your-app-id>

GOOGLE_WEB_CLIENT_ID=<your-web-client-id>.apps.googleusercontent.com
GOOGLE_IOS_CLIENT_ID=<your-ios-client-id>.apps.googleusercontent.com

NODE_ENV=development
```

**Important**: Add `.env` to `.gitignore` to prevent committing secrets!

---

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `brainlog-dev` (or your preferred name)
4. Disable Google Analytics for development (can enable later)
5. Click "Create project"

### 2. Register Apps

**iOS App**:
1. In Firebase Console, click "Add app" → iOS
2. Enter iOS bundle ID: `com.brainlog` (or your bundle ID)
3. Download `GoogleService-Info.plist`
4. Move file to `ios/BrainLog/` directory
5. Open Xcode, add `GoogleService-Info.plist` to project (right-click → Add Files)

**Android App**:
1. In Firebase Console, click "Add app" → Android
2. Enter Android package name: `com.brainlog` (or your package name)
3. Download `google-services.json`
4. Move file to `android/app/` directory

### 3. Enable Authentication

1. In Firebase Console, go to "Authentication" → "Sign-in method"
2. Enable "Google" sign-in provider
3. Add support email
4. Save

### 4. Enable Realtime Database

1. In Firebase Console, go to "Realtime Database"
2. Click "Create Database"
3. Select location (choose closest to target users)
4. Start in **Test mode** (for development)
5. After creation, go to "Rules" tab and set:

```json
{
  "rules": {
    "users": {
      "$userId": {
        ".read": "auth != null && auth.uid == $userId",
        ".write": "auth != null && auth.uid == $userId",
        ".indexOn": ["next_review_date", "folder", "category"]
      }
    }
  }
}
```

**Important**: Change to production rules before launch!

### 5. Enable Firebase Cloud Messaging (FCM)

1. In Firebase Console, go to "Project settings" → "Cloud Messaging"
2. Note the "Server key" (needed for push notifications)
3. For iOS: Upload APNs authentication key (Apple Developer Portal → Certificates, Identifiers & Profiles → Keys)

---

## Google Drive API Setup

### 1. Enable Google Drive API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project (automatically created)
3. Go to "APIs & Services" → "Library"
4. Search for "Google Drive API"
5. Click "Enable"

### 2. Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" user type (or "Internal" if G Workspace org)
3. Fill in application details:
   - App name: BrainLog
   - User support email: your email
   - Developer contact: your email
4. Add scopes:
   - `https://www.googleapis.com/auth/drive.appdata`
   - `https://www.googleapis.com/auth/drive.file`
5. Add test users (for development phase)
6. Save

### 3. Create OAuth 2.0 Credentials

**Web Client** (for Firebase Auth):
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Application type: "Web application"
4. Name: "BrainLog Web Client"
5. Authorized redirect URIs: (leave empty for now, Firebase handles this)
6. Click "Create"
7. Copy "Client ID" → This is your `GOOGLE_WEB_CLIENT_ID` in `.env`

**iOS Client**:
1. Click "Create Credentials" → "OAuth 2.0 Client ID"
2. Application type: "iOS"
3. Name: "BrainLog iOS"
4. Bundle ID: Same as Firebase iOS app (e.g., `com.brainlog`)
5. Copy "Client ID" → This is your `GOOGLE_IOS_CLIENT_ID` in `.env`

**Android Client**:
1. Click "Create Credentials" → "OAuth 2.0 Client ID"
2. Application type: "Android"
3. Name: "BrainLog Android"
4. Package name: Same as Firebase Android app (e.g., `com.brainlog`)
5. SHA-1 certificate fingerprint:

```bash
# Debug keystore (for development)
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Copy the SHA-1 value and paste it
```

6. Click "Create"

---

## Configure React Native App

### 1. Install Required Packages

```bash
npm install @react-native-firebase/app \
            @react-native-firebase/auth \
            @react-native-firebase/database \
            @react-native-firebase/messaging \
            @react-native-google-signin/google-signin \
            @nozbe/watermelondb \
            @nozbe/watermelondb/adapters/sqlite \
            zustand \
            @react-navigation/native \
            @react-navigation/bottom-tabs \
            @react-navigation/native-stack \
            react-native-safe-area-context \
            react-native-screens \
            react-native-gesture-handler \
            react-native-reanimated \
            react-native-compressor \
            react-native-image-picker \
            react-native-fs \
            @notifee/react-native \
            date-fns

npm install --save-dev @types/react \
                       @types/react-native \
                       jest \
                       @testing-library/react-native \
                       @testing-library/jest-native \
                       detox \
                       ts-node \
                       typescript
```

### 2. Configure Firebase (Native Setup)

**iOS** (`ios/Podfile`):
```ruby
# Add at the top
require_relative '../node_modules/react-native/scripts/react_native_pods'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

platform :ios, '15.0'

target 'BrainLog' do
  config = use_native_modules!

  # React Native Firebase
  pod 'Firebase/Core'
  pod 'Firebase/Auth'
  pod 'Firebase/Database'
  pod 'Firebase/Messaging'

  # Other pods...
end

# Run after editing:
# cd ios && pod install && cd ..
```

**Android** (`android/build.gradle`):
```gradle
buildscript {
  dependencies {
    classpath 'com.google.gms:google-services:4.4.0'
  }
}
```

**Android** (`android/app/build.gradle`):
```gradle
apply plugin: 'com.android.application'
apply plugin: 'com.google.gms.google-services' // Add this line

android {
  compileSdkVersion 34
  defaultConfig {
    minSdkVersion 24
    targetSdkVersion 34
  }
}

dependencies {
  // React Native Firebase
  implementation 'com.google.firebase:firebase-auth'
  implementation 'com.google.firebase:firebase-database'
  implementation 'com.google.firebase:firebase-messaging'
}
```

### 3. Configure Google Sign-In

**iOS** (`ios/BrainLog/AppDelegate.mm`):
```objc
#import <GoogleSignIn/GoogleSignIn.h>

// Add this method
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  return [GIDSignIn.sharedInstance handleURL:url];
}
```

**iOS** (`ios/BrainLog/Info.plist`):
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.googleusercontent.apps.YOUR_IOS_CLIENT_ID</string>
    </array>
  </dict>
</array>

<key>GIDClientID</key>
<string>YOUR_IOS_CLIENT_ID.apps.googleusercontent.com</string>
```

**Android** (`android/app/src/main/AndroidManifest.xml`):
```xml
<application>
  <!-- Add inside <application> tag -->
  <meta-data
    android:name="com.google.android.gms.version"
    android:value="@integer/google_play_services_version" />
</application>
```

---

## Run the App

### Start Metro Bundler

```bash
npm start
# or
npx react-native start
```

### Run on iOS (macOS only)

```bash
npx react-native run-ios

# Or specific simulator:
npx react-native run-ios --simulator="iPhone 15 Pro"
```

### Run on Android

```bash
# Start Android emulator first (or connect physical device with USB debugging)
npx react-native run-android
```

### Common Issues

**iOS Build Fails**:
```bash
# Clean build folder
cd ios && rm -rf build && rm -rf Pods && pod install && cd ..

# Clean derived data
rm -rf ~/Library/Developer/Xcode/DerivedData
```

**Android Build Fails**:
```bash
# Clean gradle cache
cd android && ./gradlew clean && cd ..

# If still failing, delete .gradle folder
rm -rf android/.gradle
```

**Metro Bundler Issues**:
```bash
# Clear cache and restart
npx react-native start --reset-cache
```

---

## Testing Setup

### Unit Tests (Jest)

**Configuration** (`jest.config.js`):
```javascript
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@react-native-firebase)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

**Run Tests**:
```bash
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Integration Tests (Firebase Emulator)

**Install Emulator**:
```bash
npm install -g firebase-tools
firebase login
firebase init emulators

# Select:
# - Authentication Emulator
# - Realtime Database Emulator
```

**Configuration** (`firebase.json`):
```json
{
  "emulators": {
    "auth": {
      "port": 9099
    },
    "database": {
      "port": 9000
    }
  }
}
```

**Start Emulator**:
```bash
firebase emulators:start
```

**Use in Tests** (`src/config/firebase.ts`):
```typescript
import { getDatabase } from '@react-native-firebase/database';
import { getAuth } from '@react-native-firebase/auth';

if (__DEV__) {
  getDatabase().useEmulator('localhost', 9000);
  getAuth().useEmulator('http://localhost:9099');
}
```

### E2E Tests (Detox)

**Configuration** (`.detoxrc.js`):
```javascript
module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'e2e/jest.config.js',
    },
    jest: {
      setupTimeout: 120000,
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/BrainLog.app',
      build: 'xcodebuild -workspace ios/BrainLog.xcworkspace -scheme BrainLog -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 15 Pro',
      },
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_7_API_34',
      },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
  },
};
```

**Run E2E Tests**:
```bash
# Build app
detox build --configuration ios.sim.debug

# Run tests
detox test --configuration ios.sim.debug
```

---

## Development Workflow

### 1. Start Development

```bash
# Terminal 1: Start Metro
npm start

# Terminal 2 (optional): Start Firebase Emulator
firebase emulators:start

# Terminal 3: Run app
npm run ios    # or npm run android
```

### 2. Hot Reload

- **Fast Refresh**: Automatic on file save
- **Manual Reload**: Shake device → "Reload" (or Cmd+R / Ctrl+M)
- **Dev Menu**: Shake device (or Cmd+D / Ctrl+M)

### 3. Debugging

**React Native Debugger**:
```bash
# Install
brew install --cask react-native-debugger

# Open debugger before running app
open "rndebugger://set-debugger-loc?host=localhost&port=8081"
```

**Flipper** (Meta's debugging tool):
1. Download from https://fbflipper.com/
2. Start Flipper
3. Run app - should auto-connect
4. Use plugins: Logs, Network, Databases, etc.

### 4. Linting & Formatting

```bash
# ESLint
npm run lint

# Prettier
npm run format

# TypeScript type checking
npm run type-check
```

---

## Environment Variables

Create environment-specific `.env` files:

- `.env.development` - Local development
- `.env.staging` - Staging environment
- `.env.production` - Production

**Load in app** (`src/config/environment.ts`):
```typescript
import Config from 'react-native-config';

export const ENV = {
  firebaseApiKey: Config.FIREBASE_API_KEY!,
  firebaseDatabaseUrl: Config.FIREBASE_DATABASE_URL!,
  googleWebClientId: Config.GOOGLE_WEB_CLIENT_ID!,
  // ... other vars
};
```

---

## Troubleshooting

### Firebase Authentication Issues

**Error: "Google Sign-In failed"**
- Verify `GOOGLE_WEB_CLIENT_ID` in `.env` matches Firebase console
- Check OAuth consent screen is configured
- Ensure test users added (if in development mode)

### Google Drive API Issues

**Error: "Access to Drive API denied"**
- Verify Google Drive API is enabled in Cloud Console
- Check OAuth scopes include `drive.appdata` and `drive.file`
- Ensure user granted permissions during sign-in

### Build Issues

**iOS: "Command PhaseScriptExecution failed"**
- Run `cd ios && pod install && cd ..`
- Clean build: `cd ios && rm -rf build && cd ..`

**Android: "Execution failed for task ':app:processDebugGoogleServices'"**
- Verify `google-services.json` is in `android/app/`
- Check package name matches Firebase console

---

## Next Steps

1. **Read Design Documents**:
   - [data-model.md](data-model.md) - Database schema
   - [contracts/firebase-database-operations.md](contracts/firebase-database-operations.md) - Firebase operations
   - [contracts/google-drive-api.md](contracts/google-drive-api.md) - Media file operations

2. **Review Spec**:
   - [spec.md](spec.md) - Feature requirements and user stories

3. **Start Implementation**:
   - Run `/speckit.tasks` to generate task breakdown
   - Begin with P1 user stories (core learning features)

---

**Questions or Issues?**
- Check [React Native Docs](https://reactnative.dev/docs/getting-started)
- Check [Firebase Docs](https://rnfirebase.io/)
- Open an issue in the repository

**Happy Coding! 🚀**
