/**
 * Storage Utility
 * Provides persistent key-value storage using MMKV
 */

import { createMMKV, type MMKV } from 'react-native-mmkv';

// Initialize MMKV storage instance with error handling
let storage: MMKV | null = null;
let initializationError: Error | null = null;

try {
  storage = createMMKV({
    id: 'brainlog-storage',
  });
} catch (error) {
  initializationError = error instanceof Error ? error : new Error('Failed to initialize MMKV');
  console.warn('MMKV initialization failed:', initializationError.message);
  console.warn('Storage operations will return defaults until MMKV is properly configured.');
}

/**
 * Check if storage is available
 */
export function isStorageAvailable(): boolean {
  return storage !== null;
}

/**
 * Get initialization error if any
 */
export function getInitializationError(): Error | null {
  return initializationError;
}

/**
 * Storage keys used throughout the app
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_ID: 'user_id',
  USER_PROFILE: 'user_profile',
  THEME: 'theme',
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
  DAILY_REMINDER_TIME: 'daily_reminder_time',
  HABIT_REMINDER_TIME: 'habit_reminder_time',
  LAST_SYNC_TIME: 'last_sync_time',
  OFFLINE_QUEUE: 'offline_queue',
  CACHED_FLASHCARDS: 'cached_flashcards',
  CACHED_NOTES: 'cached_notes',
} as const;

/**
 * Get a string value from storage
 */
export function getString(key: string): string | undefined {
  if (!storage) return undefined;
  return storage.getString(key);
}

/**
 * Set a string value in storage
 */
export function setString(key: string, value: string): void {
  if (!storage) return;
  storage.set(key, value);
}

/**
 * Get a number value from storage
 */
export function getNumber(key: string): number | undefined {
  if (!storage) return undefined;
  return storage.getNumber(key);
}

/**
 * Set a number value in storage
 */
export function setNumber(key: string, value: number): void {
  if (!storage) return;
  storage.set(key, value);
}

/**
 * Get a boolean value from storage
 */
export function getBoolean(key: string): boolean | undefined {
  if (!storage) return undefined;
  return storage.getBoolean(key);
}

/**
 * Set a boolean value in storage
 */
export function setBoolean(key: string, value: boolean): void {
  if (!storage) return;
  storage.set(key, value);
}

/**
 * Get an object value from storage (stored as JSON string)
 */
export function getObject<T>(key: string): T | undefined {
  if (!storage) return undefined;
  const jsonString = storage.getString(key);
  if (jsonString) {
    try {
      return JSON.parse(jsonString) as T;
    } catch (error) {
      console.error(`Failed to parse stored object for key: ${key}`, error);
      return undefined;
    }
  }
  return undefined;
}

/**
 * Set an object value in storage (stored as JSON string)
 */
export function setObject<T>(key: string, value: T): void {
  if (!storage) return;
  try {
    const jsonString = JSON.stringify(value);
    storage.set(key, jsonString);
  } catch (error) {
    console.error(`Failed to stringify object for key: ${key}`, error);
  }
}

/**
 * Delete a value from storage
 */
export function deleteKey(key: string): void {
  if (!storage) return;
  storage.remove(key);
}

/**
 * Get all keys in storage
 */
export function getAllKeys(): string[] {
  if (!storage) return [];
  return storage.getAllKeys();
}

/**
 * Clear all values from storage
 */
export function clearAll(): void {
  if (!storage) return;
  storage.clearAll();
}

/**
 * Check if a key exists in storage
 */
export function hasKey(key: string): boolean {
  if (!storage) return false;
  return storage.contains(key);
}

/**
 * Add an item to the offline queue
 */
export function addToOfflineQueue(operation: {
  type: string;
  path: string;
  data: unknown;
  timestamp: number;
}): void {
  const queue = getObject<(typeof operation)[]>(STORAGE_KEYS.OFFLINE_QUEUE) || [];
  queue.push(operation);
  setObject(STORAGE_KEYS.OFFLINE_QUEUE, queue);
}

/**
 * Get and clear the offline queue
 */
export function getAndClearOfflineQueue(): Array<{
  type: string;
  path: string;
  data: unknown;
  timestamp: number;
}> {
  const queue =
    getObject<
      Array<{
        type: string;
        path: string;
        data: unknown;
        timestamp: number;
      }>
    >(STORAGE_KEYS.OFFLINE_QUEUE) || [];
  deleteKey(STORAGE_KEYS.OFFLINE_QUEUE);
  return queue;
}

/**
 * Export the raw MMKV instance for advanced use cases
 */
export { storage };

export default {
  getString,
  setString,
  getNumber,
  setNumber,
  getBoolean,
  setBoolean,
  getObject,
  setObject,
  deleteKey,
  getAllKeys,
  clearAll,
  hasKey,
  addToOfflineQueue,
  getAndClearOfflineQueue,
  isStorageAvailable,
  getInitializationError,
  storage,
  STORAGE_KEYS,
};
