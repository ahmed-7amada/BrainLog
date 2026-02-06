/**
 * Create Bookmark Screen
 * Allow users to save new bookmarks
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import * as bookmarkService from '../../services/firebase/bookmarkService';
import type { BookmarkType } from '../../models/Bookmark';

const CreateBookmarkScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<BookmarkType>('article');
  const [notes, setNotes] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const types: BookmarkType[] = ['video', 'article', 'course', 'documentation', 'other'];

  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  }, [tagInput, tags]);

  const handleRemoveTag = useCallback(
    (tagToRemove: string) => {
      setTags(tags.filter(t => t !== tagToRemove));
    },
    [tags],
  );

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a bookmark title');
      return;
    }
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a URL');
      return;
    }

    setIsLoading(true);
    try {
      await bookmarkService.createBookmark(
        title.trim(),
        url.trim(),
        type,
        tags,
        notes.trim() || undefined,
      );
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save bookmark');
      console.error('Error saving bookmark:', error);
    } finally {
      setIsLoading(false);
    }
  }, [title, url, type, tags, notes, navigation]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f9fafb' }}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 16 }}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Icon name="chevron-back" size={24} color="#3b82f6" />
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#3b82f6', marginLeft: 4 }}>
            Back
          </Text>
        </Pressable>

        <Text style={{ fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 20 }}>
          Save Bookmark
        </Text>

        {/* Title */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 6 }}>
            Title
          </Text>
          <TextInput
            testID="createBookmark_input_title"
            placeholder="Bookmark title"
            value={title}
            onChangeText={setTitle}
            style={{
              backgroundColor: '#fff',
              borderWidth: 1,
              borderColor: '#e5e7eb',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 14,
              color: '#1f2937',
            }}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* URL */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 6 }}>
            URL
          </Text>
          <TextInput
            testID="createBookmark_input_url"
            placeholder="https://example.com"
            value={url}
            onChangeText={setUrl}
            keyboardType="url"
            style={{
              backgroundColor: '#fff',
              borderWidth: 1,
              borderColor: '#e5e7eb',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 14,
              color: '#1f2937',
            }}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Type */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 6 }}>
            Type
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {types.map(t => (
              <Pressable
                key={t}
                onPress={() => setType(t)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 6,
                  borderWidth: 2,
                  borderColor: type === t ? '#3b82f6' : '#e5e7eb',
                  backgroundColor: type === t ? '#dbeafe' : '#fff',
                }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: type === t ? '#1e40af' : '#6b7280',
                    textTransform: 'capitalize',
                  }}>
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Tags */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 6 }}>
            Tags
          </Text>
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <TextInput
              placeholder="Add tag"
              value={tagInput}
              onChangeText={setTagInput}
              style={{
                flex: 1,
                backgroundColor: '#fff',
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                fontSize: 14,
                color: '#1f2937',
                marginRight: 8,
              }}
              placeholderTextColor="#9ca3af"
            />
            <Pressable
              onPress={handleAddTag}
              style={{
                backgroundColor: '#3b82f6',
                paddingHorizontal: 12,
                borderRadius: 8,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Icon name="add" size={20} color="#fff" />
            </Pressable>
          </View>
          {tags.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {tags.map(tag => (
                <View
                  key={tag}
                  style={{
                    backgroundColor: '#dbeafe',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 4,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Text style={{ fontSize: 12, color: '#1e40af', marginRight: 4 }}>{tag}</Text>
                  <Pressable onPress={() => handleRemoveTag(tag)}>
                    <Icon name="close" size={14} color="#1e40af" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Notes */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 6 }}>
            Notes (Optional)
          </Text>
          <TextInput
            testID="createBookmark_input_description"
            placeholder="Add notes about this bookmark..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            style={{
              backgroundColor: '#fff',
              borderWidth: 1,
              borderColor: '#e5e7eb',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 14,
              color: '#1f2937',
              textAlignVertical: 'top',
            }}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Save Button */}
        <Pressable
          testID="createBookmark_button_save"
          onPress={handleSave}
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
            paddingVertical: 12,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>Save Bookmark</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default CreateBookmarkScreen;
