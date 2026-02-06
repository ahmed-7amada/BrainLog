/**
 * Gamification Animation Manager
 * Manages and triggers level up and badge unlock animations
 * T393, T394 - Animation trigger integration
 */

import React, { useState, useCallback, createContext, useContext } from 'react';
import { LevelUpAnimation } from './LevelUpAnimation';
import { BadgeUnlockedAnimation } from './BadgeUnlockedAnimation';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

interface GamificationAnimationContextType {
  showLevelUp: (level: number) => void;
  showBadgeUnlocked: (badge: Badge, xpBonus?: number) => void;
}

const GamificationAnimationContext = createContext<GamificationAnimationContextType | null>(null);

export const useGamificationAnimations = (): GamificationAnimationContextType => {
  const context = useContext(GamificationAnimationContext);
  if (!context) {
    throw new Error(
      'useGamificationAnimations must be used within a GamificationAnimationProvider',
    );
  }
  return context;
};

interface GamificationAnimationProviderProps {
  children: React.ReactNode;
}

interface AnimationQueueItem {
  type: 'levelUp' | 'badge';
  level?: number;
  badge?: Badge;
  xpBonus?: number;
}

export const GamificationAnimationProvider: React.FC<GamificationAnimationProviderProps> = ({
  children,
}) => {
  const [_animationQueue, setAnimationQueue] = useState<AnimationQueueItem[]>([]);
  const [currentAnimation, setCurrentAnimation] = useState<AnimationQueueItem | null>(null);

  const processNextAnimation = useCallback(() => {
    setAnimationQueue(prev => {
      if (prev.length === 0) {
        setCurrentAnimation(null);
        return [];
      }
      const [next, ...rest] = prev;
      setCurrentAnimation(next);
      return rest;
    });
  }, []);

  const showLevelUp = useCallback(
    (level: number) => {
      const item: AnimationQueueItem = { type: 'levelUp', level };
      setAnimationQueue(prev => {
        if (prev.length === 0 && !currentAnimation) {
          setCurrentAnimation(item);
          return [];
        }
        return [...prev, item];
      });
    },
    [currentAnimation],
  );

  const showBadgeUnlocked = useCallback(
    (badge: Badge, xpBonus?: number) => {
      const item: AnimationQueueItem = { type: 'badge', badge, xpBonus };
      setAnimationQueue(prev => {
        if (prev.length === 0 && !currentAnimation) {
          setCurrentAnimation(item);
          return [];
        }
        return [...prev, item];
      });
    },
    [currentAnimation],
  );

  const handleAnimationComplete = useCallback(() => {
    processNextAnimation();
  }, [processNextAnimation]);

  return (
    <GamificationAnimationContext.Provider value={{ showLevelUp, showBadgeUnlocked }}>
      {children}

      <LevelUpAnimation
        visible={currentAnimation?.type === 'levelUp'}
        level={currentAnimation?.level ?? 1}
        onComplete={handleAnimationComplete}
      />

      <BadgeUnlockedAnimation
        visible={currentAnimation?.type === 'badge'}
        badge={currentAnimation?.badge ?? null}
        xpBonus={currentAnimation?.xpBonus}
        onComplete={handleAnimationComplete}
      />
    </GamificationAnimationContext.Provider>
  );
};

export default GamificationAnimationProvider;
