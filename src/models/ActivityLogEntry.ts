/**
 * ActivityLogEntry Model
 * Represents logged upload and sync activity (FR-013 to FR-016)
 */

export type ActivityType = 'upload' | 'sync' | 'conflict';
export type ActivityAction =
  | 'upload'
  | 'download'
  | 'sync'
  | 'delete'
  | 'started'
  | 'completed'
  | 'failed'
  | 'retried'
  | 'resolved';
export type ActivityStatus = 'pending' | 'in_progress' | 'success' | 'error';

export interface ActivityLogEntry {
  id: string;
  userId: string;

  // Activity details
  type: ActivityType;
  action: ActivityAction;

  // Reference
  taskId: string | null;
  entityType: string | null;
  entityId: string | null;
  entityName: string;

  // Status
  status: ActivityStatus;
  progress: number | null; // 0-100, null if not in_progress
  errorMessage: string | null;

  // Timing
  timestamp: number;
  duration: number | null; // ms, null if not completed

  // UI metadata
  canRetry: boolean;
  canDismiss: boolean;
}

export interface CreateActivityLogEntryInput {
  userId: string;
  type: ActivityType;
  action: ActivityAction;
  entityName: string;
  taskId?: string;
  entityType?: string;
  entityId?: string;
  status?: ActivityStatus;
  progress?: number;
  errorMessage?: string;
  canRetry?: boolean;
  canDismiss?: boolean;
}

/**
 * Create a new activity log entry
 */
export const createActivityLogEntry = (input: CreateActivityLogEntryInput): ActivityLogEntry => ({
  id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  userId: input.userId,
  type: input.type,
  action: input.action,
  taskId: input.taskId ?? null,
  entityType: input.entityType ?? null,
  entityId: input.entityId ?? null,
  entityName: input.entityName,
  status: input.status ?? 'in_progress',
  progress: input.progress ?? null,
  errorMessage: input.errorMessage ?? null,
  timestamp: Date.now(),
  duration: null,
  canRetry: input.canRetry ?? false,
  canDismiss: input.canDismiss ?? true,
});

/**
 * Activity log retention period (7 days in milliseconds)
 */
export const ACTIVITY_LOG_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Check if an entry should be retained
 */
export const shouldRetainEntry = (entry: ActivityLogEntry): boolean => {
  return Date.now() - entry.timestamp < ACTIVITY_LOG_RETENTION_MS;
};
