# Research: Fix Voice Note Recording Permission Error

**Date**: 2026-02-04
**Feature Branch**: `002-fix-voicenote-recording-permission`

## Research Tasks Completed

### 1. Android Storage Directories Accessible to Apps

**Decision**: Use `CachesDirectoryPath` as primary, `DocumentDirectoryPath` as fallback

**Rationale**:
- `CachesDirectoryPath` maps to `Context.getCacheDir()` which is always writable without special permissions
- `DocumentDirectoryPath` maps to `Context.getFilesDir()` providing a persistent alternative
- Both are app-private directories that don't require `WRITE_EXTERNAL_STORAGE` permission

**Alternatives Considered**:

| Directory | Rejected Because |
|-----------|------------------|
| `/data/local/tmp` | System-restricted; requires root privileges; causes EACCES error |
| `ExternalStorageDirectoryPath` | Requires `WRITE_EXTERNAL_STORAGE` permission |
| `DownloadDirectoryPath` | May require permissions; not app-private |

### 2. react-native-fs Available Directory Constants

**Decision**: Use existing react-native-fs constants in priority order

**Rationale**: The library (v2.20.0) provides all necessary directory constants that map to Android's app-private storage:

| Constant | Android Mapping | Permission Required |
|----------|-----------------|---------------------|
| `CachesDirectoryPath` | `Context.getCacheDir()` | None |
| `DocumentDirectoryPath` | `Context.getFilesDir()` | None |
| `ExternalCachesDirectoryPath` | `Context.getExternalCacheDir()` | None (API 19+) |
| `TemporaryDirectoryPath` | Falls back to cache | None |

**Alternatives Considered**:

| Approach | Rejected Because |
|----------|------------------|
| Native module for `getCacheDir()` | Unnecessary; react-native-fs already provides this |
| Using `/tmp` on Android | Not writable; iOS-only behavior |

### 3. Fallback Strategy When react-native-fs Unavailable

**Decision**: Implement multi-tier fallback with error handling; throw clear error instead of invalid path

**Rationale**:
- Better to fail explicitly than silently use invalid path
- User gets actionable feedback (FR-005)
- Prevents silent recording failures that corrupt user data

**Alternatives Considered**:

| Approach | Rejected Because |
|----------|------------------|
| Hardcoded `/data/local/tmp` | System-restricted; root cause of bug |
| Silent failure with empty path | Poor UX; violates FR-005 |
| Retry logic for library loading | Adds complexity; library should load on first try |

## Recommended Implementation

### Safe Directory Resolution Function

```typescript
const getCacheDirectory = async (): Promise<string> => {
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

    // Priority 3: External cache (for larger files)
    if (RNFS?.ExternalCachesDirectoryPath) {
      return RNFS.ExternalCachesDirectoryPath;
    }
  } catch (error) {
    console.warn('react-native-fs not available:', error);
  }

  // Platform-specific safe fallback
  if (Platform.OS === 'ios') {
    return '/tmp'; // iOS tmp is app-sandboxed and safe
  }

  // Android: No safe hardcoded fallback exists
  throw new Error('Unable to determine writable directory for voice recordings');
};
```

### Write Access Verification (FR-004)

```typescript
const verifyWriteAccess = async (directory: string): Promise<boolean> => {
  const RNFS = require('react-native-fs').default;
  const testFile = `${directory}/.write_test_${Date.now()}`;

  try {
    await RNFS.writeFile(testFile, 'test', 'utf8');
    await RNFS.unlink(testFile);
    return true;
  } catch {
    return false;
  }
};
```

## Root Cause Analysis

**Current Bug Location**: `src/screens/voiceNotes/RecordVoiceNoteScreen.tsx` lines 29-31

```typescript
// PROBLEMATIC CODE:
return Platform.OS === 'ios'
  ? '/tmp'
  : '/data/local/tmp';  // ← INVALID on Android
```

**Why `/data/local/tmp` Fails**:
- `/data/local/tmp` is owned by `shell:shell` with mode `drwxrwx--x`
- Apps run under their own UID (e.g., `u0_a123`) not as `shell`
- Android's SELinux policy also blocks app access to this directory
- Only ADB shell and system processes can write here

**Evidence from Error**:
```
android.system.ErrnoException: open failed: EACCES (Permission denied)
```

## Dependencies Verified

- **react-native-fs**: v2.20.0 installed; provides `CachesDirectoryPath`, `DocumentDirectoryPath`
- **react-native-nitro-sound**: v0.2.10; accepts file paths from any writable directory
- **Android min SDK**: API 21+ (per react-native 0.83.1 defaults); all recommended directories available

## Open Questions Resolved

| Question | Resolution |
|----------|------------|
| Why does react-native-fs sometimes fail to load? | Metro bundler race conditions; try-catch handles gracefully |
| Is external cache reliable? | Yes, but may be cleared; use internal cache as primary |
| Do we need native module? | No; react-native-fs provides all needed constants |
