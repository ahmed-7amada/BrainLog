/**
 * ToastProvider
 * Global toast notification context (FR-003, FR-020)
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Toast, ToastType } from './Toast';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastContextValue {
  showToast: (
    message: string,
    type?: ToastType,
    options?: {
      duration?: number;
      action?: {
        label: string;
        onPress: () => void;
      };
    },
  ) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
  hideToast: (id: string) => void;
  hideAllToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const MAX_TOASTS = 3;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = 'info',
      options?: {
        duration?: number;
        action?: {
          label: string;
          onPress: () => void;
        };
      },
    ) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newToast: ToastItem = {
        id,
        message,
        type,
        duration: options?.duration,
        action: options?.action,
      };

      setToasts(prev => {
        // Limit number of toasts
        const updated = [newToast, ...prev].slice(0, MAX_TOASTS);
        return updated;
      });
    },
    [],
  );

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const hideAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showSuccess = useCallback((message: string) => showToast(message, 'success'), [showToast]);

  const showError = useCallback((message: string) => showToast(message, 'error'), [showToast]);

  const showWarning = useCallback((message: string) => showToast(message, 'warning'), [showToast]);

  const showInfo = useCallback((message: string) => showToast(message, 'info'), [showToast]);

  const contextValue = useMemo(
    () => ({
      showToast,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      hideToast,
      hideAllToasts,
    }),
    [showToast, showSuccess, showError, showWarning, showInfo, hideToast, hideAllToasts],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <View style={styles.toastContainer} pointerEvents="box-none">
        {toasts.map((toast, index) => (
          <View
            key={toast.id}
            style={[styles.toastWrapper, { top: index * 70 }]}
            pointerEvents="box-none">
            <Toast
              id={toast.id}
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              action={toast.action}
              onDismiss={hideToast}
            />
          </View>
        ))}
      </View>
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  toastWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastProvider;
