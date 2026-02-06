/**
 * Edit Flashcard Screen
 * Allows editing existing flashcard front/back content
 */

import React, { useState, useEffect } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography, borderRadius, shadows } from '../../config/theme';
import { useFlashcards } from '../../hooks/useFlashcards';
import type { FlashcardsScreenProps } from '../../navigation/types';

type Props = FlashcardsScreenProps<'EditFlashcard'>;

const EditFlashcardScreen: React.FC<Props> = () => {
  const navigation = useNavigation<Props['navigation']>();
  const route = useRoute<Props['route']>();
  const { flashcardId } = route.params;
  const { flashcards, updateFlashcard, deleteFlashcard } = useFlashcards();

  const [frontText, setFrontText] = useState('');
  const [backText, setBackText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load flashcard data
  useEffect(() => {
    const flashcard = flashcards.find(f => f.id === flashcardId);
    if (flashcard) {
      setFrontText(flashcard.frontText);
      setBackText(flashcard.backText);
      setIsLoading(false);
    } else {
      Alert.alert('Error', 'Flashcard not found');
      navigation.goBack();
    }
  }, [flashcardId, flashcards, navigation]);

  const handleSave = async () => {
    if (!frontText.trim()) {
      Alert.alert('Error', 'Please enter front text');
      return;
    }
    if (!backText.trim()) {
      Alert.alert('Error', 'Please enter back text');
      return;
    }

    setIsSaving(true);
    try {
      await updateFlashcard(flashcardId, {
        frontText: frontText.trim(),
        backText: backText.trim(),
      });
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to update flashcard');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Flashcard',
      'Are you sure you want to delete this flashcard? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteFlashcard(flashcardId);
              navigation.goBack();
            } catch {
              Alert.alert('Error', 'Failed to delete flashcard');
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} keyboardVerticalOffset={100}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {/* Front Card Input */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionLabel}>Front (Question)</Text>
          <View style={styles.cardInputContainer}>
            <TextInput
              testID="editFlashcard_input_front"
              style={styles.cardInput}
              placeholder="Enter the question or term..."
              placeholderTextColor={colors.light.textTertiary}
              value={frontText}
              onChangeText={setFrontText}
              multiline
              textAlignVertical="top"
            />
          </View>
          <Text style={styles.charCount}>{frontText.length} characters</Text>
        </View>

        {/* Flip Icon */}
        <View style={styles.flipIconContainer}>
          <Icon name="swap-vertical" size={24} color={colors.light.textTertiary} />
        </View>

        {/* Back Card Input */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionLabel}>Back (Answer)</Text>
          <View style={styles.cardInputContainer}>
            <TextInput
              testID="editFlashcard_input_back"
              style={styles.cardInput}
              placeholder="Enter the answer or definition..."
              placeholderTextColor={colors.light.textTertiary}
              value={backText}
              onChangeText={setBackText}
              multiline
              textAlignVertical="top"
            />
          </View>
          <Text style={styles.charCount}>{backText.length} characters</Text>
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          testID="editFlashcard_button_cancel"
          style={styles.deleteButton}
          onPress={handleDelete}
          disabled={isDeleting}
          activeOpacity={0.8}>
          {isDeleting ? (
            <ActivityIndicator color={colors.error} />
          ) : (
            <>
              <Icon name="trash-outline" size={20} color={colors.error} />
              <Text style={styles.deleteButtonText}>Delete Flashcard</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          testID="editFlashcard_button_save"
          style={[
            styles.saveButton,
            (!frontText.trim() || !backText.trim()) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={isSaving || !frontText.trim() || !backText.trim()}
          activeOpacity={0.8}>
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Icon name="checkmark" size={24} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  cardSection: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.light.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardInputContainer: {
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  cardInput: {
    padding: spacing.lg,
    fontSize: typography.fontSize.md,
    color: colors.light.text,
    minHeight: 120,
  },
  charCount: {
    fontSize: typography.fontSize.xs,
    color: colors.light.textTertiary,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  flipIconContainer: {
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.xl,
  },
  deleteButtonText: {
    fontSize: typography.fontSize.md,
    color: colors.error,
    marginLeft: spacing.sm,
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

export default EditFlashcardScreen;
