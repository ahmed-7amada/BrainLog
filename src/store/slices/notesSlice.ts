/**
 * Notes Slice
 * Manages notes state
 */

import {StateCreator} from 'zustand';
import {Note} from '@/models';

export interface NotesSlice {
  notes: Note[];
  selectedFolder: string | null;
  selectedCategory: string | null;

  // Actions
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNote: (note: Note) => void;
  removeNote: (noteId: string) => void;
  setSelectedFolder: (folder: string | null) => void;
  setSelectedCategory: (category: string | null) => void;
  clearFilters: () => void;
}

export const createNotesSlice: StateCreator<NotesSlice> = set => ({
  notes: [],
  selectedFolder: null,
  selectedCategory: null,

  setNotes: notes => set({notes}),

  addNote: note =>
    set(state => ({
      notes: [...state.notes, note],
    })),

  updateNote: note =>
    set(state => ({
      notes: state.notes.map(n => (n.id === note.id ? note : n)),
    })),

  removeNote: noteId =>
    set(state => ({
      notes: state.notes.filter(n => n.id !== noteId),
    })),

  setSelectedFolder: folder => set({selectedFolder: folder}),

  setSelectedCategory: category => set({selectedCategory: category}),

  clearFilters: () =>
    set({
      selectedFolder: null,
      selectedCategory: null,
    }),
});
