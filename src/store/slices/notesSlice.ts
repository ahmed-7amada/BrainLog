/**
 * Notes Slice
 * Manages notes state and operations with real-time sync support (FR-001, FR-002)
 */

import { StateCreator } from 'zustand';
import type { Note } from '../../models/Note';

export interface NotesSlice {
  // State
  notes: Record<string, Note>; // indexed by ID
  selectedNote: Note | null;
  isLoadingNotes: boolean;
  error: string | null;

  // Actions
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  removeNote: (id: string) => void;
  setSelectedNote: (note: Note | null) => void;
  setLoadingNotes: (loading: boolean) => void;
  setNotesLoading: (loading: boolean) => void;
  setNotesError: (error: string | null) => void;
  clearNotes: () => void;

  // Real-time sync actions (Feature 003)
  mergeNotes: (remoteNotes: Note[]) => void;
  replaceNote: (tempId: string, confirmedNote: Note) => void;
  markNoteOptimistic: (id: string, optimistic: boolean) => void;
}

export const createNotesSlice: StateCreator<NotesSlice> = (set, _get) => ({
  // Initial state
  notes: {},
  selectedNote: null,
  isLoadingNotes: false,
  error: null,

  // Actions
  setNotes: notes => {
    const notesMap: Record<string, Note> = {};
    notes.forEach(note => {
      notesMap[note.id] = note;
    });
    set({ notes: notesMap, isLoadingNotes: false, error: null });
  },

  addNote: note =>
    set(state => ({
      notes: {
        ...state.notes,
        [note.id]: note,
      },
    })),

  updateNote: (id, updates) =>
    set(state => {
      const existing = state.notes[id];
      if (!existing) return state;

      return {
        notes: {
          ...state.notes,
          [id]: {
            ...existing,
            ...updates,
            updatedAt: Date.now(),
          },
        },
      };
    }),

  removeNote: id =>
    set(state => {
      const notes = Object.fromEntries(Object.entries(state.notes).filter(([key]) => key !== id));
      return { notes };
    }),

  setSelectedNote: note => set({ selectedNote: note }),

  setLoadingNotes: isLoadingNotes => set({ isLoadingNotes }),

  setNotesLoading: isLoadingNotes => set({ isLoadingNotes }),

  setNotesError: error => set({ error, isLoadingNotes: false }),

  clearNotes: () => set({ notes: {}, selectedNote: null }),

  // Real-time sync actions (Feature 003)
  mergeNotes: remoteNotes =>
    set(state => {
      const merged: Record<string, Note> = { ...state.notes };

      // Track which remote IDs we've seen
      const remoteIds = new Set<string>();

      remoteNotes.forEach(remoteNote => {
        remoteIds.add(remoteNote.id);
        const localNote = merged[remoteNote.id];

        if (!localNote) {
          // New note from server
          merged[remoteNote.id] = remoteNote;
        } else if (localNote._optimistic) {
          // Local has pending changes - compare timestamps
          const localTime = localNote.updatedAt || 0;
          const remoteTime = remoteNote.updatedAt || 0;

          if (remoteTime > localTime) {
            // Remote wins - overwrite local optimistic
            merged[remoteNote.id] = remoteNote;
          }
          // Otherwise keep local optimistic version
        } else {
          // No local optimistic changes - accept remote
          merged[remoteNote.id] = remoteNote;
        }
      });

      // Remove notes that are not in remote and not optimistic
      Object.keys(merged).forEach(id => {
        if (!remoteIds.has(id) && !merged[id]._optimistic) {
          delete merged[id];
        }
      });

      return { notes: merged };
    }),

  replaceNote: (tempId, confirmedNote) =>
    set(state => {
      const notes = { ...state.notes };
      delete notes[tempId];
      notes[confirmedNote.id] = confirmedNote;
      return { notes };
    }),

  markNoteOptimistic: (id, optimistic) =>
    set(state => {
      const note = state.notes[id];
      if (!note) return state;

      return {
        notes: {
          ...state.notes,
          [id]: {
            ...note,
            _optimistic: optimistic,
          },
        },
      };
    }),
});

// Selectors
export const selectAllNotes = (state: NotesSlice): Note[] =>
  Object.values(state.notes).sort((a, b) => b.updatedAt - a.updatedAt);

export const selectNoteById = (state: NotesSlice, id: string): Note | undefined => state.notes[id];

export const selectPinnedNotes = (state: NotesSlice): Note[] =>
  Object.values(state.notes)
    .filter(note => note.isPinned)
    .sort((a, b) => b.updatedAt - a.updatedAt);

export const selectNotesByFolder = (state: NotesSlice, folder: string): Note[] =>
  Object.values(state.notes).filter(note => note.folder === folder);

export const selectNotesByCategory = (state: NotesSlice, category: string): Note[] =>
  Object.values(state.notes).filter(note => note.category === category);

export const selectNotesByTag = (state: NotesSlice, tag: string): Note[] =>
  Object.values(state.notes).filter(note => note.tags.includes(tag));

export const selectRecentNotes = (state: NotesSlice, limit: number = 5): Note[] =>
  selectAllNotes(state).slice(0, limit);
