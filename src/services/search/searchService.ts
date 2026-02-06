/**
 * Search Service
 * Unified search across all content types (FR-014, FR-015, FR-016)
 */

import * as flashcardService from '../firebase/flashcardService';
import * as noteService from '../firebase/noteService';
import * as bookmarkService from '../firebase/bookmarkService';
import * as videoService from '../firebase/videoService';
import * as voiceNoteService from '../firebase/voiceNoteService';
import * as memorizeService from '../firebase/memorizeService';
import type { Flashcard } from '../../models/Flashcard';
import type { Note } from '../../models/Note';
import type { Bookmark } from '../../models/Bookmark';
import type { Video } from '../../models/Video';
import type { VoiceNote } from '../../models/VoiceNote';
import type { MemorizeItem } from '../../models/MemorizeItem';

export type ContentType = 'flashcard' | 'note' | 'bookmark' | 'video' | 'voiceNote' | 'memorize';

export interface SearchResult {
  id: string;
  type: ContentType;
  title: string;
  subtitle?: string;
  tags: string[];
  createdAt: number;
  data: Flashcard | Note | Bookmark | Video | VoiceNote | MemorizeItem;
}

export interface SearchOptions {
  contentTypes?: ContentType[];
  tags?: string[];
  limit?: number;
  sortBy?: 'relevance' | 'date' | 'title';
}

/**
 * Search all content types
 */
export const searchAllContent = async (
  query: string,
  options: SearchOptions = {},
): Promise<SearchResult[]> => {
  const {
    contentTypes = ['flashcard', 'note', 'bookmark', 'video', 'voiceNote', 'memorize'],
    tags,
    limit = 50,
    sortBy = 'relevance',
  } = options;

  const lowerQuery = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  // Search each content type in parallel
  const searchPromises: Promise<void>[] = [];

  if (contentTypes.includes('flashcard')) {
    searchPromises.push(
      searchFlashcards(lowerQuery, tags).then(items => {
        results.push(...items);
      }),
    );
  }

  if (contentTypes.includes('note')) {
    searchPromises.push(
      searchNotes(lowerQuery, tags).then(items => {
        results.push(...items);
      }),
    );
  }

  if (contentTypes.includes('bookmark')) {
    searchPromises.push(
      searchBookmarks(lowerQuery, tags).then(items => {
        results.push(...items);
      }),
    );
  }

  if (contentTypes.includes('video')) {
    searchPromises.push(
      searchVideos(lowerQuery, tags).then(items => {
        results.push(...items);
      }),
    );
  }

  if (contentTypes.includes('voiceNote')) {
    searchPromises.push(
      searchVoiceNotes(lowerQuery, tags).then(items => {
        results.push(...items);
      }),
    );
  }

  if (contentTypes.includes('memorize')) {
    searchPromises.push(
      searchMemorizeItems(lowerQuery, tags).then(items => {
        results.push(...items);
      }),
    );
  }

  await Promise.all(searchPromises);

  // Sort results
  const sortedResults = sortResults(results, sortBy, lowerQuery);

  // Limit results
  return sortedResults.slice(0, limit);
};

/**
 * Search by tag across all content types
 */
export const searchByTag = async (
  tag: string,
  contentTypes?: ContentType[],
): Promise<SearchResult[]> => {
  return searchAllContent('', { contentTypes, tags: [tag] });
};

/**
 * Get results grouped by content type
 */
export const searchGroupedByType = async (
  query: string,
  options: SearchOptions = {},
): Promise<Record<ContentType, SearchResult[]>> => {
  const results = await searchAllContent(query, options);

  const grouped: Record<ContentType, SearchResult[]> = {
    flashcard: [],
    note: [],
    bookmark: [],
    video: [],
    voiceNote: [],
    memorize: [],
  };

  results.forEach(result => {
    grouped[result.type].push(result);
  });

  return grouped;
};

// Individual search functions

const searchFlashcards = async (query: string, tags?: string[]): Promise<SearchResult[]> => {
  try {
    let flashcards = await flashcardService.getAllFlashcards();

    // Filter by query
    if (query) {
      flashcards = flashcards.filter(
        f =>
          f.frontText.toLowerCase().includes(query) ||
          f.backText.toLowerCase().includes(query) ||
          f.deck?.toLowerCase().includes(query),
      );
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      flashcards = flashcards.filter(f => tags.some(tag => f.tags?.includes(tag)));
    }

    return flashcards.map(f => ({
      id: f.id,
      type: 'flashcard' as ContentType,
      title: f.frontText,
      subtitle: f.backText,
      tags: f.tags || [],
      createdAt: f.createdAt,
      data: f,
    }));
  } catch {
    return [];
  }
};

const searchNotes = async (query: string, tags?: string[]): Promise<SearchResult[]> => {
  try {
    let notes = await noteService.getAllNotes();

    if (query) {
      notes = notes.filter(
        n =>
          n.title.toLowerCase().includes(query) ||
          n.content.toLowerCase().includes(query) ||
          n.folder?.toLowerCase().includes(query),
      );
    }

    if (tags && tags.length > 0) {
      notes = notes.filter(n => tags.some(tag => n.tags?.includes(tag)));
    }

    return notes.map(n => ({
      id: n.id,
      type: 'note' as ContentType,
      title: n.title,
      subtitle: n.content.substring(0, 100) + (n.content.length > 100 ? '...' : ''),
      tags: n.tags || [],
      createdAt: n.createdAt,
      data: n,
    }));
  } catch {
    return [];
  }
};

const searchBookmarks = async (query: string, tags?: string[]): Promise<SearchResult[]> => {
  try {
    let bookmarks = await bookmarkService.getAllBookmarks();

    if (query) {
      bookmarks = bookmarks.filter(
        b =>
          b.title.toLowerCase().includes(query) ||
          b.url.toLowerCase().includes(query) ||
          b.notes?.toLowerCase().includes(query),
      );
    }

    if (tags && tags.length > 0) {
      bookmarks = bookmarks.filter(b => tags.some(tag => b.tags?.includes(tag)));
    }

    return bookmarks.map(b => ({
      id: b.id,
      type: 'bookmark' as ContentType,
      title: b.title,
      subtitle: b.url,
      tags: b.tags || [],
      createdAt: b.createdAt,
      data: b,
    }));
  } catch {
    return [];
  }
};

const searchVideos = async (query: string, tags?: string[]): Promise<SearchResult[]> => {
  try {
    let videos = await videoService.getAllVideos();

    if (query) {
      videos = videos.filter(
        v =>
          v.title.toLowerCase().includes(query) ||
          (v.description?.toLowerCase().includes(query) ?? false),
      );
    }

    if (tags && tags.length > 0) {
      videos = videos.filter(v => tags.some(tag => v.tags?.includes(tag)));
    }

    return videos.map(v => ({
      id: v.id,
      type: 'video' as ContentType,
      title: v.title,
      subtitle: v.description,
      tags: v.tags || [],
      createdAt: v.createdAt,
      data: v,
    }));
  } catch {
    return [];
  }
};

const searchVoiceNotes = async (query: string, tags?: string[]): Promise<SearchResult[]> => {
  try {
    let voiceNotes = await voiceNoteService.getAllVoiceNotes();

    if (query) {
      voiceNotes = voiceNotes.filter(vn => vn.title.toLowerCase().includes(query));
    }

    if (tags && tags.length > 0) {
      voiceNotes = voiceNotes.filter(vn => tags.some(tag => vn.tags?.includes(tag)));
    }

    return voiceNotes.map(vn => ({
      id: vn.id,
      type: 'voiceNote' as ContentType,
      title: vn.title,
      subtitle: `${Math.floor(vn.durationSeconds / 60)}:${(vn.durationSeconds % 60)
        .toString()
        .padStart(2, '0')}`,
      tags: vn.tags || [],
      createdAt: vn.createdAt,
      data: vn,
    }));
  } catch {
    return [];
  }
};

const searchMemorizeItems = async (query: string, tags?: string[]): Promise<SearchResult[]> => {
  try {
    let items = await memorizeService.getAllMemorizeItems();

    if (query) {
      items = items.filter(
        m =>
          m.title.toLowerCase().includes(query) || m.contentSummary.toLowerCase().includes(query),
      );
    }

    if (tags && tags.length > 0) {
      items = items.filter(m => tags.some(tag => m.tags?.includes(tag)));
    }

    return items.map(m => ({
      id: m.id,
      type: 'memorize' as ContentType,
      title: m.title,
      subtitle: m.contentSummary,
      tags: m.tags || [],
      createdAt: m.createdAt,
      data: m,
    }));
  } catch {
    return [];
  }
};

// Sorting helper

const sortResults = (
  results: SearchResult[],
  sortBy: 'relevance' | 'date' | 'title',
  query: string,
): SearchResult[] => {
  switch (sortBy) {
    case 'date':
      return results.sort((a, b) => b.createdAt - a.createdAt);

    case 'title':
      return results.sort((a, b) => a.title.localeCompare(b.title));

    case 'relevance':
    default:
      // Sort by relevance: exact match > starts with > contains
      return results.sort((a, b) => {
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();

        const aExact = aTitle === query;
        const bExact = bTitle === query;
        if (aExact && !bExact) return -1;
        if (bExact && !aExact) return 1;

        const aStarts = aTitle.startsWith(query);
        const bStarts = bTitle.startsWith(query);
        if (aStarts && !bStarts) return -1;
        if (bStarts && !aStarts) return 1;

        // Fall back to date
        return b.createdAt - a.createdAt;
      });
  }
};

/**
 * Get recent items across all content types
 */
export const getRecentItems = async (limit: number = 10): Promise<SearchResult[]> => {
  const results = await searchAllContent('', { limit, sortBy: 'date' });
  return results;
};

/**
 * Get content count by type
 */
export const getContentCounts = async (): Promise<Record<ContentType, number>> => {
  const [flashcards, notes, bookmarks, videos, voiceNotes, memorizeItems] = await Promise.all([
    flashcardService.getAllFlashcards().catch(() => []),
    noteService.getAllNotes().catch(() => []),
    bookmarkService.getAllBookmarks().catch(() => []),
    videoService.getAllVideos().catch(() => []),
    voiceNoteService.getAllVoiceNotes().catch(() => []),
    memorizeService.getAllMemorizeItems().catch(() => []),
  ]);

  return {
    flashcard: flashcards.length,
    note: notes.length,
    bookmark: bookmarks.length,
    video: videos.length,
    voiceNote: voiceNotes.length,
    memorize: memorizeItems.length,
  };
};
