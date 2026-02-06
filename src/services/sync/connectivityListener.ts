/**
 * Connectivity Listener
 * Monitors network connectivity status and triggers sync when online
 */

import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';

type ConnectivityCallback = (isConnected: boolean) => void;

class ConnectivityListener {
  private subscription: NetInfoSubscription | null = null;
  private callbacks: Set<ConnectivityCallback> = new Set();
  private isConnected: boolean = true;

  /**
   * Start listening for connectivity changes
   */
  start(): void {
    if (this.subscription) {
      return; // Already listening
    }

    this.subscription = NetInfo.addEventListener((state: NetInfoState) => {
      const wasConnected = this.isConnected;
      this.isConnected = state.isConnected ?? false;

      // Notify callbacks only when connectivity status changes
      if (wasConnected !== this.isConnected) {
        this.notifyCallbacks();
      }
    });

    // Get initial state
    NetInfo.fetch().then((state: NetInfoState) => {
      this.isConnected = state.isConnected ?? false;
    });
  }

  /**
   * Stop listening for connectivity changes
   */
  stop(): void {
    if (this.subscription) {
      this.subscription();
      this.subscription = null;
    }
  }

  /**
   * Add a callback to be notified when connectivity changes
   */
  addCallback(callback: ConnectivityCallback): () => void {
    this.callbacks.add(callback);
    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Remove a callback
   */
  removeCallback(callback: ConnectivityCallback): void {
    this.callbacks.delete(callback);
  }

  /**
   * Get current connectivity status
   */
  getIsConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Check connectivity status (async)
   */
  async checkConnectivity(): Promise<boolean> {
    const state = await NetInfo.fetch();
    this.isConnected = state.isConnected ?? false;
    return this.isConnected;
  }

  /**
   * Notify all registered callbacks
   */
  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => {
      try {
        callback(this.isConnected);
      } catch (error) {
        console.error('Error in connectivity callback:', error);
      }
    });
  }
}

// Export singleton instance
export const connectivityListener = new ConnectivityListener();

export default connectivityListener;
