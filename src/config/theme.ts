/**
 * Theme Configuration
 * Colors, typography, spacing for light and dark modes (FR-032)
 */

export const colors = {
  // Primary colors
  primary: '#007AFF',
  primaryDark: '#0056B3',
  primaryLight: '#4DA3FF',

  // Accent colors
  accent: '#FF9500',
  success: '#34C759',
  warning: '#FFCC00',
  error: '#FF3B30',
  info: '#5AC8FA',

  // Streak/XP colors
  streak: '#FF6B00',
  xp: '#FFD700',

  // Activity level colors (for calendar)
  activityHigh: '#34C759',
  activityMedium: '#FFCC00',
  activityLow: '#FF9500',
  activityNone: '#E5E5E5',

  // Light theme
  light: {
    background: '#FFFFFF',
    surface: '#F2F2F7',
    card: '#FFFFFF',
    text: '#000000',
    textSecondary: '#8E8E93',
    textTertiary: '#C7C7CC',
    border: '#E5E5E5',
    divider: '#C6C6C8',
    disabled: '#D1D1D6',
  },

  // Dark theme
  dark: {
    background: '#000000',
    surface: '#1C1C1E',
    card: '#2C2C2E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    textTertiary: '#48484A',
    border: '#38383A',
    divider: '#48484A',
    disabled: '#3A3A3C',
  },
};

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 34,
  },
  lineHeight: {
    xs: 14,
    sm: 18,
    md: 20,
    lg: 22,
    xl: 26,
    xxl: 32,
    xxxl: 42,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Theme {
  mode: ThemeMode;
  colors: typeof colors.light;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
}

export const lightTheme: Theme = {
  mode: 'light',
  colors: colors.light,
  typography,
  spacing,
  borderRadius,
  shadows,
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: colors.dark,
  typography,
  spacing,
  borderRadius,
  shadows,
};

export const getTheme = (mode: ThemeMode, systemColorScheme: 'light' | 'dark'): Theme => {
  if (mode === 'system') {
    return systemColorScheme === 'dark' ? darkTheme : lightTheme;
  }
  return mode === 'dark' ? darkTheme : lightTheme;
};

/**
 * Hook to get the current theme with additional color properties
 * Returns a theme object with colors including success, error, warning
 */
export const useTheme = (): Theme & {
  colors: Theme['colors'] & { success: string; error: string; warning: string };
} => {
  // Default to light theme - in real usage this would come from store/context
  return {
    ...lightTheme,
    colors: {
      ...lightTheme.colors,
      success: colors.success,
      error: colors.error,
      warning: colors.warning,
    },
  };
};
