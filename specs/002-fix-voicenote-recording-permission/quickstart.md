# Quickstart: Fix Voice Note Recording Permission Error

**Date**: 2026-02-04
**Feature Branch**: `002-fix-voicenote-recording-permission`
**Estimated Scope**: Small (single file fix + tests)

## Prerequisites

- [ ] Branch checked out: `002-fix-voicenote-recording-permission`
- [ ] Dependencies installed: `npm install`
- [ ] Android emulator or device available for testing

## Implementation Summary

### Primary Change

**File**: `src/screens/voiceNotes/RecordVoiceNoteScreen.tsx`
**Lines**: 16-32 (getCacheDirectory function)

**Before** (buggy):
```typescript
const getCacheDirectory = (): string => {
  try {
    const RNFS = require('react-native-fs').default;
    if (RNFS?.CachesDirectoryPath) {
      return RNFS.CachesDirectoryPath;
    }
    if (RNFS?.TemporaryDirectoryPath) {
      return RNFS.TemporaryDirectoryPath;
    }
  } catch (error) {
    console.warn('react-native-fs not available:', error);
  }
  return Platform.OS === 'ios'
    ? '/tmp'
    : '/data/local/tmp';  // ← BUG: Not accessible on Android
};
```

**After** (fixed):
```typescript
const getCacheDirectory = (): string => {
  try {
    const RNFS = require('react-native-fs').default;

    // Priority 1: Cache directory (best for temporary recordings)
    if (RNFS?.CachesDirectoryPath) {
      return RNFS.CachesDirectoryPath;
    }

    // Priority 2: Documents directory (persistent alternative)
    if (RNFS?.DocumentDirectoryPath) {
      return RNFS.DocumentDirectoryPath;
    }

    // Priority 3: External cache (for larger files, no permission needed)
    if (RNFS?.ExternalCachesDirectoryPath) {
      return RNFS.ExternalCachesDirectoryPath;
    }

    // Priority 4: Temporary directory
    if (RNFS?.TemporaryDirectoryPath) {
      return RNFS.TemporaryDirectoryPath;
    }
  } catch (error) {
    console.warn('react-native-fs not available:', error);
  }

  // iOS: /tmp is app-sandboxed and safe
  if (Platform.OS === 'ios') {
    return '/tmp';
  }

  // Android: No safe hardcoded fallback - throw to trigger error handling
  throw new Error('Unable to determine writable directory for voice recordings');
};
```

### Error Handling Update

**File**: `src/screens/voiceNotes/RecordVoiceNoteScreen.tsx`
**Function**: `handleStartRecording` (around line 107)

Add try-catch around directory resolution:
```typescript
const handleStartRecording = useCallback(async () => {
  try {
    // ... permission check ...

    let directory: string;
    try {
      directory = getCacheDirectory();
    } catch (dirError) {
      Alert.alert(
        'Storage Error',
        'Unable to access storage for recording. Please try again or restart the app.'
      );
      return;
    }

    const filename = `voicenote_${Date.now()}.m4a`;
    const path = `${directory}/${filename}`;

    // ... rest of recording logic ...
  } catch (error) {
    // ... existing error handling ...
  }
}, [startRecorder]);
```

## Testing Checklist

### Manual Testing (Android)

1. [ ] Open Record Voice Note screen
2. [ ] Grant microphone permission when prompted
3. [ ] Tap record button
4. [ ] **Expected**: Recording starts without error
5. [ ] Record for 5+ seconds
6. [ ] Tap stop button
7. [ ] Enter title and save
8. [ ] **Expected**: Voice note saved successfully

### Unit Test

Create `__tests__/unit/utils/getCacheDirectory.test.ts`:
```typescript
import { Platform } from 'react-native';

// Test cases:
// 1. Returns CachesDirectoryPath when available
// 2. Falls back to DocumentDirectoryPath when cache unavailable
// 3. Falls back to ExternalCachesDirectoryPath when documents unavailable
// 4. Returns /tmp on iOS when RNFS unavailable
// 5. Throws error on Android when RNFS unavailable
```

## Verification Commands

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Run tests
npm test

# Build Android
npm run android
```

## Success Criteria Verification

| Criteria | How to Verify |
|----------|---------------|
| SC-001: 100% recording success on Android | Manual test on Android device/emulator |
| SC-002: Zero EACCES errors | Check logcat for permission errors |
| SC-003: Recordings playable | Play saved recording after save |
| SC-004: 2s error feedback | Trigger error scenario, measure response time |

## Rollback Plan

If issues arise, revert the single file change:
```bash
git checkout HEAD~1 -- src/screens/voiceNotes/RecordVoiceNoteScreen.tsx
```
