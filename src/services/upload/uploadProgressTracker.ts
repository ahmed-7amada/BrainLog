/**
 * Upload Progress Tracker
 * XHR-based file upload with progress events (FR-009)
 */

export interface UploadOptions {
  url: string;
  filePath: string;
  fileName: string;
  mimeType: string;
  onProgress?: (progress: number) => void;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  fileId?: string;
  error?: string;
}

// Minimum progress update interval (ms)
const PROGRESS_THROTTLE_MS = 100;

/**
 * Upload a file with progress tracking using XMLHttpRequest
 */
export const uploadFile = async (options: UploadOptions): Promise<UploadResult> => {
  const { url, filePath, fileName, mimeType, onProgress, headers = {}, timeout = 60000 } = options;

  return new Promise(resolve => {
    const xhr = new XMLHttpRequest();
    let lastProgressUpdate = 0;

    // Set up progress tracking
    if (onProgress) {
      xhr.upload.onprogress = (event: ProgressEvent) => {
        if (event.lengthComputable) {
          const now = Date.now();
          // Throttle progress updates
          if (now - lastProgressUpdate >= PROGRESS_THROTTLE_MS) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
            lastProgressUpdate = now;
          }
        }
      };
    }

    // Handle completion
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({
            success: true,
            url: response.webViewLink || response.webContentLink || response.alternateLink,
            fileId: response.id,
          });
        } catch {
          // For non-JSON responses, just mark as success
          resolve({
            success: true,
            url: undefined,
            fileId: undefined,
          });
        }
      } else {
        resolve({
          success: false,
          error: `Upload failed with status ${xhr.status}: ${xhr.statusText}`,
        });
      }
    };

    // Handle errors
    xhr.onerror = () => {
      resolve({
        success: false,
        error: 'Network error during upload',
      });
    };

    xhr.ontimeout = () => {
      resolve({
        success: false,
        error: 'Upload timed out',
      });
    };

    xhr.onabort = () => {
      resolve({
        success: false,
        error: 'Upload cancelled',
      });
    };

    // Configure and send request
    xhr.open('POST', url);
    xhr.timeout = timeout;

    // Set headers
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    // Create form data with file
    const formData = new FormData();

    // In React Native, we need to pass the file differently
    // The file path needs to be converted to a blob-like object
    const fileObject = {
      uri: filePath,
      type: mimeType,
      name: fileName,
    };

    formData.append('file', fileObject as any);
    formData.append('name', fileName);

    xhr.send(formData);
  });
};

/**
 * Upload file with resumable upload support (for Google Drive)
 * This creates a resumable upload session first, then uploads the file using RNFS.uploadFiles
 */
export const uploadFileResumable = async (
  options: UploadOptions & {
    accessToken: string;
  },
): Promise<UploadResult> => {
  const { url, filePath, fileName, mimeType, onProgress, accessToken } = options;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const RNFS = require('react-native-fs');
    const cleanPath = filePath.replace(/^file:\/\//, '');

    // Step 1: Get file size
    const fileStats = await RNFS.stat(cleanPath);
    const fileSize = fileStats.size;

    // Step 2: Create resumable upload session
    // Add fields parameter to get URL in response
    const urlWithFields = `${url}&fields=id,webViewLink,webContentLink`;
    const sessionResponse = await fetch(urlWithFields, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': mimeType,
        'X-Upload-Content-Length': fileSize.toString(),
      },
      body: JSON.stringify({
        name: fileName,
        mimeType,
      }),
    });

    if (!sessionResponse.ok) {
      const errorText = await sessionResponse.text();
      return {
        success: false,
        error: `Failed to create upload session: ${sessionResponse.status} - ${errorText}`,
      };
    }

    const uploadUrl = sessionResponse.headers.get('Location');

    if (!uploadUrl) {
      return {
        success: false,
        error: 'No upload URL returned from session creation',
      };
    }

    // Step 3: Upload file content using RNFS.uploadFiles
    // Report initial progress
    if (onProgress) {
      onProgress(0);
    }

    const uploadResult = await new Promise<{ statusCode: number; body: string }>(
      (resolve, reject) => {
        const uploadTask = RNFS.uploadFiles({
          toUrl: uploadUrl,
          files: [
            {
              name: 'file',
              filename: fileName,
              filepath: cleanPath,
              filetype: mimeType,
            },
          ],
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': mimeType,
            'Content-Length': fileSize.toString(),
          },
          binaryStreamOnly: true, // Send raw binary without multipart encoding
          begin: (_res: { jobId: number }) => {},
          progress: (res: { totalBytesSent: number; totalBytesExpectedToSend: number }) => {
            if (onProgress && res.totalBytesExpectedToSend > 0) {
              const percent = Math.round((res.totalBytesSent / res.totalBytesExpectedToSend) * 100);
              onProgress(percent);
            }
          },
        });

        uploadTask.promise
          .then((response: { statusCode: number; body: string }) => {
            resolve(response);
          })
          .catch((error: Error) => {
            reject(error);
          });
      },
    );

    if (onProgress) {
      onProgress(100);
    }

    if (uploadResult.statusCode >= 200 && uploadResult.statusCode < 300) {
      try {
        const responseData = JSON.parse(uploadResult.body);

        return {
          success: true,
          url:
            responseData.webViewLink || responseData.webContentLink || responseData.alternateLink,
          fileId: responseData.id,
        };
      } catch {
        return {
          success: true,
          url: undefined,
          fileId: undefined,
        };
      }
    } else {
      return {
        success: false,
        error: `Upload failed: ${uploadResult.statusCode} - ${uploadResult.body}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Create an AbortController for cancellable uploads
 */
export const createUploadController = (): AbortController => {
  return new AbortController();
};

/**
 * Calculate estimated time remaining based on progress
 */
export const calculateETA = (
  bytesUploaded: number,
  totalBytes: number,
  elapsedMs: number,
): number | null => {
  if (bytesUploaded === 0 || elapsedMs === 0) return null;

  const bytesPerMs = bytesUploaded / elapsedMs;
  const bytesRemaining = totalBytes - bytesUploaded;

  return Math.round(bytesRemaining / bytesPerMs);
};

/**
 * Format bytes to human readable string
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

/**
 * Format duration to human readable string
 */
export const formatDuration = (ms: number): string => {
  if (ms < 1000) return 'Less than a second';

  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
};
