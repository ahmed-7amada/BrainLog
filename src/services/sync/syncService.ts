/**
 * Sync Service
 * Manages offline/online data synchronization with Firebase
 */

import database from '@react-native-firebase/database';
import { connectivityListener } from './connectivityListener';
import { offlineQueue, QueuedOperation } from './offlineQueue';
import { STORAGE_KEYS, setString, getString } from '../../utils/storage';

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

type SyncStatusCallback = (status: SyncStatus) => void;

class SyncService {
  private status: SyncStatus = 'idle';
  private statusCallbacks: Set<SyncStatusCallback> = new Set();
  private unsubscribeConnectivity: (() => void) | null = null;

  /**
   * Initialize the sync service
   */
  initialize(): void {
    // Start connectivity listener
    connectivityListener.start();

    // Subscribe to connectivity changes
    this.unsubscribeConnectivity = connectivityListener.addCallback(isConnected => {
      if (isConnected) {
        this.setStatus('idle');
        // Automatically sync when coming online
        this.syncPendingOperations();
      } else {
        this.setStatus('offline');
      }
    });

    // Set initial status based on connectivity
    if (!connectivityListener.getIsConnected()) {
      this.setStatus('offline');
    }
  }

  /**
   * Cleanup the sync service
   */
  cleanup(): void {
    if (this.unsubscribeConnectivity) {
      this.unsubscribeConnectivity();
      this.unsubscribeConnectivity = null;
    }
    connectivityListener.stop();
  }

  /**
   * Get current sync status
   */
  getStatus(): SyncStatus {
    return this.status;
  }

  /**
   * Subscribe to sync status changes
   */
  addStatusCallback(callback: SyncStatusCallback): () => void {
    this.statusCallbacks.add(callback);
    // Immediately notify with current status
    callback(this.status);
    return () => {
      this.statusCallbacks.delete(callback);
    };
  }

  /**
   * Set sync status and notify subscribers
   */
  private setStatus(status: SyncStatus): void {
    this.status = status;
    this.statusCallbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Error in sync status callback:', error);
      }
    });
  }

  /**
   * Queue an operation for offline sync
   */
  queueOperation(
    type: 'create' | 'update' | 'delete',
    collection: string,
    path: string,
    data: unknown,
  ): void {
    offlineQueue.add({
      type,
      collection,
      path,
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Process all pending operations in the queue
   */
  async syncPendingOperations(): Promise<{ processed: number; failed: number }> {
    if (!connectivityListener.getIsConnected()) {
      return { processed: 0, failed: 0 };
    }

    if (offlineQueue.getIsProcessing()) {
      return { processed: 0, failed: 0 };
    }

    if (!offlineQueue.hasPending()) {
      return { processed: 0, failed: 0 };
    }

    this.setStatus('syncing');

    try {
      const result = await offlineQueue.processAll(this.processOperation.bind(this));

      // Update last sync time
      setString(STORAGE_KEYS.LAST_SYNC_TIME, new Date().toISOString());

      this.setStatus(result.failed > 0 ? 'error' : 'idle');
      return result;
    } catch (error) {
      console.error('Sync failed:', error);
      this.setStatus('error');
      return { processed: 0, failed: offlineQueue.getCount() };
    }
  }

  /**
   * Process a single queued operation
   */
  private async processOperation(operation: QueuedOperation): Promise<boolean> {
    try {
      const ref = database().ref(operation.path);

      switch (operation.type) {
        case 'create':
        case 'update':
          await ref.set(operation.data);
          break;
        case 'delete':
          await ref.remove();
          break;
        default:
          console.error('Unknown operation type:', operation.type);
          return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to process operation:', operation, error);
      return false;
    }
  }

  /**
   * Check if there are pending operations
   */
  hasPendingOperations(): boolean {
    return offlineQueue.hasPending();
  }

  /**
   * Get the number of pending operations
   */
  getPendingCount(): number {
    return offlineQueue.getCount();
  }

  /**
   * Get last sync time
   */
  getLastSyncTime(): string | undefined {
    return getString(STORAGE_KEYS.LAST_SYNC_TIME);
  }

  /**
   * Check if currently online
   */
  isOnline(): boolean {
    return connectivityListener.getIsConnected();
  }

  /**
   * Manual sync trigger
   */
  async manualSync(): Promise<{ processed: number; failed: number }> {
    // Check connectivity first
    const isConnected = await connectivityListener.checkConnectivity();
    if (!isConnected) {
      this.setStatus('offline');
      return { processed: 0, failed: 0 };
    }

    return this.syncPendingOperations();
  }
}

// Export singleton instance
export const syncService = new SyncService();

export default syncService;
