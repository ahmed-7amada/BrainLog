/**
 * Voice Note Detail Screen
 * Display and playback voice note (FR-013)
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSound } from 'react-native-nitro-sound';
import * as voiceNoteService from '../../services/firebase/voiceNoteService';
import type { VoiceNote } from '../../models/VoiceNote';
import { format } from 'date-fns';

const VoiceNoteDetailScreen = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const { id } = route.params;
  const [voiceNote, setVoiceNote] = useState<VoiceNote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  // Initialize audio player
  const { state, startPlayer, pausePlayer, resumePlayer, stopPlayer, dispose } = useSound({
    subscriptionDuration: 100, // Update every 100ms
    onPlayback: e => {
      setCurrentPosition(e.currentPosition);
      if (e.duration > 0) {
        setAudioDuration(e.duration);
      }
    },
    onPlaybackEnd: () => {
      setCurrentPosition(0);
    },
  });

  const { isPlaying } = state;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPlayer().catch(() => {});
      dispose();
    };
  }, [dispose, stopPlayer]);

  const loadVoiceNote = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await voiceNoteService.getVoiceNoteById(id);
      setVoiceNote(data);
      if (data) {
        setAudioDuration(data.durationSeconds * 1000); // Convert to milliseconds
      }
    } catch (error) {
      console.error('Error loading voice note:', error);
      Alert.alert('Error', 'Failed to load voice note');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadVoiceNote();
  }, [loadVoiceNote]);

  const handleDelete = () => {
    Alert.alert('Delete Voice Note', 'Are you sure you want to delete this voice note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await stopPlayer();
            await voiceNoteService.deleteVoiceNote(id);
            navigation.goBack();
          } catch {
            Alert.alert('Error', 'Failed to delete voice note');
          }
        },
      },
    ]);
  };

  const handlePlayPause = useCallback(async () => {
    // Use Google Drive URL if available, otherwise fall back to local file path
    const audioSource = voiceNote?.googleDriveUrl || voiceNote?.localFilePath;

    if (!audioSource) {
      Alert.alert('Error', 'Audio file not available');
      return;
    }

    try {
      if (isPlaying) {
        await pausePlayer();
      } else if (currentPosition > 0) {
        await resumePlayer();
      } else {
        await startPlayer(audioSource);
      }
    } catch (error) {
      console.error('Playback error:', error);
      Alert.alert('Error', 'Failed to play audio');
    }
  }, [voiceNote, isPlaying, currentPosition, startPlayer, pausePlayer, resumePlayer]);

  const formatDuration = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playbackProgress = audioDuration > 0 ? (currentPosition / audioDuration) * 100 : 0;

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

  if (!voiceNote) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f9fafb',
        }}>
        <Text style={{ fontSize: 16, color: '#6b7280' }}>Voice note not found</Text>
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
        <Pressable testID="voiceNoteDetail_button_delete" onPress={handleDelete}>
          <Icon name="trash-outline" size={24} color="#ef4444" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Player Card */}
        <View
          style={{
            backgroundColor: '#1e40af',
            borderRadius: 16,
            padding: 24,
            marginBottom: 24,
            alignItems: 'center',
          }}>
          {/* Waveform Visualization (Placeholder) */}
          <View
            style={{
              flexDirection: 'row',
              height: 60,
              alignItems: 'center',
              marginBottom: 20,
              gap: 2,
            }}>
            {Array.from({ length: 30 }).map((_, index) => (
              <View
                key={index}
                style={{
                  width: 4,
                  height: 10 + Math.random() * 40,
                  backgroundColor:
                    index / 30 < playbackProgress / 100 ? '#60a5fa' : 'rgba(255, 255, 255, 0.3)',
                  borderRadius: 2,
                }}
              />
            ))}
          </View>

          {/* Progress Bar */}
          <View
            testID="voiceNoteDetail_slider_progress"
            style={{ width: '100%', marginBottom: 12 }}>
            <View
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 4, height: 4 }}>
              <View
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 4,
                  height: 4,
                  width: `${playbackProgress}%`,
                }}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
              <Text style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' }}>
                {formatDuration(currentPosition)}
              </Text>
              <Text style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' }}>
                {formatDuration(audioDuration || voiceNote.durationSeconds * 1000)}
              </Text>
            </View>
          </View>

          {/* Play Button */}
          <Pressable
            testID="voiceNoteDetail_button_play"
            onPress={handlePlayPause}
            style={{
              backgroundColor: '#fff',
              width: 64,
              height: 64,
              borderRadius: 32,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Icon
              name={isPlaying ? 'pause' : 'play'}
              size={32}
              color="#1e40af"
              style={{ marginLeft: isPlaying ? 0 : 4 }}
            />
          </Pressable>
        </View>

        {/* Title */}
        <Text
          testID="voiceNoteDetail_text_title"
          style={{ fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 8 }}>
          {voiceNote.title}
        </Text>

        {/* Metadata */}
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="time-outline" size={18} color="#6b7280" />
              <Text style={{ fontSize: 14, color: '#6b7280', marginLeft: 8 }}>Duration</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937' }}>
              {formatDuration(voiceNote.durationSeconds * 1000)}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="calendar-outline" size={18} color="#6b7280" />
              <Text style={{ fontSize: 14, color: '#6b7280', marginLeft: 8 }}>Recorded</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937' }}>
              {format(voiceNote.createdAt, 'MMM d, yyyy h:mm a')}
            </Text>
          </View>
        </View>

        {/* Attachment Info */}
        {voiceNote.attachmentType && (
          <View
            style={{ backgroundColor: '#dbeafe', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="link" size={18} color="#1e40af" />
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#1e40af', marginLeft: 8 }}>
                Attached to {voiceNote.attachmentType}
              </Text>
            </View>
          </View>
        )}

        {/* Tags */}
        {voiceNote.tags && voiceNote.tags.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>
              Tags
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {voiceNote.tags.map((tag, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: '#f3e8ff',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                  }}>
                  <Text style={{ fontSize: 12, color: '#7c3aed' }}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default VoiceNoteDetailScreen;
