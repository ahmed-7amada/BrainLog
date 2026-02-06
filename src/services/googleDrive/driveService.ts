/**
 * Google Drive Service
 * Manages file operations on Google Drive (FR-017, T411)
 * Per contracts/google-drive-api.md
 */

import { getGoogleTokens } from '../firebase/authService';

const GOOGLE_DRIVE_API_URL = 'https://www.googleapis.com/drive/v3/files';

/**
 * Delete a file from Google Drive
 */
export const deleteFile = async (fileId: string): Promise<boolean> => {
  const tokens = await getGoogleTokens();
  if (!tokens?.accessToken) {
    console.warn('No access token available for Google Drive');
    return false;
  }

  try {
    const response = await fetch(`${GOOGLE_DRIVE_API_URL}/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });

    // 204 = successfully deleted, 404 = already deleted
    return response.status === 204 || response.status === 404;
  } catch (error) {
    console.error(`Failed to delete Google Drive file ${fileId}:`, error);
    return false;
  }
};

/**
 * Delete multiple files from Google Drive
 */
export const deleteFiles = async (
  fileIds: string[],
): Promise<{ success: number; failed: number }> => {
  let success = 0;
  let failed = 0;

  // Process deletions sequentially to avoid rate limiting
  for (const fileId of fileIds) {
    const deleted = await deleteFile(fileId);
    if (deleted) {
      success++;
    } else {
      failed++;
    }
  }

  return { success, failed };
};

/**
 * Delete all user files from Google Drive (T411)
 * Used during account deletion to clean up media files
 */
export const deleteAllUserFiles = async (): Promise<{ success: number; failed: number }> => {
  const tokens = await getGoogleTokens();
  if (!tokens?.accessToken) {
    console.warn('No access token available for Google Drive cleanup');
    return { success: 0, failed: 0 };
  }

  try {
    // List all files in appDataFolder that belong to this app
    const listResponse = await fetch(
      `${GOOGLE_DRIVE_API_URL}?spaces=appDataFolder&fields=files(id,name)`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      },
    );

    if (!listResponse.ok) {
      console.warn('Failed to list Google Drive files for deletion');
      return { success: 0, failed: 0 };
    }

    const data = await listResponse.json();
    const files = data.files || [];

    if (files.length === 0) {
      return { success: 0, failed: 0 };
    }

    // Delete all files
    const fileIds = files.map((file: { id: string }) => file.id);
    return await deleteFiles(fileIds);
  } catch (error) {
    console.error('Failed to delete all user files from Google Drive:', error);
    return { success: 0, failed: 0 };
  }
};

export default {
  deleteFile,
  deleteFiles,
  deleteAllUserFiles,
};
