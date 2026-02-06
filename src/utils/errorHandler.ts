/**
 * Error Handler Utility (FR-000f, FR-000g)
 * Provides user-friendly error messages and logging
 */

export interface AppError {
  code: string;
  message: string;
  userMessage: string;
  timestamp: number;
  context?: Record<string, unknown>;
}

// Error codes and user-friendly messages
const ERROR_MESSAGES: Record<string, string> = {
  // Network errors
  'network/offline': 'No internet connection. Your changes will be saved locally.',
  'network/timeout': 'Request timed out. Please try again.',
  'network/unknown': 'Unable to connect. Check your internet connection.',

  // Auth errors
  'auth/sign-in-failed': 'Sign in failed. Please try again.',
  'auth/sign-out-failed': 'Unable to sign out. Please try again.',
  'auth/session-expired': 'Your session has expired. Please sign in again.',
  'auth/cancelled': 'Sign in was cancelled.',

  // Storage errors
  'storage/save-failed': 'Unable to save. Please try again.',
  'storage/load-failed': 'Unable to load data. Please try again.',
  'storage/delete-failed': 'Unable to delete. Please try again.',
  'storage/quota-exceeded': 'Storage quota exceeded. Please free up some space.',

  // Sync errors
  'sync/failed': 'Unable to sync. Your changes will be saved locally.',
  'sync/conflict': 'Sync conflict detected. Using the most recent version.',

  // Media errors
  'media/upload-failed': 'Unable to upload file. Please try again.',
  'media/compression-failed': 'Unable to compress video. Please try again.',
  'media/permission-denied': 'Permission denied. Please enable access in settings.',

  // Generic
  unknown: 'Something went wrong. Please try again.',
};

/**
 * Create a standardized app error
 */
export const createAppError = (
  code: string,
  message: string,
  context?: Record<string, unknown>,
): AppError => {
  const userMessage = ERROR_MESSAGES[code] || ERROR_MESSAGES.unknown;

  const error: AppError = {
    code,
    message,
    userMessage,
    timestamp: Date.now(),
    context,
  };

  // Log error (FR-000g)
  logError(error);

  return error;
};

/**
 * Log error locally (FR-000g)
 */
export const logError = (error: AppError): void => {
  const logEntry = {
    code: error.code,
    message: error.message,
    timestamp: new Date(error.timestamp).toISOString(),
    context: error.context,
  };

  // Log to console in development
  if (__DEV__) {
    console.error('[BrainLog Error]', logEntry);
  }

  // TODO: Store in local error log for debugging
  // Could use MMKV to store recent errors
};

/**
 * Get user-friendly message for an error code
 */
export const getUserMessage = (code: string): string => {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES.unknown;
};

/**
 * Parse Firebase error to app error
 */
export const parseFirebaseError = (error: unknown): AppError => {
  if (error instanceof Error) {
    const firebaseCode = (error as { code?: string }).code || 'unknown';

    // Map Firebase error codes to our error codes
    const codeMapping: Record<string, string> = {
      'auth/user-not-found': 'auth/sign-in-failed',
      'auth/wrong-password': 'auth/sign-in-failed',
      'auth/invalid-email': 'auth/sign-in-failed',
      'auth/user-disabled': 'auth/sign-in-failed',
      'auth/network-request-failed': 'network/offline',
      'permission-denied': 'auth/session-expired',
      NETWORK_ERROR: 'network/offline',
    };

    const appCode = codeMapping[firebaseCode] || 'unknown';

    return createAppError(appCode, error.message, {
      originalCode: firebaseCode,
    });
  }

  return createAppError('unknown', 'An unknown error occurred');
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: AppError): boolean => {
  return error.code.startsWith('network/');
};

/**
 * Check if error is an auth error
 */
export const isAuthError = (error: AppError): boolean => {
  return error.code.startsWith('auth/');
};

/**
 * Check if error can be retried
 */
export const canRetry = (error: AppError): boolean => {
  const retryableCodes = [
    'network/offline',
    'network/timeout',
    'network/unknown',
    'sync/failed',
    'storage/save-failed',
    'media/upload-failed',
  ];
  return retryableCodes.includes(error.code);
};
