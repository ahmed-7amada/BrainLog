# Feature Specification: Fix Voice Note Recording Permission Error

**Feature Branch**: `002-fix-voicenote-recording-permission`
**Created**: 2026-02-04
**Status**: Draft
**Type**: Bug Fix
**Input**: User description: "RecordVoiceNoteScreen.tsx:117 Error starting recording: java.io.FileNotFoundException: /data/local/tmp/voicenote_*.m4a: open failed: EACCES (Permission denied)"

## Problem Statement

Voice note recording fails on Android devices with a permission denied error. The application attempts to write audio recordings to `/data/local/tmp/` which is a restricted system directory that Android apps cannot access without root privileges.

**Root Cause Analysis**:
- The `getCacheDirectory()` function in `RecordVoiceNoteScreen.tsx` (lines 16-32) has a fallback path that returns `/data/local/tmp` for Android
- This fallback is triggered when `react-native-fs` module fails to load or doesn't provide valid directory paths
- The `/data/local/tmp` directory requires system-level permissions and is not accessible to user applications

**Error Stack Trace**:
```
java.io.FileNotFoundException: /data/local/tmp/voicenote_*.m4a: open failed: EACCES (Permission denied)
at android.media.MediaRecorder.prepare(MediaRecorder.java:1555)
Caused by: android.system.ErrnoException: open failed: EACCES (Permission denied)
```

## User Scenarios & Testing

### User Story 1 - Record Voice Note Successfully (Priority: P1)

As a user, I want to record voice notes on my Android device without encountering permission errors, so that I can capture my thoughts and ideas quickly.

**Why this priority**: This is a critical bug that completely blocks the core voice note functionality on Android devices. Users cannot use the voice recording feature at all.

**Independent Test**: Can be fully tested by opening the Record Voice Note screen, tapping the record button, and verifying that recording starts without errors.

**Acceptance Scenarios**:

1. **Given** a user is on the Record Voice Note screen on an Android device, **When** the user taps the record button and grants microphone permission, **Then** the recording should start successfully without any file permission errors

2. **Given** a user has started recording a voice note, **When** they stop the recording, **Then** the audio file should be saved to an accessible location and be playable

3. **Given** the device has limited storage space (but still has space available), **When** the user attempts to record, **Then** the recording should still function correctly using available space

---

### User Story 2 - Graceful Fallback When Library Unavailable (Priority: P2)

As a user, I want the app to handle situations where file system libraries may not be fully available, so that I can still record voice notes even in edge cases.

**Why this priority**: Ensures robustness when third-party dependencies have initialization issues.

**Independent Test**: Can be tested by simulating react-native-fs unavailability and verifying recording still works.

**Acceptance Scenarios**:

1. **Given** the react-native-fs library is unavailable or fails to initialize, **When** the user attempts to record a voice note, **Then** the app should use an alternative valid directory path

2. **Given** the primary cache directory path is not available, **When** the app needs to save a recording, **Then** it should fall back to another app-accessible directory

---

### Edge Cases

- What happens when the app's cache directory is full? App should provide a meaningful error message.
- How does the system handle concurrent recording attempts? Only one recording should be active at a time.
- What happens if the recording is interrupted (app backgrounded, phone call)? Recording should be recoverable or safely discarded.

## Requirements

### Functional Requirements

- **FR-001**: System MUST use app-accessible directories for storing voice note recordings on Android (app cache, app documents, or external app storage)

- **FR-002**: System MUST NOT attempt to write files to system-restricted directories like `/data/local/tmp`

- **FR-003**: System MUST provide a reliable fallback directory path when the primary file system library is unavailable

- **FR-004**: System MUST verify write access to the target directory before attempting to start recording

- **FR-005**: System MUST display a user-friendly error message if no writable directory is available

- **FR-006**: System MUST handle the case where react-native-fs module is not properly initialized

### Key Entities

- **Voice Note Recording**: Audio file stored temporarily during recording session, includes filename with timestamp, file path, duration metadata
- **Cache Directory**: App-specific storage location with write permissions, varies by platform

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can successfully start voice note recording on Android devices 100% of the time when microphone permission is granted

- **SC-002**: Zero EACCES (Permission denied) errors occur when recording voice notes

- **SC-003**: Voice note recordings are successfully saved and playable in 100% of recording sessions that complete normally

- **SC-004**: App provides clear feedback within 2 seconds if recording cannot start due to storage issues

## Assumptions

- The react-native-fs library may fail to load in certain conditions (Metro bundler issues, initialization race conditions)
- Android devices have at least minimal free storage available in the app's private directory
- The react-native-nitro-sound library accepts file paths in the app's cache or documents directory
- Standard Android permission model applies (API level 23+)

## Out of Scope

- iOS platform changes (the current implementation using `/tmp` works correctly on iOS)
- Cloud backup of voice note recordings
- External storage permissions (WRITE_EXTERNAL_STORAGE) - fix should use app-private storage only
- Migration of any existing recordings (none can exist due to the bug)
