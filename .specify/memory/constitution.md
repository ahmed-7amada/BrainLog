<!--
=== SYNC IMPACT REPORT ===
Version change: 1.0.0 → 1.1.0
Modified sections:
  - Quality Gates: Updated Build requirement for Android-only
  - Quality Gates: Added E2E Tests requirement with Maestro
Added sections:
  - E2E test requirements with testID naming convention
Removed sections:
  - iOS build requirement (Android-only as of v1.1.0)
Templates alignment:
  - .specify/templates/plan-template.md: Constitution Check section present
  - .specify/templates/spec-template.md: User scenarios with acceptance criteria aligned
  - .specify/templates/tasks-template.md: Test-first guidance aligned with Principle II
Follow-up TODOs: None
=========================
-->

# BrainLog Constitution

## Core Principles

### I. Code Quality

All code MUST adhere to the following quality standards:

- **TypeScript Strict Mode**: All TypeScript files MUST compile with strict mode enabled. No `any` types except when interfacing with third-party libraries that lack proper types
- **Single Responsibility**: Each module, component, and function MUST have a single, well-defined purpose. Functions exceeding 50 lines MUST be refactored
- **Consistent Naming**: Use camelCase for variables/functions, PascalCase for components/types/interfaces. File names MUST match their primary export
- **No Dead Code**: Unused imports, variables, functions, and commented-out code MUST be removed before merge
- **Explicit Over Implicit**: Prefer explicit type annotations at module boundaries. Avoid magic numbers and strings; use named constants
- **Error Handling**: All async operations MUST have proper error handling. Errors MUST be caught, logged, and presented to users appropriately

Rationale: Consistent, maintainable code reduces bugs, accelerates onboarding, and enables confident refactoring.

### II. Testing Standards

Testing requirements MUST be followed to ensure reliability:

- **Test Coverage Targets**: New features MUST include tests. Critical paths (authentication, data persistence, spaced repetition algorithm) MUST have 80%+ coverage
- **Test Hierarchy**: Unit tests for pure functions and utilities, integration tests for service interactions, component tests for UI behavior
- **Test Naming**: Test descriptions MUST clearly state the scenario being tested: `[unit under test] [scenario] [expected result]`
- **Mocking Discipline**: External services (Firebase, Google Drive) MUST be mocked in tests. Tests MUST NOT make real network calls
- **Test Independence**: Each test MUST be independent and idempotent. Tests MUST NOT depend on execution order or shared mutable state
- **Acceptance Criteria**: Features MUST NOT be considered complete until all acceptance scenarios from the spec are verified

Rationale: Comprehensive testing catches regressions early, enables confident refactoring, and documents expected behavior.

### III. User Experience Consistency

The app MUST provide a cohesive, intuitive user experience:

- **Design System Adherence**: All UI components MUST use the theme system defined in `src/config/theme.ts`. No hardcoded colors, fonts, or spacing values
- **Loading States**: All async operations MUST display appropriate loading indicators. Users MUST never see frozen or unresponsive UI
- **Error Feedback**: All user-facing errors MUST display clear, actionable messages. Never expose technical error details to users
- **Accessibility**: All interactive elements MUST have semantic labels. Color contrast MUST meet WCAG AA standards. Text MUST scale with device settings
- **Navigation Consistency**: Navigation patterns MUST be consistent across all screens. Back navigation MUST work predictably
- **Offline Awareness**: App MUST clearly indicate offline status and gracefully handle offline scenarios per spec requirements

Rationale: Consistent UX builds user trust, reduces cognitive load, and ensures the app is usable by all users including those with disabilities.

### IV. Performance Requirements

The app MUST meet these performance standards:

- **Startup Time**: Cold start to interactive dashboard MUST complete in under 3 seconds on mid-range devices
- **Screen Transitions**: Navigation between screens MUST complete in under 300ms. Use skeleton screens for content loading
- **List Performance**: Lists with 100+ items MUST use virtualization (FlatList/FlashList). Scrolling MUST maintain 60fps
- **Memory Management**: App memory usage MUST stay under 200MB during normal operation. Large assets MUST be loaded on-demand
- **Bundle Size**: JavaScript bundle MUST stay under 2MB. Use code splitting for feature modules
- **Animation Smoothness**: All animations MUST run at 60fps. Use native driver for Reanimated animations where possible
- **Query Optimization**: Firebase queries MUST be indexed. Avoid fetching data that won't be displayed

Rationale: Poor performance degrades user experience and causes abandonment. Mobile users expect fast, responsive apps.

## Development Workflow

Development MUST follow these practices:

- **Feature Branches**: All work MUST happen on feature branches. Direct commits to `main` are prohibited
- **Atomic Commits**: Each commit MUST represent a single logical change. Commit messages MUST be descriptive
- **Code Review**: All merges MUST be reviewed. Reviewers MUST verify constitution compliance
- **Spec-First Development**: Features MUST have an approved spec before implementation begins
- **Incremental Delivery**: Features MUST be implemented in user-story order (P1 before P2). Each story MUST be independently testable

## Quality Gates

Changes MUST pass these gates before merge:

- **Lint**: ESLint MUST pass with zero errors. Warnings MUST be addressed or explicitly justified
- **Type Check**: TypeScript compilation MUST succeed with zero errors
- **Tests**: All tests MUST pass. No skipped tests without documented justification
- **Build**: Production build MUST complete successfully for Android (iOS support removed as of v1.1.0)
- **E2E Tests**: Maestro E2E test suite MUST pass. All screens MUST have testID attributes following the naming convention: `screenName_elementType_identifier`
- **Performance Audit**: Changes affecting critical paths MUST include performance verification

## Governance

This constitution supersedes all other development practices for the BrainLog project:

- **Amendment Process**: Constitution changes require documented rationale and version increment. MAJOR changes require team discussion
- **Versioning**: Constitution follows semantic versioning. MAJOR for principle changes, MINOR for additions, PATCH for clarifications
- **Compliance Review**: All pull requests MUST include a constitution compliance statement
- **Exceptions**: Temporary exceptions MUST be documented with justification and remediation timeline
- **Runtime Guidance**: See spec files in `specs/` for feature-specific implementation guidance

**Version**: 1.1.0 | **Ratified**: 2026-02-04 | **Last Amended**: 2026-02-06
