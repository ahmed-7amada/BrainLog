/**
 * ActivityLogSheet Component
 * Bottom sheet modal showing upload activity (FR-016)
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUploadManager } from '../../hooks/useUploadManager';
import { ActivityLogItem } from './ActivityLogItem';
import { colors, spacing, typography, borderRadius, shadows } from '../../config/theme';
import type { ActivityLogEntry } from '../../models/ActivityLogEntry';

export interface ActivityLogSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const ActivityLogSheet: React.FC<ActivityLogSheetProps> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const {
    activityLog,
    activeCount,
    failedCount,
    retry,
    dismissActivity,
    retryAll,
    clearCompleted,
  } = useUploadManager();

  const translateY = useSharedValue(500);

  React.useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 300 });
    } else {
      translateY.value = withTiming(500, { duration: 200 });
    }
  }, [visible, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleRetry = useCallback(
    (entryId: string) => {
      const entry = activityLog.find(e => e.id === entryId);
      if (entry?.taskId) {
        retry(entry.taskId);
      }
    },
    [activityLog, retry],
  );

  const handleDismiss = useCallback(
    (entryId: string) => {
      dismissActivity(entryId);
    },
    [dismissActivity],
  );

  const renderItem = useCallback(
    ({ item }: { item: ActivityLogEntry }) => (
      <ActivityLogItem entry={item} onRetry={handleRetry} onDismiss={handleDismiss} />
    ),
    [handleRetry, handleDismiss],
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerHandle} />
      <View style={styles.headerContent}>
        <Text style={styles.title}>Activity</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <View>
            <Icon name="close" size={24} color={colors.light.text} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Summary stats */}
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{activeCount}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, failedCount > 0 && styles.statError]}>{failedCount}</Text>
          <Text style={styles.statLabel}>Failed</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{activityLog.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actionsContainer}>
        {failedCount > 0 ? (
          <TouchableOpacity style={styles.actionButton} onPress={retryAll}>
            <View>
              <Icon name="refresh" size={16} color={colors.primary} />
            </View>
            <Text style={styles.actionButtonText}>Retry All</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity style={styles.actionButton} onPress={clearCompleted}>
          <View>
            <Icon name="trash-outline" size={16} color={colors.light.textSecondary} />
          </View>
          <Text style={[styles.actionButtonText, { color: colors.light.textSecondary }]}>
            Clear
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View>
        <Icon name="cloud-done-outline" size={48} color={colors.light.textTertiary} />
      </View>
      <Text style={styles.emptyTitle}>No Activity</Text>
      <Text style={styles.emptyText}>Your upload and sync activity will appear here</Text>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View style={[styles.container, { paddingBottom: insets.bottom }, animatedStyle]}>
          <Pressable>
            {renderHeader()}
            <FlatList
              data={activityLog}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              ListEmptyComponent={renderEmpty}
              contentContainerStyle={activityLog.length === 0 && styles.emptyList}
            />
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.light.card,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
    ...shadows.lg,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  headerHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.light.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.light.text,
  },
  closeButton: {
    padding: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.light.text,
  },
  statError: {
    color: colors.error,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.light.textSecondary,
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  actionButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  emptyContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.light.textSecondary,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.light.textTertiary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

export default ActivityLogSheet;
