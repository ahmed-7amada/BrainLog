/**
 * Create Memorize Item Screen
 * Add new items to the memorize system (FR-045, FR-049)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import * as memorizeService from '../../services/firebase/memorizeService';
import type { MemorizeItem } from '../../models/MemorizeItem';

const CreateMemorizeItemScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [contentSummary, setContentSummary] = useState('');
  const [type, setType] = useState<MemorizeItem['type']>('concept');
  const [tags, setTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const typeOptions: { value: MemorizeItem['type']; label: string; icon: string; color: string }[] =
    [
      { value: 'concept', label: 'Concept', icon: 'bulb', color: '#f59e0b' },
      { value: 'note', label: 'Note', icon: 'document-text', color: '#3b82f6' },
      { value: 'vocabulary', label: 'Vocabulary', icon: 'language', color: '#10b981' },
    ];

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!contentSummary.trim()) {
      Alert.alert('Error', 'Please enter content summary');
      return;
    }

    setIsSaving(true);
    try {
      const tagArray = tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      await memorizeService.createMemorizeItem(
        title.trim(),
        contentSummary.trim(),
        type,
        undefined,
        undefined,
        tagArray.length > 0 ? tagArray : undefined,
      );

      Alert.alert('Success', 'Item added to memorize list', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error creating memorize item:', error);
      Alert.alert('Error', 'Failed to save item');
    } finally {
      setIsSaving(false);
    }
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
          <Icon name="chevron-back" size={24} color="#3b82f6" />
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#3b82f6', marginLeft: 4 }}>
            Cancel
          </Text>
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#1f2937' }}>Add to Memorize</Text>
        <Pressable onPress={handleSave} disabled={isSaving}>
          <Text
            style={{ fontSize: 16, fontWeight: '600', color: isSaving ? '#9ca3af' : '#3b82f6' }}>
            {isSaving ? 'Saving...' : 'Save'}
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* Type Selection */}
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>
            Type
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
            {typeOptions.map(option => (
              <Pressable
                key={option.value}
                onPress={() => setType(option.value)}
                style={{
                  flex: 1,
                  backgroundColor: type === option.value ? `${option.color}20` : '#fff',
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: type === option.value ? option.color : '#e5e7eb',
                }}>
                <Icon
                  name={option.icon}
                  size={24}
                  color={type === option.value ? option.color : '#9ca3af'}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: type === option.value ? option.color : '#6b7280',
                    marginTop: 6,
                  }}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Title */}
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>
            Title *
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="What do you want to remember?"
            placeholderTextColor="#9ca3af"
            style={{
              backgroundColor: '#fff',
              borderRadius: 8,
              padding: 14,
              fontSize: 16,
              color: '#1f2937',
              marginBottom: 20,
            }}
          />

          {/* Content Summary */}
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>
            Content Summary *
          </Text>
          <TextInput
            testID="createMemorize_input_content"
            value={contentSummary}
            onChangeText={setContentSummary}
            placeholder="Write a summary of what you want to memorize..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={6}
            style={{
              backgroundColor: '#fff',
              borderRadius: 8,
              padding: 14,
              fontSize: 16,
              color: '#1f2937',
              minHeight: 150,
              textAlignVertical: 'top',
              marginBottom: 20,
            }}
          />

          {/* Tags */}
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>
            Tags
          </Text>
          <TextInput
            testID="createMemorize_input_category"
            value={tags}
            onChangeText={setTags}
            placeholder="react, hooks, state (comma separated)"
            placeholderTextColor="#9ca3af"
            style={{
              backgroundColor: '#fff',
              borderRadius: 8,
              padding: 14,
              fontSize: 16,
              color: '#1f2937',
              marginBottom: 20,
            }}
          />

          {/* Info Card */}
          <View style={{ backgroundColor: '#dbeafe', borderRadius: 12, padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Icon name="information-circle" size={20} color="#1e40af" />
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#1e40af', marginLeft: 8 }}>
                How it works
              </Text>
            </View>
            <Text style={{ fontSize: 13, color: '#1e40af', lineHeight: 20 }}>
              Items you add will be reviewed using the SM-2 spaced repetition algorithm. You'll see
              them at increasing intervals as you remember them better. Rate your recall honestly to
              optimize your learning schedule.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save Button (fixed at bottom) */}
      <View style={{ padding: 16, paddingBottom: insets.bottom + 16 }}>
        <Pressable
          testID="createMemorize_button_save"
          onPress={handleSave}
          disabled={isSaving || !title.trim() || !contentSummary.trim()}
          style={{
            backgroundColor:
              isSaving || !title.trim() || !contentSummary.trim() ? '#9ca3af' : '#3b82f6',
            paddingVertical: 16,
            borderRadius: 8,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Icon name="layers" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
            {isSaving ? 'Adding...' : 'Add to Memorize'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default CreateMemorizeItemScreen;
