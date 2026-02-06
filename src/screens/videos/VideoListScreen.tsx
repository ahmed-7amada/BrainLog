/**
 * Video List Screen
 * Display and manage uploaded learning videos (FR-012)
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import * as videoService from '../../services/firebase/videoService';
import type { Video } from '../../models/Video';

const VideoListScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadVideos = useCallback(async () => {
    setIsLoading(true);
    try {
      const loaded = await videoService.getAllVideos();
      setVideos(loaded.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredVideos(
        videos.filter(v => {
          const title = typeof v.title === 'string' ? v.title : '';
          const description = typeof v.description === 'string' ? v.description : '';
          return title.toLowerCase().includes(query) || description.toLowerCase().includes(query);
        }),
      );
    } else {
      setFilteredVideos(videos);
    }
  }, [videos, searchQuery]);

  const handleDelete = useCallback(
    async (id: string) => {
      Alert.alert('Delete Video', 'Are you sure you want to delete this video?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await videoService.deleteVideo(id);
              setVideos(videos.filter(v => v.id !== id));
            } catch {
              Alert.alert('Error', 'Failed to delete video');
            }
          },
        },
      ]);
    },
    [videos],
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderVideo = ({ item }: { item: Video }) => {
    const hasDuration = typeof item.durationSeconds === 'number' && item.durationSeconds > 0;
    const hasResolution = typeof item.resolution === 'string' && item.resolution.length > 0;
    const hasSize = typeof item.compressedSizeBytes === 'number' && item.compressedSizeBytes > 0;

    return (
      <Pressable
        onPress={() => navigation.navigate('VideoDetail', { id: item.id })}
        style={{
          backgroundColor: '#fff',
          padding: 12,
          marginBottom: 8,
          borderRadius: 8,
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View
            style={{
              width: 80,
              height: 60,
              backgroundColor: '#1f2937',
              borderRadius: 6,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
            }}>
            <View>
              <Icon name="play-circle" size={28} color="#fff" />
            </View>
            {hasDuration ? (
              <View
                style={{
                  position: 'absolute',
                  bottom: 4,
                  right: 4,
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  paddingHorizontal: 4,
                  paddingVertical: 1,
                  borderRadius: 2,
                }}>
                <Text style={{ fontSize: 10, color: '#fff' }}>
                  {formatDuration(item.durationSeconds)}
                </Text>
              </View>
            ) : null}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 4 }}>
              {typeof item.title === 'string' ? item.title : 'Untitled'}
            </Text>
            <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }} numberOfLines={2}>
              {typeof item.description === 'string' ? item.description : ''}
            </Text>
            {hasResolution || hasSize ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {hasResolution ? (
                  <Text style={{ fontSize: 10, color: '#9ca3af', marginRight: 8 }}>
                    {item.resolution}
                  </Text>
                ) : null}
                {hasSize ? (
                  <Text style={{ fontSize: 10, color: '#9ca3af' }}>
                    {formatFileSize(item.compressedSizeBytes)}
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>
          <Pressable onPress={() => handleDelete(item.id)} style={{ paddingLeft: 8 }}>
            <View>
              <Icon name="trash-outline" size={18} color="#ef4444" />
            </View>
          </Pressable>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb', paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 12 }}>
          Videos
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#fff',
            borderRadius: 8,
            paddingHorizontal: 12,
            marginBottom: 12,
          }}>
          <View>
            <Icon name="search" size={18} color="#9ca3af" />
          </View>
          <TextInput
            placeholder="Search videos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 8, fontSize: 14 }}
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : filteredVideos.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 32,
          }}>
          <View style={{ marginBottom: 12 }}>
            <Icon name="videocam-outline" size={48} color="#d1d5db" />
          </View>
          <Text
            testID="videoList_text_empty"
            style={{ fontSize: 16, fontWeight: '600', color: '#6b7280', textAlign: 'center' }}>
            No videos yet
          </Text>
          <Text style={{ fontSize: 14, color: '#9ca3af', marginTop: 6, textAlign: 'center' }}>
            Upload learning videos to watch later
          </Text>
        </View>
      ) : (
        <FlatList
          testID="videoList_list_videos"
          data={filteredVideos}
          renderItem={renderVideo}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        />
      )}

      <Pressable
        testID="videoList_button_upload"
        onPress={() => navigation.navigate('UploadVideo')}
        style={{
          position: 'absolute',
          bottom: 16 + insets.bottom,
          right: 16,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#3b82f6',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}>
        <View>
          <Icon name="cloud-upload" size={24} color="#fff" />
        </View>
      </Pressable>
    </View>
  );
};

export default VideoListScreen;
