# Data Model: LearnTracker

**Feature**: LearnTracker — Personal Learning & Development Tracker
**Date**: 2026-02-03
**Database**: WatermelonDB (SQLite-backed) with Firebase Realtime Database sync

## Overview

This document defines the data model for LearnTracker, mapping functional requirements from [spec.md](spec.md) to WatermelonDB table schemas. All entities sync with Firebase Realtime Database using a custom sync adapter.

## Schema Design Principles

1. **Offline-First**: All data stored locally in WatermelonDB SQLite database
2. **Firebase Sync**: Custom sync adapter syncs changes to Firebase Realtime Database
3. **Timestamps**: All records include `created_at` and `updated_at` for sync conflict resolution
4. **Soft Deletes**: Records marked as `_status: 'deleted'` for sync purposes (not physical delete)
5. **Indexed Fields**: Foreign keys and frequently queried fields indexed for performance
6. **JSON Fields**: Complex objects (arrays, nested data) stored as JSON strings

## Entity Definitions

### 1. User Profile

**Purpose**: Represents a learner using the app (FR-000 through FR-000l)

**WatermelonDB Table**: `users`

| Field | Type | Required | Index | Description |
|-------|------|----------|-------|-------------|
| id | string (UUID) | Yes | Primary | User unique identifier (matches Firebase Auth UID) |
| email | string | Yes | Yes | User email from Google Sign-in |
| name | string | Yes | No | User display name from Google profile |
| avatar_url | string | No | No | Profile picture URL from Google |
| xp_points | number | Yes | No | Total XP accumulated (default: 0) |
| current_level | number | Yes | No | Current XP level (1-10, default: 1) |
| current_streak | number | Yes | No | Consecutive days with activity (default: 0) |
| longest_streak | number | Yes | No | Best streak ever achieved (default: 0) |
| last_active_date | string (ISO date) | Yes | Yes | Last date user performed any activity (YYYY-MM-DD) |
| streak_freeze_available | boolean | Yes | No | Can use streak freeze this week? (default: true) |
| earned_badges | string (JSON array) | Yes | No | Array of badge IDs earned (default: '[]') |
| created_at | timestamp | Yes | No | Account creation time |
| updated_at | timestamp | Yes | Yes | Last profile update (for sync) |
| _status | string | Yes | Yes | Sync status: 'created'/'updated'/'deleted' |

**Relationships**:
- `has_many :flashcards`
- `has_many :notes`
- `has_many :bookmarks`
- `has_many :videos`
- `has_many :voice_notes`
- `has_many :daily_logs`
- `has_many :habit_definitions`

**Validation Rules** (from FR-000):
- `email`: Must be valid Google email format
- `xp_points`: >= 0
- `current_level`: 1-10
- `current_streak`: >= 0

---

### 2. Flashcard

**Purpose**: Represents a single learning card for spaced repetition (FR-001 through FR-009)

**WatermelonDB Table**: `flashcards`

| Field | Type | Required | Index | Description |
|-------|------|----------|-------|-------------|
| id | string (UUID) | Yes | Primary | Flashcard unique identifier |
| user_id | string (FK) | Yes | Yes | Owner reference |
| front_text | string (text) | Yes | No | Question/prompt text |
| back_text | string (text) | Yes | No | Answer/explanation text |
| deck | string | No | Yes | Deck assignment (e.g., "React Concepts") |
| tags | string (JSON array) | Yes | No | Tag names (default: '[]') |
| voice_note_id | string (FK) | No | Yes | Optional attached voice note |
| ease_factor | number (float) | Yes | No | SM-2 ease factor (default: 2.5) |
| interval | number (int) | Yes | No | Days until next review (default: 1) |
| repetitions | number (int) | Yes | No | Number of successful reviews (default: 0) |
| next_review_date | string (ISO date) | Yes | Yes | Next scheduled review (YYYY-MM-DD) |
| last_review_date | string (ISO date) | No | Yes | Last review completion date |
| last_quality_rating | number (int) | No | No | Last rating: 0, 3, 4, or 5 |
| total_reviews | number (int) | Yes | No | Total times reviewed (default: 0) |
| correct_reviews | number (int) | Yes | No | Reviews with quality >= 3 (default: 0) |
| incorrect_reviews | number (int) | Yes | No | Reviews with quality == 0 (default: 0) |
| created_at | timestamp | Yes | No | Card creation time |
| updated_at | timestamp | Yes | Yes | Last modification (for sync) |
| _status | string | Yes | Yes | Sync status |

**Relationships**:
- `belongs_to :user`
- `belongs_to :voice_note (optional)`

**Validation Rules** (from FR-002, FR-004):
- `front_text` and `back_text`: Not empty
- `ease_factor`: >= 1.3, <= 10.0
- `interval`: >= 0
- `repetitions`: >= 0
- `last_quality_rating`: 0, 3, 4, or 5 (when not null)

**Indexes**:
- Composite index on `(user_id, next_review_date)` for efficient review queue queries
- Index on `tags` (JSON array search if supported by SQLite version)

---

### 3. Note

**Purpose**: Represents written study material (FR-010, FR-016)

**WatermelonDB Table**: `notes`

| Field | Type | Required | Index | Description |
|-------|------|----------|-------|-------------|
| id | string (UUID) | Yes | Primary | Note unique identifier |
| user_id | string (FK) | Yes | Yes | Owner reference |
| title | string | Yes | No | Note title |
| content | string (text) | Yes | No | Rich text or markdown content |
| tags | string (JSON array) | Yes | No | Tag names (default: '[]') |
| category | string | No | Yes | Category classification |
| folder | string | No | Yes | Folder assignment for organization |
| voice_note_id | string (FK) | No | Yes | Optional attached voice note |
| is_pinned | boolean | Yes | Yes | Pinned to top of list (default: false) |
| created_at | timestamp | Yes | Yes | Note creation time |
| updated_at | timestamp | Yes | Yes | Last edit time (for sync and sorting) |
| _status | string | Yes | Yes | Sync status |

**Relationships**:
- `belongs_to :user`
- `belongs_to :voice_note (optional)`
- `has_many :memorize_items (source reference)`

**Validation Rules** (from FR-010):
- `title`: Not empty, max 200 characters
- `content`: Not empty

**Full-Text Search**:
- Enable FTS5 virtual table for `title` and `content` fields for global search (FR-015)

---

### 4. Bookmark

**Purpose**: Represents a saved external link (FR-011)

**WatermelonDB Table**: `bookmarks`

| Field | Type | Required | Index | Description |
|-------|------|----------|-------|-------------|
| id | string (UUID) | Yes | Primary | Bookmark unique identifier |
| user_id | string (FK) | Yes | Yes | Owner reference |
| title | string | Yes | No | Bookmark display title |
| url | string | Yes | No | External URL |
| type | string | Yes | Yes | video/article/course/documentation/other |
| tags | string (JSON array) | Yes | No | Tag names (default: '[]') |
| notes | string (text) | No | No | Personal notes about the link |
| created_at | timestamp | Yes | Yes | Bookmark creation time |
| _status | string | Yes | Yes | Sync status |

**Relationships**:
- `belongs_to :user`

**Validation Rules** (from FR-011):
- `title`: Not empty
- `url`: Valid URL format
- `type`: One of ['video', 'article', 'course', 'documentation', 'other']

---

### 5. Video

**Purpose**: Represents uploaded or recorded learning video (FR-012, FR-017)

**WatermelonDB Table**: `videos`

| Field | Type | Required | Index | Description |
|-------|------|----------|-------|-------------|
| id | string (UUID) | Yes | Primary | Video unique identifier |
| user_id | string (FK) | Yes | Yes | Owner reference |
| title | string | Yes | No | Video title |
| description | string (text) | No | No | Video description |
| google_drive_file_id | string | Yes | Yes | Google Drive file reference |
| google_drive_url | string | Yes | No | Playback URL |
| resolution | string | No | No | Video resolution (e.g., "1920x1080") |
| bitrate | number (int) | No | No | Bitrate in bps |
| format | string | No | No | Video codec format (e.g., "h264") |
| duration_seconds | number (int) | Yes | No | Video length in seconds |
| original_size_bytes | number (int) | Yes | No | Original file size before compression |
| compressed_size_bytes | number (int) | Yes | No | Final file size after compression |
| tags | string (JSON array) | Yes | No | Tag names (default: '[]') |
| created_at | timestamp | Yes | Yes | Upload time |
| _status | string | Yes | Yes | Sync status |

**Relationships**:
- `belongs_to :user`

**Validation Rules** (from FR-012, FR-017):
- `title`: Not empty
- `google_drive_file_id`: Not empty
- `duration_seconds`: > 0
- `compressed_size_bytes`: <= original_size_bytes

---

### 6. Voice Note

**Purpose**: Represents audio recording (FR-013)

**WatermelonDB Table**: `voice_notes`

| Field | Type | Required | Index | Description |
|-------|------|----------|-------|-------------|
| id | string (UUID) | Yes | Primary | Voice note unique identifier |
| user_id | string (FK) | Yes | Yes | Owner reference |
| title | string | Yes | No | Voice note title |
| duration_seconds | number (int) | Yes | No | Audio length in seconds |
| google_drive_file_id | string | Yes | Yes | Google Drive file reference |
| google_drive_url | string | Yes | No | Playback URL |
| attachment_type | string | No | Yes | flashcard/note/dailyLog/standalone |
| attached_to_id | string (FK) | No | Yes | Referenced item ID (if attached) |
| tags | string (JSON array) | Yes | No | Tag names (default: '[]') |
| created_at | timestamp | Yes | Yes | Recording time |
| _status | string | Yes | Yes | Sync status |

**Relationships**:
- `belongs_to :user`
- Polymorphic attachment (can belong to flashcard, note, or daily_log)

**Validation Rules** (from FR-013):
- `title`: Not empty
- `google_drive_file_id`: Not empty
- `duration_seconds`: > 0
- `attachment_type`: One of ['flashcard', 'note', 'dailyLog', 'standalone', null]

---

### 7. Memorize Item

**Purpose**: Represents any content registered for spaced repetition review (FR-045 through FR-049)

**WatermelonDB Table**: `memorize_items`

| Field | Type | Required | Index | Description |
|-------|------|----------|-------|-------------|
| id | string (UUID) | Yes | Primary | Memorize item unique identifier |
| user_id | string (FK) | Yes | Yes | Owner reference |
| title | string | Yes | No | Item title |
| content_summary | string (text) | Yes | No | Content summary displayed during review |
| type | string | Yes | Yes | note/concept/vocabulary/custom |
| source_reference_type | string | No | No | Original content type (e.g., "note") |
| source_reference_id | string (FK) | No | Yes | Link to original content |
| tags | string (JSON array) | Yes | No | Tag names (default: '[]') |
| ease_factor | number (float) | Yes | No | SM-2 ease factor (default: 2.5) |
| interval | number (int) | Yes | No | Days until next review (default: 1) |
| repetitions | number (int) | Yes | No | Number of successful reviews (default: 0) |
| next_review_date | string (ISO date) | Yes | Yes | Next scheduled review (YYYY-MM-DD) |
| last_review_date | string (ISO date) | No | Yes | Last review completion date |
| last_quality_rating | number (int) | No | No | Last rating: 0, 3, 4, or 5 |
| created_at | timestamp | Yes | No | Item creation time |
| updated_at | timestamp | Yes | Yes | Last modification (for sync) |
| _status | string | Yes | Yes | Sync status |

**Relationships**:
- `belongs_to :user`
- Polymorphic source reference (can link to note, flashcard, etc.)

**Validation Rules** (from FR-046):
- `title` and `content_summary`: Not empty
- `type`: One of ['note', 'concept', 'vocabulary', 'custom']
- `ease_factor`: >= 1.3, <= 10.0
- `interval`: >= 0
- `last_quality_rating`: 0, 3, 4, or 5 (when not null)

**Indexes**:
- Composite index on `(user_id, next_review_date)`

---

### 8. Daily Log

**Purpose**: Represents a day's learning journal entry (FR-036 through FR-038)

**WatermelonDB Table**: `daily_logs`

| Field | Type | Required | Index | Description |
|-------|------|----------|-------|-------------|
| id | string (UUID) | Yes | Primary | Daily log unique identifier |
| user_id | string (FK) | Yes | Yes | Owner reference |
| date_key | string (YYYY-MM-DD) | Yes | Yes | Date identifier (unique per user+date) |
| learned_text | string (text) | No | No | "What I learned" section |
| challenges_text | string (text) | No | No | "What I struggled with" section |
| plan_text | string (text) | No | No | "Plan for tomorrow" section |
| cards_reviewed_count | number (int) | Yes | No | Auto-generated: cards reviewed today (default: 0) |
| new_cards_count | number (int) | Yes | No | Auto-generated: new cards created today (default: 0) |
| notes_created_count | number (int) | Yes | No | Auto-generated: notes created today (default: 0) |
| study_minutes | number (int) | Yes | No | Auto-generated: total study time in minutes (default: 0) |
| habits_completed_count | number (int) | Yes | No | Auto-generated: habits completed today (default: 0) |
| habits_total_count | number (int) | Yes | No | Auto-generated: total habits defined today (default: 0) |
| linked_items | string (JSON array) | Yes | No | Array of {type, id} refs to related content (default: '[]') |
| created_at | timestamp | Yes | No | Log creation time |
| updated_at | timestamp | Yes | Yes | Last edit time (for sync) |
| _status | string | Yes | Yes | Sync status |

**Relationships**:
- `belongs_to :user`
- References flashcards, notes, videos via `linked_items` JSON

**Validation Rules** (from FR-036, FR-037):
- `date_key`: Format YYYY-MM-DD
- Unique constraint on `(user_id, date_key)`

**Indexes**:
- Composite index on `(user_id, date_key)`

---

### 9. Habit Definition

**Purpose**: Represents a daily habit the user wants to track (FR-024, FR-028)

**WatermelonDB Table**: `habit_definitions`

| Field | Type | Required | Index | Description |
|-------|------|----------|-------|-------------|
| id | string (UUID) | Yes | Primary | Habit unique identifier |
| user_id | string (FK) | Yes | Yes | Owner reference |
| name | string | Yes | No | Habit name (e.g., "Review flashcards") |
| display_order | number (int) | Yes | No | Sort order in habit list (default: 0) |
| is_active | boolean | Yes | Yes | Is habit currently tracked? (default: true) |
| created_at | timestamp | Yes | No | Habit creation time |
| _status | string | Yes | Yes | Sync status |

**Relationships**:
- `belongs_to :user`
- `has_many :habit_log_entries`

**Validation Rules** (from FR-024):
- `name`: Not empty, max 100 characters
- `display_order`: >= 0

**Indexes**:
- Composite index on `(user_id, is_active, display_order)` for sorted active habits query

---

### 10. Habit Log Entry

**Purpose**: Represents daily habit completion status (FR-025, FR-026)

**WatermelonDB Table**: `habit_log_entries`

| Field | Type | Required | Index | Description |
|-------|------|----------|-------|-------------|
| id | string (UUID) | Yes | Primary | Log entry unique identifier |
| user_id | string (FK) | Yes | Yes | Owner reference |
| date_key | string (YYYY-MM-DD) | Yes | Yes | Date identifier |
| habit_completions | string (JSON object) | Yes | No | Map of habit_id -> boolean completion status |
| created_at | timestamp | Yes | No | Entry creation time |
| updated_at | timestamp | Yes | Yes | Last update (for sync) |
| _status | string | Yes | Yes | Sync status |

**Relationships**:
- `belongs_to :user`
- References `habit_definitions` via `habit_completions` JSON keys

**Validation Rules** (from FR-025):
- `date_key`: Format YYYY-MM-DD
- Unique constraint on `(user_id, date_key)`
- `habit_completions`: JSON object with habit IDs as keys, boolean values

**Indexes**:
- Composite index on `(user_id, date_key)`

**JSON Structure Example**:
```json
{
  "habit_id_1": true,
  "habit_id_2": false,
  "habit_id_3": true
}
```

---

### 11. Daily Progress

**Purpose**: Represents aggregated daily statistics (FR-018 through FR-023)

**WatermelonDB Table**: `daily_progress`

| Field | Type | Required | Index | Description |
|-------|------|----------|-------|-------------|
| id | string (UUID) | Yes | Primary | Progress record unique identifier |
| user_id | string (FK) | Yes | Yes | Owner reference |
| date_key | string (YYYY-MM-DD) | Yes | Yes | Date identifier (unique per user+date) |
| cards_reviewed_count | number (int) | Yes | No | Total flashcards reviewed today (default: 0) |
| cards_correct_count | number (int) | Yes | No | Flashcards rated >= 3 (default: 0) |
| cards_incorrect_count | number (int) | Yes | No | Flashcards rated == 0 (default: 0) |
| new_cards_count | number (int) | Yes | No | New flashcards created today (default: 0) |
| notes_created_count | number (int) | Yes | No | Notes created today (default: 0) |
| videos_added_count | number (int) | Yes | No | Videos uploaded today (default: 0) |
| voice_notes_count | number (int) | Yes | No | Voice notes recorded today (default: 0) |
| bookmarks_added_count | number (int) | Yes | No | Bookmarks saved today (default: 0) |
| study_minutes | number (int) | Yes | No | Total study time in minutes (default: 0) |
| xp_earned | number (int) | Yes | No | XP points earned today (default: 0) |
| habits_completed_count | number (int) | Yes | No | Habits completed today (default: 0) |
| habits_total_count | number (int) | Yes | No | Total active habits today (default: 0) |
| created_at | timestamp | Yes | No | Record creation time |
| updated_at | timestamp | Yes | Yes | Last update (for sync) |
| _status | string | Yes | Yes | Sync status |

**Relationships**:
- `belongs_to :user`

**Validation Rules** (from FR-018):
- `date_key`: Format YYYY-MM-DD
- Unique constraint on `(user_id, date_key)`
- All count fields: >= 0

**Indexes**:
- Composite index on `(user_id, date_key)` for calendar queries
- Index on `date_key` for weekly/monthly aggregations

---

### 12. Weekly Summary

**Purpose**: Represents auto-generated weekly insights (FR-034, FR-035)

**WatermelonDB Table**: `weekly_summaries`

| Field | Type | Required | Index | Description |
|-------|------|----------|-------|-------------|
| id | string (UUID) | Yes | Primary | Summary unique identifier |
| user_id | string (FK) | Yes | Yes | Owner reference |
| week_key | string (YYYY-Www) | Yes | Yes | ISO week identifier (e.g., "2026-W05") |
| total_cards_reviewed | number (int) | Yes | No | Sum of cards reviewed this week (default: 0) |
| new_cards_learned | number (int) | Yes | No | Sum of new cards this week (default: 0) |
| most_forgotten_card_ids | string (JSON array) | Yes | No | Array of flashcard IDs with quality==0 (default: '[]') |
| total_study_minutes | number (int) | Yes | No | Sum of study time this week (default: 0) |
| streak_days | number (int) | Yes | No | Days with activity this week (0-7) (default: 0) |
| habit_completion_rate | number (float) | Yes | No | Percentage 0-100 (default: 0) |
| xp_earned | number (int) | Yes | No | Total XP earned this week (default: 0) |
| cards_reviewed_diff | number (int) | Yes | No | Difference vs previous week (can be negative) (default: 0) |
| study_time_diff | number (int) | Yes | No | Difference in minutes vs previous week (default: 0) |
| trend | string | Yes | No | improved/declined/stable (default: "stable") |
| generated_at | timestamp | Yes | No | Summary generation time |
| _status | string | Yes | Yes | Sync status |

**Relationships**:
- `belongs_to :user`

**Validation Rules** (from FR-034):
- `week_key`: Format YYYY-Www (ISO 8601 week format)
- Unique constraint on `(user_id, week_key)`
- `streak_days`: 0-7
- `habit_completion_rate`: 0-100
- `trend`: One of ['improved', 'declined', 'stable']

**Indexes**:
- Composite index on `(user_id, week_key)` for historical summaries

---

### 13. Tag

**Purpose**: Represents a category label applied across all content types (FR-014, FR-015)

**WatermelonDB Table**: `tags`

| Field | Type | Required | Index | Description |
|-------|------|----------|-------|-------------|
| id | string (UUID) | Yes | Primary | Tag unique identifier |
| user_id | string (FK) | Yes | Yes | Owner reference |
| name | string | Yes | Yes | Tag name (e.g., "React Hooks") |
| count | number (int) | Yes | No | Total items with this tag (default: 0) |
| last_used_at | timestamp | Yes | Yes | Most recent usage (for sorting/suggestions) |
| _status | string | Yes | Yes | Sync status |

**Relationships**:
- `belongs_to :user`
- Referenced by flashcards, notes, bookmarks, videos, voice_notes, memorize_items via JSON arrays

**Validation Rules** (from FR-014):
- `name`: Not empty, max 50 characters
- Unique constraint on `(user_id, name)` (case-insensitive)
- `count`: >= 0

**Indexes**:
- Composite index on `(user_id, count DESC)` for frequently used tags query
- Composite index on `(user_id, last_used_at DESC)` for recent tags query

---

### 14. User Settings

**Purpose**: Represents user preferences (FR-056)

**WatermelonDB Table**: `user_settings`

| Field | Type | Required | Index | Description |
|-------|------|----------|-------|-------------|
| id | string (UUID) | Yes | Primary | Settings record unique identifier |
| user_id | string (FK) | Yes | Yes | Owner reference (one-to-one) |
| theme | string | Yes | No | light/dark/system (default: "system") |
| notifications_enabled | boolean | Yes | No | Global notifications toggle (default: true) |
| daily_reminder_time | string (HH:mm) | Yes | No | Time for daily review reminder (default: "09:00") |
| habit_reminder_time | string (HH:mm) | Yes | No | Time for habit reminders (default: "20:00") |
| weekly_summary_day | string | Yes | No | Day for weekly summary (default: "sunday") |
| created_at | timestamp | Yes | No | Settings creation time |
| updated_at | timestamp | Yes | Yes | Last update (for sync) |
| _status | string | Yes | Yes | Sync status |

**Relationships**:
- `belongs_to :user` (one-to-one relationship)

**Validation Rules** (from FR-056):
- Unique constraint on `user_id` (one settings record per user)
- `theme`: One of ['light', 'dark', 'system']
- `daily_reminder_time` and `habit_reminder_time`: Format HH:mm (24-hour)
- `weekly_summary_day`: One of ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

**Indexes**:
- Unique index on `user_id`

---

## Relationships Summary

```text
User (1) ──< (many) Flashcard
User (1) ──< (many) Note
User (1) ──< (many) Bookmark
User (1) ──< (many) Video
User (1) ──< (many) VoiceNote
User (1) ──< (many) MemorizeItem
User (1) ──< (many) DailyLog
User (1) ──< (many) HabitDefinition
User (1) ──< (many) HabitLogEntry
User (1) ──< (many) DailyProgress
User (1) ──< (many) WeeklySummary
User (1) ──< (many) Tag
User (1) ─── (one) UserSettings

Flashcard (many) ──> (1 optional) VoiceNote
Note (many) ──> (1 optional) VoiceNote
DailyLog (many) ──> (1 optional) VoiceNote

MemorizeItem (many) ──> (1 optional) Note (polymorphic source)
MemorizeItem (many) ──> (1 optional) Flashcard (polymorphic source)

HabitLogEntry (1) references (many) HabitDefinition via JSON
DailyLog (1) references (many) {Flashcard, Note, Video} via JSON
```

## Indexes for Performance

**Critical Query Patterns**:
1. **Review Queue**: `SELECT * FROM flashcards WHERE user_id = ? AND next_review_date <= ? ORDER BY next_review_date`
   - Index: `(user_id, next_review_date)`

2. **Calendar View**: `SELECT * FROM daily_progress WHERE user_id = ? AND date_key BETWEEN ? AND ? ORDER BY date_key`
   - Index: `(user_id, date_key)`

3. **Tag Search**: `SELECT * FROM flashcards WHERE user_id = ? AND tags LIKE ?`
   - Requires JSON_EACH for array search or full-text index

4. **Recent Content**: `SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC LIMIT 10`
   - Index: `(user_id, updated_at DESC)`

## Sync Strategy

**Firebase Realtime Database Structure**:
```text
/users/{userId}/
  /profile/              # User entity
  /flashcards/{cardId}/  # Flashcard entities
  /notes/{noteId}/       # Note entities
  /bookmarks/{bookmarkId}/
  /videos/{videoId}/
  /voice_notes/{voiceNoteId}/
  /memorize_items/{itemId}/
  /daily_logs/{dateKey}/
  /habit_definitions/{habitId}/
  /habit_log_entries/{dateKey}/
  /daily_progress/{dateKey}/
  /weekly_summaries/{weekKey}/
  /tags/{tagId}/
  /settings/             # UserSettings entity
```

**Sync Conflict Resolution** (from spec edge cases):
- **Strategy**: Last-write-wins using `updated_at` timestamp
- **Special Cases**:
  - Review history: Merge (preserve all reviews, don't overwrite)
  - Habit completions: Merge (union of completed habits from both devices)
  - XP and streaks: Use server value as source of truth

**Offline Queue**:
- Write operations queued in local `pending_syncs` table
- Processed on connectivity restoration
- Deleted successfully synced records

## Data Migration Considerations

**Assumptions** (from spec):
- Initial user base: hundreds to low thousands
- Manual data migration acceptable if schema changes needed
- No complex migration tooling required for MVP

**Future Scalability**:
- Add compound indexes as query patterns emerge
- Consider partitioning `daily_progress` by year for historical data
- Implement data archival for logs older than 2 years

---

**Next Steps**: Proceed to API contracts definition (Firebase operations, Google Drive API calls).
