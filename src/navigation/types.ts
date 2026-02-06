/**
 * Navigation Type Definitions
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  Dashboard: undefined;
  Flashcards: NavigatorScreenParams<FlashcardsStackParamList>;
  Notes: NavigatorScreenParams<NotesStackParamList>;
  Calendar: NavigatorScreenParams<CalendarStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

// Flashcards Stack
export type FlashcardsStackParamList = {
  FlashcardList: undefined;
  CreateFlashcard: { deckId?: string } | undefined;
  EditFlashcard: { flashcardId: string };
  FlashcardDetail: { flashcardId: string };
  ReviewSession: { deckId?: string } | undefined;
  ReviewComplete: {
    cardsReviewed: number;
    correctCount: number;
    incorrectCount: number;
    xpEarned: number;
  };
};

// Notes Stack
export type NotesStackParamList = {
  NoteList: undefined;
  CreateNote: { folderId?: string } | undefined;
  EditNote: { noteId: string };
  NoteDetail: { noteId: string };
  // Bookmarks
  BookmarkList: undefined;
  CreateBookmark: undefined;
  BookmarkDetail: { id: string };
  // Videos
  VideoList: undefined;
  VideoDetail: { id: string };
  UploadVideo: undefined;
  // Voice Notes
  VoiceNoteList: undefined;
  VoiceNoteDetail: { id: string };
  RecordVoiceNote: undefined;
};

// Calendar Stack
export type CalendarStackParamList = {
  CalendarView: undefined;
  DayDetail: { dateKey: string };
  DailyLog: { dateKey?: string } | undefined;
  WeeklySummary: { weekKey?: string } | undefined;
  WeeklySummaryList: undefined;
  WeeklySummaryDetail: { weekKey: string };
};

// Profile Stack
export type ProfileStackParamList = {
  ProfileMain: undefined;
  Settings: undefined;
  Badges: undefined;
  Statistics: undefined;
  Habits: undefined;
  CreateHabit: undefined;
  EditHabit: { habitId: string };
  // Memorize
  MemorizeList: undefined;
  MemorizeDetail: { id: string };
  MemorizeReview: undefined;
  CreateMemorizeItem: undefined;
};

// Root Navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Search: undefined;
};

// Screen Props Types
export type AuthStackScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

export type FlashcardsScreenProps<T extends keyof FlashcardsStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<FlashcardsStackParamList, T>,
  MainTabScreenProps<'Flashcards'>
>;

export type NotesScreenProps<T extends keyof NotesStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<NotesStackParamList, T>,
  MainTabScreenProps<'Notes'>
>;

export type CalendarScreenProps<T extends keyof CalendarStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<CalendarStackParamList, T>,
  MainTabScreenProps<'Calendar'>
>;

export type ProfileScreenProps<T extends keyof ProfileStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, T>,
  MainTabScreenProps<'Profile'>
>;

// Declare global types for navigation

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
