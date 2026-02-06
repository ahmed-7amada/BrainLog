/**
 * Sync Status Indicator Component
 * Displays the current sync status (idle, syncing, error, offline)
 * T156 - Per FR-062 offline indicator requirement
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { syncService, SyncStatus } from '../../services/sync/syncService';
import { colors, typography, spacing, borderRadius } from '../../config/theme';

interface SyncStatusIndicatorProps {
  /** Whether to show in compact mode (icon only) */
  compact?: boolean;
  /** Called when user taps to retry sync */
  onRetry?: () => void;
  /** Whether to show pending count */
  showPendingCount?: boolean;
}

const STATUS_CONFIG: Record<
  SyncStatus,
  { icon: string; label: string; color: string; bgColor: string }
> = {
  idle: {
    icon: '✓',
    label: 'Synced',
    color: colors.success,
    bgColor: `${colors.success}20`,
  },
  syncing: {
    icon: '↻',
    label: 'Syncing...',
    color: colors.primary,
    bgColor: `${colors.primary}20`,
  },
  error: {
    icon: '⚠',
    label: 'Sync failed',
    color: colors.error,
    bgColor: `${colors.error}20`,
  },
  offline: {
    icon: '○',
    label: 'Offline',
    color: colors.warning,
    bgColor: `${colors.warning}20`,
  },
};

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  compact = false,
  onRetry,
  showPendingCount = true,
}) => {
  const [status, setStatus] = useState<SyncStatus>(syncService.getStatus());
  const [pendingCount, setPendingCount] = useState(syncService.getPendingCount());
  const [spinValue] = useState(new Animated.Value(0));

  useEffect(() => {
    // Subscribe to status changes
    const unsubscribe = syncService.addStatusCallback(newStatus => {
      setStatus(newStatus);
      setPendingCount(syncService.getPendingCount());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Spin animation for syncing state
  useEffect(() => {
    if (status === 'syncing') {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ).start();
    } else {
      spinValue.setValue(0);
    }
  }, [status, spinValue]);

  const config = STATUS_CONFIG[status];
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handlePress = () => {
    if (status === 'error' || status === 'offline') {
      if (onRetry) {
        onRetry();
      } else {
        syncService.manualSync();
      }
    }
  };

  const isInteractive = status === 'error' || status === 'offline';

  const content = (
    <View
      style={[
        styles.container,
        { backgroundColor: config.bgColor },
        compact && styles.compactContainer,
      ]}>
      <Animated.Text
        style={[
          styles.icon,
          { color: config.color },
          status === 'syncing' && { transform: [{ rotate: spin }] },
        ]}>
        {config.icon}
      </Animated.Text>
      {!compact && (
        <>
          <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
          {showPendingCount && pendingCount > 0 && status !== 'syncing' && (
            <View style={[styles.badge, { backgroundColor: config.color }]}>
              <Text style={styles.badgeText}>{pendingCount}</Text>
            </View>
          )}
        </>
      )}
    </View>
  );

  if (isInteractive) {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7} accessibilityRole="button">
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  compactContainer: {
    paddingHorizontal: spacing.sm,
  },
  icon: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
});

export default SyncStatusIndicator;
