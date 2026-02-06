# Feature Specification: BrainLog — Personal Learning & Development Tracker

**Feature Branch**: `001-brainlog-app`
**Created**: 2026-02-03
**Status**: Draft
**Input**: User description: "Build a personal learning & development tracker mobile app for developers who want to track daily learning progress, memorize vocabulary and concepts, manage study materials (videos, notes, bookmarks), and build consistent learning habits."

## Clarifications

### Session 2026-02-03

- Q: What authentication method should the app support? → A: Google Sign-in only (single OAuth provider enabling both user authentication and Google Drive API access for media storage)
- Q: What data retention policy should apply when users delete their account? → A: Immediate permanent deletion (all user data including profile, flashcards, notes, and media files permanently removed upon account deletion with no recovery option)
- Q: How should the system handle errors and communicate them to users? → A: Basic error messages (display simple user-friendly messages, log errors locally, allow manual retry for failed operations)
- Q: Should the app support accessibility features for users with disabilities? → A: Basic accessibility (support device text size settings, use semantic labels for screen readers, ensure color contrast, support standard device accessibility features)
- Q: Should the app support multiple languages or remain English-only? → A: English-only for MVP (all UI text in English, faster development and testing, users can create content in any language, localization deferred to future releases)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Spaced Repetition Learning System (Priority: P1)

A developer wants to memorize new programming concepts, English vocabulary, and technical terms using scientifically-proven spaced repetition. They create flashcards with questions on the front and answers on the back, review them daily, and rate their recall quality. The system automatically schedules future reviews based on how well they remembered each card, ensuring optimal long-term retention.

**Why this priority**: This is the core value proposition of the app. Spaced repetition is scientifically proven to enhance long-term memory retention, making it the most critical feature for learning effectiveness.

**Independent Test**: Can be fully tested by creating a set of flashcards, reviewing them over multiple sessions, and verifying that review intervals increase correctly based on recall performance. Delivers immediate value as a standalone learning tool.

**Acceptance Scenarios**:

1. **Given** a user has created flashcards with front and back content, **When** they start a review session, **Then** they see each due card one at a time with the front side displayed first
2. **Given** a user is reviewing a flashcard, **When** they tap to reveal the answer, **Then** they see four rating buttons (Again, Hard, Good, Easy) with next review intervals displayed
3. **Given** a user rates a card as "Good", **When** they complete the review, **Then** the next review date is calculated using spaced repetition algorithm (1 day for first review, 6 days for second, then exponentially increasing)
4. **Given** a user rates a card as "Again", **When** they complete the review, **Then** the card is reset to appear again tomorrow
5. **Given** multiple cards are due for review, **When** the user opens the app, **Then** they see a count of cards due and can start a review session
6. **Given** a user completes a review session, **When** they view card statistics, **Then** they see total reviews, correct/incorrect counts, and current ease factor for each card

---

### User Story 2 - Content Organization & Knowledge Management (Priority: P1)

A learner wants to organize all their study materials in one place: notes about what they're learning, bookmarks to useful articles and videos, uploaded learning videos, and voice recordings of pronunciation practice. They can tag everything with consistent categories (like "React", "English", "Clean Architecture"), search across all content types at once, and quickly find related materials.

**Why this priority**: Without a way to organize and retrieve study materials, the learning experience becomes chaotic. This is essential infrastructure that supports all other features.

**Independent Test**: Can be fully tested by creating various content types (notes, bookmarks, voice notes), tagging them with categories, performing searches, and verifying all related content is found. Delivers immediate organizational value.

**Acceptance Scenarios**:

1. **Given** a user wants to save study material, **When** they create a note with rich text formatting, **Then** the note is saved with tags and can be searched later
2. **Given** a user finds a useful article online, **When** they save the bookmark with a URL and tags, **Then** it's stored and accessible from the bookmarks section
3. **Given** a user wants to practice pronunciation, **When** they record a voice note and attach it to a flashcard, **Then** the audio can be played back during reviews
4. **Given** a user has multiple types of content tagged "React Hooks", **When** they search for that tag, **Then** they see all flashcards, notes, bookmarks, and videos related to React Hooks
5. **Given** a user wants to organize notes, **When** they create folders and assign categories, **Then** notes can be filtered and browsed by folder or category
6. **Given** a user uploads a learning video, **When** the video is compressed and stored, **Then** metadata (title, description, tags, quality info) is saved and the video can be streamed

---

### User Story 3 - Daily Learning Dashboard & Progress Tracking (Priority: P2)

A learner opens the app each morning and immediately sees their current learning status: cards due for review, daily habits checklist, their current streak count, XP level, a mini activity chart for the week, and quick action buttons to add new content. They can complete their daily learning routine efficiently and stay motivated by seeing their progress.

**Why this priority**: The dashboard creates a consistent daily ritual and provides motivation through visible progress. It's the entry point that drives daily engagement, but the core learning features (P1) must exist first.

**Independent Test**: Can be fully tested by logging in daily, checking the dashboard displays correct counts, completing habits, and verifying streak/XP calculations. Delivers value as a motivational hub once content exists.

**Acceptance Scenarios**:

1. **Given** a user has flashcards due for review, **When** they open the app, **Then** the dashboard shows the count of due cards and a "Start Review" button
2. **Given** a user has defined daily habits, **When** they view the dashboard, **Then** they see a checklist of today's habits with completion status
3. **Given** a user has been active for consecutive days, **When** they view the dashboard, **Then** they see their current streak count with a fire icon
4. **Given** a user performs learning activities, **When** they check their XP progress, **Then** they see their current level, total XP, and progress to the next level
5. **Given** a user has completed activities throughout the week, **When** they view the mini activity chart, **Then** they see a visual bar chart showing daily activity levels
6. **Given** a user recently edited content, **When** they view the dashboard, **Then** they see a "Continue where you left off" section with the last item they worked on

---

### User Story 4 - Learning Calendar & Historical Insights (Priority: P2)

A learner wants to review their learning history to understand their patterns and stay accountable. They can view a calendar showing which days they were active (like a GitHub contribution graph), tap any date to see exactly what they accomplished that day (cards reviewed, notes created, study time), and reflect on their progress over time.

**Why this priority**: Historical tracking provides accountability and insights but depends on having learning data first (P1). It enhances motivation but isn't essential for the core learning loop.

**Independent Test**: Can be fully tested by performing learning activities over multiple days, then viewing the calendar to verify accurate historical data is displayed. Delivers value as a reflection and accountability tool.

**Acceptance Scenarios**:

1. **Given** a user has completed learning activities across multiple days, **When** they view the calendar, **Then** each day is color-coded by activity level (green=active, yellow=partial, red=missed, gray=no data)
2. **Given** a user taps on a specific date, **When** they view the day detail, **Then** they see cards reviewed with results, notes created, videos watched, habits completed, and total study time
3. **Given** a user wants to navigate history, **When** they use month navigation controls, **Then** they can move backward and forward through months
4. **Given** it's the current day, **When** the user views the calendar, **Then** today's date is highlighted with a clear indicator
5. **Given** a user has maintained a streak, **When** they view the calendar, **Then** consecutive active days are visually connected to show the streak
6. **Given** a user views their daily learning log for a specific date, **When** they access the log, **Then** they see their written reflections (what they learned, challenges faced, plans for tomorrow) along with auto-generated statistics

---

### User Story 5 - Habit Formation & Consistency Tracking (Priority: P2)

A learner wants to build consistent daily learning habits. They define simple daily habits (like "Review flashcards", "Read English 15 min", "Practice coding", "Write daily log"), check them off each day, and track their completion rate over time with a visual habit grid showing weekly and monthly consistency patterns.

**Why this priority**: Habit tracking drives long-term behavior change but requires existing learning activities to track. It complements the core learning features rather than enabling them.

**Independent Test**: Can be fully tested by creating habits, checking them off daily, and verifying the habit grid displays accurate completion patterns. Delivers value as a consistency tool once learning activities are established.

**Acceptance Scenarios**:

1. **Given** a user wants to establish daily routines, **When** they create a new habit with a name, **Then** it appears in their daily habits list
2. **Given** a user has active habits, **When** they complete one today, **Then** they can check it off and the completion is recorded
3. **Given** a user has habits for the current week, **When** they view the habit grid, **Then** they see a matrix showing each habit's completion status for each day of the week
4. **Given** a user views habit consistency, **When** they check their weekly completion rate, **Then** they see the percentage of habits completed this week
5. **Given** a user wants to adjust their routines, **When** they edit or delete a habit, **Then** the changes take effect immediately without affecting historical data
6. **Given** a user has habits visible on the dashboard, **When** incomplete habits remain at end of day, **Then** a reminder notification is sent at the user-configured time

---

### User Story 6 - Automated Weekly Learning Insights (Priority: P3)

A learner receives an automatically generated weekly summary every Sunday evening showing their total cards reviewed, new words learned, most forgotten cards that need extra attention, total study time, streak status, comparison with the previous week, and habits completion rate. This helps them understand their learning patterns and adjust their strategy.

**Why this priority**: Weekly summaries provide valuable insights but are not essential for core learning functionality. They enhance the experience once users have established regular learning patterns.

**Independent Test**: Can be fully tested by completing learning activities for a week, then verifying the weekly summary generates correctly with accurate statistics. Delivers value as an analytical and reflective tool.

**Acceptance Scenarios**:

1. **Given** a week of learning activities has completed, **When** the weekly summary is generated, **Then** it includes total cards reviewed, new cards learned, and total study time
2. **Given** certain cards were forgotten multiple times, **When** viewing the weekly summary, **Then** the "Most Forgotten Cards" section lists cards that need extra attention
3. **Given** previous week data exists, **When** viewing the current week's summary, **Then** comparison metrics show improvement or decline percentages
4. **Given** the user has maintained a streak, **When** viewing the weekly summary, **Then** the current streak count and any streak milestones achieved are displayed
5. **Given** the user has defined habits, **When** viewing the weekly summary, **Then** the habit completion rate percentage is shown
6. **Given** it's Sunday evening, **When** the weekly summary is ready, **Then** a push notification alerts the user to review their weekly highlights

---

### User Story 7 - Gamification & Achievement System (Priority: P3)

A learner stays motivated through a gamification system where they earn XP points for completing learning activities (reviewing cards, creating notes, writing daily logs), level up as they accumulate XP, unlock badges for achievements (first 10 cards, 7-day streak, 100 cards reviewed), and see celebration animations when reaching milestones.

**Why this priority**: Gamification enhances motivation but is not required for core learning functionality. Users can learn effectively without badges and XP, making this a nice-to-have enhancement.

**Independent Test**: Can be fully tested by performing various learning activities, verifying XP is awarded correctly, checking level progression, and confirming badges are unlocked at appropriate milestones. Delivers value as a motivational layer.

**Acceptance Scenarios**:

1. **Given** a user completes learning activities, **When** they review one flashcard, **Then** they earn 5 XP
2. **Given** a user accumulates XP, **When** they reach the XP threshold for the next level, **Then** they level up and see a celebration animation
3. **Given** a user completes specific milestones, **When** they create their first 10 flashcards, **Then** they unlock the "First Steps" badge
4. **Given** a user maintains consistency, **When** they achieve a 7-day streak, **Then** they unlock the "Week Warrior" badge and receive a 100 XP bonus
5. **Given** a user views their profile, **When** they check their badges section, **Then** they see earned badges in color and locked badges in gray
6. **Given** a user has streak freeze available, **When** they miss a day but use the streak freeze option, **Then** their streak is preserved (limited to once per week)

---

### User Story 8 - Memorize System for Multi-Content Review (Priority: P3)

A learner wants to apply spaced repetition not just to flashcards but to any content they're studying. When they study a note about a programming concept, watch a video about a topic, or learn a new vocabulary word, they can register it in the memorize system. The system schedules reviews for all types of content using the same spaced repetition algorithm, showing them recall rating buttons during review sessions.

**Why this priority**: While valuable for comprehensive learning, this extends the core flashcard system rather than being essential to it. Users can learn effectively with just flashcards initially.

**Independent Test**: Can be fully tested by creating various content types, registering them in the memorize system, reviewing them over time, and verifying the spaced repetition algorithm schedules reviews correctly. Delivers value as a unified review system.

**Acceptance Scenarios**:

1. **Given** a user studies a note, **When** they register it in the memorize system, **Then** it's scheduled for review using the spaced repetition algorithm
2. **Given** a user has memorize items due, **When** they start a review session, **Then** they see each item one at a time with content summary and source reference
3. **Given** a user reviews a memorize item, **When** they rate their recall, **Then** the next review date is calculated based on the same SM-2 algorithm used for flashcards
4. **Given** a user receives daily reminders, **When** items are due for review, **Then** a push notification shows "You have X items to review today"
5. **Given** a user tracks mastery, **When** they view memorize statistics, **Then** they see what percentage of items they've mastered (items with long intervals)
6. **Given** a user wants to link learning, **When** they create a memorize item, **Then** they can include a source reference linking back to the original note or flashcard

---

### Edge Cases

- **What happens when a user misses multiple days of reviews?** The system should accumulate due cards without overwhelming the user. Display the total count but allow them to review in manageable batches (e.g., 20 cards per session). Older due cards should appear first.

- **What happens when a user tries to upload a very large video?** The system should validate file size before upload, display compression options with size reduction estimates, and show progress during both compression and upload. If the compressed file is still too large, provide clear guidance on size limits.

- **What happens when a user has no internet connection?** The app should allow offline access to flashcards, notes, and review sessions. Changes made offline should be queued and automatically synced when connectivity is restored. Display a clear offline indicator in the UI.

- **What happens when a user tries to delete content that has associated data?** Display a confirmation dialog explaining what will be deleted (e.g., "Deleting this note will also remove 3 associated memorize items and 2 voice notes. This cannot be undone."). Require explicit confirmation before deletion.

- **What happens when a user's streak is about to break?** Send a reminder notification in the evening (8 PM) if the user hasn't completed any learning activities that day. Offer the option to use a streak freeze (limited to once per week).

- **What happens when two devices sync conflicting data?** Implement last-write-wins conflict resolution with timestamps. For critical data (like review history), prefer merging rather than overwriting. Display a sync status indicator to show when data is being synchronized.

- **What happens when a user searches but no results are found?** Display a helpful message like "No results found for '[query]'" along with suggestions like "Try different keywords" or "Check your spelling". Optionally suggest creating new content based on the search query.

- **What happens when a user has hundreds of tags?** Implement tag autocomplete with suggestions as they type. Show frequently used tags first. Allow merging duplicate tags and cleaning up unused tags through a tag management screen.

- **What happens when notifications are disabled by the user?** Respect the user's notification preferences and display an in-app indicator for due reviews instead. When the user opens the app, prominently show any missed review reminders.

- **What happens when a user wants to change their daily reminder time?** Allow customization through settings. When changed, reschedule all pending notifications to the new time. Show a preview of when the next reminder will occur.

## Requirements *(mandatory)*

### Functional Requirements

**Authentication & Account Management:**
- **FR-000**: System MUST authenticate users exclusively via Google Sign-in (OAuth 2.0), which also provides authorized access to Google Drive API for storing user media files (videos, voice notes)
- **FR-000a**: System MUST maintain user session across app restarts until explicit logout
- **FR-000b**: System MUST allow users to log out, which clears local session and cached credentials
- **FR-000c**: System MUST provide account deletion functionality that immediately and permanently removes all user data including: profile information, flashcards, notes, bookmarks, videos, voice notes, daily logs, habits, progress history, and weekly summaries
- **FR-000d**: System MUST display a confirmation dialog before account deletion warning that "All your data will be permanently deleted and cannot be recovered"
- **FR-000e**: System MUST delete all user media files from external cloud storage (Google Drive) as part of account deletion process
- **FR-000f**: System MUST display user-friendly error messages when operations fail (e.g., "Unable to sync. Check your connection." for network failures, "Unable to save flashcard. Please try again." for storage errors)
- **FR-000g**: System MUST log all errors locally for debugging purposes with sufficient context (timestamp, operation type, error details)
- **FR-000h**: System MUST provide manual retry options for failed operations (e.g., retry button on sync failures, retry button on save failures)
- **FR-000i**: System MUST respect device system text size settings allowing users to increase or decrease text size across the entire app
- **FR-000j**: System MUST use semantic labels for all interactive UI components to support screen reader navigation
- **FR-000k**: System MUST maintain minimum color contrast ratios for text and interactive elements to ensure readability
- **FR-000l**: System MUST support standard device accessibility features (VoiceOver on iOS, TalkBack on Android)

**Core Learning & Spaced Repetition:**
- **FR-001**: System MUST allow users to create flashcards with front (question) and back (answer) text content
- **FR-002**: System MUST implement the SM-2 spaced repetition algorithm with the following parameters: initial ease factor 2.5, minimum ease factor 1.3, first interval 1 day, second interval 6 days, subsequent intervals calculated as previous interval × ease factor
- **FR-003**: System MUST present flashcards for review in a one-at-a-time format showing front side first, then revealing back side on user interaction
- **FR-004**: System MUST provide four recall quality rating options during review: Again (quality 0), Hard (quality 3), Good (quality 4), Easy (quality 5)
- **FR-005**: System MUST display the next review interval estimate for each rating option before the user selects it
- **FR-006**: System MUST calculate and store the next review date for each flashcard based on the selected quality rating
- **FR-007**: System MUST track statistics for each flashcard including total reviews, correct reviews, incorrect reviews, current ease factor, and current interval
- **FR-008**: System MUST queue flashcards for review when their next review date is today or earlier
- **FR-009**: System MUST allow users to organize flashcards into decks and tag them with multiple categories

**Content Management:**
- **FR-010**: System MUST allow users to create and edit notes with rich text formatting (bold, italic, headings, lists) or markdown
- **FR-011**: System MUST allow users to save external links as bookmarks with metadata (title, URL, type, tags, personal notes)
- **FR-012**: System MUST support uploading or recording videos, compressing them to reduce file size while maintaining format, and storing them for streaming playback
- **FR-013**: System MUST allow users to record voice notes and attach them to flashcards, notes, or daily log entries
- **FR-014**: System MUST implement a unified tagging system where a single tag (e.g., "React Hooks") can be applied across all content types (flashcards, notes, bookmarks, videos, voice notes)
- **FR-015**: System MUST provide a global search that searches across all content types simultaneously and groups results by type
- **FR-016**: System MUST allow users to organize notes into folders and categories
- **FR-017**: System MUST display metadata for uploaded videos including resolution, bitrate, file size, original size, compressed size, and duration

**Progress & Tracking:**
- **FR-018**: System MUST track daily statistics including cards reviewed, cards learned (new), notes created, videos watched, voice notes recorded, and study time
- **FR-019**: System MUST calculate and display a consecutive day streak counter based on daily activity
- **FR-020**: System MUST provide a calendar view showing daily activity levels color-coded by intensity
- **FR-021**: System MUST allow users to view detailed statistics for any past date including specific actions taken that day
- **FR-022**: System MUST generate weekly progress visualizations showing activity patterns across days of the week
- **FR-023**: System MUST calculate and display retention rate (percentage of correctly recalled flashcards)

**Habits & Daily Rituals:**
- **FR-024**: System MUST allow users to define daily habits with custom names
- **FR-025**: System MUST allow users to check off completed habits each day
- **FR-026**: System MUST display a habit consistency grid showing completion status for each habit across days of the week
- **FR-027**: System MUST calculate and display weekly and monthly habit completion rates
- **FR-028**: System MUST allow users to reorder, edit, or deactivate habits without affecting historical data

**Dashboard & User Interface:**
- **FR-029**: System MUST provide a dashboard displaying: count of cards due for review, daily habits checklist, current streak count, current XP level, mini weekly activity chart, and recently edited content
- **FR-030**: System MUST provide quick action buttons for common tasks (create flashcard, create note, save bookmark, record voice note)
- **FR-031**: System MUST display personalized greetings based on time of day (e.g., "Good morning, [Name]")
- **FR-032**: System MUST support light mode and dark mode themes with user-selectable or system-preference-based switching
- **FR-033**: System MUST provide offline access to flashcards and notes with automatic sync when connectivity is restored

**Insights & Analytics:**
- **FR-034**: System MUST generate weekly summaries every Sunday including: total cards reviewed, new cards learned, most forgotten cards, total study time, streak status, comparison with previous week, and habits completion rate
- **FR-035**: System MUST send push notifications for weekly summary availability
- **FR-036**: System MUST allow users to write daily learning log entries with free-text sections for: what they learned, challenges faced, and plans for tomorrow
- **FR-037**: System MUST auto-populate daily log summaries with statistics: cards reviewed, notes created, study time, and habits completed
- **FR-038**: System MUST allow users to link daily log entries to specific flashcards, notes, or videos from that day

**Gamification:**
- **FR-039**: System MUST award XP points for learning activities: 5 XP per flashcard review, 3 XP per new flashcard, 10 XP per note created, 20 XP per daily log entry, 25 XP for completing all habits, 15 XP per video upload, 10 XP per voice note, 2 XP per bookmark
- **FR-040**: System MUST implement a leveling system with 10 levels requiring progressively more XP (Level 1: 0 XP, Level 2: 100 XP, Level 3: 300 XP, Level 4: 600 XP, Level 5: 1,000 XP, Level 6: 1,500 XP, Level 7: 2,500 XP, Level 8: 4,000 XP, Level 9: 6,000 XP, Level 10: 10,000 XP)
- **FR-041**: System MUST award badges for achievements including: first flashcard created, 100 flashcards created, 7-day streak, 30-day streak, 100-day streak, first video uploaded, 100% habit completion for 7 days, 50 cards with interval > 30 days
- **FR-042**: System MUST provide bonus XP for streak milestones (100 XP for 7-day streak, 500 XP for 30-day streak)
- **FR-043**: System MUST display celebration animations when users level up or earn badges
- **FR-044**: System MUST allow users to use a streak freeze once per week to preserve their streak if they miss a day

**Memorize System:**
- **FR-045**: System MUST allow users to register any content (notes, concepts, vocabulary) into the memorize system for spaced repetition review
- **FR-046**: System MUST apply the same SM-2 spaced repetition algorithm to memorize items as used for flashcards
- **FR-047**: System MUST allow users to include source references when creating memorize items (linking back to original notes or flashcards)
- **FR-048**: System MUST display memorize items during review sessions with content summary and recall rating buttons
- **FR-049**: System MUST track mastery percentage showing what portion of memorize items have achieved long intervals

**Notifications & Reminders:**
- **FR-050**: System MUST send daily review reminders at user-configured time (default 9 AM) showing count of items due
- **FR-051**: System MUST send streak warning notifications at 8 PM if user has not completed any learning activities that day
- **FR-052**: System MUST send weekly summary ready notifications on Sunday evening
- **FR-053**: System MUST send habit reminder notifications for incomplete habits at user-configured time
- **FR-054**: System MUST send immediate notifications for milestone achievements (badges earned, level ups)
- **FR-055**: System MUST send notifications for streak milestones (7 days, 30 days, 100 days)
- **FR-056**: System MUST allow users to enable/disable notifications and customize reminder times through settings

**Data & Storage:**
- **FR-057**: System MUST store metadata for all content types (text, JSON, references) in a real-time database
- **FR-058**: System MUST store large files (videos, voice notes, images) in external cloud storage and reference them via metadata
- **FR-059**: System MUST use ISO format for all timestamps consistently across all collections
- **FR-060**: System MUST cache flashcards and notes locally for offline access
- **FR-061**: System MUST queue offline changes and automatically sync when connectivity is restored
- **FR-062**: System MUST display an offline indicator when the app is not connected to the internet

### Key Entities

- **User Profile**: Represents a learner using the app with attributes including name, email, avatar URL, XP points, current level, current streak count, longest streak count, last active date, streak freeze status, and earned badges collection

- **Flashcard**: Represents a single learning card with attributes including front text (question/prompt), back text (answer/explanation), deck assignment, tags array, optional voice note reference, SM-2 algorithm parameters (ease factor, interval, repetitions, next review date, last review date, last quality rating), statistics (total reviews, correct reviews, incorrect reviews), and timestamps (created, updated)

- **Note**: Represents written study material with attributes including title, rich text or markdown content, tags array, category, optional folder assignment, optional voice note reference, pinned status, and timestamps (created, updated)

- **Bookmark**: Represents a saved external link with attributes including title, URL, type (video/article/course/documentation/other), tags array, personal notes text, and created timestamp

- **Video**: Represents uploaded or recorded learning video with attributes including title, description, external storage reference (file ID, URL), quality information (resolution, bitrate, format, duration), size information (original bytes, compressed bytes), tags array, and created timestamp

- **Voice Note**: Represents audio recording with attributes including title, duration in seconds, external storage reference (file ID, URL), attachment information (type: flashcard/note/dailyLog/standalone, referenced item ID), tags array, and created timestamp

- **Memorize Item**: Represents any content registered for spaced repetition review with attributes including title, content summary, type (note/concept/vocabulary/custom), optional source reference (link to original content), tags array, SM-2 algorithm parameters (ease factor, interval, repetitions, next review date, last review date, last quality rating), and created timestamp

- **Daily Log**: Represents a day's learning journal entry with attributes including date key (YYYY-MM-DD), learned text (what I learned), challenges text (what I struggled with), plan text (plan for tomorrow), auto-generated summary (cards reviewed, new cards created, notes created, study minutes, habits completed, habits total), linked items array (references to notes/cards/videos), and timestamps (created, updated)

- **Habit Definition**: Represents a daily habit the user wants to track with attributes including name, display order, active status, and created timestamp

- **Habit Log Entry**: Represents daily habit completion status with attributes including date key (YYYY-MM-DD) and completion boolean for each habit ID

- **Daily Progress**: Represents aggregated daily statistics with attributes including date key (YYYY-MM-DD), cards reviewed count, cards correct count, cards incorrect count, new cards learned count, notes created count, videos added count, voice notes recorded count, bookmarks added count, study minutes, XP earned, habits completed count, and habits total count

- **Weekly Summary**: Represents auto-generated weekly insights with attributes including week key (YYYY-Www), total cards reviewed, new cards learned count, most forgotten cards array (card IDs), total study minutes, streak days count, habit completion rate percentage, XP earned, comparison with previous week (cards reviewed difference, study time difference, trend: improved/declined/stable), and generated timestamp

- **Tag**: Represents a category label that can be applied across all content types with attributes including tag name (key), count (total items with this tag), and last used timestamp

- **User Settings**: Represents user preferences with attributes including theme (light/dark/system), notifications enabled boolean, daily reminder time (HH:mm format), and weekly review day (sunday/monday/etc.)

## Success Criteria *(mandatory)*

### Measurable Outcomes

**Learning Effectiveness:**
- **SC-001**: Users can create and review flashcards with spaced repetition, and the system correctly schedules next reviews (1 day for first review, 6 days for second review, then exponentially based on recall quality)
- **SC-002**: 80% of flashcards rated "Good" or "Easy" show interval increases of at least 1.5× the previous interval
- **SC-003**: Users achieve 75% or higher retention rate (correct recalls) after using the system for 30 days
- **SC-004**: Users can review 20 flashcards in under 5 minutes during a typical review session

**Content Organization:**
- **SC-005**: Users can find any previously created content within 10 seconds using global search or tag navigation
- **SC-006**: Unified tag search returns results from all content types (flashcards, notes, bookmarks, videos) in a single search operation
- **SC-007**: Users can successfully organize and retrieve notes using folders and categories without confusion
- **SC-008**: Video compression reduces file sizes by an average of 50% or more while maintaining playable quality

**User Engagement:**
- **SC-009**: Users complete at least one learning activity (flashcard review, note creation, or habit check) on 70% of days after initial setup
- **SC-010**: Users who establish daily habits achieve a 60% or higher weekly habit completion rate after 4 weeks of use
- **SC-011**: Users maintain learning streaks averaging 10+ consecutive days within their first month of use
- **SC-012**: Users access the app daily within 2 hours of their configured reminder time on 80% of reminder days

**Dashboard & UX:**
- **SC-013**: The dashboard loads and displays current status (due cards, habits, streak, XP) in under 2 seconds on app open
- **SC-014**: Users can complete their primary daily learning routine (review due cards, check habits, add new content) in under 15 minutes
- **SC-015**: New users can create their first flashcard and complete their first review session within 5 minutes of app installation
- **SC-016**: Users rate the dashboard as "helpful" or "very helpful" for maintaining daily learning routines in 85% of user surveys

**Progress Tracking:**
- **SC-017**: Users can view accurate historical learning data for any past date within 2 seconds of selecting the date
- **SC-018**: The calendar view correctly color-codes 100% of days based on actual activity levels with no discrepancies
- **SC-019**: Weekly summaries generate automatically every Sunday and display comparison metrics showing growth or decline trends
- **SC-020**: Users who view their weekly summary report feeling "more aware" of their learning patterns in 80% of surveys

**Gamification Impact:**
- **SC-021**: Users who unlock their first badge within the first week show 40% higher 30-day retention compared to users who don't unlock badges
- **SC-022**: Users level up at least once per month on average based on consistent learning activities
- **SC-023**: Streak preservation (using streak freeze feature) prevents 30% or more streak breaks that would otherwise occur
- **SC-024**: XP and level progression accurately reflects learning effort with no calculation errors

**System Reliability:**
- **SC-025**: Offline mode allows users to review cached flashcards and notes without internet connectivity, with 100% of changes syncing correctly when back online
- **SC-026**: The app handles 1,000+ flashcards per user without performance degradation (review sessions load in under 2 seconds)
- **SC-027**: Data synchronization across devices completes within 5 seconds of connectivity with no data loss
- **SC-028**: Push notifications for reviews, habits, and milestones deliver within 1 minute of scheduled time with 95% reliability

**Content Management Efficiency:**
- **SC-029**: Users can upload and compress a 5-minute video (average ~50MB original size) in under 3 minutes total time
- **SC-030**: Voice note recording and playback works reliably with clear audio quality on 99% of attempts
- **SC-031**: Tag suggestions and autocomplete improve tagging speed by 40% compared to manual entry
- **SC-032**: Users can merge duplicate tags and clean up unused tags in under 2 minutes using the tag management screen

## Assumptions

- Users have regular access to a mobile device with internet connectivity for synchronization
- Users are motivated to improve their learning through consistent practice and review
- Users understand basic concepts of flashcards and are willing to rate their own recall quality honestly
- The target audience consists primarily of developers and knowledge workers who value data-driven learning
- Users will grant necessary permissions for notifications to receive review reminders
- Users have sufficient storage on their device for offline caching of flashcards and notes
- MVP will launch with English-only UI to accelerate time-to-market (users can create flashcard content in any language, but all interface elements, buttons, labels, and error messages will be in English)
- Large media files (videos, voice notes) will be stored externally rather than in the primary database
- Users prefer a mobile-first experience but may occasionally access from multiple devices
- The initial user base will be relatively small (hundreds to low thousands) allowing for manual data migration if schema changes are needed
