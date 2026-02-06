/**
 * Auth Slice
 * Manages authentication state
 */

import { StateCreator } from 'zustand';
import type { User } from '../../models/User';

export interface AuthSlice {
  // State
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set, get) => ({
  // Initial state
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  // Actions
  setUser: user =>
    set({
      user,
      isAuthenticated: user !== null,
      isLoading: false,
      error: null,
    }),

  setLoading: isLoading => set({ isLoading }),

  setError: error => set({ error, isLoading: false }),

  updateUser: updates => {
    const currentUser = get().user;
    if (currentUser) {
      set({
        user: {
          ...currentUser,
          ...updates,
          updatedAt: Date.now(),
        },
      });
    }
  },

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    }),
});
