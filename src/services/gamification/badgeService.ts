/**
 * Badge Service
 * Achievement badges for gamification (FR-041, FR-042)
 */

import { getCurrentUserId, getDatabase, ref, get, set } from '../../config/firebase';
import { awardXP } from './xpService';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'learning' | 'streaks' | 'consistency' | 'milestones';
  xpReward: number;
  criteria: {
    type: string;
    value: number;
  };
}

export interface EarnedBadge {
  badgeId: string;
  earnedAt: number;
}

// Badge definitions per FR-041
export const BADGES: Badge[] = [
  // Learning Badges
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Create your first 10 flashcards',
    icon: 'footsteps',
    category: 'learning',
    xpReward: 50,
    criteria: { type: 'flashcards_created', value: 10 },
  },
  {
    id: 'card_collector',
    name: 'Card Collector',
    description: 'Create 100 flashcards',
    icon: 'albums',
    category: 'learning',
    xpReward: 200,
    criteria: { type: 'flashcards_created', value: 100 },
  },
  {
    id: 'card_master',
    name: 'Card Master',
    description: 'Create 500 flashcards',
    icon: 'diamond',
    category: 'learning',
    xpReward: 500,
    criteria: { type: 'flashcards_created', value: 500 },
  },
  {
    id: 'first_review',
    name: 'First Review',
    description: 'Complete your first review session',
    icon: 'checkmark-circle',
    category: 'learning',
    xpReward: 25,
    criteria: { type: 'reviews_completed', value: 1 },
  },
  {
    id: 'review_champion',
    name: 'Review Champion',
    description: 'Review 1000 cards total',
    icon: 'trophy',
    category: 'learning',
    xpReward: 300,
    criteria: { type: 'cards_reviewed', value: 1000 },
  },
  {
    id: 'note_taker',
    name: 'Note Taker',
    description: 'Create 50 notes',
    icon: 'document-text',
    category: 'learning',
    xpReward: 150,
    criteria: { type: 'notes_created', value: 50 },
  },

  // Streak Badges
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: 'flame',
    category: 'streaks',
    xpReward: 100,
    criteria: { type: 'streak_days', value: 7 },
  },
  {
    id: 'month_master',
    name: 'Month Master',
    description: 'Maintain a 30-day learning streak',
    icon: 'flame',
    category: 'streaks',
    xpReward: 500,
    criteria: { type: 'streak_days', value: 30 },
  },
  {
    id: 'century_scholar',
    name: 'Century Scholar',
    description: 'Maintain a 100-day learning streak',
    icon: 'flame',
    category: 'streaks',
    xpReward: 1000,
    criteria: { type: 'streak_days', value: 100 },
  },
  {
    id: 'year_long_learner',
    name: 'Year-Long Learner',
    description: 'Maintain a 365-day learning streak',
    icon: 'medal',
    category: 'streaks',
    xpReward: 5000,
    criteria: { type: 'streak_days', value: 365 },
  },

  // Consistency Badges
  {
    id: 'habit_former',
    name: 'Habit Former',
    description: 'Complete all daily habits for 7 days',
    icon: 'checkbox',
    category: 'consistency',
    xpReward: 100,
    criteria: { type: 'perfect_habit_days', value: 7 },
  },
  {
    id: 'habit_master',
    name: 'Habit Master',
    description: 'Complete all daily habits for 30 days',
    icon: 'ribbon',
    category: 'consistency',
    xpReward: 300,
    criteria: { type: 'perfect_habit_days', value: 30 },
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete a review session before 8 AM',
    icon: 'sunny',
    category: 'consistency',
    xpReward: 50,
    criteria: { type: 'early_review', value: 1 },
  },

  // Milestone Badges
  {
    id: 'level_5',
    name: 'Rising Star',
    description: 'Reach Level 5',
    icon: 'star',
    category: 'milestones',
    xpReward: 100,
    criteria: { type: 'level_reached', value: 5 },
  },
  {
    id: 'level_10',
    name: 'Dedicated Learner',
    description: 'Reach Level 10',
    icon: 'star',
    category: 'milestones',
    xpReward: 250,
    criteria: { type: 'level_reached', value: 10 },
  },
  {
    id: 'xp_1000',
    name: 'XP Hunter',
    description: 'Earn 1000 total XP',
    icon: 'sparkles',
    category: 'milestones',
    xpReward: 100,
    criteria: { type: 'total_xp', value: 1000 },
  },
  {
    id: 'xp_10000',
    name: 'XP Legend',
    description: 'Earn 10000 total XP',
    icon: 'sparkles',
    category: 'milestones',
    xpReward: 500,
    criteria: { type: 'total_xp', value: 10000 },
  },
];

/**
 * Get badge by ID
 */
export const getBadgeById = (id: string): Badge | undefined => {
  return BADGES.find(b => b.id === id);
};

/**
 * Get all badges grouped by category
 */
export const getBadgesByCategory = (): Record<string, Badge[]> => {
  const grouped: Record<string, Badge[]> = {
    learning: [],
    streaks: [],
    consistency: [],
    milestones: [],
  };

  BADGES.forEach(badge => {
    grouped[badge.category].push(badge);
  });

  return grouped;
};

/**
 * Get user's earned badges
 */
export const getEarnedBadges = async (): Promise<EarnedBadge[]> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const badgesRef = ref(getDatabase(), `users/${userId}/badges`);
  const snapshot = await get(badgesRef);
  if (!snapshot.exists()) return [];

  const data = snapshot.val();
  return Object.entries(data).map(([badgeId, earned]: [string, any]) => ({
    badgeId,
    earnedAt: earned.earnedAt,
  }));
};

/**
 * Check if user has earned a specific badge
 */
export const hasBadge = async (badgeId: string): Promise<boolean> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const badgeRef = ref(getDatabase(), `users/${userId}/badges/${badgeId}`);
  const snapshot = await get(badgeRef);
  return snapshot.exists();
};

/**
 * Award a badge to the user
 */
export const awardBadge = async (
  badgeId: string,
): Promise<{
  awarded: boolean;
  badge: Badge | undefined;
  xpAwarded: number;
}> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const badge = getBadgeById(badgeId);
  if (!badge) {
    return { awarded: false, badge: undefined, xpAwarded: 0 };
  }

  // Check if already earned
  const alreadyEarned = await hasBadge(badgeId);
  if (alreadyEarned) {
    return { awarded: false, badge, xpAwarded: 0 };
  }

  // Award the badge
  const badgeRef = ref(getDatabase(), `users/${userId}/badges/${badgeId}`);
  await set(badgeRef, {
    earnedAt: Date.now(),
  });

  // Award XP for the badge
  if (badge.xpReward > 0) {
    await awardXP(badge.xpReward, `Badge earned: ${badge.name}`);
  }

  return { awarded: true, badge, xpAwarded: badge.xpReward };
};

/**
 * Check and award badges based on current stats
 */
export const checkBadges = async (stats: {
  flashcardsCreated?: number;
  cardsReviewed?: number;
  reviewsCompleted?: number;
  notesCreated?: number;
  streakDays?: number;
  perfectHabitDays?: number;
  level?: number;
  totalXP?: number;
  earlyReview?: boolean;
}): Promise<Badge[]> => {
  const awardedBadges: Badge[] = [];

  for (const badge of BADGES) {
    let qualified = false;

    switch (badge.criteria.type) {
      case 'flashcards_created':
        qualified = (stats.flashcardsCreated || 0) >= badge.criteria.value;
        break;
      case 'cards_reviewed':
        qualified = (stats.cardsReviewed || 0) >= badge.criteria.value;
        break;
      case 'reviews_completed':
        qualified = (stats.reviewsCompleted || 0) >= badge.criteria.value;
        break;
      case 'notes_created':
        qualified = (stats.notesCreated || 0) >= badge.criteria.value;
        break;
      case 'streak_days':
        qualified = (stats.streakDays || 0) >= badge.criteria.value;
        break;
      case 'perfect_habit_days':
        qualified = (stats.perfectHabitDays || 0) >= badge.criteria.value;
        break;
      case 'level_reached':
        qualified = (stats.level || 1) >= badge.criteria.value;
        break;
      case 'total_xp':
        qualified = (stats.totalXP || 0) >= badge.criteria.value;
        break;
      case 'early_review':
        qualified = stats.earlyReview === true;
        break;
    }

    if (qualified) {
      const result = await awardBadge(badge.id);
      if (result.awarded) {
        awardedBadges.push(badge);
      }
    }
  }

  return awardedBadges;
};

/**
 * Get progress towards a badge
 */
export const getBadgeProgress = (badge: Badge, currentValue: number): number => {
  return Math.min(100, Math.round((currentValue / badge.criteria.value) * 100));
};
