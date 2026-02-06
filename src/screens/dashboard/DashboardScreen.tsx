/**
 * Dashboard Screen
 * Main home screen showing learning status, habits, streak, and XP (FR-029 through FR-031)
 * T303 - Added offline caching support
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { useStore } from '../../store';
import { colors, spacing, typography, borderRadius, shadows } from '../../config/theme';
import { getTimeGreeting } from '../../utils/dateUtils';
import type { MainTabScreenProps, RootStackParamList } from '../../navigation/types';
import * as flashcardService from '../../services/firebase/flashcardService';
import * as habitService from '../../services/firebase/habitService';
import * as xpService from '../../services/gamification/xpService';
import * as streakService from '../../services/gamification/streakService';
import { connectivityListener } from '../../services/sync/connectivityListener';
import { SafeScreen } from '../../components/common';

type Props = MainTabScreenProps<'Dashboard'>;

const DashboardScreen: React.FC<Props> = () => {
  const navigation = useNavigation<Props['navigation']>();
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [refreshing, setRefreshing] = React.useState(false);
  // T303 - Track offline state and last sync time
  const [isOffline, setIsOffline] = React.useState(!connectivityListener.getIsConnected());
  const [lastSyncTime, setLastSyncTime] = React.useState<Date | null>(null);

  const {
    user,
    dueCount,
    currentStreak,
    xpPoints,
    currentLevel,
    habits,
    todayHabitLog,
    setDueCount,
    setStreak,
    setXP,
    setHabits,
    setTodayHabitLog,
    toggleHabitCompletion,
  } = useStore();

  // T303 - Listen for connectivity changes
  React.useEffect(() => {
    const unsubscribe = connectivityListener.addCallback(connected => {
      setIsOffline(!connected);
    });
    return () => unsubscribe();
  }, []);

  // Calculate completed habits
  const completedHabitsCount = todayHabitLog
    ? Object.values(todayHabitLog.habitCompletions).filter(Boolean).length
    : 0;
  const totalHabitsCount = habits.filter(h => h.isActive).length;

  // T303 - Load data from Firebase with offline fallback
  const loadData = React.useCallback(async () => {
    // Check if we're online before attempting to fetch
    const isConnected = connectivityListener.getIsConnected();

    if (!isConnected) {
      // Offline: use cached data from Zustand (already persisted via MMKV)
      // The store already has the last synced values, so we just skip the fetch
      return;
    }

    try {
      // Load due flashcards count
      const dueCards = await flashcardService.getDueCount();
      setDueCount(dueCards);

      // Load XP and level
      const userData = await xpService.getUserXP();
      setXP(userData.xpPoints, userData.currentLevel);

      // Load streak
      const streakData = await streakService.getStreakData();
      setStreak(streakData.currentStreak);

      // Load habits
      const habitsData = await habitService.getAllHabits();
      setHabits(habitsData);

      // Load or create today's habit log
      const habitLog = await habitService.getOrCreateTodayHabitLog();
      setTodayHabitLog(habitLog);

      // T303 - Update last sync time on successful fetch
      setLastSyncTime(new Date());
    } catch (error) {
      // T303 - On error, silently use cached data
      // The Zustand store already has persisted data from MMKV
      console.warn('Dashboard: Failed to fetch fresh data, using cache:', error);
    }
  }, [setDueCount, setXP, setStreak, setHabits, setTodayHabitLog]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Refresh data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const greeting = `${getTimeGreeting()}, ${user?.name?.split(' ')[0] || 'Learner'}!`;

  return (
    <SafeScreen edges={['top', 'left', 'right']} backgroundColor={colors.light.surface}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* T303 - Cached data indicator when offline */}
        {isOffline && (
          <View style={styles.cachedIndicator}>
            <View>
              <Icon name="cloud-offline-outline" size={14} color={colors.light.textTertiary} />
            </View>
            <Text style={styles.cachedText}>
              Showing cached data
              {lastSyncTime && ` from ${lastSyncTime.toLocaleTimeString()}`}
            </Text>
          </View>
        )}

        {/* Header with Greeting and Search */}
        <View style={styles.header}>
          <Text testID="dashboard_text_greeting" style={styles.greeting}>
            {greeting}
          </Text>
          <View style={styles.headerActions}>
            {isOffline && (
              <View style={styles.offlineIcon}>
                <Icon name="cloud-offline" size={20} color={colors.warning} />
              </View>
            )}
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => rootNavigation.navigate('Search')}>
              <Icon name="search" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Row */}
        <View testID="dashboard_card_todayProgress" style={styles.statsRow}>
          {/* Streak */}
          <View testID="dashboard_card_streakCounter" style={styles.statCard}>
            <View>
              <Icon name="flame" size={28} color={colors.streak} />
            </View>
            <Text style={styles.statValue}>{currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>

          {/* Level & XP */}
          <View style={styles.statCard}>
            <View>
              <Icon name="star" size={28} color={colors.xp} />
            </View>
            <Text style={styles.statValue}>Lvl {currentLevel}</Text>
            <Text style={styles.statLabel}>{xpPoints} XP</Text>
          </View>

          {/* Due Cards */}
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate('Flashcards', { screen: 'ReviewSession' })}>
            <View>
              <Icon name="albums" size={28} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{dueCount}</Text>
            <Text style={styles.statLabel}>Due Cards</Text>
          </TouchableOpacity>
        </View>

        {/* Due Cards Alert */}
        {dueCount > 0 ? (
          <TouchableOpacity
            testID="dashboard_button_startReview"
            style={styles.dueCardsCard}
            onPress={() => navigation.navigate('Flashcards', { screen: 'ReviewSession' })}
            activeOpacity={0.8}>
            <View style={styles.dueCardsContent}>
              <View>
                <Icon name="albums" size={32} color="#FFFFFF" />
              </View>
              <View style={styles.dueCardsText}>
                <Text style={styles.dueCardsTitle}>
                  {dueCount} card{dueCount !== 1 ? 's' : ''} ready for review
                </Text>
                <Text style={styles.dueCardsSubtitle}>Tap to start your review session</Text>
              </View>
            </View>
            <View>
              <Icon name="chevron-forward" size={24} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        ) : null}

        {/* Today's Habits */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Habits</Text>
          <Text style={styles.sectionSubtitle}>
            {completedHabitsCount}/{totalHabitsCount} completed
          </Text>
        </View>

        {habits.filter(h => h.isActive).length === 0 ? (
          <View style={styles.emptyState}>
            <View>
              <Icon name="checkmark-circle-outline" size={48} color={colors.light.textTertiary} />
            </View>
            <Text style={styles.emptyText}>No habits set up yet</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('Profile', { screen: 'Habits' })}>
              <Text style={styles.emptyButtonText}>Create Habit</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View testID="dashboard_list_recentActivity" style={styles.habitsContainer}>
            {habits
              .filter(h => h.isActive)
              .slice(0, 5)
              .map(habit => {
                const isCompleted = todayHabitLog?.habitCompletions[habit.id] || false;
                return (
                  <HabitItem
                    key={habit.id}
                    name={habit.name}
                    isCompleted={isCompleted}
                    onToggle={async () => {
                      // Toggle in local state first for immediate UI feedback
                      toggleHabitCompletion(habit.id);

                      // Save to Firebase (also handles XP for all-complete bonus)
                      try {
                        await habitService.toggleHabitCompletion(habit.id);

                        // Award XP if completing (not uncompleting)
                        if (!isCompleted) {
                          await xpService.awardHabitCompleteXP(false);

                          // Update streak when first habit of the day is completed
                          const newCompletions = {
                            ...todayHabitLog?.habitCompletions,
                            [habit.id]: true,
                          };
                          const completedCount =
                            Object.values(newCompletions).filter(Boolean).length;

                          if (completedCount === 1) {
                            await streakService.updateStreak();
                            const newStreakData = await streakService.getStreakData();
                            setStreak(newStreakData.currentStreak);
                          }

                          // Refresh XP display
                          const userData = await xpService.getUserXP();
                          setXP(userData.xpPoints, userData.currentLevel);
                        }
                      } catch (error) {
                        console.error('Error toggling habit:', error);
                      }
                    }}
                  />
                );
              })}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <View testID="dashboard_card_quickActions" style={styles.quickActionsRow}>
          <QuickActionButton
            icon="add-circle"
            label="New Card"
            onPress={() => navigation.navigate('Flashcards', { screen: 'CreateFlashcard' })}
          />
          <QuickActionButton
            testID="dashboard_button_addNote"
            icon="document-text"
            label="New Note"
            onPress={() => navigation.navigate('Notes', { screen: 'CreateNote' })}
          />
          <QuickActionButton
            icon="bookmark"
            label="Bookmark"
            onPress={() => navigation.navigate('Notes', { screen: 'BookmarkList' })}
          />
          <QuickActionButton
            icon="mic"
            label="Voice Note"
            onPress={() => navigation.navigate('Notes', { screen: 'VoiceNoteList' })}
          />
        </View>

        {/* More Actions */}
        <View style={styles.quickActionsRow}>
          <QuickActionButton
            icon="journal"
            label="Daily Log"
            onPress={() => navigation.navigate('Calendar', { screen: 'DailyLog' })}
          />
          <QuickActionButton
            icon="videocam"
            label="Videos"
            onPress={() => navigation.navigate('Notes', { screen: 'VideoList' })}
          />
          <QuickActionButton
            icon="layers"
            label="Memorize"
            onPress={() => navigation.navigate('Profile', { screen: 'MemorizeList' })}
          />
          <QuickActionButton
            icon="analytics"
            label="Insights"
            onPress={() => navigation.navigate('Calendar', { screen: 'WeeklySummary' })}
          />
        </View>
      </ScrollView>
    </SafeScreen>
  );
};

const HabitItem: React.FC<{
  name: string;
  isCompleted: boolean;
  onToggle: () => void;
}> = ({ name, isCompleted, onToggle }) => (
  <TouchableOpacity
    style={[styles.habitItem, isCompleted && styles.habitItemCompleted]}
    onPress={onToggle}
    activeOpacity={0.7}>
    <View>
      <Icon
        name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
        size={24}
        color={isCompleted ? colors.success : colors.light.textSecondary}
      />
    </View>
    <Text style={[styles.habitName, isCompleted && styles.habitNameCompleted]}>{name}</Text>
  </TouchableOpacity>
);

const QuickActionButton: React.FC<{
  icon: string;
  label: string;
  onPress: () => void;
  testID?: string;
}> = ({ icon, label, onPress, testID }) => (
  <TouchableOpacity testID={testID} style={styles.quickActionButton} onPress={onPress}>
    <View style={styles.quickActionIcon}>
      <Icon name={icon} size={24} color={colors.primary} />
    </View>
    <Text style={styles.quickActionLabel}>{label}</Text>
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
  // T303 - Cached data indicator styles
  cachedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.sm,
  },
  cachedText: {
    fontSize: typography.fontSize.xs,
    color: colors.light.textTertiary,
    marginLeft: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  offlineIcon: {
    padding: spacing.xs,
  },
  greeting: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.light.text,
    flex: 1,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.light.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    ...shadows.sm,
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
  dueCardsCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  dueCardsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dueCardsText: {
    marginLeft: spacing.md,
  },
  dueCardsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
  dueCardsSubtitle: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.light.text,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.light.textSecondary,
  },
  habitsContainer: {
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  habitItemCompleted: {
    opacity: 0.7,
  },
  habitName: {
    fontSize: typography.fontSize.md,
    color: colors.light.text,
    marginLeft: spacing.md,
  },
  habitNameCompleted: {
    textDecorationLine: 'line-through',
    color: colors.light.textSecondary,
  },
  emptyState: {
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.light.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  emptyButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  quickActionButton: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.light.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
    ...shadows.sm,
  },
  quickActionLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.light.textSecondary,
    textAlign: 'center',
  },
});

export default DashboardScreen;
