# Google Drive API Contract

**Feature**: BrainLog — Personal Learning & Development Tracker
**Date**: 2026-02-03
**Purpose**: Define media file operations for Google Drive API

## Overview

This contract defines operations for storing and retrieving media files (videos, voice notes) using the Google Drive API. Files are stored in the app's private `appDataFolder` which is:
- Isolated from user's main Drive files
- Hidden from Drive UI
- Automatically deleted when user revokes app access
- Not counted against user's quota (per Google's policy for appDataFolder)

## Prerequisites

### OAuth 2.0 Scopes
```typescript
// Required when configuring Google Sign-In
const scopes = [
  'https://www.googleapis.com/auth/drive.appdata', // Access to appDataFolder
  'https://www.googleapis.com/auth/drive.file',    // Access to files created by the app
];
```

### Authentication Setup
```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  scopes: [
    'https://www.googleapis.com/auth/drive.appdata',
    'https://www.googleapis.com/auth/drive.file',
  ],
  webClientId: '[FIREBASE_WEB_CLIENT_ID]',
});
```

### API Client Initialization
```typescript
import { google } from 'googleapis';

const getGoogleDriveClient = async () => {
  const tokens = await GoogleSignin.getTokens();
  const auth = new google.auth.OAuth2();
  auth.setCredentials({
    access_token: tokens.accessToken,
  });

  return google.drive({ version: 'v3', auth });
};
```

---

## File Operations

### 1. Upload Video File

**Requirements** (from FR-012):
- Compress video before upload using react-native-compressor
- Store in appDataFolder
- Return file ID and playback URL

```typescript
interface VideoUploadResult {
  fileId: string;
  webViewLink: string;
  fileSize: number;
  mimeType: string;
}

const uploadVideoToGoogleDrive = async (
  localFilePath: string,
  fileName: string,
  mimeType: string = 'video/mp4',
  onProgress?: (progress: number) => void
): Promise<VideoUploadResult> => {
  const drive = await getGoogleDriveClient();
  const fileStream = RNFS.createReadStream(localFilePath);
  const fileStat = await RNFS.stat(localFilePath);

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: ['appDataFolder'], // Store in app's private folder
      mimeType,
    },
    media: {
      mimeType,
      body: fileStream,
    },
    fields: 'id, webViewLink, size, mimeType',
  }, {
    onUploadProgress: (evt: any) => {
      if (onProgress && evt.bytesRead && fileStat.size) {
        const progress = (evt.bytesRead / fileStat.size) * 100;
        onProgress(progress);
      }
    },
  });

  return {
    fileId: response.data.id!,
    webViewLink: response.data.webViewLink!,
    fileSize: parseInt(response.data.size || '0', 10),
    mimeType: response.data.mimeType!,
  };
};
```

**Example Usage**:
```typescript
import { Video } from 'react-native-compressor';

// Step 1: Compress video
const compressedUri = await Video.compress(
  originalVideoUri,
  {
    compressionMethod: 'auto',
    bitrate: 1000000, // 1 Mbps
  },
  (progress) => {
    console.log('Compression progress:', progress);
  }
);

// Step 2: Upload compressed video
const uploadResult = await uploadVideoToGoogleDrive(
  compressedUri,
  `video_${Date.now()}.mp4`,
  'video/mp4',
  (progress) => {
    console.log('Upload progress:', progress);
  }
);

// Step 3: Store metadata in Firebase
import { getDatabase, ref, push, set } from '@react-native-firebase/database';

const videosRef = ref(getDatabase(), `users/${userId}/videos`);
const newVideoRef = push(videosRef);
await set(newVideoRef, {
  title: 'My Learning Video',
  google_drive_file_id: uploadResult.fileId,
  google_drive_url: uploadResult.webViewLink,
  compressed_size_bytes: uploadResult.fileSize,
  // ... other metadata
});
```

---

### 2. Upload Voice Note File

**Requirements** (from FR-013):
- Upload audio recordings to appDataFolder
- Support various audio formats (m4a, mp3, wav)

```typescript
interface VoiceNoteUploadResult {
  fileId: string;
  webViewLink: string;
  fileSize: number;
  durationSeconds: number;
}

const uploadVoiceNoteToGoogleDrive = async (
  localFilePath: string,
  fileName: string,
  mimeType: string = 'audio/m4a',
  durationSeconds: number
): Promise<VoiceNoteUploadResult> => {
  const drive = await getGoogleDriveClient();
  const fileStream = RNFS.createReadStream(localFilePath);
  const fileStat = await RNFS.stat(localFilePath);

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: ['appDataFolder'],
      mimeType,
    },
    media: {
      mimeType,
      body: fileStream,
    },
    fields: 'id, webViewLink, size',
  });

  return {
    fileId: response.data.id!,
    webViewLink: response.data.webViewLink!,
    fileSize: parseInt(response.data.size || '0', 10),
    durationSeconds,
  };
};
```

---

### 3. Download File (for Offline Playback)

**Requirements**:
- Download media files to device for offline access
- Cache management to prevent storage overflow

```typescript
const downloadFileFromGoogleDrive = async (
  fileId: string,
  localFilePath: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const drive = await getGoogleDriveClient();

  const response = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream' }
  );

  return new Promise((resolve, reject) => {
    const dest = RNFS.createWriteStream(localFilePath);
    let downloadedBytes = 0;
    const totalBytes = parseInt(response.headers['content-length'] || '0', 10);

    response.data
      .on('data', (chunk: Buffer) => {
        downloadedBytes += chunk.length;
        if (onProgress && totalBytes > 0) {
          onProgress((downloadedBytes / totalBytes) * 100);
        }
      })
      .on('end', () => {
        resolve(localFilePath);
      })
      .on('error', (err: Error) => {
        reject(err);
      })
      .pipe(dest);
  });
};
```

**Example Usage**:
```typescript
// Download video for offline playback
const localPath = `${RNFS.DocumentDirectoryPath}/videos/${videoId}.mp4`;
await downloadFileFromGoogleDrive(
  googleDriveFileId,
  localPath,
  (progress) => {
    console.log('Download progress:', progress);
  }
);

// Play from local path
<Video source={{ uri: localPath }} />
```

---

### 4. Delete File

**Requirements** (from FR-000e):
- Delete media files when user deletes content or account
- Permanent deletion (not recoverable)

```typescript
const deleteFileFromGoogleDrive = async (fileId: string): Promise<void> => {
  const drive = await getGoogleDriveClient();
  await drive.files.delete({ fileId });
};
```

**Account Deletion Flow** (from FR-000c, FR-000e):
```typescript
import { getDatabase, ref, get } from '@react-native-firebase/database';

const deleteAllUserMediaFiles = async (userId: string): Promise<void> => {
  // Step 1: Get all video and voice note file IDs from Firebase
  const videosRef = ref(getDatabase(), `users/${userId}/videos`);
  const voiceNotesRef = ref(getDatabase(), `users/${userId}/voice_notes`);
  const videosSnapshot = await get(videosRef);
  const voiceNotesSnapshot = await get(voiceNotesRef);

  const fileIds: string[] = [];

  videosSnapshot.forEach((child) => {
    fileIds.push(child.val().google_drive_file_id);
  });

  voiceNotesSnapshot.forEach((child) => {
    fileIds.push(child.val().google_drive_file_id);
  });

  // Step 2: Delete all files from Google Drive
  await Promise.all(
    fileIds.map((fileId) => deleteFileFromGoogleDrive(fileId))
  );

  // Step 3: Delete Firebase data (done separately in account deletion flow)
};
```

---

### 5. Get File Metadata

**Requirements**:
- Retrieve file size, MIME type, created date without downloading full file

```typescript
interface FileMetadata {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdTime: string;
  modifiedTime: string;
}

const getFileMetadata = async (fileId: string): Promise<FileMetadata> => {
  const drive = await getGoogleDriveClient();

  const response = await drive.files.get({
    fileId,
    fields: 'id, name, mimeType, size, createdTime, modifiedTime',
  });

  return {
    id: response.data.id!,
    name: response.data.name!,
    mimeType: response.data.mimeType!,
    size: parseInt(response.data.size || '0', 10),
    createdTime: response.data.createdTime!,
    modifiedTime: response.data.modifiedTime!,
  };
};
```

---

### 6. List Files in AppDataFolder (for debugging)

```typescript
const listAppDataFiles = async (): Promise<any[]> => {
  const drive = await getGoogleDriveClient();

  const response = await drive.files.list({
    spaces: 'appDataFolder',
    fields: 'files(id, name, mimeType, size, createdTime)',
    pageSize: 100,
  });

  return response.data.files || [];
};
```

---

## Storage Quota Management

### Check Available Space
```typescript
const getStorageQuota = async (): Promise<{ usage: number; limit: number }> => {
  const drive = await getGoogleDriveClient();

  const response = await drive.about.get({
    fields: 'storageQuota',
  });

  return {
    usage: parseInt(response.data.storageQuota?.usage || '0', 10),
    limit: parseInt(response.data.storageQuota?.limit || '0', 10),
  };
};
```

### Handle Quota Exceeded
```typescript
const uploadWithQuotaCheck = async (
  localFilePath: string,
  fileName: string,
  mimeType: string
): Promise<VideoUploadResult> => {
  const fileStat = await RNFS.stat(localFilePath);
  const quota = await getStorageQuota();

  if (quota.usage + fileStat.size > quota.limit) {
    throw new Error('Google Drive storage quota exceeded. Please free up space in your Google Drive.');
  }

  return uploadVideoToGoogleDrive(localFilePath, fileName, mimeType);
};
```

---

## Error Handling

### Common Error Scenarios

```typescript
const handleGoogleDriveError = (error: any) => {
  if (error.code === 401 || error.code === 403) {
    // Authentication/authorization error
    // User needs to re-authenticate or grant permissions
    throw new Error('Please sign in again to continue uploading files.');
  } else if (error.code === 404) {
    // File not found
    throw new Error('File not found in Google Drive.');
  } else if (error.code === 429) {
    // Rate limit exceeded
    throw new Error('Too many requests. Please try again in a few minutes.');
  } else if (error.code === 500 || error.code === 503) {
    // Google Drive server error
    throw new Error('Google Drive is temporarily unavailable. Please try again later.');
  } else if (error.message?.includes('storage quota')) {
    // Quota exceeded
    throw new Error('Google Drive storage quota exceeded. Please free up space.');
  } else {
    // Generic error
    throw new Error('Failed to upload file to Google Drive. Please try again.');
  }
};

// Usage
try {
  await uploadVideoToGoogleDrive(filePath, fileName, mimeType);
} catch (error) {
  handleGoogleDriveError(error);
}
```

---

## Token Refresh Strategy

**Requirements**:
- OAuth tokens expire after 1 hour
- Automatically refresh tokens when expired

```typescript
const getValidAccessToken = async (): Promise<string> => {
  try {
    const tokens = await GoogleSignin.getTokens();
    return tokens.accessToken;
  } catch (error) {
    // Token expired, refresh it
    try {
      await GoogleSignin.signInSilently();
      const tokens = await GoogleSignin.getTokens();
      return tokens.accessToken;
    } catch (refreshError) {
      // Refresh failed, user needs to sign in again
      throw new Error('Session expired. Please sign in again.');
    }
  }
};

// Use before each API call
const drive = await getGoogleDriveClient(); // Automatically uses refreshed token
```

---

## Performance Optimization

### Chunked Upload for Large Files
```typescript
const uploadLargeVideo = async (
  localFilePath: string,
  fileName: string,
  onProgress?: (progress: number) => void
): Promise<VideoUploadResult> => {
  const drive = await getGoogleDriveClient();
  const fileStat = await RNFS.stat(localFilePath);
  const chunkSize = 5 * 1024 * 1024; // 5 MB chunks

  // Step 1: Create resumable upload session
  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: ['appDataFolder'],
      mimeType: 'video/mp4',
    },
    media: {
      mimeType: 'video/mp4',
      body: RNFS.createReadStream(localFilePath),
    },
    uploadType: 'resumable',
    fields: 'id, webViewLink, size',
  });

  // Progress tracked automatically through onUploadProgress
  return {
    fileId: response.data.id!,
    webViewLink: response.data.webViewLink!,
    fileSize: parseInt(response.data.size || '0', 10),
    mimeType: 'video/mp4',
  };
};
```

---

## Testing Strategy

### Mock Google Drive API for Tests
```typescript
// __mocks__/googleapis.ts
export const google = {
  drive: jest.fn(() => ({
    files: {
      create: jest.fn().mockResolvedValue({
        data: {
          id: 'mock-file-id',
          webViewLink: 'https://drive.google.com/file/d/mock-file-id/view',
          size: '1024',
          mimeType: 'video/mp4',
        },
      }),
      delete: jest.fn().mockResolvedValue({}),
      get: jest.fn().mockResolvedValue({
        data: {
          id: 'mock-file-id',
          name: 'test-video.mp4',
          mimeType: 'video/mp4',
          size: '1024',
          createdTime: '2026-02-03T12:00:00Z',
          modifiedTime: '2026-02-03T12:00:00Z',
        },
      }),
    },
  })),
  auth: {
    OAuth2: jest.fn(() => ({
      setCredentials: jest.fn(),
    })),
  },
};
```

---

## Security Considerations

1. **File Privacy**:
   - All files stored in `appDataFolder` are private to the app
   - Not visible in user's Drive UI
   - Automatically deleted when app access revoked

2. **Access Control**:
   - Only authenticated users can access their own files
   - File IDs stored in Firebase are user-scoped
   - Cannot access files from other users

3. **Data Deletion** (from FR-000e):
   - Account deletion permanently removes all media files
   - No recovery mechanism (as per spec requirement)
   - User warned with confirmation dialog before deletion

---

**Next Steps**: Proceed to quickstart.md generation (development environment setup guide).
