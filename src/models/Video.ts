/**
 * Video Model
 * Represents uploaded or recorded learning video with quality metadata
 */

export interface Video {
  id: string;
  user_id: string;
  title: string;
  description?: string;

  // External storage reference (Google Drive)
  google_drive_file_id: string;
  google_drive_url: string;

  // Quality information
  resolution: string; // e.g., "1920x1080"
  bitrate: number; // bits per second
  format: string; // e.g., "mp4"
  duration_seconds: number;

  // Size information
  original_size_bytes: number;
  compressed_size_bytes: number;

  tags: string[];
  created_at: number; // Timestamp
}

export interface VideoCompressionOptions {
  quality: 'low' | 'medium' | 'high';
  maxWidth?: number;
  maxHeight?: number;
  bitrate?: number;
}
