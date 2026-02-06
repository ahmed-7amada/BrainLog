/**
 * ActivityLogItem Component
 * Individual activity log entry display (FR-016)
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { MiniProgress } from '../common/ProgressIndicator';
import { colors, spacing, typography } from '../../config/theme';
import type { ActivityLogEntry } from '../../models/ActivityLogEntry';

export interface ActivityLogItemProps {
  entry: ActivityLogEntry;
  onRetry?: (entryId: string) => void;
  onDismiss?: (entryId: string) => void;
}

export const ActivityLogItem: React.FC<ActivityLogItemProps> = ({ entry, onRetry, onDismiss }) => {
  const getStatusIcon = (): { name: string; color: string } => {
    switch (entry.status) {
      case 'in_progress':
        return { name: 'sync', color: colors.primary };
      case 'success':
        return { name: 'checkmark-circle', color: colors.success };
      case 'error':
        return { name: 'close-circle', color: colors.error };
      case 'pending':
      default:
        return { name: 'time', color: colors.warning };
    }
  };

  const getActionIcon = (): string => {
    switch (entry.action) {
      case 'upload':
        return 'cloud-upload';
      case 'download':
        return 'cloud-download';
      case 'sync':
        return 'sync';
      case 'delete':
        return 'trash';
      default:
        return 'ellipsis-horizontal';
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // Less than 1 minute
    if (diff < 60000) {
      return 'Just now';
    }

    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    }

    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }

    // Older
    return date.toLocaleDateString();
  };

  const formatDuration = (ms: number | null): string => {
    if (!ms) return '';
    if (ms < 1000) return '<1s';
    const seconds = Math.round(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  const statusIcon = getStatusIcon();
  const isInProgress = entry.status === 'in_progress';
  const isError = entry.status === 'error';

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon name={getActionIcon()} size={20} color={colors.light.textSecondary} />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {entry.entityName}
          </Text>
          <View style={styles.statusContainer}>
            <Icon name={statusIcon.name} size={14} color={statusIcon.color} />
          </View>
        </View>

        <View style={styles.meta}>
          <Text style={styles.metaText}>
            {entry.entityType ? `${entry.entityType} · ` : ''}
            {formatTimestamp(entry.timestamp)}
            {entry.duration ? ` · ${formatDuration(entry.duration)}` : ''}
          </Text>
        </View>

        {/* Progress bar for in-progress items */}
        {isInProgress && entry.progress !== null && (
          <View style={styles.progressContainer}>
            <MiniProgress progress={entry.progress} />
            <Text style={styles.progressText}>{Math.round(entry.progress)}%</Text>
          </View>
        )}

        {/* Error message */}
        {isError && entry.errorMessage && (
          <Text style={styles.errorText} numberOfLines={2}>
            {entry.errorMessage}
          </Text>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {isError && entry.canRetry && onRetry ? (
          <TouchableOpacity style={styles.actionButton} onPress={() => onRetry(entry.id)}>
            <View>
              <Icon name="refresh" size={18} color={colors.primary} />
            </View>
          </TouchableOpacity>
        ) : null}
        {entry.canDismiss && onDismiss ? (
          <TouchableOpacity style={styles.actionButton} onPress={() => onDismiss(entry.id)}>
            <View>
              <Icon name="close" size={18} color={colors.light.textTertiary} />
            </View>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.light.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  statusContainer: {
    marginLeft: spacing.xs,
  },
  meta: {
    marginTop: 2,
  },
  metaText: {
    fontSize: typography.fontSize.xs,
    color: colors.light.textTertiary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  progressText: {
    fontSize: typography.fontSize.xs,
    color: colors.light.textSecondary,
    marginLeft: spacing.sm,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  actionButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
});

export default ActivityLogItem;
