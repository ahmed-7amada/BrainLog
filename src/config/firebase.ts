/**
 * Firebase Configuration
 * Initializes Firebase services for the app
 */

import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import messaging from '@react-native-firebase/messaging';
import {ENV} from './environment';

/**
 * Initialize Firebase
 * Firebase is auto-initialized on app start via native configuration files
 * (google-services.json for Android, GoogleService-Info.plist for iOS)
 */

// Connect to Firebase Emulator in development
if (ENV.IS_DEV && __DEV__) {
  const EMULATOR_HOST = 'localhost';

  // Connect to Auth Emulator
  auth().useEmulator(`http://${EMULATOR_HOST}:9099`);

  // Connect to Database Emulator
  database().useEmulator(EMULATOR_HOST, 9000);

  console.log('[Firebase] Connected to emulators');
}

// Export Firebase instances
export const firebaseAuth = auth;
export const firebaseDatabase = database;
export const firebaseMessaging = messaging;

// Helper to get current user
export const getCurrentUser = () => {
  return auth().currentUser;
};

// Helper to check auth state
export const isAuthenticated = () => {
  return auth().currentUser !== null;
};

export default {
  auth: firebaseAuth,
  database: firebaseDatabase,
  messaging: firebaseMessaging,
  getCurrentUser,
  isAuthenticated,
};
