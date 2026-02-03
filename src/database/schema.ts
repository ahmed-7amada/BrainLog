/**
 * WatermelonDB Schema
 * Defines all 14 database tables for offline-first storage
 */

import {appSchema, tableSchema} from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    // User Profile table
    tableSchema({
      name: 'users',
      columns: [
        {name: 'email', type: 'string'},
        {name: 'name', type: 'string'},
        {name: 'avatar_url', type: 'string'},
        {name: 'xp_points', type: 'number'},
        {name: 'current_level', type: 'number'},
        {name: 'current_streak', type: 'number'},
        {name: 'longest_streak', type: 'number'},
        {name: 'last_active_date', type: 'string', isIndexed: true},
        {name: 'streak_freeze_available', type: 'boolean'},
        {name: 'earned_badges', type: 'string'}, // JSON array
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
      ],
    }),

    // Flashcard table
    tableSchema({
      name: 'flashcards',
      columns: [
        {name: 'user_id', type: 'string', isIndexed: true},
        {name: 'front_text', type: 'string'},
        {name: 'back_text', type: 'string'},
        {name: 'deck', type: 'string', isIndexed: true},
        {name: 'tags', type: 'string'}, // JSON array
        {name: 'voice_note_id', type: 'string', isOptional: true},
        {name: 'ease_factor', type: 'number'},
        {name: 'interval', type: 'number'},
        {name: 'repetitions', type: 'number'},
        {name: 'next_review_date', type: 'string', isIndexed: true},
        {name: 'last_review_date', type: 'string'},
        {name: 'last_quality_rating', type: 'number'},
        {name: 'total_reviews', type: 'number'},
        {name: 'correct_reviews', type: 'number'},
        {name: 'incorrect_reviews', type: 'number'},
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
      ],
    }),

    // Note table
    tableSchema({
      name: 'notes',
      columns: [
        {name: 'user_id', type: 'string', isIndexed: true},
        {name: 'title', type: 'string'},
        {name: 'content', type: 'string'},
        {name: 'tags', type: 'string'}, // JSON array
        {name: 'category', type: 'string', isIndexed: true},
        {name: 'folder', type: 'string', isIndexed: true, isOptional: true},
        {name: 'voice_note_id', type: 'string', isOptional: true},
        {name: 'is_pinned', type: 'boolean'},
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
      ],
    }),

    // Bookmark table
    tableSchema({
      name: 'bookmarks',
      columns: [
        {name: 'user_id', type: 'string', isIndexed: true},
        {name: 'title', type: 'string'},
        {name: 'url', type: 'string'},
        {name: 'type', type: 'string'},
        {name: 'tags', type: 'string'}, // JSON array
        {name: 'personal_notes', type: 'string', isOptional: true},
        {name: 'created_at', type: 'number'},
      ],
    }),

    // Video table
    tableSchema({
      name: 'videos',
      columns: [
        {name: 'user_id', type: 'string', isIndexed: true},
        {name: 'title', type: 'string'},
        {name: 'description', type: 'string', isOptional: true},
        {name: 'google_drive_file_id', type: 'string'},
        {name: 'google_drive_url', type: 'string'},
        {name: 'resolution', type: 'string'},
        {name: 'bitrate', type: 'number'},
        {name: 'format', type: 'string'},
        {name: 'duration_seconds', type: 'number'},
        {name: 'original_size_bytes', type: 'number'},
        {name: 'compressed_size_bytes', type: 'number'},
        {name: 'tags', type: 'string'}, // JSON array
        {name: 'created_at', type: 'number'},
      ],
    }),

    // VoiceNote table
    tableSchema({
      name: 'voice_notes',
      columns: [
        {name: 'user_id', type: 'string', isIndexed: true},
        {name: 'title', type: 'string', isOptional: true},
        {name: 'duration_seconds', type: 'number'},
        {name: 'google_drive_file_id', type: 'string'},
        {name: 'google_drive_url', type: 'string'},
        {name: 'attachment_type', type: 'string'},
        {name: 'attached_item_id', type: 'string', isOptional: true},
        {name: 'tags', type: 'string'}, // JSON array
        {name: 'created_at', type: 'number'},
      ],
    }),

    // MemorizeItem table
    tableSchema({
      name: 'memorize_items',
      columns: [
        {name: 'user_id', type: 'string', isIndexed: true},
        {name: 'title', type: 'string'},
        {name: 'content_summary', type: 'string'},
        {name: 'type', type: 'string'},
        {name: 'source_reference', type: 'string', isOptional: true},
        {name: 'tags', type: 'string'}, // JSON array
        {name: 'ease_factor', type: 'number'},
        {name: 'interval', type: 'number'},
        {name: 'repetitions', type: 'number'},
        {name: 'next_review_date', type: 'string', isIndexed: true},
        {name: 'last_review_date', type: 'string'},
        {name: 'last_quality_rating', type: 'number'},
        {name: 'created_at', type: 'number'},
      ],
    }),

    // DailyLog table
    tableSchema({
      name: 'daily_logs',
      columns: [
        {name: 'user_id', type: 'string', isIndexed: true},
        {name: 'date_key', type: 'string', isIndexed: true},
        {name: 'learned_text', type: 'string', isOptional: true},
        {name: 'challenges_text', type: 'string', isOptional: true},
        {name: 'plan_text', type: 'string', isOptional: true},
        {name: 'summary', type: 'string'}, // JSON object
        {name: 'linked_item_ids', type: 'string'}, // JSON array
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
      ],
    }),

    // HabitDefinition table
    tableSchema({
      name: 'habit_definitions',
      columns: [
        {name: 'user_id', type: 'string', isIndexed: true},
        {name: 'name', type: 'string'},
        {name: 'display_order', type: 'number'},
        {name: 'is_active', type: 'boolean'},
        {name: 'created_at', type: 'number'},
      ],
    }),

    // HabitLogEntry table
    tableSchema({
      name: 'habit_log_entries',
      columns: [
        {name: 'user_id', type: 'string', isIndexed: true},
        {name: 'date_key', type: 'string', isIndexed: true},
        {name: 'habit_completions', type: 'string'}, // JSON object
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
      ],
    }),

    // DailyProgress table
    tableSchema({
      name: 'daily_progress',
      columns: [
        {name: 'user_id', type: 'string', isIndexed: true},
        {name: 'date_key', type: 'string', isIndexed: true},
        {name: 'cards_reviewed_count', type: 'number'},
        {name: 'cards_correct_count', type: 'number'},
        {name: 'cards_incorrect_count', type: 'number'},
        {name: 'new_cards_count', type: 'number'},
        {name: 'notes_created_count', type: 'number'},
        {name: 'videos_added_count', type: 'number'},
        {name: 'voice_notes_count', type: 'number'},
        {name: 'bookmarks_added_count', type: 'number'},
        {name: 'study_minutes', type: 'number'},
        {name: 'xp_earned', type: 'number'},
        {name: 'habits_completed_count', type: 'number'},
        {name: 'habits_total_count', type: 'number'},
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
      ],
    }),

    // WeeklySummary table
    tableSchema({
      name: 'weekly_summaries',
      columns: [
        {name: 'user_id', type: 'string', isIndexed: true},
        {name: 'week_key', type: 'string', isIndexed: true},
        {name: 'total_cards_reviewed', type: 'number'},
        {name: 'new_cards_learned_count', type: 'number'},
        {name: 'most_forgotten_card_ids', type: 'string'}, // JSON array
        {name: 'total_study_minutes', type: 'number'},
        {name: 'streak_days_count', type: 'number'},
        {name: 'habit_completion_rate', type: 'number'},
        {name: 'xp_earned', type: 'number'},
        {name: 'comparison', type: 'string'}, // JSON object
        {name: 'generated_at', type: 'number'},
      ],
    }),

    // Tag table
    tableSchema({
      name: 'tags',
      columns: [
        {name: 'user_id', type: 'string', isIndexed: true},
        {name: 'name', type: 'string', isIndexed: true},
        {name: 'count', type: 'number'},
        {name: 'last_used_at', type: 'number'},
      ],
    }),

    // UserSettings table
    tableSchema({
      name: 'user_settings',
      columns: [
        {name: 'user_id', type: 'string'},
        {name: 'theme', type: 'string'},
        {name: 'notifications_enabled', type: 'boolean'},
        {name: 'daily_reminder_time', type: 'string'},
        {name: 'habit_reminder_time', type: 'string'},
        {name: 'weekly_review_day', type: 'string'},
      ],
    }),
  ],
});
