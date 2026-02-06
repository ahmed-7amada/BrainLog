/**
 * Authentication Service
 * Google Sign-In with Firebase Auth (FR-000)
 */

import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { createAppError, parseFirebaseError } from '../../utils/errorHandler';
import { User, defaultUser } from '../../models/User';
import {
  getUserRef,
  getAuth,
  getDatabase,
  ref,
  remove,
  GoogleAuthProvider,
  signInWithCredential,
  firebaseSignOut,
  firebaseOnAuthStateChanged,
  child,
  get,
  set,
} from '../../config/firebase';
import { deleteAllUserFiles } from '../googleDrive/driveService';

// Web client ID from Firebase Console
// This should be moved to environment config in production
const WEB_CLIENT_ID = '702972693575-h7a7ndnqdu0il7rv38mc41arkf2igkbc.apps.googleusercontent.com';

/**
 * Configure Google Sign-In
 * Call this once during app initialization
 */
export const configureGoogleSignIn = (): void => {
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    offlineAccess: true,
    scopes: [
      'https://www.googleapis.com/auth/drive.appdata',
      'https://www.googleapis.com/auth/drive.file',
    ],
  });
};

/**
 * Sign in with Google
 * Returns the authenticated user or throws an error
 */
export const signInWithGoogle = async (): Promise<User> => {
  try {
    // Check if Google Play Services are available
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Sign in to Google
    const signInResult = await GoogleSignin.signIn();

    // Get ID token
    const idToken = signInResult.data?.idToken;
    if (!idToken) {
      throw createAppError('auth/sign-in-failed', 'No ID token received from Google');
    }

    // Create Firebase credential
    const googleCredential = GoogleAuthProvider.credential(idToken);

    // Sign in to Firebase
    const firebaseUserCredential = await signInWithCredential(getAuth(), googleCredential);
    const firebaseUser = firebaseUserCredential.user;

    // Get or create user profile in database
    const user = await getOrCreateUserProfile(firebaseUser);

    return user;
  } catch (error: unknown) {
    if (isGoogleSignInError(error)) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw createAppError('auth/cancelled', 'Sign in was cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw createAppError('auth/sign-in-failed', 'Sign in is already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw createAppError('auth/sign-in-failed', 'Google Play Services not available');
      }
    }
    throw parseFirebaseError(error);
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<void> => {
  try {
    // Sign out from Firebase
    await firebaseSignOut(getAuth());

    // Sign out from Google
    await GoogleSignin.signOut();
  } catch (error) {
    throw parseFirebaseError(error);
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentAuthUser = (): FirebaseAuthTypes.User | null => {
  return getAuth().currentUser;
};

/**
 * Check if user is signed in
 */
export const isSignedIn = (): boolean => {
  return getAuth().currentUser !== null;
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChanged = (
  callback: (user: FirebaseAuthTypes.User | null) => void,
): (() => void) => {
  return firebaseOnAuthStateChanged(getAuth(), callback);
};

/**
 * Get Google Sign-In tokens for Google Drive API
 */
export const getGoogleTokens = async (): Promise<{ accessToken: string } | null> => {
  try {
    const tokens = await GoogleSignin.getTokens();
    return tokens;
  } catch (error) {
    console.error('Failed to get Google tokens:', error);
    return null;
  }
};

/**
 * Delete user account and all data (FR-000c through FR-000e, T411)
 */
export const deleteAccount = async (): Promise<void> => {
  const user = getAuth().currentUser;
  if (!user) {
    throw createAppError('auth/session-expired', 'No authenticated user');
  }

  try {
    // T411 - Delete all user media files from Google Drive first
    // This must be done before signing out, as we need the auth tokens
    await deleteAllUserFiles();

    // Delete all user data from Firebase Realtime Database
    const userDataRef = ref(getDatabase(), `users/${user.uid}`);
    await remove(userDataRef);

    // Delete Firebase Auth account
    await user.delete();

    // Sign out from Google
    await GoogleSignin.signOut();
  } catch (error) {
    throw parseFirebaseError(error);
  }
};

/**
 * Get or create user profile in Firebase Database
 */
const getOrCreateUserProfile = async (firebaseUser: FirebaseAuthTypes.User): Promise<User> => {
  const userRef = getUserRef(firebaseUser.uid);
  const profileRef = child(userRef, 'profile');

  // Check if user exists
  const snapshot = await get(profileRef);

  if (snapshot.exists()) {
    // Return existing user
    const userData = snapshot.val();
    return {
      id: firebaseUser.uid,
      email: userData.email,
      name: userData.name,
      avatarUrl: userData.avatarUrl,
      xpPoints: userData.xpPoints || 0,
      currentLevel: userData.currentLevel || 1,
      currentStreak: userData.currentStreak || 0,
      longestStreak: userData.longestStreak || 0,
      lastActiveDate: userData.lastActiveDate || new Date().toISOString().split('T')[0],
      streakFreezeAvailable: userData.streakFreezeAvailable ?? true,
      earnedBadges: userData.earnedBadges || [],
      createdAt: userData.createdAt || Date.now(),
      updatedAt: userData.updatedAt || Date.now(),
    };
  }

  // Create new user profile
  const newUser = defaultUser({
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: firebaseUser.displayName || 'User',
    avatarUrl: firebaseUser.photoURL || undefined,
  });

  // Save to database
  await set(profileRef, {
    email: newUser.email,
    name: newUser.name,
    avatarUrl: newUser.avatarUrl,
    xpPoints: newUser.xpPoints,
    currentLevel: newUser.currentLevel,
    currentStreak: newUser.currentStreak,
    longestStreak: newUser.longestStreak,
    lastActiveDate: newUser.lastActiveDate,
    streakFreezeAvailable: newUser.streakFreezeAvailable,
    earnedBadges: newUser.earnedBadges,
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt,
  });

  return newUser;
};

/**
 * Type guard for Google Sign-In errors
 */
const isGoogleSignInError = (error: unknown): error is { code: string; message: string } => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  );
};

export type { FirebaseAuthTypes };
