/**
 * Review Session Screen
 * Spaced repetition flashcard review (FR-003 through FR-006)
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeScreen } from '../../components/common';
import Icon from 'react-native-vector-icons/Ionicons';
import { useStore, selectDueFlashcards } from '../../store';
import {
  applyReviewToFlashcard,
  getIntervalPreviews,
} from '../../services/spacedRepetition/SM2Algorithm';
import { QUALITY_LABELS, type QualityRating } from '../../models/Flashcard';
import { XP_VALUES } from '../../utils/constants';
import { colors, spacing, typography, borderRadius, shadows } from '../../config/theme';
import type { FlashcardsScreenProps } from '../../navigation/types';
import * as flashcardService from '../../services/firebase/flashcardService';
import * as progressService from '../../services/firebase/progressService';
import * as streakService from '../../services/gamification/streakService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = FlashcardsScreenProps<'ReviewSession'>;

const ReviewSessionScreen: React.FC<Props> = () => {
  const navigation = useNavigation<Props['navigation']>();
  const flashcardsState = useStore();
  const { updateFlashcard, addXP } = useStore();

  const dueCards = selectDueFlashcards(flashcardsState);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [reviewedCards, setReviewedCards] = useState<string[]>([]);

  // Animation values
  const flipAnimation = useState(new Animated.Value(0))[0];

  const currentCard = dueCards[currentIndex];
  const totalCards = dueCards.length;
  const progress = totalCards > 0 ? (reviewedCards.length / totalCards) * 100 : 0;

  // Get interval previews for rating buttons
  const intervalPreviews = currentCard
    ? getIntervalPreviews({
        easeFactor: currentCard.easeFactor,
        interval: currentCard.interval,
        repetitions: currentCard.repetitions,
      })
    : null;

  const flipCard = () => {
    const toValue = isFlipped ? 0 : 1;
    Animated.spring(flipAnimation, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const handleRating = async (quality: QualityRating) => {
    if (!currentCard) return;

    // Apply SM-2 algorithm
    const updatedCard = applyReviewToFlashcard(currentCard, quality);

    // Update local store for immediate UI feedback
    updateFlashcard(currentCard.id, updatedCard);

    // Track stats
    const isCorrect = quality !== 0;
    if (!isCorrect) {
      setIncorrectCount(c => c + 1);
    } else {
      setCorrectCount(c => c + 1);
    }

    // Award XP locally
    addXP(XP_VALUES.FLASHCARD_REVIEW);

    // Track reviewed
    setReviewedCards(prev => [...prev, currentCard.id]);

    // Persist to Firebase (in background)
    try {
      // Update flashcard in Firebase
      await flashcardService.updateFlashcard(currentCard.id, {
        easeFactor: updatedCard.easeFactor,
        interval: updatedCard.interval,
        repetitions: updatedCard.repetitions,
        nextReviewDate: updatedCard.nextReviewDate,
        lastReviewDate: updatedCard.lastReviewDate,
      });

      // Record flashcard review for progress tracking
      await progressService.recordFlashcardReview(isCorrect);

      // Update streak on first review of the day
      if (reviewedCards.length === 0) {
        await streakService.updateStreak();
      }
    } catch (error) {
      console.error('Error saving review to Firebase:', error);
      // Non-blocking - local state already updated
    }

    // Move to next card or finish
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(i => i + 1);
      setIsFlipped(false);
      flipAnimation.setValue(0);
    } else {
      // Session complete
      navigation.replace('ReviewComplete', {
        cardsReviewed: totalCards,
        correctCount: correctCount + (isCorrect ? 1 : 0),
        incorrectCount: incorrectCount + (!isCorrect ? 1 : 0),
        xpEarned: totalCards * XP_VALUES.FLASHCARD_REVIEW,
      });
    }
  };

  // Flip animation interpolations
  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  if (totalCards === 0) {
    return (
      <SafeScreen backgroundColor={colors.light.surface}>
        <View style={styles.emptyContainer}>
          <Icon name="checkmark-circle" size={80} color={colors.success} />
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptySubtitle}>No cards due for review right now</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen backgroundColor={colors.light.surface}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={28} color={colors.light.text} />
        </TouchableOpacity>
        <Text testID="reviewSession_text_progress" style={styles.progressText}>
          {reviewedCards.length + 1} / {totalCards}
        </Text>
        <View style={styles.headerRight}>
          <Text style={styles.scoreText}>
            <Icon name="checkmark" size={16} color={colors.success} /> {correctCount}
            {'  '}
            <Icon name="close" size={16} color={colors.error} /> {incorrectCount}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      {/* Card */}
      <View style={styles.cardContainer}>
        <TouchableOpacity
          testID="reviewSession_card_flashcard"
          style={styles.cardTouchable}
          onPress={flipCard}
          activeOpacity={0.9}>
          {/* Front */}
          <Animated.View
            style={[styles.card, styles.cardFront, { transform: [{ rotateY: frontInterpolate }] }]}>
            <Text style={styles.cardLabel}>QUESTION</Text>
            <Text style={styles.cardText}>{currentCard?.frontText}</Text>
            <Text testID="reviewSession_button_showAnswer" style={styles.tapHint}>
              Tap to reveal answer
            </Text>
          </Animated.View>

          {/* Back */}
          <Animated.View
            style={[styles.card, styles.cardBack, { transform: [{ rotateY: backInterpolate }] }]}>
            <Text style={styles.cardLabel}>ANSWER</Text>
            <Text style={styles.cardText}>{currentCard?.backText}</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Rating Buttons (shown after flip) */}
      {isFlipped && intervalPreviews && (
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingPrompt}>How well did you remember?</Text>
          <View style={styles.ratingButtons}>
            {([0, 3, 4, 5] as QualityRating[]).map(quality => (
              <TouchableOpacity
                key={quality}
                testID={
                  quality === 0
                    ? 'reviewSession_button_again'
                    : quality === 3
                    ? 'reviewSession_button_hard'
                    : quality === 4
                    ? 'reviewSession_button_good'
                    : 'reviewSession_button_easy'
                }
                style={[
                  styles.ratingButton,
                  quality === 0 && styles.ratingButtonAgain,
                  quality === 3 && styles.ratingButtonHard,
                  quality === 4 && styles.ratingButtonGood,
                  quality === 5 && styles.ratingButtonEasy,
                ]}
                onPress={() => handleRating(quality)}>
                <Text style={styles.ratingButtonLabel}>{QUALITY_LABELS[quality]}</Text>
                <Text style={styles.ratingButtonInterval}>{intervalPreviews[quality]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  progressText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.light.text,
  },
  headerRight: {
    width: 80,
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: typography.fontSize.sm,
    color: colors.light.textSecondary,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.light.border,
    marginHorizontal: spacing.lg,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  cardTouchable: {
    width: SCREEN_WIDTH - spacing.lg * 2,
    height: 300,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  cardFront: {
    backgroundColor: colors.light.card,
  },
  cardBack: {
    backgroundColor: colors.primaryLight,
  },
  cardLabel: {
    position: 'absolute',
    top: spacing.lg,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.light.textSecondary,
    letterSpacing: 1,
  },
  cardText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.light.text,
    textAlign: 'center',
  },
  tapHint: {
    position: 'absolute',
    bottom: spacing.lg,
    fontSize: typography.fontSize.sm,
    color: colors.light.textSecondary,
  },
  ratingContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  ratingPrompt: {
    fontSize: typography.fontSize.md,
    color: colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  ratingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.light.card,
    ...shadows.sm,
  },
  ratingButtonAgain: {
    backgroundColor: colors.error,
  },
  ratingButtonHard: {
    backgroundColor: colors.warning,
  },
  ratingButtonGood: {
    backgroundColor: colors.success,
  },
  ratingButtonEasy: {
    backgroundColor: colors.primary,
  },
  ratingButtonLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
  ratingButtonInterval: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.light.text,
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.light.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    marginTop: spacing.xl,
  },
  backButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
});

export default ReviewSessionScreen;
