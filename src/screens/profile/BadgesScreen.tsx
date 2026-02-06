/**
 * Badges Screen
 * Shows earned and available badges
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography, borderRadius, shadows } from '../../config/theme';
import { useProgress } from '../../hooks/useProgress';
import type { ProfileScreenProps } from '../../navigation/types';

type Props = ProfileScreenProps<'Badges'>;

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'streak' | 'flashcards' | 'habits' | 'xp' | 'notes';
  earned: boolean;
  progress: number;
}

const BADGES: Badge[] = [
  {
    id: '1',
    name: 'First Steps',
    description: 'Complete your first flashcard review',
    icon: 'footsteps',
    requirement: 1,
    type: 'flashcards',
    earned: false,
    progress: 0,
  },
  {
    id: '2',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: 'flame',
    requirement: 7,
    type: 'streak',
    earned: false,
    progress: 0,
  },
  {
    id: '3',
    name: 'Note Taker',
    description: 'Create 10 notes',
    icon: 'document-text',
    requirement: 10,
    type: 'notes',
    earned: false,
    progress: 0,
  },
  {
    id: '4',
    name: 'Habit Former',
    description: 'Complete all habits for 7 days',
    icon: 'checkbox',
    requirement: 7,
    type: 'habits',
    earned: false,
    progress: 0,
  },
  {
    id: '5',
    name: 'Card Master',
    description: 'Review 100 flashcards',
    icon: 'albums',
    requirement: 100,
    type: 'flashcards',
    earned: false,
    progress: 0,
  },
  {
    id: '6',
    name: 'Month Master',
    description: 'Maintain a 30-day streak',
    icon: 'calendar',
    requirement: 30,
    type: 'streak',
    earned: false,
    progress: 0,
  },
  {
    id: '7',
    name: 'XP Hunter',
    description: 'Earn 1000 XP',
    icon: 'star',
    requirement: 1000,
    type: 'xp',
    earned: false,
    progress: 0,
  },
  {
    id: '8',
    name: 'Knowledge Seeker',
    description: 'Create 50 flashcards',
    icon: 'bulb',
    requirement: 50,
    type: 'flashcards',
    earned: false,
    progress: 0,
  },
];

const BadgesScreen: React.FC<Props> = () => {
  const { currentStreak, xpPoints } = useProgress();

  // Calculate badge progress
  const getBadgeProgress = (badge: Badge): number => {
    switch (badge.type) {
      case 'streak':
        return Math.min(currentStreak / badge.requirement, 1);
      case 'xp':
        return Math.min(xpPoints / badge.requirement, 1);
      default:
        return badge.progress;
    }
  };

  const isBadgeEarned = (badge: Badge): boolean => {
    return getBadgeProgress(badge) >= 1;
  };

  const earnedBadges = BADGES.filter(badge => isBadgeEarned(badge));
  const lockedBadges = BADGES.filter(badge => !isBadgeEarned(badge));

  const renderBadge = (badge: Badge, isEarned: boolean) => {
    const progress = getBadgeProgress(badge);

    return (
      <View style={[styles.badgeCard, !isEarned && styles.badgeCardLocked]}>
        <View style={[styles.badgeIcon, isEarned && styles.badgeIconEarned]}>
          <Icon
            name={badge.icon}
            size={32}
            color={isEarned ? colors.xp : colors.light.textTertiary}
          />
        </View>
        <Text style={[styles.badgeName, !isEarned && styles.badgeNameLocked]}>{badge.name}</Text>
        <Text style={styles.badgeDescription}>{badge.description}</Text>
        {!isEarned && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
          </View>
        )}
        {isEarned && (
          <View style={styles.earnedBadge}>
            <Icon name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.earnedText}>Earned</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Stats Summary */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{earnedBadges.length}</Text>
          <Text style={styles.statLabel}>Badges Earned</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{BADGES.length - earnedBadges.length}</Text>
          <Text style={styles.statLabel}>To Unlock</Text>
        </View>
      </View>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earned ({earnedBadges.length})</Text>
          <View style={styles.badgesGrid} testID="badges_list_earned">
            {earnedBadges.map(badge => (
              <View key={badge.id} style={styles.badgeWrapper}>
                {renderBadge(badge, true)}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Locked Badges */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Locked ({lockedBadges.length})</Text>
        <View style={styles.badgesGrid} testID="badges_list_locked">
          {lockedBadges.map(badge => (
            <View key={badge.id} style={styles.badgeWrapper}>
              {renderBadge(badge, false)}
            </View>
          ))}
        </View>
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
  statsCard: {
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.light.textSecondary,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.light.border,
    marginHorizontal: spacing.xl,
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
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  badgeWrapper: {
    width: '50%',
    padding: spacing.xs,
  },
  badgeCard: {
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  badgeCardLocked: {
    opacity: 0.7,
  },
  badgeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  badgeIconEarned: {
    backgroundColor: colors.xp + '20',
  },
  badgeName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.light.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  badgeNameLocked: {
    color: colors.light.textSecondary,
  },
  badgeDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  progressContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.light.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: typography.fontSize.xs,
    color: colors.light.textSecondary,
    marginLeft: spacing.sm,
    minWidth: 35,
  },
  earnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  earnedText: {
    fontSize: typography.fontSize.sm,
    color: colors.success,
    marginLeft: spacing.xs,
  },
});

export default BadgesScreen;
