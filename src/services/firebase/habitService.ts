/**
 * Habit Firebase Service
 * CRUD operations for habits (FR-024 through FR-028)
 */

import {
  getHabitDefinitionsRef,
  getHabitLogEntriesRef,
  getCurrentUserId,
  serverTimestamp,
  push,
  get,
  set,
  update,
  child,
  onValue,
  query,
  orderByKey,
  startAt,
  endAt,
} from '../../config/firebase';
import type { HabitDefinition, CreateHabitInput } from '../../models/HabitDefinition';
import type { HabitLogEntry } from '../../models/HabitLogEntry';
import { createAppError, parseFirebaseError } from '../../utils/errorHandler';
import { getTodayKey } from '../../utils/dateUtils';
import { XP_VALUES } from '../../utils/constants';
import { addXP } from './progressService';

/**
 * Create a new habit
 */
export const createHabit = async (input: CreateHabitInput): Promise<HabitDefinition> => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw createAppError('auth/session-expired', 'User not authenticated');
  }

  const habitsRef = getHabitDefinitionsRef(userId);
  const newRef = push(habitsRef);
  const id = newRef.key!;

  // Get current max display order
  const snapshot = await get(habitsRef);
  const existingHabits = snapshot.val() || {};
  const maxOrder = Object.values(existingHabits).reduce(
    (max: number, h: any) => Math.max(max, h.displayOrder || 0),
    -1,
  );

  const habit: HabitDefinition = {
    id,
    userId,
    name: input.name,
    displayOrder: input.displayOrder ?? maxOrder + 1,
    isActive: true,
    createdAt: Date.now(),
  };

  try {
    await set(newRef, {
      ...habit,
      createdAt: serverTimestamp(),
    });
    return habit;
  } catch (error) {
    throw parseFirebaseError(error);
  }
};

/**
 * Update a habit
 */
export const updateHabit = async (
  habitId: string,
  updates: Partial<HabitDefinition>,
): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw createAppError('auth/session-expired', 'User not authenticated');
  }

  const habitRef = child(getHabitDefinitionsRef(userId), habitId);

  try {
    await update(habitRef, updates);
  } catch (error) {
    throw parseFirebaseError(error);
  }
};

/**
 * Delete (deactivate) a habit
 */
export const deactivateHabit = async (habitId: string): Promise<void> => {
  await updateHabit(habitId, { isActive: false });
};

/**
 * Get all habits for current user
 */
export const getAllHabits = async (): Promise<HabitDefinition[]> => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw createAppError('auth/session-expired', 'User not authenticated');
  }

  const habitsRef = getHabitDefinitionsRef(userId);

  try {
    const snapshot = await get(habitsRef);
    const data = snapshot.val();

    if (!data) return [];

    return Object.entries(data)
      .map(([id, habit]: [string, any]) => ({
        id,
        userId,
        name: habit.name,
        displayOrder: habit.displayOrder || 0,
        isActive: habit.isActive ?? true,
        createdAt: habit.createdAt || Date.now(),
      }))
      .sort((a, b) => a.displayOrder - b.displayOrder);
  } catch (error) {
    throw parseFirebaseError(error);
  }
};

/**
 * Get active habits only
 */
export const getActiveHabits = async (): Promise<HabitDefinition[]> => {
  const allHabits = await getAllHabits();
  return allHabits.filter(habit => habit.isActive);
};

/**
 * Get or create today's habit log
 */
export const getOrCreateTodayHabitLog = async (): Promise<HabitLogEntry> => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw createAppError('auth/session-expired', 'User not authenticated');
  }

  const dateKey = getTodayKey();
  const logRef = child(getHabitLogEntriesRef(userId), dateKey);

  try {
    const snapshot = await get(logRef);
    const data = snapshot.val();

    if (data) {
      return {
        id: dateKey,
        userId,
        dateKey,
        habitCompletions: data.habitCompletions || {},
        createdAt: data.createdAt || Date.now(),
        updatedAt: data.updatedAt || Date.now(),
      };
    }

    // Create new log for today
    const newLog: HabitLogEntry = {
      id: dateKey,
      userId,
      dateKey,
      habitCompletions: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await set(logRef, {
      ...newLog,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return newLog;
  } catch (error) {
    throw parseFirebaseError(error);
  }
};

/**
 * Toggle habit completion for today
 */
export const toggleHabitCompletion = async (
  habitId: string,
): Promise<{ completed: boolean; allCompleted: boolean }> => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw createAppError('auth/session-expired', 'User not authenticated');
  }

  const dateKey = getTodayKey();
  const logRef = child(getHabitLogEntriesRef(userId), dateKey);

  try {
    // Get current state
    const todayLog = await getOrCreateTodayHabitLog();
    const currentValue = todayLog.habitCompletions[habitId] || false;
    const newValue = !currentValue;

    // Update completion
    const habitCompletionRef = child(child(logRef, 'habitCompletions'), habitId);
    await set(habitCompletionRef, newValue);
    const updatedAtRef = child(logRef, 'updatedAt');
    await set(updatedAtRef, serverTimestamp());

    // Check if all habits are now completed
    const activeHabits = await getActiveHabits();
    const updatedCompletions = {
      ...todayLog.habitCompletions,
      [habitId]: newValue,
    };

    const completedCount = activeHabits.filter(h => updatedCompletions[h.id]).length;
    const allCompleted = completedCount === activeHabits.length && activeHabits.length > 0;

    // Award XP for completing all habits
    if (allCompleted && newValue) {
      await addXP(XP_VALUES.ALL_HABITS_COMPLETED);
    }

    return { completed: newValue, allCompleted };
  } catch (error) {
    throw parseFirebaseError(error);
  }
};

/**
 * Get habit completion status for today
 */
export const getTodayHabitStatus = async (): Promise<{
  habits: HabitDefinition[];
  completions: Record<string, boolean>;
  completedCount: number;
  totalCount: number;
}> => {
  const activeHabits = await getActiveHabits();
  const todayLog = await getOrCreateTodayHabitLog();

  const completedCount = activeHabits.filter(h => todayLog.habitCompletions[h.id]).length;

  return {
    habits: activeHabits,
    completions: todayLog.habitCompletions,
    completedCount,
    totalCount: activeHabits.length,
  };
};

/**
 * Get habit grid data for a week
 */
export const getHabitGridForWeek = async (
  startDate: string,
): Promise<Record<string, Record<string, boolean>>> => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw createAppError('auth/session-expired', 'User not authenticated');
  }

  const logsRef = getHabitLogEntriesRef(userId);

  // Calculate end date (7 days from start)
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const endDate = end.toISOString().split('T')[0];

  try {
    const queryRef = query(logsRef, orderByKey(), startAt(startDate), endAt(endDate));
    const snapshot = await get(queryRef);

    const data = snapshot.val();
    if (!data) return {};

    const grid: Record<string, Record<string, boolean>> = {};

    Object.entries(data).forEach(([dateKey, log]: [string, any]) => {
      grid[dateKey] = log.habitCompletions || {};
    });

    return grid;
  } catch (error) {
    throw parseFirebaseError(error);
  }
};

/**
 * Calculate habit completion rate for a period
 */
export const calculateHabitCompletionRate = async (
  startDate: string,
  _endDate: string,
): Promise<number> => {
  const grid = await getHabitGridForWeek(startDate);
  const activeHabits = await getActiveHabits();

  if (activeHabits.length === 0) return 0;

  let totalPossible = 0;
  let totalCompleted = 0;

  Object.values(grid).forEach(dayCompletions => {
    activeHabits.forEach(habit => {
      totalPossible++;
      if (dayCompletions[habit.id]) {
        totalCompleted++;
      }
    });
  });

  if (totalPossible === 0) return 0;
  return Math.round((totalCompleted / totalPossible) * 100);
};

/**
 * Reorder habits
 */
export const reorderHabits = async (orderedIds: string[]): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) {
    throw createAppError('auth/session-expired', 'User not authenticated');
  }

  const habitsRef = getHabitDefinitionsRef(userId);

  try {
    const updates: Record<string, number> = {};
    orderedIds.forEach((id, index) => {
      updates[`${id}/displayOrder`] = index;
    });

    await update(habitsRef, updates);
  } catch (error) {
    throw parseFirebaseError(error);
  }
};

/**
 * Subscribe to habits changes
 */
export const subscribeToHabits = (
  onData: (habits: HabitDefinition[]) => void,
  onError: (error: Error) => void,
): (() => void) => {
  const userId = getCurrentUserId();
  if (!userId) {
    onError(new Error('User not authenticated'));
    return () => {};
  }

  const habitsRef = getHabitDefinitionsRef(userId);

  const unsubscribe = onValue(
    habitsRef,
    snapshot => {
      const data = snapshot.val();
      if (!data) {
        onData([]);
        return;
      }

      const habits: HabitDefinition[] = Object.entries(data)
        .map(([id, habit]: [string, any]) => ({
          id,
          userId,
          name: habit.name,
          displayOrder: habit.displayOrder || 0,
          isActive: habit.isActive ?? true,
          createdAt: habit.createdAt || Date.now(),
        }))
        .sort((a, b) => a.displayOrder - b.displayOrder);

      onData(habits);
    },
    error => {
      onError(error);
    },
  );

  return unsubscribe;
};
