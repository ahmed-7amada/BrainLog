/**
 * Unit Tests for Optimistic Update Manager
 * Tests for tracking pending changes and rollback logic (FR-017)
 */

import {
  generateTempId,
  isTempId,
  trackPendingChange,
  confirmChange,
  rollbackChange,
  getPendingChanges,
  hasPendingChanges,
  clearAllPendingChanges,
  setToastCallback,
} from '../../../src/services/sync/optimisticUpdateManager';

// Mock the store
jest.mock('../../../src/store', () => ({
  useStore: {
    getState: jest.fn(() => ({
      notes: {},
      flashcards: {},
      addNote: jest.fn(),
      updateNote: jest.fn(),
      removeNote: jest.fn(),
      replaceNote: jest.fn(),
      markNoteOptimistic: jest.fn(),
      addFlashcard: jest.fn(),
      updateFlashcard: jest.fn(),
      removeFlashcard: jest.fn(),
      replaceFlashcard: jest.fn(),
      markFlashcardOptimistic: jest.fn(),
    })),
  },
}));

describe('optimisticUpdateManager', () => {
  beforeEach(() => {
    clearAllPendingChanges();
  });

  describe('generateTempId', () => {
    it('should generate a unique temporary ID', () => {
      const id1 = generateTempId();
      const id2 = generateTempId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^temp_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^temp_\d+_[a-z0-9]+$/);
    });

    it('should start with temp_ prefix', () => {
      const id = generateTempId();
      expect(id.startsWith('temp_')).toBe(true);
    });
  });

  describe('isTempId', () => {
    it('should return true for temporary IDs', () => {
      const tempId = generateTempId();
      expect(isTempId(tempId)).toBe(true);
    });

    it('should return false for regular IDs', () => {
      expect(isTempId('abc123')).toBe(false);
      expect(isTempId('-Mxyz123')).toBe(false);
      expect(isTempId('note_123')).toBe(false);
    });

    it('should return true for manually created temp IDs', () => {
      expect(isTempId('temp_123_abc')).toBe(true);
    });
  });

  describe('trackPendingChange', () => {
    it('should track a create operation', () => {
      const changeId = trackPendingChange(
        'note',
        'create',
        'temp_123',
        {id: 'temp_123', title: 'Test'},
      );

      expect(changeId).toContain('note_create_temp_123');
      expect(hasPendingChanges()).toBe(true);
    });

    it('should track an update operation with original data', () => {
      const originalData = {id: '123', title: 'Original'};
      const optimisticData = {id: '123', title: 'Updated'};

      trackPendingChange(
        'note',
        'update',
        '123',
        optimisticData,
        originalData,
      );

      const changes = getPendingChanges('note');
      expect(changes.length).toBe(1);
      expect(changes[0].originalData).toEqual(originalData);
      expect(changes[0].optimisticData).toEqual(optimisticData);
    });

    it('should track a delete operation', () => {
      const originalData = {id: '123', title: 'To Delete'};

      trackPendingChange(
        'flashcard',
        'delete',
        '123',
        originalData,
        originalData,
      );

      const changes = getPendingChanges('flashcard');
      expect(changes.length).toBe(1);
      expect(changes[0].operationType).toBe('delete');
    });
  });

  describe('getPendingChanges', () => {
    it('should return all pending changes when no filter is provided', () => {
      trackPendingChange('note', 'create', 'temp_1', {id: 'temp_1'});
      trackPendingChange('flashcard', 'create', 'temp_2', {id: 'temp_2'});

      const allChanges = getPendingChanges();
      expect(allChanges.length).toBe(2);
    });

    it('should filter by entity type', () => {
      trackPendingChange('note', 'create', 'temp_1', {id: 'temp_1'});
      trackPendingChange('flashcard', 'create', 'temp_2', {id: 'temp_2'});

      const noteChanges = getPendingChanges('note');
      const flashcardChanges = getPendingChanges('flashcard');

      expect(noteChanges.length).toBe(1);
      expect(flashcardChanges.length).toBe(1);
      expect(noteChanges[0].entityType).toBe('note');
      expect(flashcardChanges[0].entityType).toBe('flashcard');
    });
  });

  describe('hasPendingChanges', () => {
    it('should return false when no pending changes', () => {
      expect(hasPendingChanges()).toBe(false);
    });

    it('should return true when there are pending changes', () => {
      trackPendingChange('note', 'create', 'temp_1', {id: 'temp_1'});
      expect(hasPendingChanges()).toBe(true);
    });

    it('should filter by entity type', () => {
      trackPendingChange('note', 'create', 'temp_1', {id: 'temp_1'});

      expect(hasPendingChanges('note')).toBe(true);
      expect(hasPendingChanges('flashcard')).toBe(false);
    });
  });

  describe('confirmChange', () => {
    it('should remove the pending change after confirmation', () => {
      const changeId = trackPendingChange(
        'note',
        'update',
        '123',
        {id: '123', title: 'Updated'},
      );

      expect(hasPendingChanges()).toBe(true);

      confirmChange(changeId);

      expect(hasPendingChanges()).toBe(false);
    });

    it('should not throw for non-existent change ID', () => {
      expect(() => confirmChange('non_existent')).not.toThrow();
    });
  });

  describe('rollbackChange', () => {
    let toastMock: jest.Mock;

    beforeEach(() => {
      toastMock = jest.fn();
      setToastCallback(toastMock);
    });

    it('should remove the pending change after rollback', () => {
      const changeId = trackPendingChange(
        'note',
        'create',
        'temp_123',
        {id: 'temp_123', title: 'Test'},
      );

      expect(hasPendingChanges()).toBe(true);

      rollbackChange(changeId);

      expect(hasPendingChanges()).toBe(false);
    });

    it('should call toast callback on rollback', () => {
      const changeId = trackPendingChange(
        'note',
        'create',
        'temp_123',
        {id: 'temp_123', title: 'Test'},
      );

      rollbackChange(changeId, 'Custom error message');

      expect(toastMock).toHaveBeenCalledWith(
        'Custom error message',
        'error',
      );
    });

    it('should use default error message if none provided', () => {
      const changeId = trackPendingChange(
        'note',
        'create',
        'temp_123',
        {id: 'temp_123', title: 'Test'},
      );

      rollbackChange(changeId);

      expect(toastMock).toHaveBeenCalledWith(
        expect.stringContaining('Failed to create'),
        'error',
      );
    });

    it('should not throw for non-existent change ID', () => {
      expect(() => rollbackChange('non_existent')).not.toThrow();
    });
  });

  describe('clearAllPendingChanges', () => {
    it('should clear all pending changes', () => {
      trackPendingChange('note', 'create', 'temp_1', {id: 'temp_1'});
      trackPendingChange('flashcard', 'create', 'temp_2', {id: 'temp_2'});

      expect(hasPendingChanges()).toBe(true);

      clearAllPendingChanges();

      expect(hasPendingChanges()).toBe(false);
      expect(getPendingChanges().length).toBe(0);
    });
  });
});
