/**
 * Firebase Error Handler
 * Converts Firebase error codes to user-friendly messages
 */

export interface FirebaseError {
  code: string;
  message: string;
}

export const getFirebaseErrorMessage = (error: any): string => {
  if (!error || !error.code) {
    return 'An unexpected error occurred. Please try again.';
  }

  const errorCode = error.code;

  // Firebase Auth errors
  const authErrors: {[key: string]: string} = {
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/too-many-requests':
      'Too many failed attempts. Please try again later.',
    'auth/network-request-failed':
      'Network error. Please check your connection.',
    'auth/requires-recent-login':
      'Please sign in again to complete this action.',
    'auth/account-exists-with-different-credential':
      'An account already exists with this email using a different sign-in method.',
  };

  // Firebase Database errors
  const databaseErrors: {[key: string]: string} = {
    'database/permission-denied': 'You do not have permission to access this data.',
    'database/disconnected': 'Unable to connect to the database. Check your internet connection.',
    'database/network-error': 'Network error. Please check your connection and try again.',
    'database/unavailable': 'Database is temporarily unavailable. Please try again later.',
  };

  // Firebase Messaging errors
  const messagingErrors: {[key: string]: string} = {
    'messaging/permission-denied': 'Notification permission denied.',
    'messaging/registration-failed': 'Failed to register for notifications.',
  };

  // Check error dictionaries
  if (authErrors[errorCode]) {
    return authErrors[errorCode];
  }
  if (databaseErrors[errorCode]) {
    return databaseErrors[errorCode];
  }
  if (messagingErrors[errorCode]) {
    return messagingErrors[errorCode];
  }

  // Generic fallback
  return error.message || 'An error occurred. Please try again.';
};

export const handleFirebaseError = (error: any): void => {
  const message = getFirebaseErrorMessage(error);
  console.error('[Firebase Error]', {
    code: error.code,
    message,
    originalError: error,
  });
};
