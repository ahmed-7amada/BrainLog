/**
 * useAuth Hook
 * Authentication state and operations
 */

import { useEffect, useCallback } from 'react';
import { useStore } from '../store';
import {
  signInWithGoogle,
  signOut,
  onAuthStateChanged,
  configureGoogleSignIn,
} from '../services/firebase/authService';
import { getUserRef, get, child } from '../config/firebase';
import type { User } from '../models/User';

export const useAuth = () => {
  const {
    user,
    isLoading,
    isAuthenticated,
    error,
    setUser,
    setLoading,
    setError,
    updateUser,
    logout: storeLogout,
  } = useStore();

  // Initialize Google Sign-In on mount
  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async firebaseUser => {
      if (firebaseUser) {
        try {
          // Load full user profile from database
          const userRef = getUserRef(firebaseUser.uid);
          const profileRef = child(userRef, 'profile');
          const snapshot = await get(profileRef);
          const userData = snapshot.val();

          if (userData) {
            setUser({
              id: firebaseUser.uid,
              email: userData.email || firebaseUser.email || '',
              name: userData.name || firebaseUser.displayName || 'User',
              avatarUrl: userData.avatarUrl || firebaseUser.photoURL || undefined,
              xpPoints: userData.xpPoints || 0,
              currentLevel: userData.currentLevel || 1,
              currentStreak: userData.currentStreak || 0,
              longestStreak: userData.longestStreak || 0,
              lastActiveDate: userData.lastActiveDate || new Date().toISOString().split('T')[0],
              streakFreezeAvailable: userData.streakFreezeAvailable ?? true,
              earnedBadges: userData.earnedBadges || [],
              createdAt: userData.createdAt || Date.now(),
              updatedAt: userData.updatedAt || Date.now(),
            });
          } else {
            // New user - create profile
            const newUser: User = {
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
            };
            setUser(newUser);
          }
        } catch (loadError) {
          console.error('Error loading user profile:', loadError);
          setError('Failed to load user profile');
        }
      } else {
        storeLogout();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading, setError, storeLogout]);

  const login = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const loggedInUser = await signInWithGoogle();
      setUser(loggedInUser);
      return loggedInUser;
    } catch (loginError: unknown) {
      const message = loginError instanceof Error ? loginError.message : 'Sign in failed';
      setError(message);
      throw loginError;
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading, setError]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await signOut();
      storeLogout();
    } catch (logoutError: unknown) {
      const message = logoutError instanceof Error ? logoutError.message : 'Sign out failed';
      setError(message);
      throw logoutError;
    } finally {
      setLoading(false);
    }
  }, [storeLogout, setLoading, setError]);

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    logout,
    updateUser,
  };
};

export default useAuth;
