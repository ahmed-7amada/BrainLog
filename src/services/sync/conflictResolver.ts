/**
 * Conflict Resolver
 * Last-write-wins conflict resolution with toast notification (FR-004)
 */

export interface ConflictableEntity {
  id: string;
  updatedAt?: number;
  _optimistic?: boolean;
}

export interface ConflictResult<T> {
  resolved: T;
  hadConflict: boolean;
  localWasNewer: boolean;
}

/**
 * Resolve conflict between local and remote versions using last-write-wins
 * @param local - The local version of the entity
 * @param remote - The remote version from server
 * @returns Resolution result with the winning version
 */
export const resolveConflict = <T extends ConflictableEntity>(
  local: T,
  remote: T,
): ConflictResult<T> => {
  const localTime = local.updatedAt || 0;
  const remoteTime = remote.updatedAt || 0;

  // Remote wins if it has a newer timestamp
  if (remoteTime > localTime) {
    return {
      resolved: remote,
      hadConflict: local._optimistic === true,
      localWasNewer: false,
    };
  }

  // Local wins if it has a newer or equal timestamp
  return {
    resolved: local,
    hadConflict: false,
    localWasNewer: true,
  };
};

/**
 * Merge incoming remote items with local store items
 * Handles additions, updates, and deletions
 */
export const mergeWithConflictResolution = <T extends ConflictableEntity>(
  localItems: T[],
  remoteItems: T[],
  onConflict?: (local: T, remote: T) => void,
): T[] => {
  const remoteMap = new Map<string, T>();
  remoteItems.forEach(item => {
    remoteMap.set(item.id, item);
  });

  const localMap = new Map<string, T>();
  localItems.forEach(item => {
    localMap.set(item.id, item);
  });

  const mergedItems: T[] = [];
  const processedIds = new Set<string>();

  // Process local items - check for updates and conflicts
  localItems.forEach(localItem => {
    const remoteItem = remoteMap.get(localItem.id);
    processedIds.add(localItem.id);

    if (remoteItem) {
      // Item exists in both - resolve potential conflict
      const result = resolveConflict(localItem, remoteItem);

      if (result.hadConflict && onConflict) {
        onConflict(localItem, remoteItem);
      }

      mergedItems.push(result.resolved);
    } else if (localItem._optimistic) {
      // Keep optimistic items that aren't on server yet
      mergedItems.push(localItem);
    }
    // If not optimistic and not in remote, it was deleted on server - don't include
  });

  // Add new items from remote that weren't in local
  remoteItems.forEach(remoteItem => {
    if (!processedIds.has(remoteItem.id)) {
      mergedItems.push(remoteItem);
    }
  });

  return mergedItems;
};

/**
 * Detect if there's a conflict between pending local change and incoming remote data
 */
export const detectConflict = <T extends ConflictableEntity>(
  localItem: T,
  remoteItem: T,
): boolean => {
  // Conflict exists if:
  // 1. Local item is marked as optimistic (pending save)
  // 2. Remote item has a different/newer timestamp
  if (!localItem._optimistic) {
    return false;
  }

  const localTime = localItem.updatedAt || 0;
  const remoteTime = remoteItem.updatedAt || 0;

  return remoteTime > localTime;
};

/**
 * Generate a conflict notification message
 */
export const getConflictMessage = (entityType: string): string => {
  return `Your ${entityType} changes were synced with a newer version from another device.`;
};

/**
 * Generate a sync success message
 */
export const getSyncSuccessMessage = (entityType: string, count: number): string => {
  if (count === 1) {
    return `${entityType} synced successfully.`;
  }
  return `${count} ${entityType}s synced successfully.`;
};

/**
 * Generate a sync error message
 */
export const getSyncErrorMessage = (entityType: string): string => {
  return `Failed to sync ${entityType}. Your changes will be saved when connection is restored.`;
};
