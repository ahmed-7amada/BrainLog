/**
 * Firebase Configuration
 * Initialize Firebase services using modular API (v22+)
 */

import firebase from '@react-native-firebase/app';
import {
  getAuth as firebaseGetAuth,
  signInWithCredential as firebaseSignInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  GoogleAuthProvider,
  FirebaseAuthTypes,
} from '@react-native-firebase/auth';
import {
  getDatabase as firebaseGetDatabase,
  ref,
  child,
  get,
  set,
  update,
  remove,
  push,
  onValue,
  off,
  query,
  orderByChild,
  orderByKey,
  startAt,
  endAt,
  equalTo,
  runTransaction,
  serverTimestamp as firebaseServerTimestamp,
  DatabaseReference,
} from '@react-native-firebase/database';

// Firebase is auto-configured from google-services.json (Android)
// and GoogleService-Info.plist (iOS)

// Cached instances for performance
let authInstance: ReturnType<typeof firebaseGetAuth> | null = null;
let dbInstance: ReturnType<typeof firebaseGetDatabase> | null = null;

/**
 * Get Firebase Auth instance (cached)
 */
export const getAuth = () => {
  if (!authInstance) {
    authInstance = firebaseGetAuth();
  }
  return authInstance;
};

/**
 * Get Firebase Realtime Database instance (cached)
 */
export const getDatabase = () => {
  if (!dbInstance) {
    dbInstance = firebaseGetDatabase();
  }
  return dbInstance;
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = () => getAuth().currentUser;

/**
 * Get user ID of current authenticated user
 */
export const getCurrentUserId = (): string | null => {
  const user = getAuth().currentUser;
  return user?.uid || null;
};

/**
 * Database reference helpers
 */
export const getUserRef = (userId: string): DatabaseReference => {
  return ref(getDatabase(), `users/${userId}`);
};

export const getFlashcardsRef = (userId: string): DatabaseReference => {
  return ref(getDatabase(), `users/${userId}/flashcards`);
};

export const getNotesRef = (userId: string): DatabaseReference => {
  return ref(getDatabase(), `users/${userId}/notes`);
};

export const getBookmarksRef = (userId: string): DatabaseReference => {
  return ref(getDatabase(), `users/${userId}/bookmarks`);
};

export const getVideosRef = (userId: string): DatabaseReference => {
  return ref(getDatabase(), `users/${userId}/videos`);
};

export const getVoiceNotesRef = (userId: string): DatabaseReference => {
  return ref(getDatabase(), `users/${userId}/voice_notes`);
};

export const getMemorizeItemsRef = (userId: string): DatabaseReference => {
  return ref(getDatabase(), `users/${userId}/memorize_items`);
};

export const getDailyLogsRef = (userId: string): DatabaseReference => {
  return ref(getDatabase(), `users/${userId}/daily_logs`);
};

export const getHabitDefinitionsRef = (userId: string): DatabaseReference => {
  return ref(getDatabase(), `users/${userId}/habit_definitions`);
};

export const getHabitLogEntriesRef = (userId: string): DatabaseReference => {
  return ref(getDatabase(), `users/${userId}/habit_log_entries`);
};

export const getDailyProgressRef = (userId: string): DatabaseReference => {
  return ref(getDatabase(), `users/${userId}/daily_progress`);
};

export const getWeeklySummariesRef = (userId: string): DatabaseReference => {
  return ref(getDatabase(), `users/${userId}/weekly_summaries`);
};

export const getTagsRef = (userId: string): DatabaseReference => {
  return ref(getDatabase(), `users/${userId}/tags`);
};

export const getUserSettingsRef = (userId: string): DatabaseReference => {
  return ref(getDatabase(), `users/${userId}/settings`);
};

/**
 * Check if Firebase is initialized
 */
export const isFirebaseInitialized = (): boolean => {
  return firebase.apps.length > 0;
};

/**
 * Server timestamp for consistent timestamps
 */
export const serverTimestamp = () => firebaseServerTimestamp();

// Re-export modular database functions for services
export {
  ref,
  child,
  get,
  set,
  update,
  remove,
  push,
  onValue,
  off,
  query,
  orderByChild,
  orderByKey,
  startAt,
  endAt,
  equalTo,
  runTransaction,
};

// Re-export modular auth functions
export {
  firebaseSignInWithCredential as signInWithCredential,
  firebaseSignOut,
  firebaseOnAuthStateChanged,
  GoogleAuthProvider,
};

// Re-export types
export type { FirebaseAuthTypes, DatabaseReference };

// Re-export firebase app for compatibility
export { firebase };
