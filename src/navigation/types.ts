/**
 * Navigation Types
 * TypeScript types for navigation params and screens
 */

import type {NavigatorScreenParams} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';

// Root Stack (top-level navigation)
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabsParamList>;
};

// Auth Stack (authentication flow)
export type AuthStackParamList = {
  Login: undefined;
};

// Main Tabs (authenticated app)
export type MainTabsParamList = {
  Dashboard: undefined;
  Flashcards: NavigatorScreenParams<FlashcardsStackParamList>;
  Notes: NavigatorScreenParams<NotesStackParamList>;
  Calendar: undefined;
  Profile: undefined;
};

// Flashcards Stack
export type FlashcardsStackParamList = {
  FlashcardList: undefined;
  CreateFlashcard: undefined;
  FlashcardDetail: {flashcardId: string};
  ReviewSession: undefined;
};

// Notes Stack
export type NotesStackParamList = {
  NoteList: undefined;
  NoteEditor: {noteId?: string};
  NoteDetail: {noteId: string};
};

// Screen props types for type-safe navigation
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type MainTabsScreenProps<T extends keyof MainTabsParamList> =
  BottomTabScreenProps<MainTabsParamList, T>;

export type FlashcardsStackScreenProps<
  T extends keyof FlashcardsStackParamList,
> = NativeStackScreenProps<FlashcardsStackParamList, T>;

export type NotesStackScreenProps<T extends keyof NotesStackParamList> =
  NativeStackScreenProps<NotesStackParamList, T>;

// Declare global navigation types
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
