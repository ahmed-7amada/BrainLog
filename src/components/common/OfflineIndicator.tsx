/**
 * Offline Indicator Component
 * Displays a banner when the app is offline (FR-062)
 * T438 - Offline indicator banner component
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { connectivityListener } from '../../services/sync/connectivityListener';
import { syncService } from '../../services/sync/syncService';
import { colors, typography, spacing } from '../../config/theme';

interface OfflineIndicatorProps {
  /** Custom message to display */
  message?: string;
  /** Whether the banner can be dismissed */
  dismissible?: boolean;
  /** Called when dismissed */
  onDismiss?: () => void;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  message = 'You are offline. Changes will sync when connected.',
  dismissible = false,
  onDismiss,
}) => {
  const [isOffline, setIsOffline] = useState(!connectivityListener.getIsConnected());
  const [isDismissed, setIsDismissed] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-60));

  useEffect(() => {
    const unsubscribe = connectivityListener.addCallback(isConnected => {
      setIsOffline(!isConnected);
      if (isConnected) {
        setIsDismissed(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const shouldShow = isOffline && !isDismissed;
    Animated.spring(slideAnim, {
      toValue: shouldShow ? 0 : -60,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  }, [isOffline, isDismissed, slideAnim]);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleRetry = async () => {
    await connectivityListener.checkConnectivity();
    if (connectivityListener.getIsConnected()) {
      syncService.manualSync();
    }
  };

  const pendingCount = syncService.getPendingCount();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite">
      <View style={styles.content}>
        <Text style={styles.icon}>○</Text>
        <View style={styles.textContainer}>
          <Text style={styles.message}>{message}</Text>
          {pendingCount > 0 && (
            <Text style={styles.pendingText}>
              {pendingCount} pending {pendingCount === 1 ? 'change' : 'changes'}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={handleRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry connection">
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
        {dismissible && (
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={handleDismiss}
            accessibilityRole="button"
            accessibilityLabel="Dismiss offline banner">
            <Text style={styles.dismissText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.warning,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingTop: spacing.xxl, // Account for status bar
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    fontSize: typography.fontSize.xl,
    color: '#000',
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: '#000',
  },
  pendingText: {
    fontSize: typography.fontSize.xs,
    color: '#333',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  retryButton: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  retryText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: '#000',
  },
  dismissButton: {
    padding: spacing.xs,
  },
  dismissText: {
    fontSize: typography.fontSize.lg,
    color: '#000',
  },
});

export default OfflineIndicator;
