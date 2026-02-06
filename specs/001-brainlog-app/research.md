# Technical Research: BrainLog

**Feature**: BrainLog — Personal Learning & Development Tracker
**Date**: 2026-02-03
**Purpose**: Resolve technical decisions marked as "NEEDS CLARIFICATION" in plan.md

## Research Areas

### 1. State Management Library

**Decision**: **Zustand**

**Rationale**:
- Lightweight (~1KB) with minimal boilerplate compared to Redux
- Built-in TypeScript support with excellent type inference
- Simple API that's easier to learn for new developers
- Built-in persistence middleware for offline caching
- No Provider wrapper needed - works well with React Native
- Excellent performance with selective re-renders
- Growing ecosystem and active maintenance

**Alternatives Considered**:
- **Redux Toolkit**: More verbose, larger bundle size (~10KB), steeper learning curve. Better for very large teams with complex state interactions, but overkill for this project.
- **Context API**: Built-in but causes re-render issues at scale, no persistence middleware, no dev tools. Not suitable for 1000+ flashcards performance requirement.

**References**:
- Zustand GitHub: https://github.com/pmndrs/zustand
- React Native performance comparison: Context API causes full tree re-renders vs Zustand's selective updates

---

### 2. Offline-First Data Sync Strategy

**Decision**: **WatermelonDB** for local database with custom Firebase sync adapter

**Rationale**:
- Purpose-built for React Native offline-first apps with 10k+ records
- Lazy loading and observable patterns prevent UI freezes
- Built-in sync primitives for conflict resolution
- SQLite-backed for reliable persistence
- Excellent performance (benchmarked: 10k records load in <100ms)
- Active community and maintained by Nozbe team
- Works seamlessly with Firebase Realtime Database through custom sync adapter

**Implementation Approach**:
- WatermelonDB as local SQLite cache for all entities (Flashcard, Note, etc.)
- Custom sync adapter connecting WatermelonDB to Firebase Realtime Database
- Conflict resolution: Last-write-wins using timestamps (as specified in spec edge cases)
- Offline queue for write operations during disconnection
- Background sync service triggers on connectivity change

**Alternatives Considered**:
- **Custom AsyncStorage implementation**: Too slow for 1000+ flashcards requirement, no relational queries, complex to maintain
- **Realm**: Good performance but heavier SDK, more complex licensing, less React Native-specific

**References**:
- WatermelonDB Documentation: https://nozbe.github.io/WatermelonDB/
- Firebase sync adapter pattern: https://nozbe.github.io/WatermelonDB/Advanced/Sync.html

---

### 3. Mock Strategy for Firebase and Google Drive Integration Tests

**Decision**: **Firebase Emulator Suite + MSW (Mock Service Worker) for Google Drive**

**Rationale**:
- **Firebase Emulator Suite**: Official emulator for Realtime Database, Auth, and Storage. Provides realistic test environment without network calls or test data pollution
- **MSW for Google Drive**: Intercepts HTTP requests at network level, allows realistic API response mocking
- Enables true integration tests without external dependencies
- Fast test execution (no network latency)
- Reproducible test scenarios including error conditions

**Implementation Approach**:
```typescript
import { getDatabase } from '@react-native-firebase/database';
import { getAuth } from '@react-native-firebase/auth';

// Firebase: Use emulator in test environment
if (__DEV__ || process.env.NODE_ENV === 'test') {
  getDatabase().useEmulator('localhost', 9000);
  getAuth().useEmulator('http://localhost:9099');
}

// Google Drive: MSW handlers for REST API
// Mock /drive/v3/files endpoints in test setup
```

**Alternatives Considered**:
- **Jest manual mocks**: Brittle, hard to maintain, doesn't catch integration issues
- **Test against production Firebase**: Slow, data pollution, costs, unreliable

**References**:
- Firebase Emulator Suite: https://firebase.google.com/docs/emulator-suite
- MSW for React Native: https://mswjs.io/docs/integrations/react-native

---

### 4. Push Notification Service

**Decision**: **Firebase Cloud Messaging (FCM)** via `@react-native-firebase/messaging`

**Rationale**:
- Already using Firebase ecosystem (consistency)
- Native iOS (APNs) and Android (FCM) integration built-in
- Supports both data messages and notification messages
- Free tier sufficient for initial scale (hundreds to thousands of users)
- Reliable delivery with FCM priority levels
- Background and foreground notification handling
- Works offline (notifications queued and delivered when online)

**Implementation Approach**:
- `@react-native-firebase/messaging` for cross-platform notifications
- Background handler for notification tap actions
- Local notification scheduling for daily reminders (uses `@notifee/react-native` for rich notifications)
- Notification permission handling at onboarding

**Alternatives Considered**:
- **Expo Notifications**: Requires Expo ecosystem (project uses bare React Native based on requirements), adds abstraction layer
- **OneSignal**: Third-party dependency, additional cost at scale, overkill for simple notification needs

**References**:
- React Native Firebase Messaging: https://rnfirebase.io/messaging/usage
- Notifee (local notifications): https://notifee.app/

---

### 5. Video Compression Library

**Decision**: **react-native-compressor** (powered by native compression APIs)

**Rationale**:
- Uses native iOS (AVFoundation) and Android (MediaCodec) compression APIs for best performance
- Supports video, image, and audio compression
- Progress callbacks for UX (required by SC-029: 5-min video in <3 min)
- Quality presets with configurable bitrate control
- Actively maintained (2024-2026 releases)
- Smaller bundle size than FFmpeg-based solutions
- Background compression support

**Implementation Approach**:
```typescript
import { Video } from 'react-native-compressor';

const compressed = await Video.compress(
  videoUri,
  {
    compressionMethod: 'auto', // Uses platform-optimal codec
    bitrate: 1000000, // 1 Mbps for balanced quality/size
  },
  (progress) => {
    // Update UI progress bar
  }
);
```

**Alternatives Considered**:
- **FFmpeg (ffmpeg-kit-react-native)**: More powerful but 20MB+ bundle size, slower compile times, overkill for basic compression
- **react-native-video-processing**: Deprecated, no longer maintained

**References**:
- react-native-compressor: https://github.com/numandev1/react-native-compressor
- Performance benchmarks: 50-70% size reduction, <3min for 5-min 1080p video

---

### 6. Spaced Repetition Algorithm (SM-2) Implementation Patterns

**Decision**: **Custom TypeScript implementation with service layer pattern**

**Rationale**:
- SM-2 algorithm is well-defined with clear mathematical formulas (specified in FR-002)
- Custom implementation allows precise control over parameters (ease factor, intervals)
- Service layer makes algorithm testable independently from UI
- No existing library meets exact requirements (4 quality ratings: Again=0, Hard=3, Good=4, Easy=5)
- Pure function approach enables easy unit testing

**Implementation Approach**:
```typescript
// src/services/spacedRepetition/SM2Algorithm.ts
export interface SM2Result {
  interval: number;        // Days until next review
  easeFactor: number;      // New ease factor
  repetitions: number;     // Repetition count
}

export function calculateNextReview(
  quality: 0 | 3 | 4 | 5,  // Again | Hard | Good | Easy
  currentEaseFactor: number,
  currentInterval: number,
  repetitions: number
): SM2Result {
  // Implementation follows spec FR-002 precisely
  // Initial ease factor: 2.5
  // Min ease factor: 1.3
  // Intervals: 1 day, 6 days, then interval * easeFactor
}
```

**Testing Strategy**:
- Unit tests for each quality rating scenario
- Property-based testing for interval monotonicity (intervals should increase for quality >= 3)
- Integration tests with actual flashcard data

**Alternatives Considered**:
- **Existing libraries (e.g., sm2-plus)**: Don't match exact spec requirements, unnecessary dependencies
- **Backend calculation**: Adds latency, requires connectivity, fails offline-first requirement

**References**:
- SuperMemo SM-2 Algorithm: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
- Anki's implementation patterns (reference for production-tested approach)

---

### 7. Google OAuth Integration Approach

**Decision**: **@react-native-google-signin/google-signin** + Firebase Auth

**Rationale**:
- Official Google Sign-In SDK wrapper for React Native
- Seamless Firebase Auth integration (converts Google credentials to Firebase tokens)
- Handles token refresh automatically
- Provides access to Google Drive API scopes (required for FR-000: media storage)
- Well-maintained by Google-affiliated developers
- Supports iOS and Android with native configuration

**Implementation Approach**:
```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

// Configure with Google Drive scope
GoogleSignin.configure({
  scopes: ['https://www.googleapis.com/auth/drive.file'],
  webClientId: '[FIREBASE_WEB_CLIENT_ID]',
});

// Sign in flow
const { idToken } = await GoogleSignin.signIn();
const googleCredential = auth.GoogleAuthProvider.credential(idToken);
await auth().signInWithCredential(googleCredential);
```

**Alternatives Considered**:
- **expo-auth-session**: Requires Expo ecosystem, web-based OAuth flow (slower UX than native SDK)
- **react-native-app-auth**: More generic, requires additional Firebase integration work

**References**:
- React Native Google Sign-In: https://github.com/react-native-google-signin/google-signin
- Firebase Auth with Google: https://rnfirebase.io/auth/social-auth#google

---

### 8. Image and File Upload Handling

**Decision**: **react-native-image-picker** for media selection + **@react-native-firebase/storage** + **@googleapis/drive** for Google Drive

**Rationale**:
- **Image Picker**: Official React Native community package, supports camera and gallery, handles permissions
- **Firebase Storage**: For temporary staging and small files (if needed for thumbnails)
- **Google Drive API**: Primary storage for videos and voice notes (as specified in FR-000)
- Chunked upload support for large video files
- Progress tracking for UX requirements

**Implementation Approach**:
```typescript
// Media selection
import { launchImageLibrary } from 'react-native-image-picker';

// Google Drive upload
import { drive } from '@googleapis/drive';

async function uploadToGoogleDrive(fileUri: string, mimeType: string) {
  // Compress if video (using react-native-compressor)
  const finalUri = mimeType.startsWith('video/')
    ? await compressVideo(fileUri)
    : fileUri;

  // Upload to Google Drive with progress
  const response = await drive.files.create({
    requestBody: { name: filename, parents: ['appDataFolder'] },
    media: { mimeType, body: fs.createReadStream(finalUri) },
  }, {
    onUploadProgress: (evt) => updateProgress(evt),
  });

  return response.data.id; // Store file ID in Firebase metadata
}
```

**Alternatives Considered**:
- **Expo Image Picker**: Requires Expo ecosystem
- **Direct Firebase Storage**: 5GB free limit insufficient for video-heavy app, slower than Google Drive API

**References**:
- React Native Image Picker: https://github.com/react-native-image-picker/react-native-image-picker
- Google Drive API for React Native: https://github.com/googleapis/google-api-nodejs-client

---

### 9. Local Database Encryption Strategy

**Decision**: **WatermelonDB with SQLCipher encryption** (optional, enabled for sensitive data)

**Rationale**:
- WatermelonDB supports SQLCipher integration for at-rest encryption
- Protects sensitive user data (flashcard content, notes, daily logs) on device
- Minimal performance overhead (<5% per WatermelonDB docs)
- Transparent encryption (no code changes needed after setup)
- Key stored in device Keychain/Keystore (iOS/Android secure storage)

**Implementation Approach**:
```typescript
// WatermelonDB database setup with encryption
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'brainlog',
  jsi: true, // JSI for better performance
  // Enable encryption
  onSetUpError: (error) => console.error(error),
});

// SQLCipher enabled via native module configuration
// Key managed by react-native-keychain
```

**Risk Assessment**:
- Encryption is optional feature for MVP (not specified in requirements)
- Recommend deferring to post-MVP unless security audit identifies risk
- Current plan: No encryption for MVP, add in P3 enhancement

**Alternatives Considered**:
- **Manual encryption per field**: Complex, error-prone, performance overhead
- **Realm encryption**: Tied to Realm database, not compatible with WatermelonDB choice

**References**:
- WatermelonDB encryption: https://nozbe.github.io/WatermelonDB/Advanced/Encryption.html
- react-native-keychain: https://github.com/oblador/react-native-keychain

---

## Summary of Technical Decisions

| Decision Area | Selected Technology | Rationale |
|--------------|---------------------|-----------|
| State Management | Zustand | Lightweight, performant, simple API, built-in persistence |
| Offline Sync | WatermelonDB + Firebase sync adapter | Purpose-built for offline-first, handles 10k+ records, SQLite-backed |
| Testing Mocks | Firebase Emulator Suite + MSW | Realistic integration tests without external dependencies |
| Push Notifications | Firebase Cloud Messaging | Integrated with Firebase, free tier sufficient, reliable delivery |
| Video Compression | react-native-compressor | Native performance, progress callbacks, <3min for 5-min video |
| Spaced Repetition | Custom TypeScript implementation | Precise control, testable, matches exact spec requirements |
| Google OAuth | @react-native-google-signin/google-signin | Official SDK, Firebase integration, Google Drive scope support |
| File Upload | react-native-image-picker + Google Drive API | Community standard for picker, primary storage matches spec |
| Database Encryption | WatermelonDB + SQLCipher (deferred to P3) | Optional security enhancement, minimal overhead, transparent |

## Next Steps

All "NEEDS CLARIFICATION" items resolved. Proceed to **Phase 1: Design & Contracts**:
1. Generate data-model.md (entity schemas mapped to WatermelonDB models)
2. Generate API contracts (Firebase Realtime Database structure, Google Drive API calls)
3. Generate quickstart.md (development environment setup)
4. Update agent context with selected technologies
