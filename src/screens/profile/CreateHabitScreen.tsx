/**
 * Create Habit Screen
 * Create a new daily habit
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography, borderRadius, shadows } from '../../config/theme';
import { useProgress } from '../../hooks/useProgress';
import type { ProfileScreenProps } from '../../navigation/types';

type Props = ProfileScreenProps<'CreateHabit'>;

const HABIT_SUGGESTIONS = [
  'Exercise for 30 minutes',
  'Read for 20 minutes',
  'Meditate for 10 minutes',
  'Drink 8 glasses of water',
  'Review flashcards',
  'Write in journal',
  'Practice coding',
  'Learn something new',
];

const CreateHabitScreen: React.FC<Props> = () => {
  const navigation = useNavigation<Props['navigation']>();
  const { createHabit } = useProgress();

  const [habitName, setHabitName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!habitName.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    setIsSaving(true);
    try {
      await createHabit(habitName.trim());
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to create habit');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setHabitName(suggestion);
  };

  return (
    <KeyboardAvoidingView style={styles.container} keyboardVerticalOffset={100}>
      <View style={styles.content}>
        {/* Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Habit Name</Text>
          <View style={styles.inputContainer}>
            <Icon name="checkbox-outline" size={24} color={colors.light.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="What habit do you want to build?"
              placeholderTextColor={colors.light.textTertiary}
              value={habitName}
              onChangeText={setHabitName}
              autoFocus
              maxLength={100}
              testID="createHabit_input_name"
            />
          </View>
          <Text style={styles.charCount}>{habitName.length}/100</Text>
        </View>

        {/* Suggestions */}
        <View style={styles.suggestionsSection}>
          <Text style={styles.suggestionsTitle}>Suggestions</Text>
          <View style={styles.suggestionsContainer}>
            {HABIT_SUGGESTIONS.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionChip}
                onPress={() => handleSuggestionPress(suggestion)}
                activeOpacity={0.8}>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Tips for building habits</Text>
          <View style={styles.tipItem}>
            <Icon name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.tipText}>Start small - be specific about what you'll do</Text>
          </View>
          <View style={styles.tipItem}>
            <Icon name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.tipText}>Link to an existing routine</Text>
          </View>
          <View style={styles.tipItem}>
            <Icon name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.tipText}>Make it easy to track daily</Text>
          </View>
        </View>
      </View>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, !habitName.trim() && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving || !habitName.trim()}
          activeOpacity={0.8}
          testID="createHabit_button_save">
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Icon name="checkmark" size={24} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Create Habit</Text>
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
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  inputSection: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.light.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    ...shadows.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.light.text,
    paddingVertical: spacing.lg,
    marginLeft: spacing.sm,
  },
  charCount: {
    fontSize: typography.fontSize.xs,
    color: colors.light.textTertiary,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  suggestionsSection: {
    marginBottom: spacing.xl,
  },
  suggestionsTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.light.textSecondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestionChip: {
    backgroundColor: colors.light.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  suggestionText: {
    fontSize: typography.fontSize.sm,
    color: colors.light.text,
  },
  tipsSection: {
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  tipsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.light.text,
    marginBottom: spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tipText: {
    fontSize: typography.fontSize.sm,
    color: colors.light.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
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

export default CreateHabitScreen;
