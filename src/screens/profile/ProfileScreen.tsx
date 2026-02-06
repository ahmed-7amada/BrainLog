/**
 * Profile Screen
 * User profile, stats, and quick links
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useStore } from '../../store';
import { signOut } from '../../services/firebase/authService';
import { colors, spacing, typography, borderRadius, shadows } from '../../config/theme';
import { LEVEL_THRESHOLDS } from '../../utils/constants';
import type { ProfileScreenProps } from '../../navigation/types';

type Props = ProfileScreenProps<'ProfileMain'>;

const ProfileScreen: React.FC<Props> = () => {
  const navigation = useNavigation<Props['navigation']>();
  const { user, xpPoints, currentLevel, currentStreak, longestStreak, logout } = useStore();

  // Calculate XP progress to next level
  const currentLevelXP = LEVEL_THRESHOLDS[currentLevel] || 0;
  const nextLevelXP = LEVEL_THRESHOLDS[currentLevel + 1] || LEVEL_THRESHOLDS[10];
  const xpProgress =
    currentLevel < 10 ? ((xpPoints - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100 : 100;

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            logout();
          } catch {
            Alert.alert('Error', 'Failed to sign out. Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.header}>
        {user?.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Icon name="person" size={40} color={colors.light.textSecondary} />
          </View>
        )}
        <Text style={styles.userName} testID="profile_text_username">
          {user?.name || 'User'}
        </Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      {/* Level & XP */}
      <View style={styles.levelCard}>
        <View style={styles.levelHeader}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelNumber}>{currentLevel}</Text>
          </View>
          <View style={styles.levelInfo}>
            <Text style={styles.levelLabel} testID="profile_text_level">
              Level {currentLevel}
            </Text>
            <Text style={styles.xpText}>
              {xpPoints.toLocaleString()} XP
              {currentLevel < 10 && ` / ${nextLevelXP.toLocaleString()} XP`}
            </Text>
          </View>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${xpProgress}%` }]} />
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow} testID="profile_card_stats">
        <View style={styles.statItem}>
          <Icon name="flame" size={24} color={colors.streak} />
          <Text style={styles.statValue}>{currentStreak}</Text>
          <Text style={styles.statLabel}>Current Streak</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Icon name="trophy" size={24} color={colors.xp} />
          <Text style={styles.statValue}>{longestStreak || currentStreak}</Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <MenuItem
          icon="ribbon"
          label="Badges"
          onPress={() => navigation.navigate('Badges')}
          testID="profile_button_badges"
        />
        <MenuItem
          icon="stats-chart"
          label="Statistics"
          onPress={() => navigation.navigate('Statistics')}
          testID="profile_button_statistics"
        />
        <MenuItem
          icon="checkmark-done"
          label="Habits"
          onPress={() => navigation.navigate('Habits')}
          testID="profile_button_habits"
        />
        <MenuItem
          icon="settings"
          label="Settings"
          onPress={() => navigation.navigate('Settings')}
          testID="profile_button_settings"
        />
      </View>

      {/* Sign Out */}
      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
        testID="profile_button_logout">
        <Icon name="log-out-outline" size={20} color={colors.error} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      {/* App Version */}
      <Text style={styles.versionText}>BrainLog v0.0.1</Text>
    </ScrollView>
  );
};

const MenuItem: React.FC<{
  icon: string;
  label: string;
  onPress: () => void;
  testID?: string;
}> = ({ icon, label, onPress, testID }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} testID={testID}>
    <Icon name={icon} size={22} color={colors.primary} />
    <Text style={styles.menuItemLabel}>{label}</Text>
    <Icon name="chevron-forward" size={20} color={colors.light.textSecondary} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.surface,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: spacing.md,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  userName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.light.text,
  },
  userEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.light.textSecondary,
    marginTop: spacing.xs,
  },
  levelCard: {
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  levelInfo: {
    marginLeft: spacing.md,
  },
  levelLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.light.text,
  },
  xpText: {
    fontSize: typography.fontSize.sm,
    color: colors.light.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.light.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.xp,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.light.border,
    marginHorizontal: spacing.md,
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.light.text,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.light.textSecondary,
    marginTop: 2,
  },
  menuSection: {
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  menuItemLabel: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.light.text,
    marginLeft: spacing.md,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  signOutText: {
    fontSize: typography.fontSize.md,
    color: colors.error,
    marginLeft: spacing.sm,
  },
  versionText: {
    fontSize: typography.fontSize.xs,
    color: colors.light.textTertiary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
});

export default ProfileScreen;
