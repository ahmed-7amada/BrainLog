/**
 * useFlashcards Hook
 * Flashcard operations and state management
 */

import { useEffect, useCallback, useState } from 'react';
import { useStore } from '../store';
import * as flashcardService from '../services/firebase/flashcardService';
import * as progressService from '../services/firebase/progressService';
import type { Flashcard, CreateFlashcardInput, QualityRating } from '../models/Flashcard';

export const useFlashcards = () => {
  const {
    flashcards,
    dueCount,
    isLoading,
    error,
    setFlashcards,
    addFlashcard: addToStore,
    updateFlashcard: updateInStore,
    removeFlashcard: removeFromStore,
    setDueCount,
    setFlashcardsLoading,
    setFlashcardsError,
  } = useStore();

  const [isInitialized, setIsInitialized] = useState(false);

  // Load initial flashcards (real-time sync is handled by useRealtimeSync hook)
  useEffect(() => {
    const loadFlashcards = async () => {
      setFlashcardsLoading(true);
      try {
        const cards = await flashcardService.getAllFlashcards();
        setFlashcards(cards);
        // Calculate due count - nextReviewDate is ISO date string (YYYY-MM-DD)
        const today = new Date().toISOString().split('T')[0];
        const due = cards.filter(card => card.nextReviewDate <= today);
        setDueCount(due.length);
        setIsInitialized(true);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load flashcards';
        setFlashcardsError(message);
        setIsInitialized(true);
      } finally {
        setFlashcardsLoading(false);
      }
    };

    loadFlashcards();
  }, [setFlashcards, setDueCount, setFlashcardsError, setFlashcardsLoading]);

  // Note: Real-time subscriptions are handled by useRealtimeSync hook
  // Do NOT add another subscription here to avoid duplicate listeners

  // Update due count when flashcards change (from real-time sync)
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const due = Object.values(flashcards).filter(card => card.nextReviewDate <= today);
    setDueCount(due.length);
  }, [flashcards, setDueCount]);

  // Memoize flashcards as array for convenience
  const flashcardsArray = Object.values(flashcards);

  // Create flashcard
  const createFlashcard = useCallback(
    async (input: CreateFlashcardInput): Promise<Flashcard> => {
      setFlashcardsLoading(true);
      try {
        const newCard = await flashcardService.createFlashcard(input);
        addToStore(newCard);
        await progressService.recordNewFlashcard();
        return newCard;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to create flashcard';
        setFlashcardsError(message);
        throw err;
      } finally {
        setFlashcardsLoading(false);
      }
    },
    [addToStore, setFlashcardsLoading, setFlashcardsError],
  );

  // Update flashcard
  const updateFlashcard = useCallback(
    async (id: string, updates: Partial<Flashcard>): Promise<void> => {
      try {
        await flashcardService.updateFlashcard(id, updates);
        updateInStore(id, updates);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to update flashcard';
        setFlashcardsError(message);
        throw err;
      }
    },
    [updateInStore, setFlashcardsError],
  );

  // Delete flashcard
  const deleteFlashcard = useCallback(
    async (id: string): Promise<void> => {
      try {
        await flashcardService.deleteFlashcard(id);
        removeFromStore(id);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to delete flashcard';
        setFlashcardsError(message);
        throw err;
      }
    },
    [removeFromStore, setFlashcardsError],
  );

  // Review flashcard
  const reviewFlashcard = useCallback(
    async (flashcard: Flashcard, quality: QualityRating): Promise<Flashcard> => {
      try {
        const updatedCard = await flashcardService.reviewFlashcard(flashcard, quality);
        updateInStore(flashcard.id, updatedCard);

        // Record progress
        const isCorrect = quality !== 0;
        await progressService.recordFlashcardReview(isCorrect);

        return updatedCard;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to review flashcard';
        setFlashcardsError(message);
        throw err;
      }
    },
    [updateInStore, setFlashcardsError],
  );

  // Get all flashcards as array
  const getAllFlashcards = useCallback((): Flashcard[] => {
    return flashcardsArray;
  }, [flashcardsArray]);

  // Get due flashcards
  const getDueFlashcards = useCallback((): Flashcard[] => {
    const today = new Date().toISOString().split('T')[0];
    return flashcardsArray.filter(card => card.nextReviewDate <= today);
  }, [flashcardsArray]);

  // Get flashcards by deck
  const getFlashcardsByDeck = useCallback(
    (deck: string): Flashcard[] => {
      return flashcardsArray.filter(card => card.deck === deck);
    },
    [flashcardsArray],
  );

  // Get flashcards by tag
  const getFlashcardsByTag = useCallback(
    (tag: string): Flashcard[] => {
      return flashcardsArray.filter(card => card.tags.includes(tag));
    },
    [flashcardsArray],
  );

  // Get all unique decks
  const getAllDecks = useCallback((): string[] => {
    const decks = new Set<string>();
    flashcardsArray.forEach(card => {
      if (card.deck) {
        decks.add(card.deck);
      }
    });
    return Array.from(decks).sort();
  }, [flashcardsArray]);

  // Get flashcard by ID
  const getFlashcardById = useCallback(
    (id: string): Flashcard | undefined => {
      return flashcards[id];
    },
    [flashcards],
  );

  return {
    // State - flashcards as array for convenience
    flashcards: flashcardsArray,
    flashcardsMap: flashcards, // Original record by ID
    dueCount,
    isLoading,
    isInitialized,
    error,

    // Actions
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    reviewFlashcard,

    // Getters
    getAllFlashcards,
    getDueFlashcards,
    getFlashcardsByDeck,
    getFlashcardsByTag,
    getAllDecks,
    getFlashcardById,
  };
};

export default useFlashcards;
