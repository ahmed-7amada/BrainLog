/**
 * Note List Screen
 * Displays all notes with search and filtering
 * Includes real-time sync and pull-to-refresh support (FR-001, FR-002, FR-003)
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNotes } from '../../hooks/useNotes';
import { useRealtimeSync } from '../../hooks/useRealtimeSync';
import { useStore } from '../../store';
import { RefreshableList } from '../../components/common/RefreshableList';
import { colors, spacing, typography, borderRadius, shadows } from '../../config/theme';
import type { NotesScreenProps } from '../../navigation/types';
import type { Note } from '../../models/Note';

type Props = NotesScreenProps<'NoteList'>;

const NoteListScreen: React.FC<Props> = () => {
  const navigation = useNavigation<Props['navigation']>();
  const insets = useSafeAreaInsets();
  const { notes } = useNotes();
  const userId = useStore(state => state.user?.id ?? null);

  // Set up real-time sync for notes
  const { refresh } = useRealtimeSync(userId, {
    entities: ['notes'],
    showConflictToast: true,
  });

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    await refresh('notes');
  }, [refresh]);

  const renderNoteItem = useCallback(
    ({ item }: { item: Note }) => (
      <TouchableOpacity
        style={styles.noteItem}
        onPress={() => navigation.navigate('NoteDetail', { noteId: item.id })}>
        <View style={styles.noteHeader}>
          {item.isPinned ? (
            <View>
              <Icon name="pin" size={16} color={colors.primary} />
            </View>
          ) : null}
          <Text style={styles.noteTitle} numberOfLines={1}>
            {item.title}
          </Text>
          {item._optimistic && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>Saving...</Text>
            </View>
          )}
        </View>
        <Text style={styles.noteContent} numberOfLines={2}>
          {item.content}
        </Text>
        <View style={styles.noteFooter}>
          <Text style={styles.noteDate}>{new Date(item.updatedAt).toLocaleDateString()}</Text>
          {item.tags.length > 0 && (
            <Text style={styles.noteTags} numberOfLines={1}>
              {item.tags.slice(0, 3).join(', ')}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    ),
    [navigation],
  );

  const emptyComponent = (
    <View style={styles.emptyState}>
      <View>
        <Icon name="document-text-outline" size={64} color={colors.light.textTertiary} />
      </View>
      <Text testID="noteList_text_empty" style={styles.emptyTitle}>
        No notes yet
      </Text>
      <Text style={styles.emptySubtitle}>Create your first note to get started</Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateNote')}>
        <Text style={styles.createButtonText}>Create Note</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <RefreshableList
        testID="noteList_list_notes"
        data={notes}
        keyExtractor={item => item.id}
        contentContainerStyle={notes.length === 0 ? styles.emptyContainer : styles.listContent}
        renderItem={renderNoteItem}
        onRefresh={handleRefresh}
        emptyComponent={emptyComponent}
      />

      {/* FAB */}
      <TouchableOpacity
        testID="noteList_button_create"
        style={[styles.fab, { bottom: spacing.lg + insets.bottom }]}
        onPress={() => navigation.navigate('CreateNote')}
        activeOpacity={0.8}>
        <View>
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
  listContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  noteItem: {
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  noteTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.light.text,
    flex: 1,
    marginLeft: spacing.xs,
  },
  noteContent: {
    fontSize: typography.fontSize.sm,
    color: colors.light.textSecondary,
    marginBottom: spacing.sm,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    paddingTop: spacing.sm,
  },
  noteDate: {
    fontSize: typography.fontSize.xs,
    color: colors.light.textTertiary,
  },
  noteTags: {
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
  pendingBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.xs,
  },
  pendingText: {
    fontSize: typography.fontSize.xs,
    color: '#000',
    fontWeight: '500',
  },
});

export default NoteListScreen;
