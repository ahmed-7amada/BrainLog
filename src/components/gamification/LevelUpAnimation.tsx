/**
 * Level Up Animation Component
 * Displays a celebration animation when the user levels up
 * T391 - Per FR-043 level up celebrations
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius } from '../../config/theme';

interface LevelUpAnimationProps {
  /** Whether to show the animation */
  visible: boolean;
  /** The new level achieved */
  level: number;
  /** Called when animation completes */
  onComplete: () => void;
  /** Animation duration in ms */
  duration?: number;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const LevelUpAnimation: React.FC<LevelUpAnimationProps> = ({
  visible,
  level,
  onComplete,
  duration = 3000,
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const levelScale = useSharedValue(0);
  const starRotation = useSharedValue(0);
  const confettiY = useSharedValue(-50);

  useEffect(() => {
    if (!visible) {
      return;
    }

    // Reset values
    scale.value = 0;
    opacity.value = 0;
    levelScale.value = 0;
    starRotation.value = 0;
    confettiY.value = -50;

    // Start animation sequence
    opacity.value = withTiming(1, { duration: 300 });
    scale.value = withSpring(1, { damping: 10, stiffness: 100 });
    levelScale.value = withDelay(
      400,
      withSequence(
        withSpring(1.3, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 12, stiffness: 150 }),
      ),
    );
    starRotation.value = withTiming(360, {
      duration: 2000,
      easing: Easing.linear,
    });
    confettiY.value = withTiming(SCREEN_HEIGHT + 100, { duration: 2500 });

    // Complete callback
    const timeout = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 300 }, finished => {
        if (finished) {
          runOnJS(onComplete)();
        }
      });
    }, duration);

    return () => clearTimeout(timeout);
  }, [visible, duration, onComplete, scale, opacity, levelScale, starRotation, confettiY]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const levelStyle = useAnimatedStyle(() => ({
    transform: [{ scale: levelScale.value }],
  }));

  const starStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${starRotation.value}deg` }],
  }));

  const confettiStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: confettiY.value }],
  }));

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.confettiContainer, confettiStyle]}>
          {[...Array(20)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.confetti,
                {
                  left: Math.random() * SCREEN_WIDTH,
                  backgroundColor: [colors.primary, colors.accent, colors.success, colors.xp][
                    i % 4
                  ],
                  transform: [{ rotate: `${Math.random() * 360}deg` }],
                },
              ]}
            />
          ))}
        </Animated.View>

        <Animated.View style={[styles.container, containerStyle]}>
          <Animated.Text style={[styles.star, starStyle]}>⭐</Animated.Text>
          <Text style={styles.title}>LEVEL UP!</Text>
          <Animated.View style={[styles.levelContainer, levelStyle]}>
            <Text style={styles.levelLabel}>Level</Text>
            <Text style={styles.levelNumber}>{level}</Text>
          </Animated.View>
          <Text style={styles.subtitle}>Keep up the great work!</Text>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  container: {
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  star: {
    fontSize: 60,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.xp,
    letterSpacing: 4,
    marginBottom: spacing.lg,
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  levelContainer: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  levelLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: spacing.xs,
  },
  levelNumber: {
    fontSize: 48,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: '#FFFFFF',
    opacity: 0.8,
  },
});

export default LevelUpAnimation;
