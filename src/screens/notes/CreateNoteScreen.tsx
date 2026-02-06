/**
 * Create Note Screen
 * Allows users to create new notes with title, content, and tags
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography, borderRadius, shadows } from '../../config/theme';
import { useNotes } from '../../hooks/useNotes';
import type { NotesScreenProps } from '../../navigation/types';

type Props = NotesScreenProps<'CreateNote'>;

const CreateNoteScreen: React.FC<Props> = () => {
  const navigation = useNavigation<Props['navigation']>();
  const { createNote, getAllFolders } = useNotes();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [folder, setFolder] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);

  const existingFolders = getAllFolders();

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    setIsSaving(true);
    try {
      await createNote(title.trim(), content.trim(), {
        tags,
        folder: folder || undefined,
      });
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to create note');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} keyboardVerticalOffset={100}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {/* Title Input */}
        <View style={styles.inputSection}>
          <TextInput
            testID="createNote_input_title"
            style={styles.titleInput}
            placeholder="Note title..."
            placeholderTextColor={colors.light.textTertiary}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />
        </View>

        {/* Content Input */}
        <View style={styles.contentSection}>
          <TextInput
            testID="createNote_input_content"
            style={styles.contentInput}
            placeholder="Start writing..."
            placeholderTextColor={colors.light.textTertiary}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Folder Picker */}
        <View style={styles.optionSection}>
          <Text style={styles.optionLabel}>Folder</Text>
          <TouchableOpacity
            style={styles.folderPicker}
            onPress={() => setShowFolderPicker(!showFolderPicker)}
            activeOpacity={0.8}>
            <Icon name="folder-outline" size={20} color={colors.light.textSecondary} />
            <Text style={styles.folderText}>{folder || 'No folder'}</Text>
            <Icon
              name={showFolderPicker ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.light.textSecondary}
            />
          </TouchableOpacity>

          {showFolderPicker && (
            <View style={styles.folderOptions}>
              <TouchableOpacity
                style={styles.folderOption}
                onPress={() => {
                  setFolder('');
                  setShowFolderPicker(false);
                }}>
                <Text style={[styles.folderOptionText, !folder && styles.folderOptionActive]}>
                  No folder
                </Text>
              </TouchableOpacity>
              {existingFolders.map(f => (
                <TouchableOpacity
                  key={f}
                  style={styles.folderOption}
                  onPress={() => {
                    setFolder(f);
                    setShowFolderPicker(false);
                  }}>
                  <Text
                    style={[styles.folderOptionText, folder === f && styles.folderOptionActive]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
              <View style={styles.newFolderInput}>
                <TextInput
                  style={styles.newFolderTextInput}
                  placeholder="New folder name..."
                  placeholderTextColor={colors.light.textTertiary}
                  onSubmitEditing={e => {
                    const newFolder = e.nativeEvent.text.trim();
                    if (newFolder) {
                      setFolder(newFolder);
                      setShowFolderPicker(false);
                    }
                  }}
                />
              </View>
            </View>
          )}
        </View>

        {/* Tags */}
        <View style={styles.optionSection}>
          <Text style={styles.optionLabel}>Tags</Text>
          <View style={styles.tagsContainer}>
            {tags.map(tag => (
              <TouchableOpacity key={tag} style={styles.tag} onPress={() => handleRemoveTag(tag)}>
                <Text style={styles.tagText}>#{tag}</Text>
                <Icon name="close-circle" size={16} color={colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              placeholder="Add tag..."
              placeholderTextColor={colors.light.textTertiary}
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={handleAddTag}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={styles.addTagButton}
              onPress={handleAddTag}
              disabled={!tagInput.trim()}>
              <Icon
                name="add"
                size={24}
                color={tagInput.trim() ? colors.primary : colors.light.textTertiary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          testID="createNote_button_save"
          style={[styles.saveButton, !title.trim() && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving || !title.trim()}
          activeOpacity={0.8}>
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Icon name="checkmark" size={24} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Note</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  inputSection: {
    marginBottom: spacing.md,
  },
  titleInput: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.light.text,
    padding: spacing.md,
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  contentSection: {
    marginBottom: spacing.lg,
  },
  contentInput: {
    fontSize: typography.fontSize.md,
    color: colors.light.text,
    padding: spacing.lg,
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.lg,
    minHeight: 200,
    ...shadows.sm,
  },
  optionSection: {
    marginBottom: spacing.lg,
  },
  optionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.light.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  folderPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  folderText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.light.text,
    marginLeft: spacing.sm,
  },
  folderOptions: {
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
    overflow: 'hidden',
    ...shadows.sm,
  },
  folderOption: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  folderOptionText: {
    fontSize: typography.fontSize.md,
    color: colors.light.text,
  },
  folderOptionActive: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  newFolderInput: {
    padding: spacing.sm,
  },
  newFolderTextInput: {
    fontSize: typography.fontSize.md,
    color: colors.light.text,
    padding: spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginRight: spacing.xs,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  tagInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.light.text,
    padding: spacing.md,
  },
  addTagButton: {
    padding: spacing.md,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.light.background,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  saveButtonDisabled: {
    backgroundColor: colors.light.textTertiary,
  },
  saveButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: '#FFFFFF',
    marginLeft: spacing.sm,
  },
});

export default CreateNoteScreen;
