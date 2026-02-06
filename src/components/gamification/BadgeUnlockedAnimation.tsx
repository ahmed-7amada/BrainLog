/**
 * Badge Unlocked Animation Component
 * Displays a celebration animation when the user unlocks a badge
 * T392 - Per FR-041 badge achievements
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
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

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

interface BadgeUnlockedAnimationProps {
  /** Whether to show the animation */
  visible: boolean;
  /** The badge that was unlocked */
  badge: Badge | null;
  /** XP bonus awarded (if any) */
  xpBonus?: number;
  /** Called when animation completes */
  onComplete: () => void;
  /** Animation duration in ms */
  duration?: number;
}

export const BadgeUnlockedAnimation: React.FC<BadgeUnlockedAnimationProps> = ({
  visible,
  badge,
  xpBonus = 0,
  onComplete,
  duration = 3500,
}) => {
  const opacity = useSharedValue(0);
  const badgeScale = useSharedValue(0);
  const badgeRotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const shine = useSharedValue(-1);

  useEffect(() => {
    if (!visible || !badge) {
      return;
    }

    // Reset values
    opacity.value = 0;
    badgeScale.value = 0;
    badgeRotation.value = -30;
    glowOpacity.value = 0;
    textOpacity.value = 0;
    shine.value = -1;

    // Start animation sequence
    opacity.value = withTiming(1, { duration: 300 });

    // Badge entrance with bounce and rotation
    badgeScale.value = withDelay(
      200,
      withSequence(
        withSpring(1.2, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 12, stiffness: 150 }),
      ),
    );
    badgeRotation.value = withDelay(200, withSpring(0, { damping: 10, stiffness: 100 }));

    // Glow effect
    glowOpacity.value = withDelay(
      400,
      withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(0.5, { duration: 600 }),
        withTiming(1, { duration: 600 }),
        withTiming(0.5, { duration: 600 }),
      ),
    );

    // Shine sweep effect
    shine.value = withDelay(600, withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) }));

    // Text fade in
    textOpacity.value = withDelay(800, withTiming(1, { duration: 400 }));

    // Complete callback
    const timeout = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 300 }, finished => {
        if (finished) {
          runOnJS(onComplete)();
        }
      });
    }, duration);

    return () => clearTimeout(timeout);
  }, [
    visible,
    badge,
    duration,
    onComplete,
    opacity,
    badgeScale,
    badgeRotation,
    glowOpacity,
    textOpacity,
    shine,
  ]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const badgeContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }, { rotate: `${badgeRotation.value}deg` }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const shineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shine.value * 200 }],
    opacity: shine.value > 0 && shine.value < 1 ? 1 : 0,
  }));

  if (!visible || !badge) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View style={[styles.overlay, containerStyle]}>
        <View style={styles.content}>
          <Animated.Text style={[styles.title, textStyle]}>Badge Unlocked!</Animated.Text>

          <View style={styles.badgeWrapper}>
            <Animated.View style={[styles.glow, glowStyle]} />
            <Animated.View style={[styles.badgeContainer, badgeContainerStyle]}>
              <Text style={styles.badgeIcon}>{badge.icon}</Text>
              <Animated.View style={[styles.shine, shineStyle]} />
            </Animated.View>
          </View>

          <Animated.View style={[styles.textContainer, textStyle]}>
            <Text style={styles.badgeName}>{badge.name}</Text>
            <Text style={styles.badgeDescription}>{badge.description}</Text>
            <Text style={styles.category}>{badge.category}</Text>
            {xpBonus > 0 && (
              <View style={styles.xpBonusContainer}>
                <Text style={styles.xpBonusText}>+{xpBonus} XP Bonus!</Text>
              </View>
            )}
          </Animated.View>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.accent,
    letterSpacing: 2,
    marginBottom: spacing.xxl,
    textTransform: 'uppercase',
  },
  badgeWrapper: {
    position: 'relative',
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 40,
  },
  badgeContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: colors.accent,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  badgeIcon: {
    fontSize: 60,
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: -100,
    width: 60,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewX: '-20deg' }],
  },
  textContainer: {
    alignItems: 'center',
  },
  badgeName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: typography.fontSize.md,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: spacing.sm,
    maxWidth: 280,
  },
  category: {
    fontSize: typography.fontSize.sm,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: typography.fontWeight.semibold,
  },
  xpBonusContainer: {
    marginTop: spacing.lg,
    backgroundColor: colors.xp,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  xpBonusText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: '#000',
  },
});

export default BadgeUnlockedAnimation;
