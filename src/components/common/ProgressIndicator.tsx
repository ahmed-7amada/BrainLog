/**
 * ProgressIndicator Component
 * Animated progress bar for upload tracking (FR-009)
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, spacing, typography, borderRadius } from '../../config/theme';

export interface ProgressIndicatorProps {
  /** Current progress (0-100) */
  progress: number;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Color variant */
  variant?: 'primary' | 'success' | 'warning' | 'error';
  /** Whether to show percentage label */
  showLabel?: boolean;
  /** Custom label text (overrides percentage) */
  label?: string;
  /** Whether the progress is indeterminate (animated) */
  indeterminate?: boolean;
  /** Animation duration in ms */
  animationDuration?: number;
}

const sizeConfig = {
  small: { height: 4, fontSize: typography.fontSize.xs },
  medium: { height: 8, fontSize: typography.fontSize.sm },
  large: { height: 12, fontSize: typography.fontSize.md },
};

const variantColors = {
  primary: colors.primary,
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
};

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  size = 'medium',
  variant = 'primary',
  showLabel = false,
  label,
  indeterminate = false,
  animationDuration = 300,
}) => {
  const progressValue = useSharedValue(0);
  const indeterminateValue = useSharedValue(0);

  const { height, fontSize } = sizeConfig[size];
  const barColor = variantColors[variant];

  // Update progress animation
  useEffect(() => {
    progressValue.value = withTiming(Math.min(100, Math.max(0, progress)), {
      duration: animationDuration,
      easing: Easing.out(Easing.quad),
    });
  }, [progress, progressValue, animationDuration]);

  // Indeterminate animation
  useEffect(() => {
    if (indeterminate) {
      indeterminateValue.value = withTiming(1, {
        duration: 1500,
        easing: Easing.linear,
      });
    }
  }, [indeterminate, indeterminateValue]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value}%`,
  }));

  const displayLabel = label ?? `${Math.round(progress)}%`;

  const styles = StyleSheet.create({
    container: {
      width: '100%',
    },
    labelContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.xs,
    },
    label: {
      fontSize,
      color: colors.light.textSecondary,
    },
    track: {
      height,
      backgroundColor: colors.light.border,
      borderRadius: borderRadius.full,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      backgroundColor: barColor,
      borderRadius: borderRadius.full,
    },
  });

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>Progress</Text>
          <Text style={styles.label}>{displayLabel}</Text>
        </View>
      )}
      <View style={styles.track}>
        <Animated.View style={[styles.fill, progressStyle]} />
      </View>
    </View>
  );
};

/**
 * Circular progress indicator
 */
export interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 48,
  strokeWidth = 4,
  color = colors.primary,
  backgroundColor = colors.light.border,
  showLabel = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  // Note: circumference calculation for future SVG implementation
  const _circumference = radius * 2 * Math.PI;
  const progressValue = useSharedValue(0);

  useEffect(() => {
    progressValue.value = withTiming(Math.min(100, Math.max(0, progress)), {
      duration: 300,
      easing: Easing.out(Easing.quad),
    });
  }, [progress, progressValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: '-90deg' }],
  }));

  const styles = StyleSheet.create({
    container: {
      width: size,
      height: size,
      justifyContent: 'center',
      alignItems: 'center',
    },
    labelContainer: {
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
    },
    label: {
      fontSize: size * 0.25,
      fontWeight: '600',
      color: colors.light.text,
    },
  });

  // Note: SVG implementation would be ideal here, using View-based approximation
  return (
    <View style={styles.container}>
      <Animated.View style={animatedStyle}>
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: backgroundColor,
          }}>
          <View
            style={{
              position: 'absolute',
              top: -strokeWidth,
              left: -strokeWidth,
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: 'transparent',
              borderTopColor: color,
              borderRightColor: progress > 25 ? color : 'transparent',
              borderBottomColor: progress > 50 ? color : 'transparent',
              borderLeftColor: progress > 75 ? color : 'transparent',
            }}
          />
        </View>
      </Animated.View>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{Math.round(progress)}%</Text>
        </View>
      )}
    </View>
  );
};

/**
 * Mini progress indicator for inline use
 */
export const MiniProgress: React.FC<{
  progress: number;
  color?: string;
}> = ({ progress, color = colors.primary }) => {
  const progressValue = useSharedValue(0);

  useEffect(() => {
    progressValue.value = withTiming(progress, { duration: 200 });
  }, [progress, progressValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value}%`,
  }));

  return (
    <View
      style={{
        height: 2,
        backgroundColor: colors.light.border,
        borderRadius: 1,
        overflow: 'hidden',
      }}>
      <Animated.View
        style={[
          {
            height: '100%',
            backgroundColor: color,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

export default ProgressIndicator;
