/**
 * ErrorBoundary Component
 * Catches and handles errors in sync/upload operations (FR-018)
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography, borderRadius } from '../../config/theme';

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional fallback component */
  fallback?: ReactNode;
  /** Called when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Optional title for error screen */
  title?: string;
  /** Whether to show retry button */
  showRetry?: boolean;
  /** Called when retry is pressed */
  onRetry?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static defaultProps = {
    title: 'Something went wrong',
    showRetry: true,
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log to console in development
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }

    // Call optional error callback
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onRetry?.();
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, title, showRetry } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <View style={styles.container}>
          <View>
            <Icon name="alert-circle-outline" size={64} color={colors.error} />
          </View>
          <Text style={styles.title}>{title}</Text>
          {error ? (
            <Text style={styles.message} numberOfLines={3}>
              {error.message}
            </Text>
          ) : null}
          {showRetry ? (
            <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
              <View>
                <Icon name="refresh" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      );
    }

    return children;
  }
}

/**
 * SyncErrorBoundary - Specialized for sync-related errors
 */
export class SyncErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static defaultProps = {
    title: 'Sync Error',
    showRetry: true,
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    if (__DEV__) {
      console.error('SyncErrorBoundary caught an error:', error);
    }

    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onRetry?.();
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, showRetry } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <View style={styles.syncErrorContainer}>
          <View>
            <Icon name="cloud-offline-outline" size={48} color={colors.warning} />
          </View>
          <Text style={styles.syncErrorTitle}>Unable to sync</Text>
          <Text style={styles.syncErrorMessage}>
            {error?.message || 'Your changes will be saved when connection is restored.'}
          </Text>
          {showRetry ? (
            <TouchableOpacity style={styles.syncRetryButton} onPress={this.handleRetry}>
              <Text style={styles.syncRetryText}>Retry Sync</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      );
    }

    return children;
  }
}

/**
 * UploadErrorBoundary - Specialized for upload-related errors
 */
export class UploadErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static defaultProps = {
    title: 'Upload Error',
    showRetry: true,
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    if (__DEV__) {
      console.error('UploadErrorBoundary caught an error:', error);
    }

    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onRetry?.();
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, showRetry } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <View style={styles.uploadErrorContainer}>
          <View>
            <Icon name="cloud-upload-outline" size={48} color={colors.error} />
          </View>
          <Text style={styles.uploadErrorTitle}>Upload failed</Text>
          <Text style={styles.uploadErrorMessage}>
            {error?.message || 'The upload could not be completed.'}
          </Text>
          {showRetry ? (
            <TouchableOpacity style={styles.uploadRetryButton} onPress={this.handleRetry}>
              <View>
                <Icon name="refresh" size={16} color={colors.primary} />
              </View>
              <Text style={styles.uploadRetryText}>Retry Upload</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      );
    }

    return children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.light.background,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.light.text,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.fontSize.sm,
    color: colors.light.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xl,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },

  // Sync error styles
  syncErrorContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.light.surface,
    borderRadius: borderRadius.lg,
    margin: spacing.lg,
  },
  syncErrorTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.light.text,
    marginTop: spacing.md,
  },
  syncErrorMessage: {
    fontSize: typography.fontSize.sm,
    color: colors.light.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  syncRetryButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  syncRetryText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },

  // Upload error styles
  uploadErrorContainer: {
    padding: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.light.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  uploadErrorTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.light.text,
    marginTop: spacing.sm,
  },
  uploadErrorMessage: {
    fontSize: typography.fontSize.sm,
    color: colors.light.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  uploadRetryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  uploadRetryText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
});

export default ErrorBoundary;
