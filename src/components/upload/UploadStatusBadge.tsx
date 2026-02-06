/**
 * UploadStatusBadge Component
 * Floating badge on tab bar showing upload status (FR-015)
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { useStore } from '../../store';
import { colors, spacing, typography, borderRadius, shadows } from '../../config/theme';

export interface UploadStatusBadgeProps {
  /** Called when badge is pressed */
  onPress: () => void;
}

export const UploadStatusBadge: React.FC<UploadStatusBadgeProps> = ({ onPress }) => {
  const activeCount = useStore(state => state.activeCount);
  const failedCount = useStore(state => state.failedCount);
  const activeUploads = useStore(state => state.activeUploads);

  // Calculate overall progress
  const overallProgress =
    activeUploads.length > 0
      ? activeUploads.reduce((sum, u) => sum + u.progress, 0) / activeUploads.length
      : 0;

  // Animation for active uploads
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    if (activeCount > 0) {
      rotation.value = withRepeat(
        withTiming(360, {
          duration: 2000,
          easing: Easing.linear,
        }),
        -1,
        false,
      );
    } else {
      rotation.value = 0;
    }
  }, [activeCount, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // Don't show if nothing is happening
  if (activeCount === 0 && failedCount === 0) {
    return null;
  }

  const hasFailures = failedCount > 0;
  const isActive = activeCount > 0;

  return (
    <TouchableOpacity
      style={[styles.container, hasFailures && styles.containerError]}
      onPress={onPress}
      activeOpacity={0.8}>
      <View style={styles.content}>
        {isActive ? (
          <Animated.View style={animatedStyle} collapsable={false}>
            <Icon name="sync" size={16} color="#FFFFFF" />
          </Animated.View>
        ) : hasFailures ? (
          <View collapsable={false}>
            <Icon name="warning" size={16} color="#FFFFFF" />
          </View>
        ) : (
          <View collapsable={false}>
            <Icon name="checkmark-circle" size={16} color="#FFFFFF" />
          </View>
        )}

        <Text style={styles.text}>
          {isActive
            ? `${activeCount} uploading (${Math.round(overallProgress)}%)`
            : hasFailures
            ? `${failedCount} failed`
            : 'Done'}
        </Text>
      </View>

      {/* Progress bar */}
      {isActive && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${overallProgress}%` }]} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 70,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  containerError: {
    backgroundColor: colors.error,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  text: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  progressContainer: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
});

export default UploadStatusBadge;
