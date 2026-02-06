/**
 * ConflictRecord Model
 * Represents detected data conflicts for audit and debugging (FR-003)
 */

export type ConflictResolution = 'server_wins' | 'local_wins' | 'merged';

export interface ConflictRecord {
  id: string;
  userId: string;

  // Conflict context
  entityType: string;
  entityId: string;

  // Versions
  localVersion: Record<string, unknown>;
  serverVersion: Record<string, unknown>;
  resolvedVersion: Record<string, unknown>;

  // Resolution
  resolution: ConflictResolution;
  resolvedAt: number;
  wasNotified: boolean;

  // Timing
  detectedAt: number;
}

export interface CreateConflictRecordInput {
  userId: string;
  entityType: string;
  entityId: string;
  localVersion: Record<string, unknown>;
  serverVersion: Record<string, unknown>;
  resolvedVersion: Record<string, unknown>;
  resolution: ConflictResolution;
  wasNotified?: boolean;
}

/**
 * Create a new conflict record
 */
export const createConflictRecord = (input: CreateConflictRecordInput): ConflictRecord => ({
  id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  userId: input.userId,
  entityType: input.entityType,
  entityId: input.entityId,
  localVersion: input.localVersion,
  serverVersion: input.serverVersion,
  resolvedVersion: input.resolvedVersion,
  resolution: input.resolution,
  resolvedAt: Date.now(),
  wasNotified: input.wasNotified ?? false,
  detectedAt: Date.now(),
});
