/**
 * Voice Note Model
 * Represents audio recording with attachment information
 */

export interface VoiceNote {
  id: string;
  user_id: string;
  title?: string;
  duration_seconds: number;

  // External storage reference (Google Drive)
  google_drive_file_id: string;
  google_drive_url: string;

  // Attachment information
  attachment_type: VoiceNoteAttachmentType;
  attached_item_id?: string; // ID of flashcard, note, or daily log

  tags: string[];
  created_at: number; // Timestamp
}

export type VoiceNoteAttachmentType = 'flashcard' | 'note' | 'dailyLog' | 'standalone';
