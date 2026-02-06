/**
 * Tag Model
 * Represents a category label applied across all content types (FR-014, FR-015)
 */

export interface Tag {
  id: string;
  userId: string;
  name: string;
  normalizedName: string; // lowercase version for searching
  usageCount: number; // Total items with this tag
  createdAt: number;
}

export interface CreateTagInput {
  userId: string;
  name: string;
}

export const createTag = (input: CreateTagInput): Tag => ({
  id: generateId(),
  ...input,
  normalizedName: input.name.toLowerCase().trim(),
  usageCount: 1,
  createdAt: Date.now(),
});

const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
