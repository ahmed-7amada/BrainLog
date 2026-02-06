/**
 * Conflict Resolver Tests
 * T030 - Unit tests for conflictResolver
 */

import {
  resolveConflict,
  mergeWithConflictResolution,
  detectConflict,
  getConflictMessage,
  getSyncSuccessMessage,
  getSyncErrorMessage,
} from '../../../src/services/sync/conflictResolver';

interface TestEntity {
  id: string;
  updatedAt?: number;
  _optimistic?: boolean;
  name: string;
}

describe('conflictResolver', () => {
  describe('resolveConflict', () => {
    it('should return remote when remote is newer', () => {
      const local: TestEntity = {
        id: '1',
        updatedAt: 1000,
        name: 'local',
      };
      const remote: TestEntity = {
        id: '1',
        updatedAt: 2000,
        name: 'remote',
      };

      const result = resolveConflict(local, remote);

      expect(result.resolved).toEqual(remote);
      expect(result.localWasNewer).toBe(false);
    });

    it('should return local when local is newer', () => {
      const local: TestEntity = {
        id: '1',
        updatedAt: 2000,
        name: 'local',
      };
      const remote: TestEntity = {
        id: '1',
        updatedAt: 1000,
        name: 'remote',
      };

      const result = resolveConflict(local, remote);

      expect(result.resolved).toEqual(local);
      expect(result.localWasNewer).toBe(true);
    });

    it('should return local when timestamps are equal', () => {
      const local: TestEntity = {
        id: '1',
        updatedAt: 1000,
        name: 'local',
      };
      const remote: TestEntity = {
        id: '1',
        updatedAt: 1000,
        name: 'remote',
      };

      const result = resolveConflict(local, remote);

      expect(result.resolved).toEqual(local);
      expect(result.localWasNewer).toBe(true);
    });

    it('should indicate conflict when local is optimistic and remote is newer', () => {
      const local: TestEntity = {
        id: '1',
        updatedAt: 1000,
        _optimistic: true,
        name: 'local',
      };
      const remote: TestEntity = {
        id: '1',
        updatedAt: 2000,
        name: 'remote',
      };

      const result = resolveConflict(local, remote);

      expect(result.hadConflict).toBe(true);
      expect(result.resolved).toEqual(remote);
    });

    it('should not indicate conflict when local is not optimistic', () => {
      const local: TestEntity = {
        id: '1',
        updatedAt: 1000,
        _optimistic: false,
        name: 'local',
      };
      const remote: TestEntity = {
        id: '1',
        updatedAt: 2000,
        name: 'remote',
      };

      const result = resolveConflict(local, remote);

      expect(result.hadConflict).toBe(false);
    });
  });

  describe('mergeWithConflictResolution', () => {
    it('should add new remote items', () => {
      const local: TestEntity[] = [
        {id: '1', name: 'local1', updatedAt: 1000},
      ];
      const remote: TestEntity[] = [
        {id: '1', name: 'local1', updatedAt: 1000},
        {id: '2', name: 'remote2', updatedAt: 2000},
      ];

      const result = mergeWithConflictResolution(local, remote);

      expect(result).toHaveLength(2);
      expect(result.find(i => i.id === '2')).toBeDefined();
    });

    it('should remove items not in remote that are not optimistic', () => {
      const local: TestEntity[] = [
        {id: '1', name: 'local1', updatedAt: 1000},
        {id: '2', name: 'local2', updatedAt: 1000},
      ];
      const remote: TestEntity[] = [
        {id: '1', name: 'local1', updatedAt: 1000},
      ];

      const result = mergeWithConflictResolution(local, remote);

      expect(result).toHaveLength(1);
      expect(result.find(i => i.id === '2')).toBeUndefined();
    });

    it('should keep optimistic items not in remote', () => {
      const local: TestEntity[] = [
        {id: '1', name: 'local1', updatedAt: 1000},
        {id: 'temp_123', name: 'optimistic', updatedAt: 1000, _optimistic: true},
      ];
      const remote: TestEntity[] = [
        {id: '1', name: 'local1', updatedAt: 1000},
      ];

      const result = mergeWithConflictResolution(local, remote);

      expect(result).toHaveLength(2);
      expect(result.find(i => i.id === 'temp_123')).toBeDefined();
    });

    it('should call onConflict callback when conflict detected', () => {
      const onConflict = jest.fn();
      const local: TestEntity[] = [
        {id: '1', name: 'local', updatedAt: 1000, _optimistic: true},
      ];
      const remote: TestEntity[] = [
        {id: '1', name: 'remote', updatedAt: 2000},
      ];

      mergeWithConflictResolution(local, remote, onConflict);

      expect(onConflict).toHaveBeenCalledWith(local[0], remote[0]);
    });
  });

  describe('detectConflict', () => {
    it('should return false when local is not optimistic', () => {
      const local: TestEntity = {
        id: '1',
        updatedAt: 1000,
        name: 'local',
      };
      const remote: TestEntity = {
        id: '1',
        updatedAt: 2000,
        name: 'remote',
      };

      expect(detectConflict(local, remote)).toBe(false);
    });

    it('should return true when local is optimistic and remote is newer', () => {
      const local: TestEntity = {
        id: '1',
        updatedAt: 1000,
        _optimistic: true,
        name: 'local',
      };
      const remote: TestEntity = {
        id: '1',
        updatedAt: 2000,
        name: 'remote',
      };

      expect(detectConflict(local, remote)).toBe(true);
    });

    it('should return false when local is optimistic but not newer remote', () => {
      const local: TestEntity = {
        id: '1',
        updatedAt: 2000,
        _optimistic: true,
        name: 'local',
      };
      const remote: TestEntity = {
        id: '1',
        updatedAt: 1000,
        name: 'remote',
      };

      expect(detectConflict(local, remote)).toBe(false);
    });
  });

  describe('message generators', () => {
    it('should generate conflict message', () => {
      const message = getConflictMessage('note');
      expect(message).toContain('note');
      expect(message).toContain('synced');
    });

    it('should generate singular success message', () => {
      const message = getSyncSuccessMessage('note', 1);
      expect(message).toContain('note');
      expect(message).not.toContain('notes');
    });

    it('should generate plural success message', () => {
      const message = getSyncSuccessMessage('note', 5);
      expect(message).toContain('notes');
      expect(message).toContain('5');
    });

    it('should generate error message', () => {
      const message = getSyncErrorMessage('flashcard');
      expect(message).toContain('flashcard');
      expect(message).toContain('Failed');
    });
  });
});
