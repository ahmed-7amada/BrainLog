/**
 * RefreshableList Component
 * Wrapper component with pull-to-refresh support (FR-003)
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FlatList, FlatListProps, RefreshControl, View, Text, StyleSheet } from 'react-native';
import { useStore } from '../../store';
import { useToast } from './ToastProvider';
import { colors, spacing, typography } from '../../config/theme';

// Refresh timeout in milliseconds
const REFRESH_TIMEOUT = 5000;

export interface RefreshableListProps<T> extends Omit<FlatListProps<T>, 'refreshControl'> {
  /** Async function to call on refresh */
  onRefresh: () => Promise<void>;
  /** Custom tint color for refresh indicator */
  tintColor?: string;
  /** Disable pull-to-refresh */
  refreshDisabled?: boolean;
  /** Custom empty state component */
  emptyComponent?: React.ReactNode;
  /** Whether to show offline warning */
  showOfflineWarning?: boolean;
}

export function RefreshableList<T>({
  onRefresh,
  tintColor = colors.primary,
  refreshDisabled = false,
  emptyComponent,
  showOfflineWarning = true,
  data,
  ...flatListProps
}: RefreshableListProps<T>) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isOnline = useStore(state => state.isOnline);
  const { showToast } = useToast();

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleRefresh = useCallback(async () => {
    if (refreshDisabled || isRefreshing) return;

    // Check online status
    if (!isOnline) {
      showToast('You are offline. Please check your connection.', 'warning');
      return;
    }

    setIsRefreshing(true);
    setShowTimeoutWarning(false);

    // Set timeout warning
    timeoutRef.current = setTimeout(() => {
      setShowTimeoutWarning(true);
    }, REFRESH_TIMEOUT);

    try {
      await onRefresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to refresh. Please try again.';
      showToast(message, 'error');
    } finally {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsRefreshing(false);
      setShowTimeoutWarning(false);
    }
  }, [onRefresh, refreshDisabled, isRefreshing, isOnline, showToast]);

  const renderEmptyState = () => {
    if (emptyComponent) {
      return emptyComponent;
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No items to display</Text>
        <Text style={styles.emptySubtext}>Pull down to refresh</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Timeout warning banner */}
      {showTimeoutWarning && (
        <View style={styles.timeoutBanner}>
          <Text style={styles.timeoutText}>Taking longer than expected...</Text>
        </View>
      )}

      {/* Offline warning banner */}
      {showOfflineWarning && !isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>You are offline. Showing cached data.</Text>
        </View>
      )}

      <FlatList
        data={data}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={tintColor}
            colors={[tintColor]}
            enabled={!refreshDisabled}
          />
        }
        ListEmptyComponent={renderEmptyState}
        {...flatListProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.light.textSecondary,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.light.textTertiary,
    marginTop: spacing.xs,
  },
  timeoutBanner: {
    backgroundColor: colors.warning,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  timeoutText: {
    fontSize: typography.fontSize.sm,
    color: '#000',
    fontWeight: '500',
  },
  offlineBanner: {
    backgroundColor: colors.light.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  offlineText: {
    fontSize: typography.fontSize.sm,
    color: colors.light.textSecondary,
  },
});

export default RefreshableList;
