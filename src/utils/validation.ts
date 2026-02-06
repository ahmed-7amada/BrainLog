/**
 * Validation Utility Functions
 */

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    // Using URL constructor to validate - if it doesn't throw, URL is valid
    const _url = new URL(url);
    return Boolean(_url);
  } catch {
    return false;
  }
};

/**
 * Validate required string (not empty)
 */
export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Validate string length
 */
export const isValidLength = (value: string, min: number, max: number): boolean => {
  const length = value.trim().length;
  return length >= min && length <= max;
};

/**
 * Validate time format (HH:mm)
 */
export const isValidTimeFormat = (time: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

/**
 * Validate date key format (YYYY-MM-DD)
 */
export const isValidDateKey = (dateKey: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateKey)) return false;

  const date = new Date(dateKey);
  return !isNaN(date.getTime());
};

/**
 * Validate week key format (YYYY-Www)
 */
export const isValidWeekKey = (weekKey: string): boolean => {
  const weekRegex = /^\d{4}-W(0[1-9]|[1-4][0-9]|5[0-3])$/;
  return weekRegex.test(weekKey);
};

/**
 * Flashcard validation
 */
export interface FlashcardValidationResult {
  isValid: boolean;
  errors: {
    frontText?: string;
    backText?: string;
    deck?: string;
  };
}

export const validateFlashcard = (
  frontText: string,
  backText: string,
  deck?: string,
): FlashcardValidationResult => {
  const errors: FlashcardValidationResult['errors'] = {};

  if (!isNotEmpty(frontText)) {
    errors.frontText = 'Question is required';
  }

  if (!isNotEmpty(backText)) {
    errors.backText = 'Answer is required';
  }

  if (deck && !isValidLength(deck, 1, 100)) {
    errors.deck = 'Deck name must be between 1 and 100 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Note validation
 */
export interface NoteValidationResult {
  isValid: boolean;
  errors: {
    title?: string;
    content?: string;
  };
}

export const validateNote = (title: string, content: string): NoteValidationResult => {
  const errors: NoteValidationResult['errors'] = {};

  if (!isNotEmpty(title)) {
    errors.title = 'Title is required';
  } else if (!isValidLength(title, 1, 200)) {
    errors.title = 'Title must be between 1 and 200 characters';
  }

  if (!isNotEmpty(content)) {
    errors.content = 'Content is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Bookmark validation
 */
export interface BookmarkValidationResult {
  isValid: boolean;
  errors: {
    title?: string;
    url?: string;
  };
}

export const validateBookmark = (title: string, url: string): BookmarkValidationResult => {
  const errors: BookmarkValidationResult['errors'] = {};

  if (!isNotEmpty(title)) {
    errors.title = 'Title is required';
  }

  if (!isNotEmpty(url)) {
    errors.url = 'URL is required';
  } else if (!isValidUrl(url)) {
    errors.url = 'Please enter a valid URL';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Habit validation
 */
export interface HabitValidationResult {
  isValid: boolean;
  errors: {
    name?: string;
  };
}

export const validateHabit = (name: string): HabitValidationResult => {
  const errors: HabitValidationResult['errors'] = {};

  if (!isNotEmpty(name)) {
    errors.name = 'Habit name is required';
  } else if (!isValidLength(name, 1, 100)) {
    errors.name = 'Habit name must be between 1 and 100 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Tag validation
 */
export const isValidTag = (tag: string): boolean => {
  return isNotEmpty(tag) && isValidLength(tag, 1, 50);
};

/**
 * Sanitize tag name (trim and lowercase for consistency)
 */
export const sanitizeTag = (tag: string): string => {
  return tag.trim();
};
