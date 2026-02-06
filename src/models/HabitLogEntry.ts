/**
 * Habit Log Entry Model
 * Represents daily habit completion status (FR-025, FR-026)
 */

export interface HabitLogEntry {
  id: string;
  userId: string;
  dateKey: string; // YYYY-MM-DD
  habitCompletions: Record<string, boolean>; // habitId -> completed
  createdAt: number;
  updatedAt: number;
}

export interface CreateHabitLogEntryInput {
  userId: string;
  dateKey: string;
  habitCompletions?: Record<string, boolean>;
}

export const createHabitLogEntry = (input: CreateHabitLogEntryInput): HabitLogEntry => ({
  id: generateId(),
  ...input,
  habitCompletions: input.habitCompletions || {},
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
