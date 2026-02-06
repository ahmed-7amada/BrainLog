# Firebase Realtime Database Operations

**Feature**: BrainLog — Personal Learning & Development Tracker
**Date**: 2026-02-03
**Purpose**: Define CRUD operations for Firebase Realtime Database

## Overview

This contract defines the operations for interacting with Firebase Realtime Database. All operations use the Firebase modular SDK (`@react-native-firebase/database`) with modular imports (`ref`, `get`, `set`, `update`, etc.) and follow offline-first patterns.

## Database Structure

```text
firebase://brainlog-db/
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
import { getDatabase, ref, set, serverTimestamp } from '@react-native-firebase/database';

const createUserProfile = async (userId: string, email: string, name: string, avatarUrl: string) => {
  const profileRef = ref(getDatabase(), `users/${userId}/profile`);
  await set(profileRef, {
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
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
};
```

#### Update XP and Level
```typescript
import { getDatabase, ref, update, serverTimestamp, increment } from '@react-native-firebase/database';

const updateXPAndLevel = async (userId: string, xpToAdd: number, newLevel?: number) => {
  const profileRef = ref(getDatabase(), `users/${userId}/profile`);
  const updates: any = {
    xp_points: increment(xpToAdd),
    updated_at: serverTimestamp(),
  };

  if (newLevel) {
    updates.current_level = newLevel;
  }

  await update(profileRef, updates);
};
```

#### Update Streak
```typescript
import { getDatabase, ref, update, serverTimestamp } from '@react-native-firebase/database';

const updateStreak = async (userId: string, newStreak: number, updateLongest: boolean = false) => {
  const profileRef = ref(getDatabase(), `users/${userId}/profile`);
  const updates: any = {
    current_streak: newStreak,
    last_active_date: new Date().toISOString().split('T')[0],
    updated_at: serverTimestamp(),
  };

  if (updateLongest) {
    updates.longest_streak = newStreak;
  }

  await update(profileRef, updates);
};
```

---

### 2. Flashcard Operations

#### Create Flashcard
```typescript
import { getDatabase, ref, push, set, serverTimestamp } from '@react-native-firebase/database';

const createFlashcard = async (userId: string, flashcard: Omit<Flashcard, 'id' | 'created_at' | 'updated_at'>) => {
  const flashcardsRef = ref(getDatabase(), `users/${userId}/flashcards`);
  const newFlashcardRef = push(flashcardsRef);
  const flashcardId = newFlashcardRef.key!;

  await set(newFlashcardRef, {
    id: flashcardId,
    user_id: userId,
    ...flashcard,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });

  return flashcardId;
};
```

#### Update Flashcard Review (after SM-2 calculation)
```typescript
import { getDatabase, ref, update, serverTimestamp, increment } from '@react-native-firebase/database';

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
  const flashcardRef = ref(getDatabase(), `users/${userId}/flashcards/${flashcardId}`);
  await update(flashcardRef, {
    ...reviewData,
    last_review_date: new Date().toISOString().split('T')[0],
    total_reviews: increment(1),
    correct_reviews: reviewData.last_quality_rating >= 3
      ? increment(1)
      : undefined,
    incorrect_reviews: reviewData.last_quality_rating === 0
      ? increment(1)
      : undefined,
    updated_at: serverTimestamp(),
  });
};
```

#### Query Due Flashcards
```typescript
import { getDatabase, ref, get, query, orderByChild, endAt } from '@react-native-firebase/database';

const getDueFlashcards = async (userId: string): Promise<Flashcard[]> => {
  const today = new Date().toISOString().split('T')[0];
  const flashcardsRef = ref(getDatabase(), `users/${userId}/flashcards`);
  const dueQuery = query(flashcardsRef, orderByChild('next_review_date'), endAt(today));

  const snapshot = await get(dueQuery);

  const flashcards: Flashcard[] = [];
  snapshot.forEach((child) => {
    flashcards.push(child.val());
  });

  return flashcards;
};
```

#### Delete Flashcard
```typescript
import { getDatabase, ref, remove } from '@react-native-firebase/database';

const deleteFlashcard = async (userId: string, flashcardId: string) => {
  const flashcardRef = ref(getDatabase(), `users/${userId}/flashcards/${flashcardId}`);
  await remove(flashcardRef);
};
```

---

### 3. Note Operations

#### Create Note
```typescript
import { getDatabase, ref, push, set, serverTimestamp } from '@react-native-firebase/database';

const createNote = async (userId: string, note: Omit<Note, 'id' | 'created_at' | 'updated_at'>) => {
  const notesRef = ref(getDatabase(), `users/${userId}/notes`);
  const newNoteRef = push(notesRef);
  const noteId = newNoteRef.key!;

  await set(newNoteRef, {
    id: noteId,
    user_id: userId,
    ...note,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });

  return noteId;
};
```

#### Update Note
```typescript
import { getDatabase, ref, update, serverTimestamp } from '@react-native-firebase/database';

const updateNote = async (userId: string, noteId: string, updates: Partial<Note>) => {
  const noteRef = ref(getDatabase(), `users/${userId}/notes/${noteId}`);
  await update(noteRef, {
    ...updates,
    updated_at: serverTimestamp(),
  });
};
```

#### Query Notes by Folder
```typescript
import { getDatabase, ref, get, query, orderByChild, equalTo } from '@react-native-firebase/database';

const getNotesByFolder = async (userId: string, folder: string): Promise<Note[]> => {
  const notesRef = ref(getDatabase(), `users/${userId}/notes`);
  const folderQuery = query(notesRef, orderByChild('folder'), equalTo(folder));

  const snapshot = await get(folderQuery);

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
import { getDatabase, ref, runTransaction, serverTimestamp } from '@react-native-firebase/database';

const upsertDailyProgress = async (
  userId: string,
  dateKey: string,
  progressData: Partial<DailyProgress>
) => {
  const progressRef = ref(getDatabase(), `users/${userId}/daily_progress/${dateKey}`);

  // Use transaction to safely increment counters
  await runTransaction(progressRef, (current) => {
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
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
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
        updated_at: serverTimestamp(),
      };
    }
  });
};
```

#### Get Progress for Date Range (Calendar View)
```typescript
import { getDatabase, ref, get, query, orderByKey, startAt, endAt } from '@react-native-firebase/database';

const getProgressForDateRange = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<DailyProgress[]> => {
  const progressRef = ref(getDatabase(), `users/${userId}/daily_progress`);
  const rangeQuery = query(progressRef, orderByKey(), startAt(startDate), endAt(endDate));

  const snapshot = await get(rangeQuery);

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
import { getDatabase, ref, push, set, serverTimestamp } from '@react-native-firebase/database';

const createHabitDefinition = async (userId: string, habitName: string, displayOrder: number) => {
  const habitsRef = ref(getDatabase(), `users/${userId}/habit_definitions`);
  const newHabitRef = push(habitsRef);
  const habitId = newHabitRef.key!;

  await set(newHabitRef, {
    id: habitId,
    user_id: userId,
    name: habitName,
    display_order: displayOrder,
    is_active: true,
    created_at: serverTimestamp(),
  });

  return habitId;
};
```

#### Update Habit Completion for Today
```typescript
import { getDatabase, ref, runTransaction, serverTimestamp } from '@react-native-firebase/database';

const updateHabitCompletion = async (
  userId: string,
  dateKey: string,
  habitId: string,
  completed: boolean
) => {
  const logRef = ref(getDatabase(), `users/${userId}/habit_log_entries/${dateKey}`);

  await runTransaction(logRef, (current) => {
    if (current === null) {
      // Create new log entry
      return {
        id: `${userId}_${dateKey}`,
        user_id: userId,
        date_key: dateKey,
        habit_completions: {
          [habitId]: completed,
        },
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };
    } else {
      // Update existing log entry
      return {
        ...current,
        habit_completions: {
          ...current.habit_completions,
          [habitId]: completed,
        },
        updated_at: serverTimestamp(),
      };
    }
  });
};
```

---

### 6. Tag Operations

#### Increment Tag Count (when tag used)
```typescript
import { getDatabase, ref, get, set, update, push, child, query, orderByChild, equalTo, increment, serverTimestamp } from '@react-native-firebase/database';

const incrementTagCount = async (userId: string, tagName: string) => {
  const tagsRef = ref(getDatabase(), `users/${userId}/tags`);

  // Find or create tag
  const tagQuery = query(tagsRef, orderByChild('name'), equalTo(tagName));
  const snapshot = await get(tagQuery);

  if (snapshot.exists()) {
    // Tag exists, increment count
    const tagId = Object.keys(snapshot.val())[0];
    const tagRef = child(tagsRef, tagId);
    await update(tagRef, {
      count: increment(1),
      last_used_at: serverTimestamp(),
    });
  } else {
    // Create new tag
    const newTagRef = push(tagsRef);
    await set(newTagRef, {
      id: newTagRef.key!,
      user_id: userId,
      name: tagName,
      count: 1,
      last_used_at: serverTimestamp(),
    });
  }
};
```

---

### 7. Weekly Summary Operations

#### Create Weekly Summary (automated cron job)
```typescript
import { getDatabase, ref, set, serverTimestamp } from '@react-native-firebase/database';

const createWeeklySummary = async (
  userId: string,
  weekKey: string,
  summaryData: Omit<WeeklySummary, 'id' | 'user_id' | 'week_key' | 'generated_at'>
) => {
  const summaryRef = ref(getDatabase(), `users/${userId}/weekly_summaries/${weekKey}`);
  await set(summaryRef, {
    id: `${userId}_${weekKey}`,
    user_id: userId,
    week_key: weekKey,
    ...summaryData,
    generated_at: serverTimestamp(),
  });
};
```

---

## Offline Support

### Enabling Persistence
```typescript
import { getDatabase } from '@react-native-firebase/database';

// Enable offline persistence (call once at app initialization)
const db = getDatabase();
db.setPersistenceEnabled(true);

// Set cache size (10 MB recommended for this app)
db.setPersistenceCacheSizeBytes(10 * 1024 * 1024);
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
