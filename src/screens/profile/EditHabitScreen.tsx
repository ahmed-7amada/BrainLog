/**
 * Edit Habit Screen
 * Edit or delete an existing habit
 */

import React, { useState, useEffect } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography, borderRadius, shadows } from '../../config/theme';
import { useProgress } from '../../hooks/useProgress';
import * as habitService from '../../services/firebase/habitService';
import type { ProfileScreenProps } from '../../navigation/types';

type Props = ProfileScreenProps<'EditHabit'>;

const EditHabitScreen: React.FC<Props> = () => {
  const navigation = useNavigation<Props['navigation']>();
  const route = useRoute<Props['route']>();
  const { habitId } = route.params;
  const { habits, deleteHabit } = useProgress();

  const [habitName, setHabitName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load habit data
  useEffect(() => {
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      setHabitName(habit.name);
      setIsLoading(false);
    } else {
      Alert.alert('Error', 'Habit not found');
      navigation.goBack();
    }
  }, [habitId, habits, navigation]);

  const handleSave = async () => {
    if (!habitName.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }

    setIsSaving(true);
    try {
      await habitService.updateHabit(habitId, { name: habitName.trim() });
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to update habit');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteHabit(habitId);
              navigation.goBack();
            } catch {
              Alert.alert('Error', 'Failed to delete habit');
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
              maxLength={100}
              testID="editHabit_input_name"
            />
          </View>
          <Text style={styles.charCount}>{habitName.length}/100</Text>
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          disabled={isDeleting}
          activeOpacity={0.8}
          testID="editHabit_button_delete">
          {isDeleting ? (
            <ActivityIndicator color={colors.error} />
          ) : (
            <>
              <Icon name="trash-outline" size={20} color={colors.error} />
              <Text style={styles.deleteButtonText}>Delete Habit</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, !habitName.trim() && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving || !habitName.trim()}
          activeOpacity={0.8}
          testID="editHabit_button_save">
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

export default EditHabitScreen;
