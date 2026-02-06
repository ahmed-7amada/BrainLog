/**
 * Create Flashcard Screen
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useStore } from '../../store';
import { validateFlashcard } from '../../utils/validation';
import * as flashcardService from '../../services/firebase/flashcardService';
import * as xpService from '../../services/gamification/xpService';
import { colors, spacing, typography, borderRadius, shadows } from '../../config/theme';
import type { FlashcardsScreenProps } from '../../navigation/types';

type Props = FlashcardsScreenProps<'CreateFlashcard'>;

const CreateFlashcardScreen: React.FC<Props> = ({ route }) => {
  const navigation = useNavigation<Props['navigation']>();
  const { user, addFlashcard } = useStore();
  const deckId = route?.params?.deckId;

  const [frontText, setFrontText] = useState('');
  const [backText, setBackText] = useState('');
  const [deck, setDeck] = useState(deckId || '');
  const [tagsInput, setTagsInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    // Validate
    const validation = validateFlashcard(frontText, backText, deck);
    if (!validation.isValid) {
      const errorMessage = Object.values(validation.errors).join('\n');
      Alert.alert('Validation Error', errorMessage);
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'You must be signed in to create flashcards');
      return;
    }

    setIsLoading(true);

    try {
      // Parse tags
      const tags = tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Create flashcard in Firebase
      const newCard = await flashcardService.createFlashcard({
        frontText: frontText.trim(),
        backText: backText.trim(),
        deck: deck.trim() || undefined,
        tags,
      });

      // Add to local store for immediate UI update
      addFlashcard(newCard);

      // Award XP for creating flashcard
      try {
        await xpService.awardFlashcardCreateXP();
      } catch {
        // XP award failure shouldn't block the flow
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error creating flashcard:', error);
      Alert.alert('Error', 'Failed to create flashcard. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Front Text */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Question (Front)</Text>
          <TextInput
            testID="createFlashcard_input_front"
            style={[styles.textArea, styles.textAreaLarge]}
            placeholder="Enter the question or term..."
            placeholderTextColor={colors.light.textSecondary}
            value={frontText}
            onChangeText={setFrontText}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Back Text */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Answer (Back)</Text>
          <TextInput
            testID="createFlashcard_input_back"
            style={[styles.textArea, styles.textAreaLarge]}
            placeholder="Enter the answer or definition..."
            placeholderTextColor={colors.light.textSecondary}
            value={backText}
            onChangeText={setBackText}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Deck */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Deck (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., React Concepts, English Vocabulary"
            placeholderTextColor={colors.light.textSecondary}
            value={deck}
            onChangeText={setDeck}
          />
        </View>

        {/* Tags */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tags (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Separate tags with commas: react, hooks, frontend"
            placeholderTextColor={colors.light.textSecondary}
            value={tagsInput}
            onChangeText={setTagsInput}
          />
          <Text style={styles.hint}>Tags help you organize and find cards later</Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          testID="createFlashcard_button_save"
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
          activeOpacity={0.8}>
          <Icon name="checkmark" size={24} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>{isLoading ? 'Saving...' : 'Save Flashcard'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.surface,
  },
  content: {
    padding: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.light.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.light.text,
    ...shadows.sm,
  },
  textArea: {
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.light.text,
    ...shadows.sm,
  },
  textAreaLarge: {
    minHeight: 120,
  },
  hint: {
    fontSize: typography.fontSize.xs,
    color: colors.light.textSecondary,
    marginTop: spacing.xs,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    marginTop: spacing.md,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: '#FFFFFF',
    marginLeft: spacing.sm,
  },
});

export default CreateFlashcardScreen;
