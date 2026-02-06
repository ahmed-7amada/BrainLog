/**
 * SafeScreen Component
 * Wrapper component that handles safe area insets for screens
 */

import React from 'react';
import { StyleSheet, ViewStyle, StatusBar } from 'react-native';
import { SafeAreaView, Edge, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../config/theme';

export interface SafeScreenProps {
  children: React.ReactNode;
  /** Which edges to apply safe area padding. Default: ['top', 'bottom', 'left', 'right'] */
  edges?: Edge[];
  /** Background color. Default: colors.light.background */
  backgroundColor?: string;
  /** Additional style for the container */
  style?: ViewStyle;
  /** Use dark theme colors */
  dark?: boolean;
}

/**
 * SafeScreen - A wrapper component that handles device safe areas
 *
 * Usage:
 * ```tsx
 * <SafeScreen>
 *   <YourContent />
 * </SafeScreen>
 *
 * // For screens with bottom tabs (no bottom padding needed):
 * <SafeScreen edges={['top', 'left', 'right']}>
 *   <YourContent />
 * </SafeScreen>
 *
 * // For modal screens (no top padding if modal has own header):
 * <SafeScreen edges={['bottom', 'left', 'right']}>
 *   <YourContent />
 * </SafeScreen>
 * ```
 */
export const SafeScreen: React.FC<SafeScreenProps> = ({
  children,
  edges = ['top', 'bottom', 'left', 'right'],
  backgroundColor,
  style,
  dark = false,
}) => {
  const defaultBg = dark ? colors.dark.background : colors.light.background;
  const bgColor = backgroundColor ?? defaultBg;

  return (
    <SafeAreaView edges={edges} style={[styles.container, { backgroundColor: bgColor }, style]}>
      {children}
    </SafeAreaView>
  );
};

/**
 * Hook to get safe area insets for custom implementations
 * Useful when you need fine-grained control over padding
 */
export const useSafeInsets = () => {
  return useSafeAreaInsets();
};

/**
 * Get the status bar height (useful for absolute positioning)
 */
export const getStatusBarHeight = (): number => {
  return StatusBar.currentHeight ?? 24;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SafeScreen;
