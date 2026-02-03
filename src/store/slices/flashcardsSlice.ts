/**
 * Flashcards Slice
 * Manages flashcard state and review session
 */

import {StateCreator} from 'zustand';
import {Flashcard} from '@/models';

export interface FlashcardsSlice {
  flashcards: Flashcard[];
  dueFlashcards: Flashcard[];
  currentReviewSession: Flashcard[];
  currentReviewIndex: number;
  isReviewActive: boolean;

  // Actions
  setFlashcards: (flashcards: Flashcard[]) => void;
  setDueFlashcards: (flashcards: Flashcard[]) => void;
  startReviewSession: (flashcards: Flashcard[]) => void;
  nextCard: () => void;
  endReviewSession: () => void;
  updateFlashcard: (flashcard: Flashcard) => void;
  addFlashcard: (flashcard: Flashcard) => void;
  removeFlashcard: (flashcardId: string) => void;
}

export const createFlashcardsSlice: StateCreator<FlashcardsSlice> = set => ({
  flashcards: [],
  dueFlashcards: [],
  currentReviewSession: [],
  currentReviewIndex: 0,
  isReviewActive: false,

  setFlashcards: flashcards => set({flashcards}),

  setDueFlashcards: flashcards => set({dueFlashcards: flashcards}),

  startReviewSession: flashcards =>
    set({
      currentReviewSession: flashcards,
      currentReviewIndex: 0,
      isReviewActive: true,
    }),

  nextCard: () =>
    set(state => ({
      currentReviewIndex: state.currentReviewIndex + 1,
    })),

  endReviewSession: () =>
    set({
      currentReviewSession: [],
      currentReviewIndex: 0,
      isReviewActive: false,
    }),

  updateFlashcard: flashcard =>
    set(state => ({
      flashcards: state.flashcards.map(f => (f.id === flashcard.id ? flashcard : f)),
    })),

  addFlashcard: flashcard =>
    set(state => ({
      flashcards: [...state.flashcards, flashcard],
    })),

  removeFlashcard: flashcardId =>
    set(state => ({
      flashcards: state.flashcards.filter(f => f.id !== flashcardId),
    })),
});
