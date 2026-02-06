/**
 * Flashcard List Screen
 * Displays all flashcards with filtering and search
 * Includes real-time sync and pull-to-refresh support (FR-001, FR-002, FR-003)
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useStore, selectAllFlashcards, selectDueFlashcards } from '../../store';
import { useRealtimeSync } from '../../hooks/useRealtimeSync';
import { RefreshableList } from '../../components/common/RefreshableList';
import { colors, spacing, typography, borderRadius, shadows } from '../../config/theme';
import type { Flashcard } from '../../models/Flashcard';
import type { FlashcardsScreenProps } from '../../navigation/types';

type Props = FlashcardsScreenProps<'FlashcardList'>;

const FlashcardListScreen: React.FC<Props> = () => {
  const navigation = useNavigation<Props['navigation']>();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDueOnly, setShowDueOnly] = useState(false);

  const flashcardsState = useStore();
  const userId = useStore(state => state.user?.id ?? null);

  // Set up real-time sync for flashcards
  const { refresh } = useRealtimeSync(userId, {
    entities: ['flashcards'],
    showConflictToast: true,
  });
  const allFlashcards = selectAllFlashcards(flashcardsState);
  const dueFlashcards = selectDueFlashcards(flashcardsState);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    await refresh('flashcards');
  }, [refresh]);

  // Filter flashcards
  const filteredCards = (showDueOnly ? dueFlashcards : allFlashcards).filter(
    card =>
      card.frontText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.backText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const renderFlashcard = ({ item }: { item: Flashcard }) => (
    <TouchableOpacity
      style={styles.cardItem}
      onPress={() => navigation.navigate('FlashcardDetail', { flashcardId: item.id })}
      activeOpacity={0.7}>
      <View style={styles.cardContent}>
        <Text style={styles.cardFront} numberOfLines={2}>
          {item.frontText}
        </Text>
        <Text style={styles.cardBack} numberOfLines={1}>
          {item.backText}
        </Text>
        {item.deck && (
          <View style={styles.deckBadge}>
            <Text style={styles.deckText}>{item.deck}</Text>
          </View>
        )}
      </View>
      <View style={styles.cardStats}>
        <Text style={styles.statsText}>
          {item.correctReviews}/{item.totalReviews} correct
        </Text>
        <Text style={styles.nextReview}>Next: {item.nextReviewDate}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View collapsable={false}>
          <Icon name="search" size={20} color={colors.light.textSecondary} />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search flashcards..."
          placeholderTextColor={colors.light.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <View collapsable={false}>
              <Icon name="close-circle" size={20} color={colors.light.textSecondary} />
            </View>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.filterTab, !showDueOnly && styles.filterTabActive]}
          onPress={() => setShowDueOnly(false)}>
          <Text style={[styles.filterTabText, !showDueOnly && styles.filterTabTextActive]}>
            All ({allFlashcards.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, showDueOnly && styles.filterTabActive]}
          onPress={() => setShowDueOnly(true)}>
          <Text style={[styles.filterTabText, showDueOnly && styles.filterTabTextActive]}>
            Due ({dueFlashcards.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Start Review Button */}
      {dueFlashcards.length > 0 ? (
        <TouchableOpacity
          testID="flashcardList_button_startReview"
          style={styles.reviewButton}
          onPress={() => navigation.navigate('ReviewSession')}
          activeOpacity={0.8}>
          <View collapsable={false}>
            <Icon name="play" size={24} color="#FFFFFF" />
          </View>
          <Text testID="flashcardList_text_dueCount" style={styles.reviewButtonText}>
            Start Review ({dueFlashcards.length} cards)
          </Text>
        </TouchableOpacity>
      ) : null}

      {/* Flashcard List with Pull-to-Refresh */}
      <RefreshableList
        testID="flashcardList_list_cards"
        data={filteredCards}
        renderItem={renderFlashcard}
        keyExtractor={item => item.id}
        contentContainerStyle={
          filteredCards.length === 0 ? styles.emptyContainer : styles.listContent
        }
        showsVerticalScrollIndicator={false}
        onRefresh={handleRefresh}
        emptyComponent={
          <View style={styles.emptyState}>
            <View collapsable={false}>
              <Icon name="albums-outline" size={64} color={colors.light.textTertiary} />
            </View>
            <Text testID="flashcardList_text_empty" style={styles.emptyTitle}>
              {searchQuery ? 'No matches found' : 'No flashcards yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'Try a different search term'
                : 'Create your first flashcard to get started'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate('CreateFlashcard')}>
                <Text style={styles.createButtonText}>Create Flashcard</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        testID="flashcardList_button_create"
        style={[styles.fab, { bottom: spacing.lg + insets.bottom }]}
        onPress={() => navigation.navigate('CreateFlashcard')}
        activeOpacity={0.8}>
        <View collapsable={false}>
          <Icon name="add" size={28} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.surface,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    ...shadows.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.light.text,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  filterTab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    backgroundColor: colors.light.card,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    fontSize: typography.fontSize.sm,
    color: colors.light.textSecondary,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.medium,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  reviewButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: '#FFFFFF',
    marginLeft: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  cardItem: {
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardContent: {
    marginBottom: spacing.sm,
  },
  cardFront: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.light.text,
    marginBottom: spacing.xs,
  },
  cardBack: {
    fontSize: typography.fontSize.sm,
    color: colors.light.textSecondary,
  },
  deckBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.light.surface,
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  deckText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    paddingTop: spacing.sm,
  },
  statsText: {
    fontSize: typography.fontSize.xs,
    color: colors.light.textSecondary,
  },
  nextReview: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
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

export default FlashcardListScreen;
