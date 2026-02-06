/**
 * Habits Screen
 * Daily habits tracking with completion checkboxes
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography, borderRadius, shadows } from '../../config/theme';
import { useProgress } from '../../hooks/useProgress';
import type { ProfileScreenProps } from '../../navigation/types';

type Props = ProfileScreenProps<'Habits'>;

const HabitsScreen: React.FC<Props> = () => {
  const navigation = useNavigation<Props['navigation']>();
  const insets = useSafeAreaInsets();
  const {
    habits,
    todayHabitLog,
    toggleHabit,
    deleteHabit,
    getCompletedHabitsCount,
    getHabitCompletionRate,
  } = useProgress();

  const [togglingHabit, setTogglingHabit] = useState<string | null>(null);

  const completedCount = getCompletedHabitsCount();
  const completionRate = getHabitCompletionRate();

  const handleToggleHabit = async (habitId: string) => {
    setTogglingHabit(habitId);
    try {
      const result = await toggleHabit(habitId);
      if (result.allCompleted) {
        Alert.alert('Great job!', 'You completed all your habits for today! +10 XP');
      }
    } catch {
      Alert.alert('Error', 'Failed to update habit');
    } finally {
      setTogglingHabit(null);
    }
  };

  const handleDeleteHabit = (habitId: string, habitName: string) => {
    Alert.alert('Delete Habit', `Are you sure you want to delete "${habitName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteHabit(habitId);
          } catch {
            Alert.alert('Error', 'Failed to delete habit');
          }
        },
      },
    ]);
  };

  const isHabitCompleted = (habitId: string) => {
    return todayHabitLog?.habitCompletions[habitId] || false;
  };

  return (
    <View style={styles.container}>
      {/* Progress Header */}
      <View style={styles.progressHeader}>
        <View style={styles.progressCircle}>
          <Text style={styles.progressPercent}>{completionRate}%</Text>
          <Text style={styles.progressLabel}>Complete</Text>
        </View>
        <View style={styles.progressStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completedCount}</Text>
            <Text style={styles.statLabel}>Done</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{habits.length - completedCount}</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{habits.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      </View>

      {/* Habits List */}
      {habits.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="checkbox-outline" size={64} color={colors.light.textTertiary} />
          <Text style={styles.emptyTitle} testID="habits_text_empty">
            No habits yet
          </Text>
          <Text style={styles.emptySubtitle}>Create habits to build your daily routine</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateHabit')}
            testID="habits_button_create">
            <Text style={styles.createButtonText}>Create Habit</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={habits}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          testID="habits_list_habits"
          renderItem={({ item }) => {
            const isCompleted = isHabitCompleted(item.id);
            const isToggling = togglingHabit === item.id;

            return (
              <View style={styles.habitItem}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => handleToggleHabit(item.id)}
                  disabled={isToggling}
                  activeOpacity={0.8}>
                  {isToggling ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <View style={[styles.checkbox, isCompleted && styles.checkboxChecked]}>
                      {isCompleted && <Icon name="checkmark" size={18} color="#FFFFFF" />}
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.habitContent}
                  onPress={() => navigation.navigate('EditHabit', { habitId: item.id })}
                  onLongPress={() => handleDeleteHabit(item.id, item.name)}
                  activeOpacity={0.8}>
                  <Text style={[styles.habitName, isCompleted && styles.habitNameCompleted]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.moreButton}
                  onPress={() => handleDeleteHabit(item.id, item.name)}>
                  <Icon name="ellipsis-horizontal" size={20} color={colors.light.textTertiary} />
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: spacing.lg + insets.bottom }]}
        onPress={() => navigation.navigate('CreateHabit')}
        activeOpacity={0.8}
        testID="habits_button_create">
        <Icon name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.surface,
  },
  progressHeader: {
    backgroundColor: colors.light.card,
    padding: spacing.xl,
    margin: spacing.lg,
    borderRadius: borderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.md,
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.primary,
  },
  progressPercent: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  progressLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.light.textSecondary,
  },
  progressStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.light.text,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.light.textSecondary,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.light.border,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  checkboxContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  habitContent: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
  habitName: {
    fontSize: typography.fontSize.md,
    color: colors.light.text,
  },
  habitNameCompleted: {
    textDecorationLine: 'line-through',
    color: colors.light.textSecondary,
  },
  moreButton: {
    padding: spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.light.text,
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.light.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
  },
  createButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
});

export default HabitsScreen;
