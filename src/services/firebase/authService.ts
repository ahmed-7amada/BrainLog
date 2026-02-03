/**
 * Authentication Service
 * Handles Google Sign-In and Firebase Authentication
 */

import {GoogleSignin} from '@react-native-google-signin/google-signin';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {ENV} from '@/config/environment';
import {getFirebaseErrorMessage} from '@/utils/firebaseErrorHandler';

/**
 * Configure Google Sign-In
 * Must be called once at app initialization
 */
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: ENV.GOOGLE_WEB_CLIENT_ID,
    offlineAccess: true,
    scopes: [
      'https://www.googleapis.com/auth/drive.appdata', // Access to appDataFolder
      'https://www.googleapis.com/auth/drive.file', // Access to files created by app
    ],
  });
};

/**
 * Sign in with Google
 * Returns the signed-in user or throws an error
 */
export const signInWithGoogle = async (): Promise<FirebaseAuthTypes.User> => {
  try {
    // Check Google Play Services availability (Android)
    await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});

    // Get user info from Google
    const {idToken} = await GoogleSignin.signIn();

    if (!idToken) {
      throw new Error('No ID token received from Google Sign-In');
    }

    // Create Firebase credential
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign in to Firebase with the credential
    const userCredential = await auth().signInWithCredential(googleCredential);

    if (!userCredential.user) {
      throw new Error('Failed to sign in with Firebase');
    }

    console.log('[Auth] Signed in:', userCredential.user.email);
    return userCredential.user;
  } catch (error: any) {
    const message = getFirebaseErrorMessage(error);
    console.error('[Auth] Sign in failed:', message);
    throw new Error(message);
  }
};

/**
 * Sign out
 * Clears session and cached credentials
 */
export const signOut = async (): Promise<void> => {
  try {
    // Sign out from Google
    await GoogleSignin.signOut();

    // Sign out from Firebase
    await auth().signOut();

    console.log('[Auth] Signed out successfully');
  } catch (error: any) {
    const message = getFirebaseErrorMessage(error);
    console.error('[Auth] Sign out failed:', message);
    throw new Error(message);
  }
};

/**
 * Get current user
 * Returns null if not authenticated
 */
export const getCurrentUser = (): FirebaseAuthTypes.User | null => {
  return auth().currentUser;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return auth().currentUser !== null;
};

/**
 * Get Google access tokens
 * Required for Google Drive API access
 */
export const getGoogleTokens = async () => {
  try {
    const tokens = await GoogleSignin.getTokens();
    return tokens;
  } catch (error) {
    console.error('[Auth] Failed to get tokens:', error);
    throw error;
  }
};

/**
 * Refresh Google Sign-In session silently
 * Useful when tokens expire
 */
export const refreshGoogleSignIn = async () => {
  try {
    await GoogleSignin.signInSilently();
    const tokens = await GoogleSignin.getTokens();
    return tokens;
  } catch (error) {
    console.error('[Auth] Failed to refresh sign-in:', error);
    throw new Error('Session expired. Please sign in again.');
  }
};

/**
 * Listen to auth state changes
 * Returns unsubscribe function
 */
export const onAuthStateChanged = (
  callback: (user: FirebaseAuthTypes.User | null) => void,
) => {
  return auth().onAuthStateChanged(callback);
};

/**
 * Delete user account
 * Permanently removes the user from Firebase Auth
 */
export const deleteAccount = async (): Promise<void> => {
  try {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('No user signed in');
    }

    await user.delete();
    console.log('[Auth] Account deleted successfully');
  } catch (error: any) {
    const message = getFirebaseErrorMessage(error);
    console.error('[Auth] Account deletion failed:', message);
    throw new Error(message);
  }
};

export default {
  configureGoogleSignIn,
  signInWithGoogle,
  signOut,
  getCurrentUser,
  isAuthenticated,
  getGoogleTokens,
  refreshGoogleSignIn,
  onAuthStateChanged,
  deleteAccount,
};
