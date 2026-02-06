/**
 * useNetworkStatus Hook
 * Monitors network connectivity status (FR-022)
 */

import { useState, useEffect, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useStore } from '../store';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: string | null;
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: null,
    connectionType: null,
  });

  const setOnline = useStore(state => state.setOnline);

  const handleNetworkChange = useCallback(
    (state: NetInfoState) => {
      const isConnected = state.isConnected ?? false;
      const isInternetReachable = state.isInternetReachable;
      const connectionType = state.type;

      setNetworkStatus({
        isConnected,
        isInternetReachable,
        connectionType,
      });

      // Update global store
      setOnline(isConnected && isInternetReachable !== false);
    },
    [setOnline],
  );

  useEffect(() => {
    // Get initial state
    NetInfo.fetch().then(handleNetworkChange);

    // Subscribe to changes
    const unsubscribe = NetInfo.addEventListener(handleNetworkChange);

    return () => {
      unsubscribe();
    };
  }, [handleNetworkChange]);

  const refresh = useCallback(async () => {
    const state = await NetInfo.refresh();
    handleNetworkChange(state);
    return state.isConnected ?? false;
  }, [handleNetworkChange]);

  return {
    ...networkStatus,
    isOnline: networkStatus.isConnected && networkStatus.isInternetReachable !== false,
    refresh,
  };
};

export default useNetworkStatus;
