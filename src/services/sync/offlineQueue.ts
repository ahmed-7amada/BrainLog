/**
 * Offline Queue
 * Manages queued operations that need to be synced when online
 */

import { STORAGE_KEYS, getObject, setObject, deleteKey } from '../../utils/storage';

export interface QueuedOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: string;
  path: string;
  data: unknown;
  timestamp: number;
  retryCount: number;
}

const MAX_RETRY_COUNT = 3;

class OfflineQueue {
  private isProcessing: boolean = false;

  /**
   * Add an operation to the queue
   */
  add(operation: Omit<QueuedOperation, 'id' | 'retryCount'>): void {
    const queue = this.getQueue();
    const newOperation: QueuedOperation = {
      ...operation,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      retryCount: 0,
    };
    queue.push(newOperation);
    this.saveQueue(queue);
  }

  /**
   * Get all queued operations
   */
  getQueue(): QueuedOperation[] {
    return getObject<QueuedOperation[]>(STORAGE_KEYS.OFFLINE_QUEUE) || [];
  }

  /**
   * Save the queue to storage
   */
  private saveQueue(queue: QueuedOperation[]): void {
    if (queue.length === 0) {
      deleteKey(STORAGE_KEYS.OFFLINE_QUEUE);
    } else {
      setObject(STORAGE_KEYS.OFFLINE_QUEUE, queue);
    }
  }

  /**
   * Remove an operation from the queue
   */
  remove(operationId: string): void {
    const queue = this.getQueue();
    const filteredQueue = queue.filter(op => op.id !== operationId);
    this.saveQueue(filteredQueue);
  }

  /**
   * Clear the entire queue
   */
  clear(): void {
    deleteKey(STORAGE_KEYS.OFFLINE_QUEUE);
  }

  /**
   * Get the number of queued operations
   */
  getCount(): number {
    return this.getQueue().length;
  }

  /**
   * Check if there are pending operations
   */
  hasPending(): boolean {
    return this.getCount() > 0;
  }

  /**
   * Process all queued operations
   * @param processor Function to process each operation
   * @returns Promise with results
   */
  async processAll(
    processor: (operation: QueuedOperation) => Promise<boolean>,
  ): Promise<{ processed: number; failed: number }> {
    if (this.isProcessing) {
      return { processed: 0, failed: 0 };
    }

    this.isProcessing = true;
    let processed = 0;
    let failed = 0;

    try {
      const queue = this.getQueue();
      const remainingQueue: QueuedOperation[] = [];

      for (const operation of queue) {
        try {
          const success = await processor(operation);
          if (success) {
            processed++;
          } else {
            // Increment retry count and keep in queue if under limit
            operation.retryCount++;
            if (operation.retryCount < MAX_RETRY_COUNT) {
              remainingQueue.push(operation);
            } else {
              failed++;
              console.error('Operation exceeded max retries:', operation);
            }
          }
        } catch (error) {
          operation.retryCount++;
          if (operation.retryCount < MAX_RETRY_COUNT) {
            remainingQueue.push(operation);
          } else {
            failed++;
            console.error('Operation failed after max retries:', operation, error);
          }
        }
      }

      this.saveQueue(remainingQueue);
    } finally {
      this.isProcessing = false;
    }

    return { processed, failed };
  }

  /**
   * Check if currently processing
   */
  getIsProcessing(): boolean {
    return this.isProcessing;
  }
}

// Export singleton instance
export const offlineQueue = new OfflineQueue();

export default offlineQueue;
