/**
 * Login Screen
 * Google Sign-In authentication
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeScreen } from '../../components/common';
import Icon from 'react-native-vector-icons/Ionicons';
import { configureGoogleSignIn, signInWithGoogle } from '../../services/firebase/authService';
import { useStore } from '../../store';
import { colors, spacing, typography, borderRadius } from '../../config/theme';
import type { AuthStackScreenProps } from '../../navigation/types';

type Props = AuthStackScreenProps<'Login'>;

const LoginScreen: React.FC<Props> = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setError } = useStore();

  useEffect(() => {
    // Configure Google Sign-In on mount
    configureGoogleSignIn();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const user = await signInWithGoogle();
      setUser(user);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Sign in failed. Please try again.';
      setError(message);
      Alert.alert('Sign In Failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeScreen backgroundColor={colors.light.background}>
      <View style={styles.content}>
        {/* App Logo/Icon */}
        <View style={styles.logoContainer}>
          <Icon name="brain" size={80} color={colors.primary} />
          <Text testID="login_text_title" style={styles.appName}>
            BrainLog
          </Text>
          <Text style={styles.tagline}>Track Your Learning Journey</Text>
        </View>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          <FeatureItem icon="albums" text="Spaced Repetition Flashcards" />
          <FeatureItem icon="document-text" text="Organize Notes & Bookmarks" />
          <FeatureItem icon="trending-up" text="Track Progress & Habits" />
          <FeatureItem icon="trophy" text="Earn XP & Badges" />
        </View>

        {/* Sign In Button */}
        <TouchableOpacity
          testID="login_button_googleSignIn"
          style={styles.signInButton}
          onPress={handleGoogleSignIn}
          disabled={isLoading}
          activeOpacity={0.8}>
          {isLoading ? (
            <ActivityIndicator testID="login_indicator_loading" color="#FFFFFF" />
          ) : (
            <>
              <Icon name="logo-google" size={24} color="#FFFFFF" style={styles.googleIcon} />
              <Text style={styles.signInButtonText}>Sign in with Google</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Terms */}
        <Text style={styles.termsText}>
          By signing in, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeScreen>
  );
};

const FeatureItem: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <View style={styles.featureItem}>
    <Icon name={icon} size={24} color={colors.primary} />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  appName: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginTop: spacing.md,
  },
  tagline: {
    fontSize: typography.fontSize.lg,
    color: colors.light.textSecondary,
    marginTop: spacing.xs,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: spacing.xxxl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  featureText: {
    fontSize: typography.fontSize.md,
    color: colors.light.text,
    marginLeft: spacing.md,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.lg,
    width: '100%',
    marginBottom: spacing.xl,
  },
  googleIcon: {
    marginRight: spacing.md,
  },
  signInButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
  termsText: {
    fontSize: typography.fontSize.xs,
    color: colors.light.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});

export default LoginScreen;
