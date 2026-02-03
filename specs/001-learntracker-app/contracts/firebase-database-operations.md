# Firebase Realtime Database Operations

**Feature**: LearnTracker — Personal Learning & Development Tracker
**Date**: 2026-02-03
**Purpose**: Define CRUD operations for Firebase Realtime Database

## Overview

This contract defines the operations for interacting with Firebase Realtime Database. All operations use the Firebase JavaScript SDK (`@react-native-firebase/database`) and follow offline-first patterns with WatermelonDB sync.

## Database Structure

```text
firebase://learntracker-db/
└── users/
    └── {userId}/
        ├── profile/                        # User Profile (1 record)
        ├── flashcards/                     # Flashcard collection
        │   └── {flashcardId}/
        ├── notes/                          # Note collection
        │   └── {noteId}/
        ├── bookmarks/                      # Bookmark collection
        │   └── {bookmarkId}/
        ├── videos/                         # Video collection
        │   └── {videoId}/
        ├── voice_notes/                    # VoiceNote collection
        │   └── {voiceNoteId}/
        ├── memorize_items/                 # MemorizeItem collection
        │   └── {itemId}/
        ├── daily_logs/                     # DailyLog collection (keyed by date)
        │   └── {YYYY-MM-DD}/
        ├── habit_definitions/              # HabitDefinition collection
        │   └── {habitId}/
        ├── habit_log_entries/              # HabitLogEntry collection (keyed by date)
        │   └── {YYYY-MM-DD}/
        ├── daily_progress/                 # DailyProgress collection (keyed by date)
        │   └── {YYYY-MM-DD}/
        ├── weekly_summaries/               # WeeklySummary collection (keyed by week)
        │   └── {YYYY-Www}/
        ├── tags/                           # Tag collection
        │   └── {tagId}/
        └── settings/                       # UserSettings (1 record)
```

## Security Rules

```javascript
{
  "rules": {
    "users": {
      "$userId": {
        // Users can only read/write their own data
        ".read": "auth != null && auth.uid == $userId",
        ".write": "auth != null && auth.uid == $userId",

        // Validate schema structure
        "profile": {
          ".validate": "newData.hasChildren(['email', 'name', 'xp_points', 'current_level'])"
        },

        "flashcards": {
          "$flashcardId": {
            ".validate": "newData.hasChildren(['front_text', 'back_text', 'ease_factor', 'interval'])"
          }
        },

        // Additional validation rules for other collections...
      }
    }
  }
}
```

## Common Operations

### 1. User Profile Operations

#### Create Profile (on sign-up)
```typescript
const createUserProfile = async (userId: string, email: string, name: string, avatarUrl: string) => {
  const profileRef = database().ref(`users/${userId}/profile`);
  await profileRef.set({
    id: userId,
    email,
    name,
    avatar_url: avatarUrl,
    xp_points: 0,
    current_level: 1,
    current_streak: 0,
    longest_streak: 0,
    last_active_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    streak_freeze_available: true,
    earned_badges: [],
    created_at: database.ServerValue.TIMESTAMP,
    updated_at: database.ServerValue.TIMESTAMP,
  });
};
```

#### Update XP and Level
```typescript
const updateXPAndLevel = async (userId: string, xpToAdd: number, newLevel?: number) => {
  const profileRef = database().ref(`users/${userId}/profile`);
  const updates: any = {
    xp_points: database.ServerValue.increment(xpToAdd),
    updated_at: database.ServerValue.TIMESTAMP,
  };

  if (newLevel) {
    updates.current_level = newLevel;
  }

  await profileRef.update(updates);
};
```

#### Update Streak
```typescript
const updateStreak = async (userId: string, newStreak: number, updateLongest: boolean = false) => {
  const profileRef = database().ref(`users/${userId}/profile`);
  const updates: any = {
    current_streak: newStreak,
    last_active_date: new Date().toISOString().split('T')[0],
    updated_at: database.ServerValue.TIMESTAMP,
  };

  if (updateLongest) {
    updates.longest_streak = newStreak;
  }

  await profileRef.update(updates);
};
```

---

### 2. Flashcard Operations

#### Create Flashcard
```typescript
const createFlashcard = async (userId: string, flashcard: Omit<Flashcard, 'id' | 'created_at' | 'updated_at'>) => {
  const flashcardsRef = database().ref(`users/${userId}/flashcards`);
  const newFlashcardRef = flashcardsRef.push();
  const flashcardId = newFlashcardRef.key!;

  await newFlashcardRef.set({
    id: flashcardId,
    user_id: userId,
    ...flashcard,
    created_at: database.ServerValue.TIMESTAMP,
    updated_at: database.ServerValue.TIMESTAMP,
  });

  return flashcardId;
};
```

#### Update Flashcard Review (after SM-2 calculation)
```typescript
const updateFlashcardReview = async (
  userId: string,
  flashcardId: string,
  reviewData: {
    ease_factor: number;
    interval: number;
    repetitions: number;
    next_review_date: string;
    last_quality_rating: number;
  }
) => {
  const flashcardRef = database().ref(`users/${userId}/flashcards/${flashcardId}`);
  await flashcardRef.update({
    ...reviewData,
    last_review_date: new Date().toISOString().split('T')[0],
    total_reviews: database.ServerValue.increment(1),
    correct_reviews: reviewData.last_quality_rating >= 3
      ? database.ServerValue.increment(1)
      : undefined,
    incorrect_reviews: reviewData.last_quality_rating === 0
      ? database.ServerValue.increment(1)
      : undefined,
    updated_at: database.ServerValue.TIMESTAMP,
  });
};
```

#### Query Due Flashcards
```typescript
const getDueFlashcards = async (userId: string): Promise<Flashcard[]> => {
  const today = new Date().toISOString().split('T')[0];
  const flashcardsRef = database().ref(`users/${userId}/flashcards`);

  const snapshot = await flashcardsRef
    .orderByChild('next_review_date')
    .endAt(today)
    .once('value');

  const flashcards: Flashcard[] = [];
  snapshot.forEach((child) => {
    flashcards.push(child.val());
  });

  return flashcards;
};
```

#### Delete Flashcard
```typescript
const deleteFlashcard = async (userId: string, flashcardId: string) => {
  const flashcardRef = database().ref(`users/${userId}/flashcards/${flashcardId}`);
  await flashcardRef.remove();
};
```

---

### 3. Note Operations

#### Create Note
```typescript
const createNote = async (userId: string, note: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => {
  const notesRef = database().ref(`users/${userId}/notes`);
  const newNoteRef = notesRef.push();
  const noteId = newNoteRef.key!;

  await newNoteRef.set({
    id: noteId,
    user_id: userId,
    ...note,
    created_at: database.ServerValue.TIMESTAMP,
    updated_at: database.ServerValue.TIMESTAMP,
  });

  return noteId;
};
```

#### Update Note
```typescript
const updateNote = async (userId: string, noteId: string, updates: Partial<Note>) => {
  const noteRef = database().ref(`users/${userId}/notes/${noteId}`);
  await noteRef.update({
    ...updates,
    updated_at: database.ServerValue.TIMESTAMP,
  });
};
```

#### Query Notes by Folder
```typescript
const getNotesByFolder = async (userId: string, folder: string): Promise<Note[]> => {
  const notesRef = database().ref(`users/${userId}/notes`);

  const snapshot = await notesRef
    .orderByChild('folder')
    .equalTo(folder)
    .once('value');

  const notes: Note[] = [];
  snapshot.forEach((child) => {
    notes.push(child.val());
  });

  return notes;
};
```

---

### 4. Daily Progress Operations

#### Create or Update Daily Progress
```typescript
const upsertDailyProgress = async (
  userId: string,
  dateKey: string,
  progressData: Partial<DailyProgress>
) => {
  const progressRef = database().ref(`users/${userId}/daily_progress/${dateKey}`);

  // Use transaction to safely increment counters
  await progressRef.transaction((current) => {
    if (current === null) {
      // Create new record
      return {
        id: `${userId}_${dateKey}`,
        user_id: userId,
        date_key: dateKey,
        cards_reviewed_count: progressData.cards_reviewed_count || 0,
        cards_correct_count: progressData.cards_correct_count || 0,
        cards_incorrect_count: progressData.cards_incorrect_count || 0,
        new_cards_count: progressData.new_cards_count || 0,
        notes_created_count: progressData.notes_created_count || 0,
        videos_added_count: progressData.videos_added_count || 0,
        voice_notes_count: progressData.voice_notes_count || 0,
        bookmarks_added_count: progressData.bookmarks_added_count || 0,
        study_minutes: progressData.study_minutes || 0,
        xp_earned: progressData.xp_earned || 0,
        habits_completed_count: progressData.habits_completed_count || 0,
        habits_total_count: progressData.habits_total_count || 0,
        created_at: database.ServerValue.TIMESTAMP,
        updated_at: database.ServerValue.TIMESTAMP,
      };
    } else {
      // Update existing record
      return {
        ...current,
        cards_reviewed_count: (current.cards_reviewed_count || 0) + (progressData.cards_reviewed_count || 0),
        cards_correct_count: (current.cards_correct_count || 0) + (progressData.cards_correct_count || 0),
        cards_incorrect_count: (current.cards_incorrect_count || 0) + (progressData.cards_incorrect_count || 0),
        new_cards_count: (current.new_cards_count || 0) + (progressData.new_cards_count || 0),
        notes_created_count: (current.notes_created_count || 0) + (progressData.notes_created_count || 0),
        videos_added_count: (current.videos_added_count || 0) + (progressData.videos_added_count || 0),
        voice_notes_count: (current.voice_notes_count || 0) + (progressData.voice_notes_count || 0),
        bookmarks_added_count: (current.bookmarks_added_count || 0) + (progressData.bookmarks_added_count || 0),
        study_minutes: (current.study_minutes || 0) + (progressData.study_minutes || 0),
        xp_earned: (current.xp_earned || 0) + (progressData.xp_earned || 0),
        habits_completed_count: progressData.habits_completed_count ?? current.habits_completed_count,
        habits_total_count: progressData.habits_total_count ?? current.habits_total_count,
        updated_at: database.ServerValue.TIMESTAMP,
      };
    }
  });
};
```

#### Get Progress for Date Range (Calendar View)
```typescript
const getProgressForDateRange = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<DailyProgress[]> => {
  const progressRef = database().ref(`users/${userId}/daily_progress`);

  const snapshot = await progressRef
    .orderByKey()
    .startAt(startDate)
    .endAt(endDate)
    .once('value');

  const progress: DailyProgress[] = [];
  snapshot.forEach((child) => {
    progress.push(child.val());
  });

  return progress;
};
```

---

### 5. Habit Operations

#### Create Habit Definition
```typescript
const createHabitDefinition = async (userId: string, habitName: string, displayOrder: number) => {
  const habitsRef = database().ref(`users/${userId}/habit_definitions`);
  const newHabitRef = habitsRef.push();
  const habitId = newHabitRef.key!;

  await newHabitRef.set({
    id: habitId,
    user_id: userId,
    name: habitName,
    display_order: displayOrder,
    is_active: true,
    created_at: database.ServerValue.TIMESTAMP,
  });

  return habitId;
};
```

#### Update Habit Completion for Today
```typescript
const updateHabitCompletion = async (
  userId: string,
  dateKey: string,
  habitId: string,
  completed: boolean
) => {
  const logRef = database().ref(`users/${userId}/habit_log_entries/${dateKey}`);

  await logRef.transaction((current) => {
    if (current === null) {
      // Create new log entry
      return {
        id: `${userId}_${dateKey}`,
        user_id: userId,
        date_key: dateKey,
        habit_completions: {
          [habitId]: completed,
        },
        created_at: database.ServerValue.TIMESTAMP,
        updated_at: database.ServerValue.TIMESTAMP,
      };
    } else {
      // Update existing log entry
      return {
        ...current,
        habit_completions: {
          ...current.habit_completions,
          [habitId]: completed,
        },
        updated_at: database.ServerValue.TIMESTAMP,
      };
    }
  });
};
```

---

### 6. Tag Operations

#### Increment Tag Count (when tag used)
```typescript
const incrementTagCount = async (userId: string, tagName: string) => {
  const tagsRef = database().ref(`users/${userId}/tags`);

  // Find or create tag
  const snapshot = await tagsRef.orderByChild('name').equalTo(tagName).once('value');

  if (snapshot.exists()) {
    // Tag exists, increment count
    const tagId = Object.keys(snapshot.val())[0];
    await tagsRef.child(tagId).update({
      count: database.ServerValue.increment(1),
      last_used_at: database.ServerValue.TIMESTAMP,
    });
  } else {
    // Create new tag
    const newTagRef = tagsRef.push();
    await newTagRef.set({
      id: newTagRef.key!,
      user_id: userId,
      name: tagName,
      count: 1,
      last_used_at: database.ServerValue.TIMESTAMP,
    });
  }
};
```

---

### 7. Weekly Summary Operations

#### Create Weekly Summary (automated cron job)
```typescript
const createWeeklySummary = async (
  userId: string,
  weekKey: string,
  summaryData: Omit<WeeklySummary, 'id' | 'user_id' | 'week_key' | 'generated_at'>
) => {
  const summaryRef = database().ref(`users/${userId}/weekly_summaries/${weekKey}`);
  await summaryRef.set({
    id: `${userId}_${weekKey}`,
    user_id: userId,
    week_key: weekKey,
    ...summaryData,
    generated_at: database.ServerValue.TIMESTAMP,
  });
};
```

---

## Offline Support

### Enabling Persistence
```typescript
import database from '@react-native-firebase/database';

// Enable offline persistence (call once at app initialization)
database().setPersistenceEnabled(true);

// Set cache size (10 MB recommended for this app)
database().setPersistenceCacheSizeBytes(10 * 1024 * 1024);
```

### Offline Behavior
- **Reads**: Served from local cache if available
- **Writes**: Queued locally and synced when connectivity restored
- **Listeners**: Continue to work with cached data
- **Conflicts**: Last-write-wins using server timestamps

---

## Performance Optimizations

### Indexing Rules
```json
{
  "rules": {
    "users": {
      "$userId": {
        "flashcards": {
          ".indexOn": ["next_review_date", "deck", "updated_at"]
        },
        "notes": {
          ".indexOn": ["folder", "category", "updated_at", "is_pinned"]
        },
        "tags": {
          ".indexOn": ["name", "count", "last_used_at"]
        }
      }
    }
  }
}
```

### Query Limits
- Use `.limitToFirst(N)` or `.limitToLast(N)` to paginate large collections
- For calendar queries, limit to 3-month windows to reduce payload

---

## Error Handling

### Common Error Scenarios
```typescript
try {
  await createFlashcard(userId, flashcardData);
} catch (error) {
  if (error.code === 'permission-denied') {
    // User not authenticated or accessing wrong user's data
    console.error('Permission denied:', error);
  } else if (error.code === 'unavailable') {
    // Network error, operation queued for retry
    console.warn('Offline, operation queued:', error);
  } else {
    // Other Firebase errors
    console.error('Firebase error:', error);
  }
}
```

---

**Next Steps**: Proceed to Google Drive API contract definition.
