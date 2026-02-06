/**
 * App-wide Constants
 */

// XP Point Values (FR-039)
export const XP_VALUES = {
  FLASHCARD_REVIEW: 5,
  NEW_FLASHCARD: 3,
  NOTE_CREATED: 10,
  DAILY_LOG: 20,
  ALL_HABITS_COMPLETED: 25,
  VIDEO_UPLOAD: 15,
  VOICE_NOTE: 10,
  BOOKMARK: 2,
};

// XP Bonus for Streak Milestones (FR-042)
export const STREAK_BONUS_XP = {
  7: 100, // 7-day streak
  30: 500, // 30-day streak
  100: 1000, // 100-day streak
};

// Level Thresholds (FR-040)
export const LEVEL_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 100,
  3: 300,
  4: 600,
  5: 1000,
  6: 1500,
  7: 2500,
  8: 4000,
  9: 6000,
  10: 10000,
};

// Badge IDs and Requirements (FR-041)
export const BADGES = {
  FIRST_FLASHCARD: {
    id: 'first_flashcard',
    name: 'First Steps',
    description: 'Create your first flashcard',
    requirement: 1,
  },
  FLASHCARDS_100: {
    id: 'flashcards_100',
    name: 'Card Collector',
    description: 'Create 100 flashcards',
    requirement: 100,
  },
  STREAK_7: {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    requirement: 7,
  },
  STREAK_30: {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    requirement: 30,
  },
  STREAK_100: {
    id: 'streak_100',
    name: 'Century Champion',
    description: 'Maintain a 100-day streak',
    requirement: 100,
  },
  FIRST_VIDEO: {
    id: 'first_video',
    name: 'Video Pioneer',
    description: 'Upload your first learning video',
    requirement: 1,
  },
  HABITS_PERFECT_WEEK: {
    id: 'habits_perfect_week',
    name: 'Habit Hero',
    description: 'Complete 100% of habits for 7 days',
    requirement: 7,
  },
  MASTERED_50: {
    id: 'mastered_50',
    name: 'Memory Master',
    description: 'Have 50 cards with interval > 30 days',
    requirement: 50,
  },
};

// Default Settings
export const DEFAULT_REMINDER_TIME = '09:00';
export const DEFAULT_HABIT_REMINDER_TIME = '20:00';
export const STREAK_WARNING_HOUR = 20; // 8 PM

// Performance Thresholds
export const MAX_CARDS_PER_SESSION = 20;
export const DASHBOARD_LOAD_TIMEOUT_MS = 2000;

// Storage Keys
export const STORAGE_KEYS = {
  USER: '@brainlog/user',
  SETTINGS: '@brainlog/settings',
  AUTH_TOKEN: '@brainlog/auth_token',
  LAST_SYNC: '@brainlog/last_sync',
  OFFLINE_QUEUE: '@brainlog/offline_queue',
};

// Firebase Paths
export const FIREBASE_PATHS = {
  USERS: 'users',
  FLASHCARDS: 'flashcards',
  NOTES: 'notes',
  BOOKMARKS: 'bookmarks',
  VIDEOS: 'videos',
  VOICE_NOTES: 'voice_notes',
  MEMORIZE_ITEMS: 'memorize_items',
  DAILY_LOGS: 'daily_logs',
  HABIT_DEFINITIONS: 'habit_definitions',
  HABIT_LOG_ENTRIES: 'habit_log_entries',
  DAILY_PROGRESS: 'daily_progress',
  WEEKLY_SUMMARIES: 'weekly_summaries',
  TAGS: 'tags',
  SETTINGS: 'settings',
};

// Content Types
export const CONTENT_TYPES = {
  FLASHCARD: 'flashcard',
  NOTE: 'note',
  BOOKMARK: 'bookmark',
  VIDEO: 'video',
  VOICE_NOTE: 'voice_note',
  MEMORIZE_ITEM: 'memorize_item',
};

// Quality Rating Labels (FR-004)
export const QUALITY_LABELS = {
  0: 'Again',
  3: 'Hard',
  4: 'Good',
  5: 'Easy',
};
