/**
 * Review Complete Screen
 * Shows session summary after completing a review
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeScreen } from '../../components/common';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography, borderRadius, shadows } from '../../config/theme';
import type { FlashcardsScreenProps } from '../../navigation/types';

type Props = FlashcardsScreenProps<'ReviewComplete'>;

const ReviewCompleteScreen: React.FC<Props> = () => {
  const navigation = useNavigation<Props['navigation']>();
  const route = useRoute<Props['route']>();

  const { cardsReviewed, correctCount, incorrectCount, xpEarned } = route.params;

  const accuracy = cardsReviewed > 0 ? Math.round((correctCount / cardsReviewed) * 100) : 0;

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, fadeAnim]);

  const getAccuracyColor = () => {
    if (accuracy >= 80) return colors.success;
    if (accuracy >= 60) return colors.warning;
    return colors.error;
  };

  const getEncouragingMessage = () => {
    if (accuracy >= 90) return 'Excellent work! 🎉';
    if (accuracy >= 80) return 'Great job! Keep it up!';
    if (accuracy >= 60) return 'Good progress! Practice makes perfect.';
    return "Don't give up! Review again soon.";
  };

  return (
    <SafeScreen backgroundColor={colors.light.background}>
      <View style={styles.container}>
        {/* Success Icon */}
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
          <Icon name="checkmark-circle" size={100} color={colors.success} />
        </Animated.View>

        {/* Title */}
        <Text testID="reviewComplete_text_summary" style={styles.title}>
          Session Complete!
        </Text>
        <Text style={styles.message}>{getEncouragingMessage()}</Text>

        {/* Stats */}
        <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text testID="reviewComplete_text_cardsReviewed" style={styles.statValue}>
                {cardsReviewed}
              </Text>
              <Text style={styles.statLabel}>Cards Reviewed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: getAccuracyColor() }]}>{accuracy}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statWithIcon}>
                <Icon name="checkmark" size={20} color={colors.success} />
                <Text style={[styles.statValue, styles.smallStat]}>{correctCount}</Text>
              </View>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statWithIcon}>
                <Icon name="close" size={20} color={colors.error} />
                <Text style={[styles.statValue, styles.smallStat]}>{incorrectCount}</Text>
              </View>
              <Text style={styles.statLabel}>Incorrect</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statWithIcon}>
                <Icon name="star" size={20} color={colors.xp} />
                <Text style={[styles.statValue, styles.smallStat]}>+{xpEarned}</Text>
              </View>
              <Text style={styles.statLabel}>XP Earned</Text>
            </View>
          </View>
        </Animated.View>

        {/* Actions */}
        <Animated.View style={[styles.actionsContainer, { opacity: fadeAnim }]}>
          <TouchableOpacity
            testID="reviewComplete_button_done"
            style={styles.primaryButton}
            onPress={() => navigation.navigate('FlashcardList')}
            activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>Done</Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="reviewComplete_button_reviewMore"
            style={styles.secondaryButton}
            onPress={() => navigation.replace('ReviewSession')}
            activeOpacity={0.8}>
            <Icon name="refresh" size={20} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>Review More</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.light.text,
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: typography.fontSize.md,
    color: colors.light.textSecondary,
    marginBottom: spacing.xxl,
  },
  statsContainer: {
    width: '100%',
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xxl,
    ...shadows.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.light.border,
    marginHorizontal: spacing.md,
  },
  statValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.light.text,
  },
  smallStat: {
    fontSize: typography.fontSize.xl,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.light.textSecondary,
    marginTop: spacing.xs,
  },
  statWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionsContainer: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  primaryButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
  secondaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    marginLeft: spacing.sm,
  },
});

export default ReviewCompleteScreen;
