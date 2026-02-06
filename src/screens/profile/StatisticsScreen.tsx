/**
 * Statistics Screen
 * Shows detailed learning statistics and analytics
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography, borderRadius, shadows } from '../../config/theme';
import { useProgress } from '../../hooks/useProgress';
import { useFlashcards } from '../../hooks/useFlashcards';
import { useNotes } from '../../hooks/useNotes';
import type { ProfileScreenProps } from '../../navigation/types';

type Props = ProfileScreenProps<'Statistics'>;

const StatisticsScreen: React.FC<Props> = () => {
  const { currentStreak, xpPoints, currentLevel, habits, getCompletedHabitsCount } = useProgress();
  const { flashcards, dueCount } = useFlashcards();
  const { notes } = useNotes();

  // Calculate flashcard stats
  const totalFlashcards = flashcards.length;
  const dueFlashcards = dueCount;
  const masteredFlashcards = flashcards.filter(f => f.easeFactor >= 2.5 && f.interval >= 21).length;
  const learningFlashcards = flashcards.filter(f => f.interval < 21).length;

  // Calculate XP to next level
  const xpForCurrentLevel = (currentLevel - 1) * 100;
  const xpForNextLevel = currentLevel * 100;
  const xpProgress = xpPoints - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const levelProgress = xpProgress / xpNeeded;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Level Progress */}
      <View style={styles.levelCard}>
        <View style={styles.levelHeader}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelNumber}>{currentLevel}</Text>
          </View>
          <View style={styles.levelInfo}>
            <Text style={styles.levelTitle}>Level {currentLevel}</Text>
            <Text style={styles.levelSubtitle}>{xpPoints} XP total</Text>
          </View>
          <View style={styles.xpToNext}>
            <Text style={styles.xpToNextValue}>{xpNeeded - xpProgress}</Text>
            <Text style={styles.xpToNextLabel}>XP to next</Text>
          </View>
        </View>
        <View style={styles.levelProgressBar}>
          <View style={[styles.levelProgressFill, { width: `${levelProgress * 100}%` }]} />
        </View>
        <Text style={styles.levelProgressText}>
          {xpProgress} / {xpNeeded} XP
        </Text>
      </View>

      {/* Quick Stats Grid */}
      <View style={styles.quickStatsGrid} testID="statistics_chart_activity">
        <View style={styles.quickStatCard} testID="statistics_card_reviewStreak">
          <Icon name="flame" size={28} color={colors.error} />
          <Text style={styles.quickStatValue}>{currentStreak}</Text>
          <Text style={styles.quickStatLabel}>Day Streak</Text>
        </View>
        <View style={styles.quickStatCard} testID="statistics_card_totalCards">
          <Icon name="albums" size={28} color={colors.primary} />
          <Text style={styles.quickStatValue}>{totalFlashcards}</Text>
          <Text style={styles.quickStatLabel}>Flashcards</Text>
        </View>
        <View style={styles.quickStatCard}>
          <Icon name="document-text" size={28} color={colors.info} />
          <Text style={styles.quickStatValue}>{notes.length}</Text>
          <Text style={styles.quickStatLabel}>Notes</Text>
        </View>
        <View style={styles.quickStatCard}>
          <Icon name="checkbox" size={28} color={colors.success} />
          <Text style={styles.quickStatValue}>{habits.length}</Text>
          <Text style={styles.quickStatLabel}>Habits</Text>
        </View>
      </View>

      {/* Flashcard Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Flashcard Statistics</Text>
        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <View style={styles.statIcon}>
              <Icon name="time" size={20} color={colors.warning} />
            </View>
            <Text style={styles.statLabel}>Due for Review</Text>
            <Text style={[styles.statValue, dueFlashcards > 0 && styles.statValueWarning]}>
              {dueFlashcards}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statRow}>
            <View style={styles.statIcon}>
              <Icon name="school" size={20} color={colors.info} />
            </View>
            <Text style={styles.statLabel}>Learning</Text>
            <Text style={styles.statValue}>{learningFlashcards}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statRow} testID="statistics_card_averageAccuracy">
            <View style={styles.statIcon}>
              <Icon name="trophy" size={20} color={colors.success} />
            </View>
            <Text style={styles.statLabel}>Mastered</Text>
            <Text style={[styles.statValue, styles.statValueSuccess]}>{masteredFlashcards}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statRow}>
            <View style={styles.statIcon}>
              <Icon name="albums" size={20} color={colors.light.textSecondary} />
            </View>
            <Text style={styles.statLabel}>Total Cards</Text>
            <Text style={styles.statValue}>{totalFlashcards}</Text>
          </View>
        </View>
      </View>

      {/* Habits Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Habits</Text>
        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <View style={styles.statIcon}>
              <Icon name="checkmark-circle" size={20} color={colors.success} />
            </View>
            <Text style={styles.statLabel}>Completed</Text>
            <Text style={[styles.statValue, styles.statValueSuccess]}>
              {getCompletedHabitsCount()}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statRow}>
            <View style={styles.statIcon}>
              <Icon name="ellipse-outline" size={20} color={colors.light.textSecondary} />
            </View>
            <Text style={styles.statLabel}>Remaining</Text>
            <Text style={styles.statValue}>{habits.length - getCompletedHabitsCount()}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statRow}>
            <View style={styles.statIcon}>
              <Icon name="list" size={20} color={colors.light.textSecondary} />
            </View>
            <Text style={styles.statLabel}>Total Habits</Text>
            <Text style={styles.statValue}>{habits.length}</Text>
          </View>
        </View>
      </View>

      {/* Learning Tips */}
      <View style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>Keep Learning!</Text>
        <Text style={styles.tipsText}>
          Consistency is key. Review your flashcards daily and complete your habits to maximize
          learning retention.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.surface,
  },
  content: {
    padding: spacing.lg,
  },
  levelCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  levelInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  levelTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
  levelSubtitle: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  xpToNext: {
    alignItems: 'flex-end',
  },
  xpToNextValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  xpToNextLabel: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  levelProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  levelProgressText: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
    marginBottom: spacing.lg,
  },
  quickStatCard: {
    width: '50%',
    padding: spacing.xs,
  },
  quickStatValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.light.text,
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    textAlign: 'center',
    marginTop: spacing.sm,
    ...shadows.sm,
  },
  quickStatLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.light.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.light.text,
    marginBottom: spacing.md,
  },
  statsCard: {
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.light.text,
    marginLeft: spacing.md,
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.light.text,
  },
  statValueWarning: {
    color: colors.warning,
  },
  statValueSuccess: {
    color: colors.success,
  },
  statDivider: {
    height: 1,
    backgroundColor: colors.light.border,
    marginVertical: spacing.xs,
  },
  tipsSection: {
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  tipsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.light.text,
    marginBottom: spacing.sm,
  },
  tipsText: {
    fontSize: typography.fontSize.md,
    color: colors.light.textSecondary,
    lineHeight: typography.fontSize.md * 1.5,
  },
});

export default StatisticsScreen;
