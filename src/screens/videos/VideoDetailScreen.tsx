/**
 * Video Detail Screen
 * Display video information and playback controls (FR-012, FR-017)
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Video, { VideoRef } from 'react-native-video';
import * as videoService from '../../services/firebase/videoService';
import type { Video as VideoType } from '../../models/Video';
import { format } from 'date-fns';

const VideoDetailScreen = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const { id } = route.params;
  const [video, setVideo] = useState<VideoType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<VideoRef>(null);

  const loadVideo = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await videoService.getVideoById(id);
      setVideo(data);
    } catch (error) {
      console.error('Error loading video:', error);
      Alert.alert('Error', 'Failed to load video');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadVideo();
  }, [loadVideo]);

  const handleDelete = () => {
    Alert.alert('Delete Video', 'Are you sure you want to delete this video?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await videoService.deleteVideo(id);
            navigation.goBack();
          } catch {
            Alert.alert('Error', 'Failed to delete video');
          }
        },
      },
    ]);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVideoPress = () => {
    setShowControls(true);
    // Auto-hide controls after 3 seconds
    setTimeout(() => setShowControls(false), 3000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f9fafb',
        }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!video) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f9fafb',
        }}>
        <Text style={{ fontSize: 16, color: '#6b7280' }}>Video not found</Text>
      </View>
    );
  }

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
            Back
          </Text>
        </Pressable>
        <Pressable testID="videoDetail_button_delete" onPress={handleDelete}>
          <Icon name="trash-outline" size={24} color="#ef4444" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Video Player */}
        <Pressable
          testID="videoDetail_player_video"
          onPress={handleVideoPress}
          style={{
            backgroundColor: '#1f2937',
            aspectRatio: 16 / 9,
            borderRadius: 12,
            overflow: 'hidden',
            marginBottom: 16,
          }}>
          {video?.googleDriveUrl ? (
            <>
              <Video
                ref={videoRef}
                source={{ uri: video.googleDriveUrl }}
                style={{ width: '100%', height: '100%' }}
                paused={!isPlaying}
                resizeMode="contain"
                onError={error => {
                  console.error('Video playback error:', error);
                  Alert.alert(
                    'Playback Error',
                    'Unable to play this video. The file may have been moved or deleted.',
                  );
                }}
              />
              {showControls && (
                <Pressable
                  onPress={togglePlayPause}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                  }}>
                  <View
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      padding: 20,
                      borderRadius: 50,
                    }}>
                    <Icon name={isPlaying ? 'pause' : 'play'} size={48} color="#fff" />
                  </View>
                </Pressable>
              )}
            </>
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Icon name="videocam-off" size={48} color="#6b7280" />
              <Text style={{ color: '#6b7280', marginTop: 8 }}>No video source</Text>
            </View>
          )}
        </Pressable>

        {/* Title */}
        <Text
          testID="videoDetail_text_title"
          style={{ fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 8 }}>
          {video.title}
        </Text>

        {/* Description */}
        {video.description && (
          <Text style={{ fontSize: 14, color: '#6b7280', lineHeight: 22, marginBottom: 16 }}>
            {video.description}
          </Text>
        )}

        {/* Metadata */}
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 12 }}>
            Video Info
          </Text>

          {video.resolution && (
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: '#6b7280' }}>Resolution</Text>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#1f2937' }}>
                {video.resolution}
              </Text>
            </View>
          )}

          {video.originalSizeBytes > 0 && (
            <>
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: '#6b7280' }}>Original Size</Text>
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#1f2937' }}>
                  {formatFileSize(video.originalSizeBytes)}
                </Text>
              </View>
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: '#6b7280' }}>Compressed Size</Text>
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#1f2937' }}>
                  {formatFileSize(video.compressedSizeBytes)}
                </Text>
              </View>
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: '#6b7280' }}>Saved</Text>
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#10b981' }}>
                  {Math.round((1 - video.compressedSizeBytes / video.originalSizeBytes) * 100)}%
                </Text>
              </View>
            </>
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 14, color: '#6b7280' }}>Added</Text>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#1f2937' }}>
              {format(video.createdAt, 'MMM d, yyyy')}
            </Text>
          </View>
        </View>

        {/* Tags */}
        {video.tags && video.tags.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>
              Tags
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {video.tags.map((tag, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: '#dbeafe',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                  }}>
                  <Text style={{ fontSize: 12, color: '#1e40af' }}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Play/Pause Button */}
        <Pressable
          testID="videoDetail_button_play"
          onPress={togglePlayPause}
          style={{
            backgroundColor: '#3b82f6',
            paddingVertical: 14,
            borderRadius: 8,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Icon
            name={isPlaying ? 'pause-circle' : 'play-circle'}
            size={24}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
            {isPlaying ? 'Pause Video' : 'Play Video'}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

export default VideoDetailScreen;
