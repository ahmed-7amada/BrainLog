/**
 * Auth Slice
 * Manages authentication state
 */

import {StateCreator} from 'zustand';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';

export interface AuthSlice {
  user: FirebaseAuthTypes.User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: FirebaseAuthTypes.User | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = set => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  setUser: user =>
    set({
      user,
      isAuthenticated: user !== null,
    }),

  setLoading: loading =>
    set({
      isLoading: loading,
    }),

  clearAuth: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),
});
