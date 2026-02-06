/**
 * Habit Definition Model
 * Represents a daily habit the user wants to track (FR-024, FR-028)
 */

export interface HabitDefinition {
  id: string;
  userId: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: number;
}

export interface CreateHabitInput {
  userId: string;
  name: string;
  displayOrder?: number;
}

export const createHabitDefinition = (input: CreateHabitInput): HabitDefinition => ({
  id: generateId(),
  ...input,
  displayOrder: input.displayOrder || 0,
  isActive: true,
  createdAt: Date.now(),
});

const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
