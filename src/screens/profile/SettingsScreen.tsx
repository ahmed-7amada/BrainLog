/**
 * Settings Screen
 * User preferences and app settings (FR-032, FR-056)
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useStore } from '../../store';
import { deleteAccount } from '../../services/firebase/authService';
import { colors, spacing, typography, borderRadius, shadows } from '../../config/theme';
import type { ProfileScreenProps } from '../../navigation/types';

type Props = ProfileScreenProps<'Settings'>;

const SettingsScreen: React.FC<Props> = () => {
  const { settings, toggleNotifications, setTheme, logout } = useStore();

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'All your data will be permanently deleted and cannot be recovered. This includes all flashcards, notes, progress, and settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              logout();
            } catch {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Appearance */}
      <Text style={styles.sectionTitle}>Appearance</Text>
      <View style={styles.section}>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="moon" size={22} color={colors.primary} />
            <Text style={styles.settingLabel}>Theme</Text>
          </View>
          <View style={styles.themeButtons}>
            {(['light', 'dark', 'system'] as const).map(theme => (
              <TouchableOpacity
                key={theme}
                style={[styles.themeButton, settings?.theme === theme && styles.themeButtonActive]}
                onPress={() => setTheme(theme)}
                testID={theme === 'dark' ? 'settings_toggle_darkMode' : undefined}>
                <Text
                  style={[
                    styles.themeButtonText,
                    settings?.theme === theme && styles.themeButtonTextActive,
                  ]}>
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Notifications */}
      <Text style={styles.sectionTitle}>Notifications</Text>
      <View style={styles.section}>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="notifications" size={22} color={colors.primary} />
            <Text style={styles.settingLabel}>Enable Notifications</Text>
          </View>
          <Switch
            value={settings?.notificationsEnabled ?? true}
            onValueChange={toggleNotifications}
            trackColor={{ false: colors.light.border, true: colors.primary }}
            testID="settings_toggle_notifications"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="alarm" size={22} color={colors.primary} />
            <Text style={styles.settingLabel}>Daily Reminder</Text>
          </View>
          <Text style={styles.settingValue}>{settings?.dailyReminderTime || '09:00'}</Text>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="time" size={22} color={colors.primary} />
            <Text style={styles.settingLabel}>Habit Reminder</Text>
          </View>
          <Text style={styles.settingValue}>{settings?.habitReminderTime || '20:00'}</Text>
        </View>
      </View>

      {/* Data */}
      <Text style={styles.sectionTitle}>Data</Text>
      <View style={styles.section}>
        <TouchableOpacity style={styles.settingItem} testID="settings_button_exportData">
          <View style={styles.settingInfo}>
            <Icon name="cloud-upload" size={22} color={colors.primary} />
            <Text style={styles.settingLabel}>Export Data</Text>
          </View>
          <Icon name="chevron-forward" size={20} color={colors.light.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} testID="settings_button_clearCache">
          <View style={styles.settingInfo}>
            <Icon name="sync" size={22} color={colors.primary} />
            <Text style={styles.settingLabel}>Sync Status</Text>
          </View>
          <Text style={styles.settingValue}>Up to date</Text>
        </TouchableOpacity>
      </View>

      {/* Danger Zone */}
      <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>
      <View style={styles.section}>
        <TouchableOpacity style={styles.settingItem} onPress={handleDeleteAccount}>
          <View style={styles.settingInfo}>
            <Icon name="trash" size={22} color={colors.error} />
            <Text style={[styles.settingLabel, styles.dangerLabel]}>Delete Account</Text>
          </View>
          <Icon name="chevron-forward" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>
        Deleting your account will permanently remove all your data including flashcards, notes,
        progress, and settings.
      </Text>
    </ScrollView>
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
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.light.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dangerTitle: {
    color: colors.error,
  },
  section: {
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: typography.fontSize.md,
    color: colors.light.text,
    marginLeft: spacing.md,
  },
  dangerLabel: {
    color: colors.error,
  },
  settingValue: {
    fontSize: typography.fontSize.md,
    color: colors.light.textSecondary,
  },
  themeButtons: {
    flexDirection: 'row',
  },
  themeButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.xs,
    backgroundColor: colors.light.surface,
  },
  themeButtonActive: {
    backgroundColor: colors.primary,
  },
  themeButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.light.textSecondary,
  },
  themeButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.medium,
  },
  footerText: {
    fontSize: typography.fontSize.xs,
    color: colors.light.textTertiary,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
});

export default SettingsScreen;
