/**
 * Root App Navigator
 * Handles auth state and switches between Auth and Main stacks
 * T384 - Added notification tap handling via navigation ref
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme, ActivityIndicator, View, StyleSheet } from 'react-native';
import type { RootStackParamList } from './types';
import { useStore } from '../store';
import { onAuthStateChanged } from '../services/firebase/authService';
import { colors } from '../config/theme';
import {
  navigationRef,
  setupNotificationHandlers,
  getInitialNotification,
} from '../services/notifications/notificationHandler';
import { initializeNotifications } from '../services/notifications/notificationService';

import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import SearchScreen from '../screens/search/SearchScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const LoadingScreen: React.FC = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={colors.primary} />
  </View>
);

const AppNavigator: React.FC = () => {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading, setUser, setLoading, logout, setSystemColorScheme } =
    useStore();

  // Update system color scheme
  useEffect(() => {
    setSystemColorScheme(colorScheme === 'dark' ? 'dark' : 'light');
  }, [colorScheme, setSystemColorScheme]);

  // Initialize notifications and set up handlers (T384)
  useEffect(() => {
    const setupNotifications = async () => {
      await initializeNotifications();
      const unsubscribe = setupNotificationHandlers();
      // Check if app was opened from a notification
      await getInitialNotification();
      return unsubscribe;
    };

    let unsubscribe: (() => void) | undefined;
    setupNotifications().then(unsub => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async firebaseUser => {
      if (firebaseUser) {
        // User is signed in
        // The full user profile should be loaded from the auth service
        // For now, we'll use basic info
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'User',
          avatarUrl: firebaseUser.photoURL || undefined,
          xpPoints: 0,
          currentLevel: 1,
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: new Date().toISOString().split('T')[0],
          streakFreezeAvailable: true,
          earnedBadges: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      } else {
        // User is signed out
        logout();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, logout, setLoading]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="Search"
              component={SearchScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.light.background,
  },
});

export default AppNavigator;
