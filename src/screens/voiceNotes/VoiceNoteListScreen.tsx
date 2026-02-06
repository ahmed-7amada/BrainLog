/**
 * Voice Note List Screen
 * Display and manage voice recordings (FR-013)
 * Includes real-time sync and pull-to-refresh support (FR-001, FR-002, FR-003)
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import * as voiceNoteService from '../../services/firebase/voiceNoteService';
import { useStore } from '../../store';
import { useRealtimeSync } from '../../hooks/useRealtimeSync';
import { RefreshableList } from '../../components/common/RefreshableList';
import type { VoiceNote } from '../../models/VoiceNote';

const VoiceNoteListScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const userId = useStore(state => state.user?.id ?? null);

  // Set up real-time sync for voice notes
  useRealtimeSync(userId, {
    entities: ['voiceNotes'],
    showConflictToast: true,
  });

  const loadVoiceNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const loaded = await voiceNoteService.getAllVoiceNotes();
      setVoiceNotes(loaded.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
      console.error('Error loading voice notes:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVoiceNotes();
  }, [loadVoiceNotes]);

  const handleDelete = useCallback(
    async (id: string) => {
      Alert.alert('Delete Voice Note', 'Are you sure you want to delete this voice note?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await voiceNoteService.deleteVoiceNote(id);
              setVoiceNotes(voiceNotes.filter(vn => vn.id !== id));
            } catch {
              Alert.alert('Error', 'Failed to delete voice note');
            }
          },
        },
      ]);
    },
    [voiceNotes],
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAttachmentLabel = (attachmentType?: VoiceNote['attachmentType']) => {
    if (!attachmentType) return 'Standalone';
    switch (attachmentType) {
      case 'flashcard':
        return 'Flashcard';
      case 'note':
        return 'Note';
      case 'dailyLog':
        return 'Daily Log';
      case 'standalone':
        return 'Standalone';
      default:
        return 'Standalone';
    }
  };

  const renderVoiceNote = ({ item }: { item: VoiceNote }) => (
    <Pressable
      onPress={() => navigation.navigate('VoiceNoteDetail', { id: item.id })}
      style={{
        backgroundColor: '#fff',
        padding: 12,
        marginBottom: 8,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: '#fef3c7',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
        }}>
        <Icon name="mic" size={22} color="#f59e0b" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 4 }}>
          {item.title}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="time-outline" size={12} color="#9ca3af" />
            <Text style={{ fontSize: 12, color: '#6b7280', marginLeft: 2 }}>
              {formatDuration(item.durationSeconds)}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: '#f3f4f6',
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
            }}>
            <Text style={{ fontSize: 10, color: '#6b7280' }}>
              {getAttachmentLabel(item.attachmentType)}
            </Text>
          </View>
        </View>
      </View>
      <Pressable onPress={() => handleDelete(item.id)} style={{ paddingLeft: 8 }}>
        <Icon name="trash-outline" size={18} color="#ef4444" />
      </Pressable>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb', paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 12 }}>
          Voice Notes
        </Text>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <RefreshableList
          testID="voiceNoteList_list_notes"
          data={voiceNotes}
          renderItem={renderVoiceNote}
          keyExtractor={item => item.id}
          contentContainerStyle={
            voiceNotes.length === 0
              ? { flexGrow: 1 }
              : { paddingHorizontal: 16, paddingBottom: 100 }
          }
          onRefresh={loadVoiceNotes}
          emptyComponent={
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 32,
              }}>
              <Icon name="mic-outline" size={48} color="#d1d5db" style={{ marginBottom: 12 }} />
              <Text
                testID="voiceNoteList_text_empty"
                style={{ fontSize: 16, fontWeight: '600', color: '#6b7280', textAlign: 'center' }}>
                No voice notes yet
              </Text>
              <Text style={{ fontSize: 14, color: '#9ca3af', marginTop: 6, textAlign: 'center' }}>
                Record voice notes to practice pronunciation
              </Text>
            </View>
          }
        />
      )}

      <Pressable
        testID="voiceNoteList_button_record"
        onPress={() => navigation.navigate('RecordVoiceNote')}
        style={{
          position: 'absolute',
          bottom: 16 + insets.bottom,
          right: 16,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#f59e0b',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}>
        <Icon name="mic" size={24} color="#fff" />
      </Pressable>
    </View>
  );
};

export default VoiceNoteListScreen;
