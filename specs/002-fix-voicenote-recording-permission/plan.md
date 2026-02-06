# Implementation Plan: Fix Voice Note Recording Permission Error

**Branch**: `002-fix-voicenote-recording-permission` | **Date**: 2026-02-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-fix-voicenote-recording-permission/spec.md`

## Summary

Fix the voice note recording failure on Android caused by the app attempting to write to the restricted `/data/local/tmp` directory. The solution replaces the invalid fallback path with proper Android app-accessible directories using react-native-fs constants (`CachesDirectoryPath`, `DocumentDirectoryPath`, `ExternalCachesDirectoryPath`).

## Technical Context

**Language/Version**: TypeScript 5.8.3 (strict mode enabled)
**Primary Dependencies**: react-native-fs ^2.20.0, react-native-nitro-sound ^0.2.10
**Storage**: Local file system (app cache/documents directory)
**Testing**: Jest 29.6.3
**Target Platform**: Android (iOS unaffected per spec Out of Scope)
**Project Type**: Mobile (React Native 0.83.1)
**Performance Goals**: 2 seconds max feedback time for storage errors (SC-004)
**Constraints**: App-private storage only; no WRITE_EXTERNAL_STORAGE permission required
**Scale/Scope**: Single screen fix (RecordVoiceNoteScreen.tsx)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Code Quality** | Pass | Fix maintains TypeScript strict mode; single function modification; explicit error handling added |
| **II. Testing Standards** | Pass | Unit tests recommended; verification tasks included; bug fix scope allows optional unit tests |
| **III. UX Consistency** | Pass | Error feedback requirement aligned with spec FR-005; user-friendly Alert implemented |
| **IV. Performance** | Pass | No performance-critical path affected; directory resolution is synchronous |
| **Development Workflow** | Pass | On feature branch; spec completed before implementation |
| **Quality Gates** | Pass | Tasks include lint (T009), type-check (T010), tests (T011), Android build (T012) |

**Gate Result**: PASS - No violations. Proceed to implementation.

## Project Structure

### Documentation (this feature)

```text
specs/002-fix-voicenote-recording-permission/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file (complete)
├── research.md          # Phase 0 output (complete)
├── data-model.md        # Phase 1 output (complete)
├── quickstart.md        # Phase 1 output (complete)
├── checklists/
│   └── requirements.md  # Quality checklist (complete)
└── tasks.md             # Phase 2 output (complete)
```

### Source Code (repository root)

```text
src/
├── screens/
│   └── voiceNotes/
│       └── RecordVoiceNoteScreen.tsx  # PRIMARY: Fix getCacheDirectory() function
└── utils/
    └── storage.ts                      # OPTIONAL: Extract directory helper if reusable

__tests__/
├── unit/
│   └── utils/
│       └── getCacheDirectory.test.ts  # OPTIONAL: Unit tests for directory resolution
└── integration/
    └── voiceNotes/
        └── recording.test.ts          # OPTIONAL: Integration test for recording flow
```

**Structure Decision**: Single-file fix in existing screen component. All changes in `src/screens/voiceNotes/RecordVoiceNoteScreen.tsx`. Tests in `__tests__/` per existing project structure.

## Key Technical Decisions

From [research.md](./research.md):

1. **Directory Priority Order**: CachesDirectoryPath > DocumentDirectoryPath > ExternalCachesDirectoryPath > TemporaryDirectoryPath
2. **Fallback Strategy**: Throw explicit error on Android when no valid directory (better than silent invalid path)
3. **Write Verification**: Test write access before recording starts (FR-004)
4. **No Native Module Needed**: react-native-fs v2.20.0 provides all required directory constants

## Complexity Tracking

No constitution violations to justify. This is a minimal, targeted bug fix.
