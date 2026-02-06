/**
 * Note Firebase Service
 * CRUD operations for notes (FR-010, FR-016)
 * Optimistic updates support (FR-017)
 */

import {
  getNotesRef,
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
import type { Note, CreateNoteInput } from '../../models/Note';
import { createAppError, parseFirebaseError } from '../../utils/errorHandler';
import { useStore } from '../../store';
import { generateTempId, executeOptimistically } from '../sync/optimisticUpdateManager';

/**
 * Create a new note (with optimistic update support)
 */
export const createNote = async (input: CreateNoteInput): Promise<Note> => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw createAppError('auth/session-expired', 'User not authenticated');
  }

  const tempId = generateTempId();
  const now = Date.now();

  const optimisticNote: Note = {
    id: tempId,
    userId,
    title: input.title,
    content: input.content,
    tags: input.tags || [],
    category: input.category,
    folder: input.folder,
    voiceNoteId: input.voiceNoteId,
    isPinned: input.isPinned || false,
    createdAt: now,
    updatedAt: now,
    _optimistic: true,
  };

  const store = useStore.getState();

  return executeOptimistically<Note, Note>({
    entityType: 'note',
    operationType: 'create',
    entityId: tempId,
    optimisticData: optimisticNote,
    applyOptimistic: () => {
      store.addNote(optimisticNote);
    },
    serverOperation: async () => {
      const notesRef = getNotesRef(userId);
      const newRef = push(notesRef);
      const id = newRef.key!;

      const note: Note = {
        ...optimisticNote,
        id,
        _optimistic: false,
      };

      await set(newRef, {
        ...note,
        _optimistic: undefined, // Don't persist this field
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return note;
    },
  });
};

/**
 * Create a new note without optimistic updates (for internal use)
 */
export const createNoteSync = async (input: CreateNoteInput): Promise<Note> => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw createAppError('auth/session-expired', 'User not authenticated');
  }

  const notesRef = getNotesRef(userId);
  const newRef = push(notesRef);
  const id = newRef.key!;
  const now = Date.now();

  const note: Note = {
    id,
    userId,
    title: input.title,
    content: input.content,
    tags: input.tags || [],
    category: input.category,
    folder: input.folder,
    voiceNoteId: input.voiceNoteId,
    isPinned: input.isPinned || false,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await set(newRef, {
      ...note,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return note;
  } catch (error) {
    throw parseFirebaseError(error);
  }
};

/**
 * Update a note (with optimistic update support)
 */
export const updateNote = async (noteId: string, updates: Partial<Note>): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw createAppError('auth/session-expired', 'User not authenticated');
  }

  const store = useStore.getState();
  const originalNote = store.notes[noteId];

  if (!originalNote) {
    throw createAppError('not-found', 'Note not found');
  }

  const optimisticNote: Note = {
    ...originalNote,
    ...updates,
    updatedAt: Date.now(),
    _optimistic: true,
  };

  await executeOptimistically<Note, void>({
    entityType: 'note',
    operationType: 'update',
    entityId: noteId,
    optimisticData: optimisticNote,
    originalData: originalNote,
    applyOptimistic: () => {
      store.updateNote(noteId, { ...updates, _optimistic: true });
    },
    serverOperation: async () => {
      const noteRef = child(getNotesRef(userId), noteId);
      await update(noteRef, {
        ...updates,
        _optimistic: undefined,
        updatedAt: serverTimestamp(),
      });
    },
  });
};

/**
 * Update a note without optimistic updates (for internal use)
 */
export const updateNoteSync = async (noteId: string, updates: Partial<Note>): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw createAppError('auth/session-expired', 'User not authenticated');
  }

  const noteRef = child(getNotesRef(userId), noteId);

  try {
    await update(noteRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw parseFirebaseError(error);
  }
};

/**
 * Delete a note (with optimistic update support)
 */
export const deleteNote = async (noteId: string): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw createAppError('auth/session-expired', 'User not authenticated');
  }

  const store = useStore.getState();
  const originalNote = store.notes[noteId];

  if (!originalNote) {
    throw createAppError('not-found', 'Note not found');
  }

  await executeOptimistically<Note, void>({
    entityType: 'note',
    operationType: 'delete',
    entityId: noteId,
    optimisticData: originalNote,
    originalData: originalNote,
    applyOptimistic: () => {
      store.removeNote(noteId);
    },
    serverOperation: async () => {
      const noteRef = child(getNotesRef(userId), noteId);
      await remove(noteRef);
    },
  });
};

/**
 * Delete a note without optimistic updates (for internal use)
 */
export const deleteNoteSync = async (noteId: string): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw createAppError('auth/session-expired', 'User not authenticated');
  }

  const noteRef = child(getNotesRef(userId), noteId);

  try {
    await remove(noteRef);
  } catch (error) {
    throw parseFirebaseError(error);
  }
};

/**
 * Get all notes for current user
 */
export const getAllNotes = async (): Promise<Note[]> => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw createAppError('auth/session-expired', 'User not authenticated');
  }

  const notesRef = getNotesRef(userId);

  try {
    const snapshot = await get(notesRef);
    const data = snapshot.val();

    if (!data) return [];

    return Object.entries(data)
      .map(([id, note]: [string, any]) => ({
        id,
        userId,
        title: note.title,
        content: note.content,
        tags: note.tags || [],
        category: note.category,
        folder: note.folder,
        voiceNoteId: note.voiceNoteId,
        isPinned: note.isPinned || false,
        createdAt: note.createdAt || Date.now(),
        updatedAt: note.updatedAt || Date.now(),
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (error) {
    throw parseFirebaseError(error);
  }
};

/**
 * Get note by ID
 */
export const getNoteById = async (noteId: string): Promise<Note | null> => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw createAppError('auth/session-expired', 'User not authenticated');
  }

  const noteRef = child(getNotesRef(userId), noteId);

  try {
    const snapshot = await get(noteRef);
    const data = snapshot.val();

    if (!data) return null;

    return {
      id: noteId,
      userId,
      title: data.title,
      content: data.content,
      tags: data.tags || [],
      category: data.category,
      folder: data.folder,
      voiceNoteId: data.voiceNoteId,
      isPinned: data.isPinned || false,
      createdAt: data.createdAt || Date.now(),
      updatedAt: data.updatedAt || Date.now(),
    };
  } catch (error) {
    throw parseFirebaseError(error);
  }
};

/**
 * Get notes by folder
 */
export const getNotesByFolder = async (folder: string): Promise<Note[]> => {
  const allNotes = await getAllNotes();
  return allNotes.filter(note => note.folder === folder);
};

/**
 * Get notes by category
 */
export const getNotesByCategory = async (category: string): Promise<Note[]> => {
  const allNotes = await getAllNotes();
  return allNotes.filter(note => note.category === category);
};

/**
 * Get notes by tag
 */
export const getNotesByTag = async (tag: string): Promise<Note[]> => {
  const allNotes = await getAllNotes();
  return allNotes.filter(note => note.tags.includes(tag));
};

/**
 * Get pinned notes
 */
export const getPinnedNotes = async (): Promise<Note[]> => {
  const allNotes = await getAllNotes();
  return allNotes.filter(note => note.isPinned);
};

/**
 * Toggle note pinned status
 */
export const toggleNotePinned = async (noteId: string): Promise<void> => {
  const note = await getNoteById(noteId);
  if (note) {
    await updateNote(noteId, { isPinned: !note.isPinned });
  }
};

/**
 * Get all unique folders
 */
export const getAllFolders = async (): Promise<string[]> => {
  const allNotes = await getAllNotes();
  const folders = new Set<string>();

  allNotes.forEach(note => {
    if (note.folder) {
      folders.add(note.folder);
    }
  });

  return Array.from(folders).sort();
};

/**
 * Get all unique categories
 */
export const getAllCategories = async (): Promise<string[]> => {
  const allNotes = await getAllNotes();
  const categories = new Set<string>();

  allNotes.forEach(note => {
    if (note.category) {
      categories.add(note.category);
    }
  });

  return Array.from(categories).sort();
};

/**
 * Subscribe to notes changes in real-time
 */
export const subscribeToNotes = (
  onData: (notes: Note[]) => void,
  onError: (error: Error) => void,
): (() => void) => {
  const userId = getCurrentUserId();
  if (!userId) {
    onError(new Error('User not authenticated'));
    return () => {};
  }

  const notesRef = getNotesRef(userId);

  const unsubscribe = onValue(
    notesRef,
    snapshot => {
      const data = snapshot.val();
      if (!data) {
        onData([]);
        return;
      }

      const notes: Note[] = Object.entries(data)
        .map(([id, note]: [string, any]) => ({
          id,
          userId,
          title: note.title,
          content: note.content,
          tags: note.tags || [],
          category: note.category,
          folder: note.folder,
          voiceNoteId: note.voiceNoteId,
          isPinned: note.isPinned || false,
          createdAt: note.createdAt || Date.now(),
          updatedAt: note.updatedAt || Date.now(),
        }))
        .sort((a, b) => b.updatedAt - a.updatedAt);

      onData(notes);
    },
    error => {
      onError(error);
    },
  );

  return unsubscribe;
};
