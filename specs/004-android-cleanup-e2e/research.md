# Research: Android-Only Codebase Cleanup with Maestro E2E Testing

**Feature**: 004-android-cleanup-e2e
**Date**: 2026-02-06
**Status**: Complete

## Research Topics

### 1. Maestro E2E Testing for React Native Android

**Decision**: Use Maestro CLI with YAML-based test flows

**Rationale**:
- Maestro is purpose-built for mobile E2E testing with native support for React Native
- YAML syntax is human-readable and maintainable
- Built-in support for `testID` prop targeting (React Native standard)
- No test code compilation required; tests run directly against APK
- Excellent Android emulator integration
- Active development and community support (mobile.dev)

**Alternatives Considered**:
| Tool | Rejected Because |
|------|------------------|
| Detox | Heavier setup, requires native build integration, complex configuration for Android |
| Appium | Slow execution, complex setup, requires Selenium infrastructure |
| Espresso (native) | Requires Java/Kotlin, no React Native awareness, testID not natively supported |
| React Native Testing Library | Not E2E; better for component testing |

**Implementation Details**:
- Installation: `curl -Ls "https://get.maestro.mobile.dev" | bash`
- Targeting elements: `id: "screenName_elementType_identifier"` (maps to testID prop)
- Assertions: `assertVisible`, `assertNotVisible`, `assertText`
- Wait conditions: `waitForAnimationToEnd`, explicit `sleep` for transitions

### 2. iOS Removal from React Native Projects

**Decision**: Complete removal of ios/ directory and all iOS-specific configurations

**Rationale**:
- Eliminates ~50% of platform-specific maintenance overhead
- Simplifies CI/CD pipeline (no Xcode, CocoaPods, signing)
- Reduces cognitive load for Android-focused development
- Removes unused native dependencies

**Removal Checklist**:
1. **Directory Removal**:
   - Delete `ios/` directory entirely
   - Delete `Podfile.lock` if present at root

2. **package.json Cleanup**:
   - Remove script: `"ios": "react-native run-ios"`
   - Remove script: `"pod-install": "..."` (if present)
   - Remove devDependency: `@react-native-community/cli-platform-ios`
   - Remove any iOS-only dependencies (none identified in current package.json)

3. **Config File Updates**:
   - metro.config.js: No iOS-specific config detected (clean)
   - babel.config.js: No iOS-specific config detected (clean)
   - app.json: No iOS-specific config detected (clean)
   - tsconfig.json: No iOS-specific config detected (clean)

4. **Source Code Cleanup**:
   - Search for `Platform.OS === 'ios'` and `Platform.select` with iOS branches
   - Remove iOS conditional paths, keeping only Android logic
   - Simplify to direct Android implementation where conditionals existed

**Alternatives Considered**:
| Approach | Rejected Because |
|----------|------------------|
| Keep ios/ but don't maintain | Creates confusion, inconsistent state, build errors |
| Exclude via .gitignore | Still present locally, can cause issues |
| Conditional build scripts | Adds complexity without benefit |

### 3. testID Naming Convention for React Native

**Decision**: Use `screenName_elementType_identifier` pattern

**Rationale**:
- Globally unique: No conflicts across screens
- Self-documenting: Test authors can infer element location
- Consistent: Same pattern throughout codebase
- Maestro-friendly: Direct mapping to `id:` selector

**Convention Details**:
```
Pattern: {screenName}_{elementType}_{identifier}

screenName: PascalCase, matches screen component name without "Screen" suffix
  - LoginScreen → login
  - DashboardScreen → dashboard
  - FlashcardListScreen → flashcardList

elementType: lowercase, describes element category
  - button, input, text, card, list, item, modal, toggle, dropdown, tab, icon

identifier: camelCase, describes specific purpose
  - submit, cancel, email, password, search, create, delete, edit, back

Examples:
  - login_input_email
  - login_input_password
  - login_button_submit
  - login_button_googleSignIn
  - login_text_error
  - dashboard_card_todayProgress
  - dashboard_button_startReview
  - noteList_item_0 (for list items, use index)
  - noteList_button_create
  - noteDetail_button_edit
  - noteDetail_button_delete
  - createNote_input_title
  - createNote_input_content
  - createNote_button_save
```

**Alternatives Considered**:
| Pattern | Rejected Because |
|---------|------------------|
| `element-type-name` (kebab) | Inconsistent with React Native conventions |
| Just unique IDs | Not self-documenting, hard to maintain |
| data-testid attribute | Not React Native standard; testID is the convention |
| Nested IDs with dots | Some testing tools don't handle dots well |

### 4. Code Cleanup Tools and Patterns

**Decision**: Use existing toolchain (TypeScript, ESLint, Prettier) with strict enforcement

**Rationale**:
- Project already has TypeScript strict mode capable
- ESLint with React Native config provides comprehensive linting
- Prettier ensures consistent formatting
- No new tools needed; enforce existing configuration

**Cleanup Process**:

1. **Unused Imports/Exports Detection**:
   - TypeScript compiler with `noUnusedLocals` and `noUnusedParameters`
   - ESLint rule: `@typescript-eslint/no-unused-vars`
   - Manual review for side-effect imports

2. **Unused Dependencies Detection**:
   - `npx depcheck` for unused npm dependencies
   - Manual verification for peer dependencies and build tools

3. **Dead Code Detection**:
   - ESLint rule: `no-unreachable`
   - TypeScript compiler: unreachable code analysis
   - Manual review for commented-out code blocks

4. **Code Organization**:
   - Feature-based folder structure (already in place)
   - Re-exports through index.ts files
   - Consistent file naming (PascalCase for components, camelCase for utilities)

5. **SOLID Compliance**:
   - Single Responsibility: Functions under 50 lines (constitution)
   - Open/Closed: Prefer composition over modification
   - Liskov Substitution: Consistent interface contracts
   - Interface Segregation: Small, focused interfaces
   - Dependency Inversion: Services depend on abstractions

**Tools Configuration**:
```json
// tsconfig.json additions for strict cleanup
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### 5. Maestro Test Organization Best Practices

**Decision**: Organize by feature domain with master suite orchestration

**Rationale**:
- Mirrors source code structure for easy navigation
- Individual flows can run independently
- Master suite enables full regression testing
- Supports parallel execution by domain

**Directory Structure**:
```
.maestro/
├── config.yaml           # Global Maestro configuration
├── suite.yaml            # Master test suite (runs all flows)
├── flows/
│   ├── auth/
│   │   ├── login_success.yaml
│   │   ├── login_error.yaml
│   │   ├── login_google.yaml
│   │   └── logout.yaml
│   ├── navigation/
│   │   └── tab_navigation.yaml
│   ├── notes/
│   │   ├── create_note.yaml
│   │   ├── edit_note.yaml
│   │   ├── delete_note.yaml
│   │   └── note_list.yaml
│   └── [other features]/
└── helpers/
    └── auth_login.yaml   # Reusable login flow for other tests
```

**Test Flow Patterns**:
```yaml
# Example: login_success.yaml
appId: com.brainlog
---
- launchApp
- waitForAnimationToEnd
- tapOn:
    id: "login_button_googleSignIn"
- waitForAnimationToEnd
- assertVisible:
    id: "dashboard_card_todayProgress"
```

### 6. Android Build Verification Post-iOS Removal

**Decision**: Standard React Native Android build process

**Rationale**:
- React Native CLI handles Android builds independently
- Gradle configuration unaffected by iOS removal
- Firebase and other native dependencies have Android-specific configurations

**Verification Steps**:
1. Clean build: `cd android && ./gradlew clean`
2. Debug build: `npx react-native run-android`
3. Release build: `cd android && ./gradlew assembleRelease`
4. APK location: `android/app/build/outputs/apk/release/`

**Expected Issues and Mitigations**:
| Issue | Mitigation |
|-------|------------|
| Metro bundler references ios | Metro auto-detects available platforms |
| react-native.config.js references ios | Remove ios-specific config if present |
| Native module linking issues | React Native autolinking handles Android-only |

## Summary of Decisions

| Topic | Decision |
|-------|----------|
| E2E Testing Tool | Maestro CLI with YAML flows |
| iOS Removal | Complete deletion of ios/ and all iOS configs |
| testID Convention | `screenName_elementType_identifier` |
| Code Cleanup | Strict TypeScript + ESLint + Prettier |
| Test Organization | Feature-domain folders with master suite |
| Build Process | Standard React Native Android CLI |

## NEEDS CLARIFICATION Items: None

All technical decisions resolved using industry best practices.
