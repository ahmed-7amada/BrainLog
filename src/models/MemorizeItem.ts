/**
 * Memorize Item Model
 * Represents any content registered for spaced repetition review
 */

export interface MemorizeItem {
  id: string;
  user_id: string;
  title: string;
  content_summary: string;
  type: MemorizeItemType;
  source_reference?: string; // Link to original note or flashcard
  tags: string[];

  // SM-2 Algorithm Parameters (same as Flashcard)
  ease_factor: number; // Min 1.3, initial 2.5
  interval: number; // Days until next review
  repetitions: number;
  next_review_date: string; // YYYY-MM-DD
  last_review_date: string; // YYYY-MM-DD
  last_quality_rating: number; // 0, 3, 4, or 5

  created_at: number; // Timestamp
}

export type MemorizeItemType = 'note' | 'concept' | 'vocabulary' | 'custom';
