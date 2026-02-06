/**
 * useNotes Hook
 * Notes management with Firebase integration
 */

import { useEffect, useCallback } from 'react';
import { useStore } from '../store';
import * as noteService from '../services/firebase/noteService';
import { getCurrentUserId } from '../config/firebase';
import type { Note } from '../models/Note';

export const useNotes = () => {
  // Use individual selectors to prevent re-renders from unrelated store changes
  const notesMap = useStore(state => state.notes);
  const selectedNote = useStore(state => state.selectedNote);
  const isLoadingNotes = useStore(state => state.isLoadingNotes);

  // Actions are stable - get them once from store
  const setNotes = useStore(state => state.setNotes);
  const setSelectedNote = useStore(state => state.setSelectedNote);
  const setLoadingNotes = useStore(state => state.setLoadingNotes);
  const addNote = useStore(state => state.addNote);
  const updateNoteInStore = useStore(state => state.updateNote);
  const removeNote = useStore(state => state.removeNote);

  // Convert notes from Record to sorted array
  const notes = Object.values(notesMap).sort((a, b) => b.updatedAt - a.updatedAt);

  // Load initial notes (real-time sync is handled by useRealtimeSync hook)
  useEffect(() => {
    const loadNotes = async () => {
      setLoadingNotes(true);
      try {
        const loadedNotes = await noteService.getAllNotes();
        setNotes(loadedNotes);
      } catch (error) {
        console.error('Error loading notes:', error);
      } finally {
        setLoadingNotes(false);
      }
    };

    loadNotes();
  }, [setNotes, setLoadingNotes]);

  // Note: Real-time subscriptions are handled by useRealtimeSync hook
  // Do NOT add another subscription here to avoid duplicate listeners

  // Create note
  const createNote = useCallback(
    async (
      title: string,
      content: string,
      options?: {
        tags?: string[];
        category?: string;
        folder?: string;
      },
    ) => {
      const userId = getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');

      try {
        const note = await noteService.createNote({
          userId,
          title,
          content,
          tags: options?.tags,
          category: options?.category,
          folder: options?.folder,
        });
        addNote(note);
        return note;
      } catch (error) {
        console.error('Error creating note:', error);
        throw error;
      }
    },
    [addNote],
  );

  // Update note
  const updateNote = useCallback(
    async (noteId: string, updates: Partial<Note>) => {
      try {
        await noteService.updateNote(noteId, updates);
        updateNoteInStore(noteId, updates);
      } catch (error) {
        console.error('Error updating note:', error);
        throw error;
      }
    },
    [updateNoteInStore],
  );

  // Delete note
  const deleteNote = useCallback(
    async (noteId: string) => {
      try {
        await noteService.deleteNote(noteId);
        removeNote(noteId);
      } catch (error) {
        console.error('Error deleting note:', error);
        throw error;
      }
    },
    [removeNote],
  );

  // Toggle pinned
  const togglePinned = useCallback(
    async (noteId: string) => {
      const note = notes.find(n => n.id === noteId);
      if (note) {
        await updateNote(noteId, { isPinned: !note.isPinned });
      }
    },
    [notes, updateNote],
  );

  // Get note by ID
  const getNoteById = useCallback(
    (noteId: string) => {
      return notes.find(n => n.id === noteId) || null;
    },
    [notes],
  );

  // Get pinned notes
  const getPinnedNotes = useCallback(() => {
    return notes.filter(n => n.isPinned);
  }, [notes]);

  // Get notes by folder
  const getNotesByFolder = useCallback(
    (folder: string) => {
      return notes.filter(n => n.folder === folder);
    },
    [notes],
  );

  // Get notes by category
  const getNotesByCategory = useCallback(
    (category: string) => {
      return notes.filter(n => n.category === category);
    },
    [notes],
  );

  // Get notes by tag
  const getNotesByTag = useCallback(
    (tag: string) => {
      return notes.filter(n => n.tags.includes(tag));
    },
    [notes],
  );

  // Get all unique folders
  const getAllFolders = useCallback(() => {
    const folders = new Set<string>();
    notes.forEach(note => {
      if (note.folder) {
        folders.add(note.folder);
      }
    });
    return Array.from(folders).sort();
  }, [notes]);

  // Get all unique categories
  const getAllCategories = useCallback(() => {
    const categories = new Set<string>();
    notes.forEach(note => {
      if (note.category) {
        categories.add(note.category);
      }
    });
    return Array.from(categories).sort();
  }, [notes]);

  // Get all unique tags
  const getAllTags = useCallback(() => {
    const tags = new Set<string>();
    notes.forEach(note => {
      note.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [notes]);

  // Search notes
  const searchNotes = useCallback(
    (query: string) => {
      const lowerQuery = query.toLowerCase();
      return notes.filter(
        note =>
          note.title.toLowerCase().includes(lowerQuery) ||
          note.content.toLowerCase().includes(lowerQuery) ||
          note.tags.some(tag => tag.toLowerCase().includes(lowerQuery)),
      );
    },
    [notes],
  );

  return {
    // State
    notes,
    selectedNote,
    isLoading: isLoadingNotes,
    notesCount: notes.length,
    pinnedCount: notes.filter(n => n.isPinned).length,

    // Actions
    createNote,
    updateNote,
    deleteNote,
    togglePinned,
    setSelectedNote,

    // Getters
    getNoteById,
    getPinnedNotes,
    getNotesByFolder,
    getNotesByCategory,
    getNotesByTag,
    getAllFolders,
    getAllCategories,
    getAllTags,
    searchNotes,
  };
};

export default useNotes;
