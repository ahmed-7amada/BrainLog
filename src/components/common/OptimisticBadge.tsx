/**
 * OptimisticBadge Component
 * Visual indicator for items with pending changes (FR-017)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography, borderRadius } from '../../config/theme';

export type OptimisticStatus = 'saving' | 'deleting' | 'error' | 'offline';

export interface OptimisticBadgeProps {
  /** The optimistic status to display */
  status: OptimisticStatus;
  /** Optional compact mode for inline display */
  compact?: boolean;
  /** Custom label text */
  label?: string;
}

const statusConfig: Record<
  OptimisticStatus,
  { label: string; icon: string; color: string; bgColor: string }
> = {
  saving: {
    label: 'Saving...',
    icon: 'cloud-upload-outline',
    color: '#ffffff',
    bgColor: colors.warning,
  },
  deleting: {
    label: 'Deleting...',
    icon: 'trash-outline',
    color: '#ffffff',
    bgColor: colors.error,
  },
  error: {
    label: 'Failed',
    icon: 'warning-outline',
    color: '#ffffff',
    bgColor: colors.error,
  },
  offline: {
    label: 'Offline',
    icon: 'cloud-offline-outline',
    color: '#ffffff',
    bgColor: colors.light.textTertiary,
  },
};

export const OptimisticBadge: React.FC<OptimisticBadgeProps> = ({
  status,
  compact = false,
  label,
}) => {
  const config = statusConfig[status];
  const pulseOpacity = useSharedValue(1);

  React.useEffect(() => {
    if (status === 'saving' || status === 'deleting') {
      pulseOpacity.value = withRepeat(
        withTiming(0.6, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    } else {
      pulseOpacity.value = 1;
    }
  }, [status, pulseOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  if (compact) {
    return (
      <Animated.View
        style={[styles.compactContainer, { backgroundColor: config.bgColor }, animatedStyle]}>
        <Icon name={config.icon} size={10} color={config.color} />
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, { backgroundColor: config.bgColor }, animatedStyle]}>
      <Icon name={config.icon} size={12} color={config.color} />
      <Text style={styles.label}>{label || config.label}</Text>
    </Animated.View>
  );
};

/**
 * Wrapper component that adds an optimistic overlay to children
 */
export interface OptimisticWrapperProps {
  /** Whether the item is optimistic */
  isOptimistic?: boolean;
  /** The status to show (defaults to 'saving') */
  status?: OptimisticStatus;
  /** Children to wrap */
  children: React.ReactNode;
}

export const OptimisticWrapper: React.FC<OptimisticWrapperProps> = ({
  isOptimistic,
  status = 'saving',
  children,
}) => {
  if (!isOptimistic) {
    return <>{children}</>;
  }

  return (
    <View style={styles.wrapperContainer}>
      <View style={styles.wrapperOverlay} />
      {children}
      <View style={styles.badgePosition}>
        <OptimisticBadge status={status} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  compactContainer: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: '500',
    color: '#ffffff',
  },
  wrapperContainer: {
    position: 'relative',
  },
  wrapperOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: borderRadius.md,
    zIndex: 1,
  },
  badgePosition: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    zIndex: 2,
  },
});

export default OptimisticBadge;
