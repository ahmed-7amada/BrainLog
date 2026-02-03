/**
 * useAuth Hook
 * Provides authentication state and methods throughout the app
 */

import {useState, useEffect} from 'react';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {
  signInWithGoogle,
  signOut,
  getCurrentUser,
  isAuthenticated,
  onAuthStateChanged,
  deleteAccount,
} from '@/services/firebase/authService';

export interface UseAuthReturn {
  user: FirebaseAuthTypes.User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  error: string | null;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(
    getCurrentUser(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseUser => {
      setUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const signedInUser = await signInWithGoogle();
      setUser(signedInUser);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signOut();
      setUser(null);
    } catch (err: any) {
      setError(err.message || 'Failed to sign out');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await deleteAccount();
      setUser(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: isAuthenticated(),
    signIn,
    signOut: handleSignOut,
    deleteAccount: handleDeleteAccount,
    error,
  };
};
