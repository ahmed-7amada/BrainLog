# Native Platform Setup Guide

## Overview

This guide walks you through setting up iOS and Android native platforms for LearnTracker. Our project was initialized with custom structure, so we need to add React Native's native folders.

## Prerequisites

✅ **Already Complete:**
- Node.js 24.13.0 installed
- React Native CLI installed globally
- Git repository configured
- All npm dependencies installed
- Source code structure (src/) created

⏳ **Still Needed:**
- **macOS only**: Xcode 15.x + CocoaPods
- **All platforms**: Android Studio + JDK 17
- Firebase project
- Google Cloud Console project

---

## Step 1: Generate iOS and Android Folders

Since we manually created our project, we need React Native's native folders. The cleanest way:

```bash
# Create a temporary React Native project
cd ..
npx react-native@latest init TempLearnTracker --template react-native-template-typescript

# Copy native folders to our project
cp -r TempLearnTracker/ios BrainLog/
cp -r TempLearnTracker/android BrainLog/

# Copy additional native files
cp TempLearnTracker/react-native.config.js BrainLog/
cp TempLearnTracker/Gemfile BrainLog/  # iOS CocoaPods
cp TempLearnTracker/.watchmanconfig BrainLog/

# Clean up
rm -rf TempLearnTracker

# Return to project
cd BrainLog
```

**Alternative (Simpler)**: Just run this from the BrainLog directory:
```bash
npx react-native init LearnTrackerTemp --template react-native-template-typescript
mv LearnTrackerTemp/ios .
mv LearnTrackerTemp/android .
mv LearnTrackerTemp/react-native.config.js .
mv LearnTrackerTemp/Gemfile .
rm -rf LearnTrackerTemp
```

---

## Step 2: iOS Configuration (macOS only)

### 2.1 Install CocoaPods Dependencies

```bash
cd ios
pod install
cd ..
```

### 2.2 Update iOS Bundle Identifier

Edit `ios/LearnTracker/Info.plist` and find `CFBundleIdentifier`:
```xml
<key>CFBundleIdentifier</key>
<string>com.learntracker.app</string>
```

### 2.3 Add Firebase iOS Configuration

1. Download `GoogleService-Info.plist` from Firebase Console
2. Place it in `ios/LearnTracker/` directory
3. Open `ios/LearnTracker.xcworkspace` in Xcode
4. Drag `GoogleService-Info.plist` into the project navigator

### 2.4 Configure Google Sign-In for iOS

Edit `ios/LearnTracker/Info.plist` and add:

```xml
<!-- Google Sign-In URL Scheme -->
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleTypeRole</key>
    <string>Editor</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.googleusercontent.apps.YOUR-IOS-CLIENT-ID-REVERSED</string>
    </array>
  </dict>
</array>

<!-- Google OAuth Client ID -->
<key>GIDClientID</key>
<string>YOUR-IOS-CLIENT-ID.apps.googleusercontent.com</string>
```

Replace `YOUR-IOS-CLIENT-ID` with your actual iOS OAuth client ID from Google Cloud Console.

### 2.5 Update Podfile

The generated Podfile should already include most dependencies from package.json, but verify these are present:

```ruby
# In ios/Podfile, after `use_react_native!`:

# Firebase
pod 'Firebase/Auth'
pod 'Firebase/Database'
pod 'Firebase/Messaging'

# Google Sign-In
pod 'GoogleSignIn'
```

Then run:
```bash
cd ios
pod install
cd ..
```

---

## Step 3: Android Configuration

### 3.1 Update Package Name

Edit `android/app/build.gradle`:
```gradle
android {
    namespace "com.learntracker.app"
    defaultConfig {
        applicationId "com.learntracker.app"
        // ... other config
    }
}
```

### 3.2 Add Firebase Android Configuration

1. Download `google-services.json` from Firebase Console
2. Place it in `android/app/` directory

### 3.3 Configure Firebase in Gradle

Edit `android/build.gradle` (project-level):
```gradle
buildscript {
    dependencies {
        // Add this line
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

Edit `android/app/build.gradle` (app-level):
```gradle
// At the top, after other plugins
apply plugin: 'com.google.gms.google-services'

dependencies {
    // Firebase
    implementation platform('com.google.firebase:firebase-bom:32.7.0')
    implementation 'com.google.firebase:firebase-auth'
    implementation 'com.google.firebase:firebase-database'
    implementation 'com.google.firebase:firebase-messaging'
}
```

### 3.4 Update Android SDK Versions

In `android/app/build.gradle`:
```gradle
android {
    compileSdk 34

    defaultConfig {
        minSdkVersion 24
        targetSdkVersion 34
    }
}
```

### 3.5 Add Google Sign-In to AndroidManifest

Edit `android/app/src/main/AndroidManifest.xml`:
```xml
<application>
    <!-- Add inside <application> tag -->
    <meta-data
        android:name="com.google.android.gms.version"
        android:value="@integer/google_play_services_version" />
</application>
```

---

## Step 4: Create .env File

Create `.env` in project root:

```bash
# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key_here
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:android:abc123

# Google OAuth Client IDs
GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com

# Environment
NODE_ENV=development
```

---

## Step 5: Update App Entry Point

Edit `App.tsx` to use our navigation:

```typescript
import React, {useEffect} from 'react';
import {AppNavigator} from './src/navigation/AppNavigator';
import {configureGoogleSignIn} from './src/services/firebase/authService';

function App(): React.JSX.Element {
  useEffect(() => {
    // Configure Google Sign-In on app start
    configureGoogleSignIn();
  }, []);

  return <AppNavigator />;
}

export default App;
```

---

## Step 6: Firebase Project Setup (Web Console)

### 6.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name: `learntracker-dev`
4. Disable Google Analytics (optional for development)

### 6.2 Register iOS App

1. Click "Add app" → iOS
2. Bundle ID: `com.learntracker.app`
3. Download `GoogleService-Info.plist`
4. Place in `ios/LearnTracker/`

### 6.3 Register Android App

1. Click "Add app" → Android
2. Package name: `com.learntracker.app`
3. Get SHA-1 fingerprint:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```
4. Download `google-services.json`
5. Place in `android/app/`

### 6.4 Enable Google Authentication

1. Go to **Authentication** → **Sign-in method**
2. Enable **Google** provider
3. Add support email

### 6.5 Create Realtime Database

1. Go to **Realtime Database** → **Create Database**
2. Choose location (closest to your users)
3. Start in **test mode** (we'll add security rules later)

### 6.6 Configure Database Rules

Go to **Rules** tab and paste:

```json
{
  "rules": {
    "users": {
      "$userId": {
        ".read": "auth != null && auth.uid == $userId",
        ".write": "auth != null && auth.uid == $userId"
      }
    }
  }
}
```

### 6.7 Enable Cloud Messaging

1. Go to **Project Settings** → **Cloud Messaging**
2. Note the Server key (for push notifications)
3. (iOS only) Upload APNs authentication key

---

## Step 7: Google Cloud Console Setup

### 7.1 Enable Google Drive API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project (auto-linked)
3. **APIs & Services** → **Enable APIs and Services**
4. Search "Google Drive API" → Enable

### 7.2 Configure OAuth Consent Screen

1. **OAuth consent screen**
2. User Type: **External**
3. App name: **LearnTracker**
4. User support email: your email
5. Add scopes:
   - `https://www.googleapis.com/auth/drive.appdata`
   - `https://www.googleapis.com/auth/drive.file`

### 7.3 Create OAuth Credentials

**Web Application:**
1. **Credentials** → **Create Credentials** → **OAuth client ID**
2. Application type: **Web application**
3. Copy **Client ID** → Add to `.env` as `GOOGLE_WEB_CLIENT_ID`

**iOS Application** (macOS only):
1. Create another OAuth client → **iOS**
2. Bundle ID: `com.learntracker.app`
3. Copy **Client ID** → Add to `.env` as `GOOGLE_IOS_CLIENT_ID`

**Android Application:**
1. Create another OAuth client → **Android**
2. Package name: `com.learntracker.app`
3. SHA-1 fingerprint: (from Step 6.3)
4. Copy **Client ID** → Add to `.env` as `GOOGLE_ANDROID_CLIENT_ID`

---

## Step 8: Test the Setup

### 8.1 Start Metro Bundler

```bash
npm start
```

### 8.2 Run on iOS (macOS only)

```bash
npm run ios
```

Or open `ios/LearnTracker.xcworkspace` in Xcode and click Run.

### 8.3 Run on Android

```bash
npm run android
```

Or open `android/` in Android Studio and click Run.

### 8.4 Verify

You should see the LearnTracker splash screen with:
- 🧠 LearnTracker title
- "Personal Learning & Development Tracker" subtitle
- "Setting up your learning journey..." status

---

## Troubleshooting

### iOS: Pod install fails
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Android: Gradle sync fails
```bash
cd android
./gradlew clean
cd ..
```

### Metro bundler cache issues
```bash
npm start -- --reset-cache
```

### "Command not found" errors
Make sure React Native CLI is installed globally:
```bash
npm install -g react-native-cli
```

---

## Next Steps

Once the app runs successfully:
1. ✅ Test Firebase Auth connection (check logs)
2. ✅ Test Google Sign-In (should show login screen)
3. ✅ Verify navigation works (auth → main transition)
4. 🚀 **Begin Phase 3: Implement first user story (Flashcards MVP)**

---

**Need Help?** Refer to:
- [React Native Setup](https://reactnative.dev/docs/environment-setup)
- [Firebase iOS Setup](https://firebase.google.com/docs/ios/setup)
- [Firebase Android Setup](https://firebase.google.com/docs/android/setup)
- [quickstart.md](specs/001-learntracker-app/quickstart.md) for detailed integration steps
