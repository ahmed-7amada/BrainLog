# Data Model: Fix Voice Note Recording Permission Error

**Date**: 2026-02-04
**Feature Branch**: `002-fix-voicenote-recording-permission`

## Overview

This bug fix does not introduce new entities. It corrects the storage location for existing voice note recordings.

## Affected Entity: Voice Note Recording

### Current State (Buggy)

```
Voice Note Recording
├── filePath: string (BROKEN - points to /data/local/tmp/voicenote_*.m4a)
├── filename: string
├── duration: number (seconds)
└── timestamp: number
```

**Problem**: `filePath` resolves to `/data/local/tmp/` on Android, which is not writable.

### Target State (Fixed)

```
Voice Note Recording
├── filePath: string (points to app-private cache directory)
│   ├── Android: /data/data/com.brainlog/cache/voicenote_*.m4a
│   └── iOS: /tmp/voicenote_*.m4a (unchanged)
├── filename: string
├── duration: number (seconds)
└── timestamp: number
```

## Directory Resolution Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    getCacheDirectory()                          │
├─────────────────────────────────────────────────────────────────┤
│  1. Try: RNFS.CachesDirectoryPath                               │
│     ├── Success → Return path                                   │
│     └── Undefined → Continue                                    │
│                                                                 │
│  2. Try: RNFS.DocumentDirectoryPath                             │
│     ├── Success → Return path                                   │
│     └── Undefined → Continue                                    │
│                                                                 │
│  3. Try: RNFS.ExternalCachesDirectoryPath                       │
│     ├── Success → Return path                                   │
│     └── Undefined → Continue                                    │
│                                                                 │
│  4. Catch block (RNFS unavailable):                             │
│     └── Log warning                                             │
│                                                                 │
│  5. Platform check:                                             │
│     ├── iOS → Return '/tmp'                                     │
│     └── Android → Throw Error (no safe hardcoded fallback)      │
└─────────────────────────────────────────────────────────────────┘
```

## State Transitions

### Recording Lifecycle (Unchanged)

```
┌──────┐    start()    ┌───────────┐    stop()     ┌─────────┐
│ idle │──────────────►│ recording │──────────────►│ stopped │
└──────┘               └───────────┘               └─────────┘
                             │                           │
                             │ pause()                   │ save()
                             ▼                           ▼
                       ┌──────────┐               ┌───────────┐
                       │  paused  │               │  saved    │
                       └──────────┘               └───────────┘
                             │
                             │ resume()
                             ▼
                       ┌───────────┐
                       │ recording │
                       └───────────┘
```

### File Creation Flow

```
User taps record
       │
       ▼
┌──────────────────────┐
│ getCacheDirectory()  │
│ (now fixed)          │
└──────────────────────┘
       │
       ▼
┌──────────────────────┐     ┌──────────────────────┐
│ Directory resolved?  │─No─►│ Show error message   │
│                      │     │ (FR-005)             │
└──────────────────────┘     └──────────────────────┘
       │ Yes
       ▼
┌──────────────────────┐
│ Generate filename    │
│ voicenote_{ts}.m4a   │
└──────────────────────┘
       │
       ▼
┌──────────────────────┐
│ Start recording to   │
│ {directory}/{file}   │
└──────────────────────┘
```

## Validation Rules

| Rule | Validation |
|------|------------|
| Directory must be writable | Pre-check before recording (FR-004) |
| Filename must be unique | Timestamp-based naming ensures uniqueness |
| File extension must be .m4a | Hardcoded in filename generation |

## No Schema Changes

- No Firebase schema changes required
- No new local storage entities
- Existing `VoiceNote` model in `src/models/VoiceNote.ts` unchanged
