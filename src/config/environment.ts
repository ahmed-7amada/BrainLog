/**
 * Environment Configuration
 * Loads configuration from environment variables
 */

import Config from 'react-native-config';

export const ENV = {
  // Firebase Configuration
  FIREBASE_API_KEY: Config.FIREBASE_API_KEY || '',
  FIREBASE_AUTH_DOMAIN: Config.FIREBASE_AUTH_DOMAIN || '',
  FIREBASE_DATABASE_URL: Config.FIREBASE_DATABASE_URL || '',
  FIREBASE_PROJECT_ID: Config.FIREBASE_PROJECT_ID || '',
  FIREBASE_STORAGE_BUCKET: Config.FIREBASE_STORAGE_BUCKET || '',
  FIREBASE_MESSAGING_SENDER_ID: Config.FIREBASE_MESSAGING_SENDER_ID || '',
  FIREBASE_APP_ID: Config.FIREBASE_APP_ID || '',

  // Google OAuth Client IDs
  GOOGLE_WEB_CLIENT_ID: Config.GOOGLE_WEB_CLIENT_ID || '',
  GOOGLE_IOS_CLIENT_ID: Config.GOOGLE_IOS_CLIENT_ID || '',
  GOOGLE_ANDROID_CLIENT_ID: Config.GOOGLE_ANDROID_CLIENT_ID || '',

  // Environment
  NODE_ENV: Config.NODE_ENV || 'development',
  IS_DEV: Config.NODE_ENV !== 'production',
  IS_PROD: Config.NODE_ENV === 'production',
};

// Validation: Warn if critical env vars are missing in development
if (ENV.IS_DEV) {
  const requiredVars = [
    'FIREBASE_API_KEY',
    'FIREBASE_PROJECT_ID',
    'GOOGLE_WEB_CLIENT_ID',
  ];

  requiredVars.forEach(varName => {
    if (!ENV[varName as keyof typeof ENV]) {
      console.warn(
        `[Environment] Missing ${varName}. Please add it to .env file.`,
      );
    }
  });
}
