/**
 * Note Detail Screen
 * Shows detailed view of a single note
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
import { useNotes } from '../../hooks/useNotes';
import type { NotesScreenProps } from '../../navigation/types';
import type { Note } from '../../models/Note';

type Props = NotesScreenProps<'NoteDetail'>;

const NoteDetailScreen: React.FC<Props> = () => {
  const navigation = useNavigation<Props['navigation']>();
  const route = useRoute<Props['route']>();
  const { noteId } = route.params;
  const { notes, togglePinned } = useNotes();

  const [note, setNote] = useState<Note | null>(null);

  useEffect(() => {
    const found = notes.find(n => n.id === noteId);
    if (found) {
      setNote(found);
    } else {
      Alert.alert('Error', 'Note not found');
      navigation.goBack();
    }
  }, [noteId, notes, navigation]);

  const handleTogglePin = async () => {
    if (note) {
      await togglePinned(note.id);
    }
  };

  if (!note) {
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
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header Actions */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleTogglePin}
            activeOpacity={0.8}>
            <Icon
              name={note.isPinned ? 'pin' : 'pin-outline'}
              size={24}
              color={note.isPinned ? colors.warning : colors.light.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            testID="noteDetail_button_edit"
            style={styles.actionButton}
            onPress={() => navigation.navigate('EditNote', { noteId })}
            activeOpacity={0.8}>
            <Icon name="pencil" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text testID="noteDetail_text_title" style={styles.title}>
          {note.title}
        </Text>

        {/* Metadata */}
        <View style={styles.metadataRow}>
          <Icon name="time-outline" size={16} color={colors.light.textTertiary} />
          <Text style={styles.metadataText}>Updated {formatDate(note.updatedAt)}</Text>
        </View>

        {note.folder && (
          <View style={styles.metadataRow}>
            <Icon name="folder-outline" size={16} color={colors.light.textTertiary} />
            <Text style={styles.metadataText}>{note.folder}</Text>
          </View>
        )}

        {/* Tags */}
        {note.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {note.tags.map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text testID="noteDetail_text_content" style={styles.noteContent}>
            {note.content || 'No content'}
          </Text>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created</Text>
            <Text style={styles.infoValue}>{formatDate(note.createdAt)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Word count</Text>
            <Text style={styles.infoValue}>
              {note.content.split(/\s+/).filter(Boolean).length} words
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('EditNote', { noteId })}
          activeOpacity={0.8}>
          <Icon name="pencil" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Edit Note</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.md,
  },
  actionButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.light.text,
    marginBottom: spacing.md,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  metadataText: {
    fontSize: typography.fontSize.sm,
    color: colors.light.textTertiary,
    marginLeft: spacing.xs,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  tag: {
    backgroundColor: colors.light.surface,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  tagText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
  },
  contentContainer: {
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginTop: spacing.md,
    minHeight: 200,
    ...shadows.sm,
  },
  noteContent: {
    fontSize: typography.fontSize.md,
    color: colors.light.text,
    lineHeight: typography.fontSize.md * 1.6,
  },
  infoSection: {
    marginTop: spacing.xl,
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
  bottomActions: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  primaryButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: '#FFFFFF',
    marginLeft: spacing.sm,
  },
});

export default NoteDetailScreen;
