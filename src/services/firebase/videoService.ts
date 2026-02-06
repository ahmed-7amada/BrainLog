/**
 * Video Service
 * Firebase integration for video management (FR-012, FR-017)
 */

import {
  getCurrentUserId,
  getDatabase,
  ref,
  get,
  set,
  update,
  remove,
} from '../../config/firebase';
import type { Video, CreateVideoInput } from '../../models/Video';

/**
 * Create video metadata entry
 */
export const createVideo = async (input: CreateVideoInput): Promise<Video> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const id = `video_${Date.now()}`;
  const video: Video = {
    id,
    userId,
    title: input.title,
    description: input.description,
    googleDriveFileId: input.googleDriveFileId,
    googleDriveUrl: input.googleDriveUrl,
    resolution: input.resolution,
    bitrate: input.bitrate,
    format: input.format,
    durationSeconds: input.durationSeconds,
    originalSizeBytes: input.originalSizeBytes,
    compressedSizeBytes: input.compressedSizeBytes,
    tags: input.tags || [],
    createdAt: Date.now(),
  };

  const videoRef = ref(getDatabase(), `users/${userId}/videos/${id}`);
  await set(videoRef, video);
  return video;
};

/**
 * Get all videos for current user
 */
export const getAllVideos = async (): Promise<Video[]> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const videosRef = ref(getDatabase(), `users/${userId}/videos`);
  const snapshot = await get(videosRef);
  if (!snapshot.exists()) return [];

  const data = snapshot.val();
  return Object.values(data) as Video[];
};

/**
 * Get video by ID
 */
export const getVideoById = async (id: string): Promise<Video | null> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const videoRef = ref(getDatabase(), `users/${userId}/videos/${id}`);
  const snapshot = await get(videoRef);
  return snapshot.exists() ? (snapshot.val() as Video) : null;
};

/**
 * Update video metadata
 */
export const updateVideo = async (id: string, updates: Partial<Video>): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const videoRef = ref(getDatabase(), `users/${userId}/videos/${id}`);
  await update(videoRef, updates);
};

/**
 * Delete video
 */
export const deleteVideo = async (id: string): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const videoRef = ref(getDatabase(), `users/${userId}/videos/${id}`);
  await remove(videoRef);
};

/**
 * Get videos by tag
 */
export const getVideosByTag = async (tag: string): Promise<Video[]> => {
  const videos = await getAllVideos();
  return videos.filter(v => v.tags.includes(tag));
};

/**
 * Search videos
 */
export const searchVideos = async (searchQuery: string): Promise<Video[]> => {
  const videos = await getAllVideos();
  const lowerQuery = searchQuery.toLowerCase();
  return videos.filter(
    v =>
      v.title.toLowerCase().includes(lowerQuery) ||
      (v.description?.toLowerCase().includes(lowerQuery) ?? false),
  );
};
