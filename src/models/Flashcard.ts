/**
 * Flashcard Model
 * Represents a single learning card with SM-2 spaced repetition parameters
 */

export interface Flashcard {
  id: string;
  user_id: string;
  front_text: string; // Question/prompt
  back_text: string; // Answer/explanation
  deck: string; // Deck name/category
  tags: string[]; // Category tags
  voice_note_id?: string; // Optional attached voice note

  // SM-2 Algorithm Parameters
  ease_factor: number; // Difficulty multiplier (min 1.3, initial 2.5)
  interval: number; // Days until next review
  repetitions: number; // Number of successful reviews
  next_review_date: string; // YYYY-MM-DD
  last_review_date: string; // YYYY-MM-DD
  last_quality_rating: number; // 0, 3, 4, or 5

  // Statistics
  total_reviews: number;
  correct_reviews: number; // Quality >= 3
  incorrect_reviews: number; // Quality == 0

  created_at: number; // Timestamp
  updated_at: number; // Timestamp
}

export interface FlashcardReviewResult {
  flashcard_id: string;
  quality_rating: 0 | 3 | 4 | 5; // Again, Hard, Good, Easy
  new_ease_factor: number;
  new_interval: number;
  new_repetitions: number;
  next_review_date: string;
}
