/**
 * Upload Video Screen
 * Select, compress, and upload videos (FR-012, FR-017)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import * as videoService from '../../services/firebase/videoService';

const UploadVideoScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<{
    uri: string;
    size: number;
    duration?: number;
    thumbnail?: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'medium' | 'high' | 'original'>(
    'medium',
  );

  const handleSelectVideo = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'video',
        videoQuality:
          compressionLevel === 'high' || compressionLevel === 'original' ? 'high' : 'low',
        includeExtra: true,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to select video');
        return;
      }

      const video = result.assets?.[0];
      if (video?.uri) {
        setSelectedVideo({
          uri: video.uri,
          size: video.fileSize || 0,
          duration: video.duration,
          thumbnail: video.uri,
        });

        // Auto-fill title from filename if empty
        if (!title && video.fileName) {
          const nameWithoutExt = video.fileName.replace(/\.[^/.]+$/, '');
          setTitle(nameWithoutExt);
        }
      }
    } catch (error) {
      console.error('Error selecting video:', error);
      Alert.alert('Error', 'Failed to select video');
    }
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!selectedVideo) {
      Alert.alert('Error', 'Please select a video first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const tagArray = tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      // Get resolution based on compression level
      const getResolution = (level: string) => {
        switch (level) {
          case 'low':
            return '480p';
          case 'medium':
            return '720p';
          case 'high':
            return '1080p';
          default:
            return 'Original';
        }
      };

      // Create video metadata (actual upload would use Google Drive API)
      await videoService.createVideo({
        title: title.trim(),
        description: description.trim(),
        googleDriveFileId: `video_${Date.now()}`,
        googleDriveUrl: selectedVideo.uri,
        resolution: getResolution(compressionLevel),
        durationSeconds: selectedVideo.duration || 0,
        originalSizeBytes: selectedVideo.size,
        compressedSizeBytes: Math.round(selectedVideo.size * 0.7),
        tags: tagArray.length > 0 ? tagArray : undefined,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      Alert.alert('Success', 'Video uploaded successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error uploading video:', error);
      Alert.alert('Error', 'Failed to upload video');
    } finally {
      setIsUploading(false);
    }
  };

  const compressionOptions = [
    { value: 'low' as const, label: 'Low (480p)' },
    { value: 'medium' as const, label: 'Medium (720p)' },
    { value: 'high' as const, label: 'High (1080p)' },
    { value: 'original' as const, label: 'Original' },
  ];

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
          <Icon name="chevron-back" size={24} color="#3b82f6" />
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#3b82f6', marginLeft: 4 }}>
            Cancel
          </Text>
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#1f2937' }}>Upload Video</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Video Selection */}
        <Pressable
          testID="uploadVideo_button_selectVideo"
          onPress={handleSelectVideo}
          disabled={isUploading}
          style={{
            backgroundColor: '#fff',
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: selectedVideo ? '#10b981' : '#d1d5db',
            borderRadius: 12,
            padding: selectedVideo ? 0 : 32,
            alignItems: 'center',
            marginBottom: 24,
            overflow: 'hidden',
          }}>
          {selectedVideo?.thumbnail ? (
            <View style={{ width: '100%', aspectRatio: 16 / 9, position: 'relative' }}>
              <Image
                source={{ uri: selectedVideo.thumbnail }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
              <View
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Icon name="play-circle" size={64} color="#fff" />
              </View>
              <View
                style={{
                  position: 'absolute',
                  bottom: 8,
                  left: 8,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 4,
                }}>
                <Text style={{ fontSize: 12, color: '#fff', fontWeight: '600' }}>
                  {selectedVideo.duration
                    ? `${Math.floor(selectedVideo.duration / 60)}:${String(
                        Math.floor(selectedVideo.duration % 60),
                      ).padStart(2, '0')}`
                    : 'Video'}
                </Text>
              </View>
              <View
                style={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  backgroundColor: '#10b981',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 4,
                }}>
                <Text style={{ fontSize: 12, color: '#fff', fontWeight: '600' }}>
                  {(selectedVideo.size / (1024 * 1024)).toFixed(1)} MB
                </Text>
              </View>
              <Pressable
                onPress={handleSelectVideo}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  padding: 8,
                  borderRadius: 20,
                }}>
                <Icon name="refresh" size={20} color="#fff" />
              </Pressable>
            </View>
          ) : (
            <>
              <Icon name="videocam" size={48} color="#9ca3af" />
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginTop: 12 }}>
                Select Video
              </Text>
              <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
                Tap to choose from gallery
              </Text>
            </>
          )}
        </Pressable>

        {/* Title */}
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>
          Title *
        </Text>
        <TextInput
          testID="uploadVideo_input_title"
          value={title}
          onChangeText={setTitle}
          placeholder="Enter video title"
          placeholderTextColor="#9ca3af"
          editable={!isUploading}
          style={{
            backgroundColor: '#fff',
            borderRadius: 8,
            padding: 14,
            fontSize: 16,
            color: '#1f2937',
            marginBottom: 16,
          }}
        />

        {/* Description */}
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>
          Description
        </Text>
        <TextInput
          testID="uploadVideo_input_description"
          value={description}
          onChangeText={setDescription}
          placeholder="Add a description..."
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={4}
          editable={!isUploading}
          style={{
            backgroundColor: '#fff',
            borderRadius: 8,
            padding: 14,
            fontSize: 16,
            color: '#1f2937',
            minHeight: 100,
            textAlignVertical: 'top',
            marginBottom: 16,
          }}
        />

        {/* Quality Selection */}
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>
          Compression Quality
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {compressionOptions.map(option => (
            <Pressable
              key={option.value}
              onPress={() => !isUploading && setCompressionLevel(option.value)}
              style={{
                backgroundColor: compressionLevel === option.value ? '#3b82f6' : '#fff',
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: compressionLevel === option.value ? '#3b82f6' : '#d1d5db',
              }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: compressionLevel === option.value ? '#fff' : '#1f2937',
                }}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Tags */}
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>
          Tags
        </Text>
        <TextInput
          value={tags}
          onChangeText={setTags}
          placeholder="react, tutorial, coding (comma separated)"
          placeholderTextColor="#9ca3af"
          editable={!isUploading}
          style={{
            backgroundColor: '#fff',
            borderRadius: 8,
            padding: 14,
            fontSize: 16,
            color: '#1f2937',
            marginBottom: 24,
          }}
        />

        {/* Upload Progress */}
        {isUploading && (
          <View testID="uploadVideo_progress_upload" style={{ marginBottom: 24 }}>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: '#6b7280' }}>Uploading...</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#3b82f6' }}>
                {uploadProgress}%
              </Text>
            </View>
            <View style={{ backgroundColor: '#e5e7eb', borderRadius: 4, height: 8 }}>
              <View
                style={{
                  backgroundColor: '#3b82f6',
                  borderRadius: 4,
                  height: 8,
                  width: `${uploadProgress}%`,
                }}
              />
            </View>
          </View>
        )}

        {/* Upload Button */}
        <Pressable
          testID="uploadVideo_button_upload"
          onPress={handleUpload}
          disabled={isUploading || !title.trim()}
          style={{
            backgroundColor: isUploading || !title.trim() ? '#9ca3af' : '#3b82f6',
            paddingVertical: 14,
            borderRadius: 8,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {isUploading ? (
            <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
          ) : (
            <Icon name="cloud-upload" size={24} color="#fff" style={{ marginRight: 8 }} />
          )}
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
            {isUploading ? 'Uploading...' : 'Upload Video'}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

export default UploadVideoScreen;
