/**
 * useGamification Hook
 * Provides easy access to gamification features (XP, Streaks, Badges)
 */

import { useState, useEffect, useCallback } from 'react';
import * as xpService from '../services/gamification/xpService';
import * as streakService from '../services/gamification/streakService';
import * as badgeService from '../services/gamification/badgeService';
import type { Badge, EarnedBadge } from '../services/gamification/badgeService';

export interface GamificationState {
  xpPoints: number;
  currentLevel: number;
  levelProgress: number;
  xpToNextLevel: number;
  currentStreak: number;
  longestStreak: number;
  streakFreezeAvailable: boolean;
  earnedBadges: EarnedBadge[];
  isLoading: boolean;
}

export const useGamification = () => {
  const [state, setState] = useState<GamificationState>({
    xpPoints: 0,
    currentLevel: 1,
    levelProgress: 0,
    xpToNextLevel: 100,
    currentStreak: 0,
    longestStreak: 0,
    streakFreezeAvailable: true,
    earnedBadges: [],
    isLoading: true,
  });

  const [recentBadge, setRecentBadge] = useState<Badge | null>(null);
  const [levelUpAnimation, setLevelUpAnimation] = useState(false);

  // Load all gamification data
  const loadData = useCallback(async () => {
    try {
      const [xpData, streakData, badges] = await Promise.all([
        xpService.getUserXP(),
        streakService.getStreakData(),
        badgeService.getEarnedBadges(),
      ]);

      setState({
        xpPoints: xpData.xpPoints,
        currentLevel: xpData.currentLevel,
        levelProgress: xpData.levelProgress,
        xpToNextLevel: xpData.xpToNextLevel,
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
        streakFreezeAvailable: streakData.streakFreezeAvailable,
        earnedBadges: badges,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading gamification data:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Award XP and check for badges/level up
  const awardXP = useCallback(
    async (amount: number, reason: string, checkBadges: boolean = true) => {
      try {
        const result = await xpService.awardXP(amount, reason);

        // Update state
        setState(prev => ({
          ...prev,
          xpPoints: result.newTotal,
          currentLevel: result.newLevel,
          levelProgress: xpService.getLevelProgress(result.newTotal),
          xpToNextLevel: xpService.getXPForNextLevel(result.newLevel) - result.newTotal,
        }));

        // Show level up animation
        if (result.levelUp) {
          setLevelUpAnimation(true);
          setTimeout(() => setLevelUpAnimation(false), 3000);
        }

        // Check for new badges
        if (checkBadges) {
          const newBadges = await badgeService.checkBadges({
            totalXP: result.newTotal,
            level: result.newLevel,
          });

          if (newBadges.length > 0) {
            setRecentBadge(newBadges[0]);
            setState(prev => ({
              ...prev,
              earnedBadges: [
                ...prev.earnedBadges,
                ...newBadges.map(b => ({ badgeId: b.id, earnedAt: Date.now() })),
              ],
            }));
          }
        }

        return result;
      } catch (error) {
        console.error('Error awarding XP:', error);
        throw error;
      }
    },
    [],
  );

  // Update streak
  const updateStreak = useCallback(async () => {
    try {
      const result = await streakService.updateStreak();

      if (result.streakUpdated) {
        setState(prev => ({
          ...prev,
          currentStreak: result.newStreak,
          longestStreak: result.isNewRecord ? result.newStreak : prev.longestStreak,
        }));

        // Check for streak badges
        const newBadges = await badgeService.checkBadges({
          streakDays: result.newStreak,
        });

        if (newBadges.length > 0) {
          setRecentBadge(newBadges[0]);
        }

        // Award streak bonus XP
        await xpService.awardStreakBonusXP(result.newStreak);
      }

      return result;
    } catch (error) {
      console.error('Error updating streak:', error);
      throw error;
    }
  }, []);

  // Use streak freeze
  const useStreakFreeze = useCallback(async () => {
    try {
      const success = await streakService.useStreakFreeze();
      if (success) {
        setState(prev => ({
          ...prev,
          streakFreezeAvailable: false,
        }));
      }
      return success;
    } catch (error) {
      console.error('Error using streak freeze:', error);
      return false;
    }
  }, []);

  // Check if streak is at risk
  const checkStreakRisk = useCallback(async () => {
    return streakService.isStreakAtRisk();
  }, []);

  // Get all badges with earned status
  const getAllBadgesWithStatus = useCallback(() => {
    const earnedIds = new Set(state.earnedBadges.map(b => b.badgeId));
    return badgeService.BADGES.map(badge => ({
      ...badge,
      earned: earnedIds.has(badge.id),
      earnedAt: state.earnedBadges.find(b => b.badgeId === badge.id)?.earnedAt,
    }));
  }, [state.earnedBadges]);

  // Clear recent badge notification
  const clearRecentBadge = useCallback(() => {
    setRecentBadge(null);
  }, []);

  // Clear level up animation
  const clearLevelUpAnimation = useCallback(() => {
    setLevelUpAnimation(false);
  }, []);

  return {
    // State
    ...state,
    recentBadge,
    levelUpAnimation,

    // Actions
    loadData,
    awardXP,
    updateStreak,
    useStreakFreeze,
    checkStreakRisk,
    getAllBadgesWithStatus,
    clearRecentBadge,
    clearLevelUpAnimation,

    // Helpers
    XP_VALUES: xpService.XP_VALUES,
    BADGES: badgeService.BADGES,
    getBadgesByCategory: badgeService.getBadgesByCategory,
    getNextMilestone: streakService.getNextMilestone,
  };
};

export default useGamification;
