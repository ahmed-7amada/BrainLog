/**
 * Tag Model
 * Represents a category label that can be applied across all content types
 */

export interface Tag {
  id: string;
  user_id: string;
  name: string; // Unique tag name (key)
  count: number; // Total items with this tag
  last_used_at: number; // Timestamp
}
