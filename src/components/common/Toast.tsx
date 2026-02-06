/**
 * Toast Component
 * Animated toast notification (FR-003, FR-020)
 */

import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../config/theme';

export type ToastType = 'info' | 'success' | 'error' | 'warning';

export interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss: (id: string) => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

const TOAST_DURATION = 3000;
const ANIMATION_DURATION = 300;

export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type = 'info',
  duration = TOAST_DURATION,
  onDismiss,
  action,
}) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  const getTypeColors = () => {
    switch (type) {
      case 'success':
        return {
          background: theme.colors.success || '#22c55e',
          text: '#ffffff',
        };
      case 'error':
        return {
          background: theme.colors.error || '#ef4444',
          text: '#ffffff',
        };
      case 'warning':
        return {
          background: theme.colors.warning || '#f59e0b',
          text: '#000000',
        };
      default:
        return {
          background: theme.colors.surface || '#1f2937',
          text: theme.colors.text || '#ffffff',
        };
    }
  };

  const colors = getTypeColors();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const dismiss = () => {
    onDismiss(id);
  };

  useEffect(() => {
    // Animate in
    translateY.value = withTiming(0, {
      duration: ANIMATION_DURATION,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withTiming(1, {
      duration: ANIMATION_DURATION,
    });

    // Auto dismiss after duration
    const timer = setTimeout(() => {
      translateY.value = withTiming(-100, {
        duration: ANIMATION_DURATION,
        easing: Easing.in(Easing.cubic),
      });
      opacity.value = withTiming(
        0,
        {
          duration: ANIMATION_DURATION,
        },
        () => {
          runOnJS(dismiss)();
        },
      );
    }, duration);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePress = () => {
    translateY.value = withTiming(-100, {
      duration: ANIMATION_DURATION,
    });
    opacity.value = withTiming(
      0,
      {
        duration: ANIMATION_DURATION,
      },
      () => {
        runOnJS(dismiss)();
      },
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + 8,
          backgroundColor: colors.background,
        },
        animatedStyle,
      ]}>
      <TouchableOpacity style={styles.content} onPress={handlePress} activeOpacity={0.8}>
        <Text style={[styles.message, { color: colors.text }]} numberOfLines={2}>
          {message}
        </Text>
        {action && (
          <TouchableOpacity
            onPress={() => {
              action.onPress();
              handlePress();
            }}
            style={styles.actionButton}>
            <Text style={[styles.actionText, { color: colors.text }]}>{action.label}</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  actionButton: {
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});

export default Toast;
