/**
 * Flashcards Slice
 * Manages flashcard state and operations with real-time sync support (FR-001, FR-002)
 */

import { StateCreator } from 'zustand';
import type { Flashcard } from '../../models/Flashcard';

export interface FlashcardsSlice {
  // State
  flashcards: Record<string, Flashcard>; // indexed by ID
  dueCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  setFlashcards: (flashcards: Flashcard[]) => void;
  addFlashcard: (flashcard: Flashcard) => void;
  updateFlashcard: (id: string, updates: Partial<Flashcard>) => void;
  removeFlashcard: (id: string) => void;
  setDueCount: (count: number) => void;
  setFlashcardsLoading: (loading: boolean) => void;
  setFlashcardsError: (error: string | null) => void;
  clearFlashcards: () => void;

  // Real-time sync actions (Feature 003)
  mergeFlashcards: (remoteFlashcards: Flashcard[]) => void;
  replaceFlashcard: (tempId: string, confirmedFlashcard: Flashcard) => void;
  markFlashcardOptimistic: (id: string, optimistic: boolean) => void;
}

export const createFlashcardsSlice: StateCreator<FlashcardsSlice> = (set, _get) => ({
  // Initial state
  flashcards: {},
  dueCount: 0,
  isLoading: false,
  error: null,

  // Actions
  setFlashcards: flashcards => {
    const flashcardsMap: Record<string, Flashcard> = {};
    flashcards.forEach(card => {
      flashcardsMap[card.id] = card;
    });
    set({ flashcards: flashcardsMap, isLoading: false, error: null });
  },

  addFlashcard: flashcard =>
    set(state => ({
      flashcards: {
        ...state.flashcards,
        [flashcard.id]: flashcard,
      },
    })),

  updateFlashcard: (id, updates) =>
    set(state => {
      const existing = state.flashcards[id];
      if (!existing) return state;

      return {
        flashcards: {
          ...state.flashcards,
          [id]: {
            ...existing,
            ...updates,
            updatedAt: Date.now(),
          },
        },
      };
    }),

  removeFlashcard: id =>
    set(state => {
      const flashcards = Object.fromEntries(
        Object.entries(state.flashcards).filter(([key]) => key !== id),
      );
      return { flashcards };
    }),

  setDueCount: dueCount => set({ dueCount }),

  setFlashcardsLoading: isLoading => set({ isLoading }),

  setFlashcardsError: error => set({ error, isLoading: false }),

  clearFlashcards: () => set({ flashcards: {}, dueCount: 0 }),

  // Real-time sync actions (Feature 003)
  mergeFlashcards: remoteFlashcards =>
    set(state => {
      const merged: Record<string, Flashcard> = { ...state.flashcards };

      // Track which remote IDs we've seen
      const remoteIds = new Set<string>();

      remoteFlashcards.forEach(remoteCard => {
        remoteIds.add(remoteCard.id);
        const localCard = merged[remoteCard.id];

        if (!localCard) {
          // New flashcard from server
          merged[remoteCard.id] = remoteCard;
        } else if (localCard._optimistic) {
          // Local has pending changes - compare timestamps
          const localTime = localCard.updatedAt || 0;
          const remoteTime = remoteCard.updatedAt || 0;

          if (remoteTime > localTime) {
            // Remote wins - overwrite local optimistic
            merged[remoteCard.id] = remoteCard;
          }
          // Otherwise keep local optimistic version
        } else {
          // No local optimistic changes - accept remote
          merged[remoteCard.id] = remoteCard;
        }
      });

      // Remove flashcards that are not in remote and not optimistic
      Object.keys(merged).forEach(id => {
        if (!remoteIds.has(id) && !merged[id]._optimistic) {
          delete merged[id];
        }
      });

      return { flashcards: merged };
    }),

  replaceFlashcard: (tempId, confirmedFlashcard) =>
    set(state => {
      const flashcards = { ...state.flashcards };
      delete flashcards[tempId];
      flashcards[confirmedFlashcard.id] = confirmedFlashcard;
      return { flashcards };
    }),

  markFlashcardOptimistic: (id, optimistic) =>
    set(state => {
      const card = state.flashcards[id];
      if (!card) return state;

      return {
        flashcards: {
          ...state.flashcards,
          [id]: {
            ...card,
            _optimistic: optimistic,
          },
        },
      };
    }),
});

// Selectors
export const selectAllFlashcards = (state: FlashcardsSlice): Flashcard[] =>
  Object.values(state.flashcards);

export const selectFlashcardById = (state: FlashcardsSlice, id: string): Flashcard | undefined =>
  state.flashcards[id];

export const selectDueFlashcards = (state: FlashcardsSlice): Flashcard[] => {
  const today = new Date().toISOString().split('T')[0];
  return Object.values(state.flashcards).filter(card => card.nextReviewDate <= today);
};

export const selectFlashcardsByDeck = (state: FlashcardsSlice, deck: string): Flashcard[] =>
  Object.values(state.flashcards).filter(card => card.deck === deck);

export const selectFlashcardsByTag = (state: FlashcardsSlice, tag: string): Flashcard[] =>
  Object.values(state.flashcards).filter(card => card.tags.includes(tag));
