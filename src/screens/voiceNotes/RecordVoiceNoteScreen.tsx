/**
 * Record Voice Note Screen
 * Record and save voice notes (FR-013)
 * Integrated with upload queue for background uploads (Feature 003)
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  Alert,
  Animated,
  PermissionsAndroid,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSoundRecorder } from 'react-native-nitro-sound';
import * as voiceNoteService from '../../services/firebase/voiceNoteService';
import { useUploadManager } from '../../hooks/useUploadManager';
import { MiniProgress } from '../../components/common/ProgressIndicator';
import { useToast } from '../../components/common/ToastProvider';

type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';

// Get cache directory path safely - lazy load to avoid initialization errors
const getCacheDirectory = (): string | null => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const RNFS = require('react-native-fs');

    // Priority 1: Cache directory (best for temporary recordings)
    if (RNFS?.CachesDirectoryPath) {
      return RNFS.CachesDirectoryPath;
    }

    // Priority 2: Documents directory (persistent alternative)
    if (RNFS?.DocumentDirectoryPath) {
      return RNFS.DocumentDirectoryPath;
    }

    // Priority 3: External cache (for larger files, no permission needed on API 19+)
    if (RNFS?.ExternalCachesDirectoryPath) {
      return RNFS.ExternalCachesDirectoryPath;
    }

    // Priority 4: Temporary directory
    if (RNFS?.TemporaryDirectoryPath) {
      return RNFS.TemporaryDirectoryPath;
    }
  } catch (error) {
    console.warn('react-native-fs not available:', error instanceof Error ? error.message : error);
  }

  // Return null to let the audio library choose its own path
  // This is safer than using a hardcoded path that might not exist
  return null;
};

// Verify write access to a directory before recording (FR-004)
const verifyWriteAccess = async (directory: string): Promise<boolean> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const RNFS = require('react-native-fs');
    if (!RNFS?.writeFile) {
      // RNFS not available, skip verification and let the recorder handle it
      console.warn('react-native-fs not available for write verification, proceeding anyway');
      return true;
    }
    const testFile = `${directory}/.write_test_${Date.now()}`;
    await RNFS.writeFile(testFile, 'test', 'utf8');
    await RNFS.unlink(testFile);
    return true;
  } catch (error) {
    console.warn('Write access verification failed:', error);
    // If RNFS fails, still try recording - the audio library might handle paths differently
    return true;
  }
};

const RecordVoiceNoteScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [recordedPath, setRecordedPath] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState(0);
  const [uploadTaskId, setUploadTaskId] = useState<string | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { uploads } = useUploadManager();
  const { showToast } = useToast();

  // Get current upload progress if we have an active upload
  const currentUpload = uploadTaskId ? uploads.find(u => u.id === uploadTaskId) : null;
  const uploadProgress = currentUpload?.progress ?? 0;

  // Initialize audio recorder
  const { startRecorder, pauseRecorder, resumeRecorder, stopRecorder, dispose } = useSoundRecorder({
    subscriptionDuration: 0.1, // Update every 0.1 seconds (100ms) - value is in seconds!
    onRecord: e => {
      if (e.currentPosition) {
        setDuration(Math.floor(e.currentPosition / 1000));
      }
    },
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispose();
    };
  }, [dispose]);

  useEffect(() => {
    if (recordingState === 'recording') {
      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      // Stop pulse animation
      pulseAnim.setValue(1);
    }
  }, [recordingState, pulseAnim]);

  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'BrainLog needs access to your microphone to record voice notes.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Permission request error:', err);
      return false;
    }
  };

  const handleStartRecording = useCallback(async () => {
    try {
      // Request microphone permission first
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Microphone permission is required to record voice notes. Please enable it in Settings.',
        );
        return;
      }

      // Get cache directory with proper error handling (FR-005, FR-006)
      const directory = getCacheDirectory();

      // Verify write access before recording (FR-004) - skip if no directory
      if (directory) {
        const canWrite = await verifyWriteAccess(directory);
        if (!canWrite) {
          console.warn('Write access verification failed for directory:', directory);
          // Don't block - let the recorder try anyway
        }
      }

      // Generate unique filename
      const filename = `voicenote_${Date.now()}.m4a`;
      // If no directory, pass undefined to let the audio library choose its default path
      const path = directory ? `${directory}/${filename}` : undefined;

      const actualPath = await startRecorder(
        path,
        {
          AudioEncodingBitRate: 128000,
          AudioSamplingRate: 44100,
          AudioChannels: 2,
        },
        true,
      );

      setRecordingState('recording');
      setDuration(0);
      setRecordedPath(actualPath || path || null);
    } catch (error) {
      console.error('Error starting recording:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      Alert.alert('Recording Error', `Failed to start recording: ${errorMessage}`);
    }
  }, [startRecorder]);

  const handleStopRecording = useCallback(async () => {
    try {
      const result = await stopRecorder();
      setRecordedPath(result);
      setRecordingState('stopped');

      // Get file size for upload tracking
      if (result) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const RNFS = require('react-native-fs');
          // Strip file:// prefix for RNFS operations
          const filePath = result.replace(/^file:\/\//, '');
          const stats = await RNFS.stat(filePath);
          setFileSize(stats.size || 0);
        } catch (statError) {
          console.warn('Could not get file stats:', statError);
          // Estimate based on duration (128kbps * duration)
          setFileSize(Math.round((128000 / 8) * duration));
        }
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      setRecordingState('stopped');
    }
  }, [stopRecorder, duration]);

  const handlePauseRecording = useCallback(async () => {
    try {
      await pauseRecorder();
      setRecordingState('paused');
    } catch (error) {
      console.error('Error pausing recording:', error);
    }
  }, [pauseRecorder]);

  const handleResumeRecording = useCallback(async () => {
    try {
      await resumeRecorder();
      setRecordingState('recording');
    } catch (error) {
      console.error('Error resuming recording:', error);
    }
  }, [resumeRecorder]);

  const handleDiscard = useCallback(() => {
    Alert.alert('Discard Recording', 'Are you sure you want to discard this recording?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: async () => {
          try {
            await stopRecorder();
          } catch {
            // Ignore if already stopped
          }
          setRecordingState('idle');
          setDuration(0);
          setRecordedPath(null);
        },
      },
    ]);
  }, [stopRecorder]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!recordedPath) {
      Alert.alert('Error', 'No recording found');
      return;
    }

    setIsSaving(true);
    try {
      const tagArray = tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      // Create voice note with background upload (Feature 003)
      const result = await voiceNoteService.createVoiceNoteWithUpload(
        title.trim(),
        duration,
        recordedPath,
        fileSize,
        undefined,
        undefined,
        tagArray.length > 0 ? tagArray : undefined,
      );

      setUploadTaskId(result.uploadTaskId);
      showToast('Voice note saved. Uploading in background...', 'success');

      // Navigate back - upload continues in background
      navigation.goBack();
    } catch (error) {
      console.error('Error saving voice note:', error);
      Alert.alert('Error', 'Failed to save voice note');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb', paddingTop: insets.top }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View collapsable={false}>
            <Icon name="chevron-back" size={24} color="#3b82f6" />
          </View>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#3b82f6', marginLeft: 4 }}>
            Cancel
          </Text>
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#1f2937' }}>Record</Text>
        <View style={{ width: 70 }} />
      </View>

      <View style={{ flex: 1, padding: 16 }}>
        {/* Recording Area */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {/* Waveform Visualization (Placeholder) */}
          {recordingState !== 'idle' && (
            <View
              style={{
                flexDirection: 'row',
                height: 80,
                alignItems: 'center',
                marginBottom: 32,
                gap: 3,
              }}>
              {Array.from({ length: 40 }).map((_, index) => (
                <Animated.View
                  key={index}
                  style={{
                    width: 3,
                    height:
                      recordingState === 'recording'
                        ? 10 + Math.random() * 60
                        : 10 + Math.sin(index * 0.5) * 30,
                    backgroundColor: '#ef4444',
                    borderRadius: 2,
                    opacity: recordingState === 'paused' ? 0.5 : 1,
                  }}
                />
              ))}
            </View>
          )}

          {/* Duration Display */}
          <Text
            testID="recordVoiceNote_text_duration"
            style={{ fontSize: 48, fontWeight: '300', color: '#1f2937', marginBottom: 32 }}>
            {formatDuration(duration)}
          </Text>

          {/* Recording Controls */}
          {recordingState === 'idle' ? (
            <Pressable
              testID="recordVoiceNote_button_record"
              onPress={handleStartRecording}
              style={{
                backgroundColor: '#ef4444',
                width: 80,
                height: 80,
                borderRadius: 40,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <View collapsable={false}>
                <Icon name="mic" size={36} color="#fff" />
              </View>
            </Pressable>
          ) : recordingState === 'recording' ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24 }}>
              <Pressable
                onPress={handlePauseRecording}
                style={{
                  backgroundColor: '#f59e0b',
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <View collapsable={false}>
                  <Icon name="pause" size={28} color="#fff" />
                </View>
              </Pressable>

              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Pressable
                  testID="recordVoiceNote_button_stop"
                  onPress={handleStopRecording}
                  style={{
                    backgroundColor: '#ef4444',
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <View
                    style={{ backgroundColor: '#fff', width: 24, height: 24, borderRadius: 4 }}
                  />
                </Pressable>
              </Animated.View>

              <View style={{ width: 56, height: 56 }} />
            </View>
          ) : recordingState === 'paused' ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24 }}>
              <Pressable
                onPress={handleDiscard}
                style={{
                  backgroundColor: '#e5e7eb',
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <View collapsable={false}>
                  <Icon name="trash" size={28} color="#6b7280" />
                </View>
              </Pressable>

              <Pressable
                onPress={handleResumeRecording}
                style={{
                  backgroundColor: '#ef4444',
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <View>
                  <Icon name="mic" size={36} color="#fff" />
                </View>
              </Pressable>

              <Pressable
                onPress={handleStopRecording}
                style={{
                  backgroundColor: '#10b981',
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <View collapsable={false}>
                  <Icon name="checkmark" size={28} color="#fff" />
                </View>
              </Pressable>
            </View>
          ) : null}

          {/* Status Text */}
          <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 16 }}>
            {recordingState === 'idle'
              ? 'Tap to start recording'
              : recordingState === 'recording'
              ? 'Recording...'
              : recordingState === 'paused'
              ? 'Paused'
              : 'Recording stopped'}
          </Text>
        </View>

        {/* Save Form (shown after recording stops) */}
        {recordingState === 'stopped' && (
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>
              Title *
            </Text>
            <TextInput
              testID="recordVoiceNote_input_title"
              value={title}
              onChangeText={setTitle}
              placeholder="Enter voice note title"
              placeholderTextColor="#9ca3af"
              style={{
                backgroundColor: '#f9fafb',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                color: '#1f2937',
                marginBottom: 16,
              }}
            />

            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>
              Tags
            </Text>
            <TextInput
              value={tags}
              onChangeText={setTags}
              placeholder="meeting, idea, reminder (comma separated)"
              placeholderTextColor="#9ca3af"
              style={{
                backgroundColor: '#f9fafb',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                color: '#1f2937',
                marginBottom: 16,
              }}
            />

            {/* Upload Progress Indicator */}
            {currentUpload && currentUpload.status === 'uploading' && (
              <View style={{ marginBottom: 16 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                  }}>
                  <Text style={{ fontSize: 12, color: '#6b7280' }}>Uploading...</Text>
                  <Text style={{ fontSize: 12, color: '#6b7280' }}>
                    {Math.round(uploadProgress)}%
                  </Text>
                </View>
                <MiniProgress progress={uploadProgress} color="#3b82f6" />
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={handleDiscard}
                style={{
                  flex: 1,
                  backgroundColor: '#f3f4f6',
                  paddingVertical: 14,
                  borderRadius: 8,
                  alignItems: 'center',
                }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#6b7280' }}>Discard</Text>
              </Pressable>

              <Pressable
                testID="recordVoiceNote_button_save"
                onPress={handleSave}
                disabled={isSaving || !title.trim()}
                style={{
                  flex: 1,
                  backgroundColor: isSaving || !title.trim() ? '#9ca3af' : '#3b82f6',
                  paddingVertical: 14,
                  borderRadius: 8,
                  alignItems: 'center',
                }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default RecordVoiceNoteScreen;
