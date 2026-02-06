/**
 * useProgress Hook
 * Progress tracking and gamification
 */

import { useEffect, useCallback } from 'react';
import { useStore } from '../store';
import * as progressService from '../services/firebase/progressService';
import * as habitService from '../services/firebase/habitService';
import { getUserRef, getCurrentUserId, get, child } from '../config/firebase';

export const useProgress = () => {
  const {
    todayProgress,
    currentStreak,
    xpPoints,
    currentLevel,
    habits,
    todayHabitLog,
    setTodayProgress,
    setStreak,
    setXP,
    addXP: addXPToStore,
    setHabits,
    setTodayHabitLog,
    toggleHabitCompletion: toggleHabitInStore,
  } = useStore();

  // Load initial data
  useEffect(() => {
    const loadProgress = async () => {
      try {
        // Load today's progress
        const progress = await progressService.getOrCreateTodayProgress();
        setTodayProgress(progress);

        // Load habits
        const activeHabits = await habitService.getActiveHabits();
        setHabits(activeHabits);

        // Load today's habit log
        const habitLog = await habitService.getOrCreateTodayHabitLog();
        setTodayHabitLog(habitLog);

        // Load user profile for streak and XP
        const userId = getCurrentUserId();
        if (userId) {
          const userRef = getUserRef(userId);
          const profileRef = child(userRef, 'profile');
          const snapshot = await get(profileRef);
          const userData = snapshot.val();

          if (userData) {
            setStreak(userData.currentStreak || 0);
            setXP(userData.xpPoints || 0, userData.currentLevel || 1);
          }
        }
      } catch (error) {
        console.error('Error loading progress:', error);
      }
    };

    loadProgress();
  }, [setTodayProgress, setHabits, setTodayHabitLog, setStreak, setXP]);

  // Subscribe to habits
  useEffect(() => {
    const unsubscribe = habitService.subscribeToHabits(
      loadedHabits => {
        setHabits(loadedHabits.filter(h => h.isActive));
      },
      error => {
        console.error('Error subscribing to habits:', error);
      },
    );

    return () => unsubscribe();
  }, [setHabits]);

  // Toggle habit completion
  const toggleHabit = useCallback(
    async (habitId: string) => {
      try {
        const result = await habitService.toggleHabitCompletion(habitId);
        toggleHabitInStore(habitId);

        // Refresh habit log
        const habitLog = await habitService.getOrCreateTodayHabitLog();
        setTodayHabitLog(habitLog);

        return result;
      } catch (error) {
        console.error('Error toggling habit:', error);
        throw error;
      }
    },
    [toggleHabitInStore, setTodayHabitLog],
  );

  // Add XP
  const addXP = useCallback(
    async (amount: number) => {
      try {
        const { newXP, newLevel } = await progressService.addXP(amount);
        setXP(newXP, newLevel);
        addXPToStore(amount);
        return { newXP, newLevel };
      } catch (error) {
        console.error('Error adding XP:', error);
        throw error;
      }
    },
    [setXP, addXPToStore],
  );

  // Update streak
  const updateStreak = useCallback(async () => {
    try {
      const result = await progressService.updateStreak();
      setStreak(result.currentStreak);
      return result;
    } catch (error) {
      console.error('Error updating streak:', error);
      throw error;
    }
  }, [setStreak]);

  // Create habit
  const createHabit = useCallback(async (name: string) => {
    try {
      const habit = await habitService.createHabit({
        userId: getCurrentUserId()!,
        name,
      });
      return habit;
    } catch (error) {
      console.error('Error creating habit:', error);
      throw error;
    }
  }, []);

  // Delete habit
  const deleteHabit = useCallback(async (habitId: string) => {
    try {
      await habitService.deactivateHabit(habitId);
    } catch (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  }, []);

  // Get completed habits count
  const getCompletedHabitsCount = useCallback(() => {
    if (!todayHabitLog) return 0;
    return Object.values(todayHabitLog.habitCompletions).filter(Boolean).length;
  }, [todayHabitLog]);

  // Get habit completion rate
  const getHabitCompletionRate = useCallback(() => {
    if (!todayHabitLog || habits.length === 0) return 0;
    const completed = getCompletedHabitsCount();
    return Math.round((completed / habits.length) * 100);
  }, [todayHabitLog, habits, getCompletedHabitsCount]);

  return {
    // State
    todayProgress,
    currentStreak,
    xpPoints,
    currentLevel,
    habits,
    todayHabitLog,

    // Actions
    toggleHabit,
    addXP,
    updateStreak,
    createHabit,
    deleteHabit,

    // Getters
    getCompletedHabitsCount,
    getHabitCompletionRate,
  };
};

export default useProgress;
