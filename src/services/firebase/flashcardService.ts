/**
 * Flashcard Firebase Service
 * CRUD operations for flashcards (FR-001 through FR-009)
 * Optimistic updates support (FR-017)
 */

import {
  getFlashcardsRef,
  getCurrentUserId,
  serverTimestamp,
  push,
  set,
  get,
  update,
  remove,
  child,
  onValue,
} from '../../config/firebase';
import type { Flashcard, CreateFlashcardInput, QualityRating } from '../../models/Flashcard';
import { applyReviewToFlashcard } from '../spacedRepetition/SM2Algorithm';
import { createAppError, parseFirebaseError } from '../../utils/errorHandler';
import { useStore } from '../../store';
import { generateTempId, executeOptimistically } from '../sync/optimisticUpdateManager';

/**
 * Create a new flashcard (with optimistic update support)
 */
export const createFlashcard = async (input: CreateFlashcardInput): Promise<Flashcard> => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw createAppError('auth/session-expired', 'User not authenticated');
  }

  const tempId = generateTempId();
  const today = new Date().toISOString().split('T')[0];
  const now = Date.now();

  const optimisticFlashcard: Flashcard = {
    id: tempId,
    userId,
    frontText: input.frontText,
    backText: input.backText,
    deck: input.deck,
    tags: input.tags || [],
    voiceNoteId: input.voiceNoteId,
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    nextReviewDate: today,
    totalReviews: 0,
    correctReviews: 0,
    incorrectReviews: 0,
    createdAt: now,
    updatedAt: now,
    _optimistic: true,
  };

  const store = useStore.getState();

  return executeOptimistically<Flashcard, Flashcard>({
    entityType: 'flashcard',
    operationType: 'create',
    entityId: tempId,
    optimisticData: optimisticFlashcard,
    applyOptimistic: () => {
      store.addFlashcard(optimisticFlashcard);
    },
    serverOperation: async () => {
      const flashcardsRef = getFlashcardsRef(userId);
      const newRef = push(flashcardsRef);
      const id = newRef.key!;

      const flashcard: Flashcard = {
        ...optimisticFlashcard,
        id,
        _optimistic: false,
      };

      await set(newRef, {
        ...flashcard,
        _optimistic: undefined, // Don't persist this field
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return flashcard;
    },
  });
};

/**
 * Create a new flashcard without optimistic updates (for internal use)
 */
export const createFlashcardSync = async (input: CreateFlashcardInput): Promise<Flashcard> => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw createAppError('auth/session-expired', 'User not authenticated');
  }

  const flashcardsRef = getFlashcardsRef(userId);
  const newRef = push(flashcardsRef);
  const id = newRef.key!;

  const today = new Date().toISOString().split('T')[0];
  const now = Date.now();

  const flashcard: Flashcard = {
    id,
    userId,
    frontText: input.frontText,
    backText: input.backText,
    deck: input.deck,
    tags: input.tags || [],
    voiceNoteId: input.voiceNoteId,
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    nextReviewDate: today,
    totalReviews: 0,
    correctReviews: 0,
    incorrectReviews: 0,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await set(newRef, {
      ...flashcard,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return flashcard;
  } catch (error) {
    throw parseFirebaseError(error);
  }
};

/**
 * Update a flashcard (with optimistic update support)
 */
export const updateFlashcard = async (
  flashcardId: string,
  updates: Partial<Flashcard>,
): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw createAppError('auth/session-expired', 'User not authenticated');
  }

  const store = useStore.getState();
  const originalFlashcard = store.flashcards[flashcardId];

  if (!originalFlashcard) {
    throw createAppError('not-found', 'Flashcard not found');
  }

  const optimisticFlashcard: Flashcard = {
    ...originalFlashcard,
    ...updates,
    updatedAt: Date.now(),
    _optimistic: true,
  };

  await executeOptimistically<Flashcard, void>({
    entityType: 'flashcard',
    operationType: 'update',
    entityId: flashcardId,
    optimisticData: optimisticFlashcard,
    originalData: originalFlashcard,
    applyOptimistic: () => {
      store.updateFlashcard(flashcardId, { ...updates, _optimistic: true });
    },
    serverOperation: async () => {
      const flashcardRef = child(getFlashcardsRef(userId), flashcardId);
      await update(flashcardRef, {
        ...updates,
        _optimistic: undefined,
        updatedAt: serverTimestamp(),
      });
    },
  });
};

/**
 * Update a flashcard without optimistic updates (for internal use)
 */
export const updateFlashcardSync = async (
  flashcardId: string,
  updates: Partial<Flashcard>,
): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw createAppError('auth/session-expired', 'User not authenticated');
  }

  const flashcardRef = child(getFlashcardsRef(userId), flashcardId);

  try {
    await update(flashcardRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw parseFirebaseError(error);
  }
};

/**
 * Delete a flashcard (with optimistic update support)
 */
export const deleteFlashcard = async (flashcardId: string): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw createAppError('auth/session-expired', 'User not authenticated');
  }

  const store = useStore.getState();
  const originalFlashcard = store.flashcards[flashcardId];

  if (!originalFlashcard) {
    throw createAppError('not-found', 'Flashcard not found');
  }

  await executeOptimistically<Flashcard, void>({
    entityType: 'flashcard',
    operationType: 'delete',
    entityId: flashcardId,
    optimisticData: originalFlashcard,
    originalData: originalFlashcard,
    applyOptimistic: () => {
      store.removeFlashcard(flashcardId);
    },
    serverOperation: async () => {
      const flashcardRef = child(getFlashcardsRef(userId), flashcardId);
      await remove(flashcardRef);
    },
  });
};

/**
 * Delete a flashcard without optimistic updates (for internal use)
 */
export const deleteFlashcardSync = async (flashcardId: string): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw createAppError('auth/session-expired', 'User not authenticated');
  }

  const flashcardRef = child(getFlashcardsRef(userId), flashcardId);

  try {
    await remove(flashcardRef);
  } catch (error) {
    throw parseFirebaseError(error);
  }
};

/**
 * Get all flashcards for current user
 */
export const getAllFlashcards = async (): Promise<Flashcard[]> => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw createAppError('auth/session-expired', 'User not authenticated');
  }

  const flashcardsRef = getFlashcardsRef(userId);

  try {
    const snapshot = await get(flashcardsRef);
    const data = snapshot.val();

    if (!data) return [];

    return Object.entries(data).map(([id, card]: [string, any]) => ({
      id,
      userId,
      frontText: card.frontText,
      backText: card.backText,
      deck: card.deck,
      tags: card.tags || [],
      voiceNoteId: card.voiceNoteId,
      easeFactor: card.easeFactor || 2.5,
      interval: card.interval || 1,
      repetitions: card.repetitions || 0,
      nextReviewDate: card.nextReviewDate,
      lastReviewDate: card.lastReviewDate,
      lastQualityRating: card.lastQualityRating,
      totalReviews: card.totalReviews || 0,
      correctReviews: card.correctReviews || 0,
      incorrectReviews: card.incorrectReviews || 0,
      createdAt: card.createdAt || Date.now(),
      updatedAt: card.updatedAt || Date.now(),
    }));
  } catch (error) {
    throw parseFirebaseError(error);
  }
};

/**
 * Get flashcards due for review
 */
export const getDueFlashcards = async (): Promise<Flashcard[]> => {
  const allCards = await getAllFlashcards();
  const today = new Date().toISOString().split('T')[0];

  return allCards.filter(card => card.nextReviewDate <= today);
};

/**
 * Get flashcards by deck
 */
export const getFlashcardsByDeck = async (deck: string): Promise<Flashcard[]> => {
  const allCards = await getAllFlashcards();
  return allCards.filter(card => card.deck === deck);
};

/**
 * Get flashcards by tag
 */
export const getFlashcardsByTag = async (tag: string): Promise<Flashcard[]> => {
  const allCards = await getAllFlashcards();
  return allCards.filter(card => card.tags.includes(tag));
};

/**
 * Review a flashcard and update with SM-2 algorithm
 */
export const reviewFlashcard = async (
  flashcard: Flashcard,
  quality: QualityRating,
): Promise<Flashcard> => {
  const updatedCard = applyReviewToFlashcard(flashcard, quality);

  await updateFlashcard(flashcard.id, {
    easeFactor: updatedCard.easeFactor,
    interval: updatedCard.interval,
    repetitions: updatedCard.repetitions,
    nextReviewDate: updatedCard.nextReviewDate,
    lastReviewDate: updatedCard.lastReviewDate,
    lastQualityRating: updatedCard.lastQualityRating,
    totalReviews: updatedCard.totalReviews,
    correctReviews: updatedCard.correctReviews,
    incorrectReviews: updatedCard.incorrectReviews,
  });

  return updatedCard;
};

/**
 * Listen to flashcards changes in real-time
 */
export const subscribeToFlashcards = (
  onData: (flashcards: Flashcard[]) => void,
  onError: (error: Error) => void,
): (() => void) => {
  const userId = getCurrentUserId();
  if (!userId) {
    onError(new Error('User not authenticated'));
    return () => {};
  }

  const flashcardsRef = getFlashcardsRef(userId);

  const unsubscribe = onValue(
    flashcardsRef,
    snapshot => {
      const data = snapshot.val();
      if (!data) {
        onData([]);
        return;
      }

      const flashcards: Flashcard[] = Object.entries(data).map(([id, card]: [string, any]) => ({
        id,
        userId,
        frontText: card.frontText,
        backText: card.backText,
        deck: card.deck,
        tags: card.tags || [],
        voiceNoteId: card.voiceNoteId,
        easeFactor: card.easeFactor || 2.5,
        interval: card.interval || 1,
        repetitions: card.repetitions || 0,
        nextReviewDate: card.nextReviewDate,
        lastReviewDate: card.lastReviewDate,
        lastQualityRating: card.lastQualityRating,
        totalReviews: card.totalReviews || 0,
        correctReviews: card.correctReviews || 0,
        incorrectReviews: card.incorrectReviews || 0,
        createdAt: card.createdAt || Date.now(),
        updatedAt: card.updatedAt || Date.now(),
      }));

      onData(flashcards);
    },
    error => {
      onError(error);
    },
  );

  return unsubscribe;
};

/**
 * Get count of due flashcards
 */
export const getDueCount = async (): Promise<number> => {
  const dueCards = await getDueFlashcards();
  return dueCards.length;
};

/**
 * Get all unique decks
 */
export const getAllDecks = async (): Promise<string[]> => {
  const allCards = await getAllFlashcards();
  const decks = new Set<string>();

  allCards.forEach(card => {
    if (card.deck) {
      decks.add(card.deck);
    }
  });

  return Array.from(decks).sort();
};

/**
 * Get most forgotten cards (cards with highest error rate)
 */
export const getMostForgottenCards = async (
  limit: number = 5,
): Promise<
  Array<{
    id: string;
    frontText: string;
    incorrectCount: number;
    totalReviews: number;
    errorRate: number;
  }>
> => {
  const allCards = await getAllFlashcards();

  // Filter cards that have been reviewed and calculate error rate
  const reviewedCards = allCards
    .filter(card => card.totalReviews > 0)
    .map(card => ({
      id: card.id,
      frontText: card.frontText,
      incorrectCount: card.incorrectReviews,
      totalReviews: card.totalReviews,
      errorRate: card.totalReviews > 0 ? card.incorrectReviews / card.totalReviews : 0,
    }))
    .sort((a, b) => b.errorRate - a.errorRate)
    .slice(0, limit);

  return reviewedCards;
};
