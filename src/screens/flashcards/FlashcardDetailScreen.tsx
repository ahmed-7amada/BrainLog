/**
 * Flashcard Detail Screen
 * Shows detailed view of a single flashcard with stats
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography, borderRadius, shadows } from '../../config/theme';
import { useFlashcards } from '../../hooks/useFlashcards';
import type { FlashcardsScreenProps } from '../../navigation/types';
import type { Flashcard } from '../../models/Flashcard';

type Props = FlashcardsScreenProps<'FlashcardDetail'>;

const FlashcardDetailScreen: React.FC<Props> = () => {
  const navigation = useNavigation<Props['navigation']>();
  const route = useRoute<Props['route']>();
  const { flashcardId } = route.params;
  const { flashcards } = useFlashcards();

  const [flashcard, setFlashcard] = useState<Flashcard | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    const found = flashcards.find(f => f.id === flashcardId);
    if (found) {
      setFlashcard(found);
    } else {
      Alert.alert('Error', 'Flashcard not found');
      navigation.goBack();
    }
  }, [flashcardId, flashcards, navigation]);

  if (!flashcard) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDifficultyLabel = (easeFactor: number) => {
    if (easeFactor >= 2.5) return 'Easy';
    if (easeFactor >= 2.0) return 'Medium';
    if (easeFactor >= 1.5) return 'Hard';
    return 'Very Hard';
  };

  const getDifficultyColor = (easeFactor: number) => {
    if (easeFactor >= 2.5) return colors.success;
    if (easeFactor >= 2.0) return colors.warning;
    return colors.error;
  };

  const today = new Date().toISOString().split('T')[0];
  const isDue = flashcard.nextReviewDate <= today;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Card Preview */}
      <TouchableOpacity
        style={styles.cardPreview}
        onPress={() => setShowAnswer(!showAnswer)}
        activeOpacity={0.9}>
        <View style={styles.cardSide}>
          <Text style={styles.cardSideLabel}>{showAnswer ? 'ANSWER' : 'QUESTION'}</Text>
          <Text
            testID={showAnswer ? 'flashcardDetail_text_back' : 'flashcardDetail_text_front'}
            style={styles.cardText}>
            {showAnswer ? flashcard.backText : flashcard.frontText}
          </Text>
        </View>
        <View style={styles.tapHint}>
          <Icon name="hand-left-outline" size={16} color={colors.light.textTertiary} />
          <Text style={styles.tapHintText}>Tap to flip</Text>
        </View>
      </TouchableOpacity>

      {/* Review Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Review Status</Text>
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Icon
                name={isDue ? 'time' : 'checkmark-circle'}
                size={24}
                color={isDue ? colors.warning : colors.success}
              />
              <Text style={styles.statusLabel}>{isDue ? 'Due for Review' : 'Up to Date'}</Text>
            </View>
            <Text style={[styles.statusValue, isDue && styles.dueText]}>
              {isDue ? 'Review Now' : `Next: ${flashcard.nextReviewDate}`}
            </Text>
          </View>
        </View>
      </View>

      {/* Learning Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Learning Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{flashcard.repetitions}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{flashcard.interval}</Text>
            <Text style={styles.statLabel}>Days Interval</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: getDifficultyColor(flashcard.easeFactor) }]}>
              {getDifficultyLabel(flashcard.easeFactor)}
            </Text>
            <Text style={styles.statLabel}>Difficulty</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{flashcard.easeFactor.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Ease Factor</Text>
          </View>
        </View>
      </View>

      {/* Card Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Card Info</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created</Text>
            <Text style={styles.infoValue}>{formatDate(flashcard.createdAt)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Reviewed</Text>
            <Text style={styles.infoValue}>{flashcard.lastReviewDate ?? 'Never'}</Text>
          </View>
          {flashcard.voiceNoteId && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Voice Note</Text>
              <TouchableOpacity>
                <Text style={[styles.infoValue, styles.linkText]}>View Voice Note</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          testID="flashcardDetail_button_edit"
          style={styles.editButton}
          onPress={() => navigation.navigate('EditFlashcard', { flashcardId })}
          activeOpacity={0.8}>
          <Icon name="pencil" size={20} color={colors.primary} />
          <Text style={styles.editButtonText}>Edit Card</Text>
        </TouchableOpacity>

        {isDue && (
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() => navigation.navigate('ReviewSession')}
            activeOpacity={0.8}>
            <Icon name="play" size={20} color="#FFFFFF" />
            <Text style={styles.reviewButtonText}>Start Review</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  content: {
    padding: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.light.background,
  },
  cardPreview: {
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    minHeight: 200,
    justifyContent: 'center',
    marginBottom: spacing.xl,
    ...shadows.md,
  },
  cardSide: {
    alignItems: 'center',
  },
  cardSideLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  cardText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    color: colors.light.text,
    textAlign: 'center',
    lineHeight: typography.fontSize.xl * 1.4,
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  tapHintText: {
    fontSize: typography.fontSize.xs,
    color: colors.light.textTertiary,
    marginLeft: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  statusCard: {
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: typography.fontSize.md,
    color: colors.light.text,
    marginLeft: spacing.sm,
  },
  statusValue: {
    fontSize: typography.fontSize.sm,
    color: colors.light.textSecondary,
  },
  dueText: {
    color: colors.warning,
    fontWeight: typography.fontWeight.semibold,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  statCard: {
    width: '50%',
    padding: spacing.xs,
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.light.text,
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    textAlign: 'center',
    overflow: 'hidden',
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.light.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  infoCard: {
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  infoLabel: {
    fontSize: typography.fontSize.md,
    color: colors.light.textSecondary,
  },
  infoValue: {
    fontSize: typography.fontSize.md,
    color: colors.light.text,
  },
  linkText: {
    color: colors.primary,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.light.card,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  editButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    marginLeft: spacing.sm,
  },
  reviewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  reviewButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: '#FFFFFF',
    marginLeft: spacing.sm,
  },
});

export default FlashcardDetailScreen;
