/**
 * Bookmark Detail Screen
 * View and manage individual bookmarks
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, Linking, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import * as bookmarkService from '../../services/firebase/bookmarkService';
import type { Bookmark } from '../../models/Bookmark';

const BookmarkDetailScreen = ({ route, navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { id } = route.params;
  const [bookmark, setBookmark] = useState<Bookmark | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadBookmark = useCallback(async () => {
    setIsLoading(true);
    try {
      const loaded = await bookmarkService.getBookmarkById(id);
      setBookmark(loaded);
    } catch (error) {
      console.error('Error loading bookmark:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBookmark();
  }, [loadBookmark]);

  const handleOpenURL = useCallback(async () => {
    if (bookmark?.url) {
      try {
        await Linking.openURL(bookmark.url);
      } catch {
        Alert.alert('Error', 'Could not open URL');
      }
    }
  }, [bookmark]);

  const handleDelete = useCallback(async () => {
    Alert.alert('Delete Bookmark', 'Are you sure you want to delete this bookmark?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await bookmarkService.deleteBookmark(id);
            navigation.goBack();
          } catch {
            Alert.alert('Error', 'Failed to delete bookmark');
          }
        },
      },
    ]);
  }, [id, navigation]);

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

  if (!bookmark) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f9fafb',
        }}>
        <Text style={{ fontSize: 16, color: '#6b7280' }}>Bookmark not found</Text>
      </View>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return 'play-circle';
      case 'article':
        return 'document-text';
      case 'course':
        return 'school';
      case 'documentation':
        return 'book';
      default:
        return 'link';
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f9fafb' }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>
      <View style={{ paddingHorizontal: 16, paddingTop: insets.top + 12, paddingBottom: 12 }}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Icon name="chevron-back" size={24} color="#3b82f6" />
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#3b82f6', marginLeft: 4 }}>
            Back
          </Text>
        </Pressable>

        {/* Header Card */}
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: '#dbeafe',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}>
              <Icon name={getTypeIcon(bookmark.type)} size={24} color="#1e40af" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                testID="bookmarkDetail_text_title"
                style={{ fontSize: 18, fontWeight: '700', color: '#1f2937', marginBottom: 4 }}>
                {bookmark.title}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: '#9ca3af',
                    textTransform: 'capitalize',
                  }}>
                  {bookmark.type}
                </Text>
                <Text style={{ fontSize: 12, color: '#d1d5db', marginHorizontal: 6 }}>•</Text>
                <Text style={{ fontSize: 12, color: '#9ca3af' }}>
                  {new Date(bookmark.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>

          {/* URL */}
          <Pressable
            testID="bookmarkDetail_button_openUrl"
            onPress={handleOpenURL}
            style={{
              backgroundColor: '#f3f4f6',
              padding: 12,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Icon name="open-outline" size={16} color="#3b82f6" style={{ marginRight: 8 }} />
            <Text
              testID="bookmarkDetail_text_url"
              style={{ fontSize: 13, color: '#3b82f6', flex: 1 }}
              numberOfLines={1}>
              {bookmark.url}
            </Text>
            <Icon name="chevron-forward" size={16} color="#3b82f6" />
          </Pressable>
        </View>

        {/* Tags */}
        {bookmark.tags.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>
              Tags
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {bookmark.tags.map(tag => (
                <View
                  key={tag}
                  style={{
                    backgroundColor: '#dbeafe',
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 6,
                  }}>
                  <Text style={{ fontSize: 12, fontWeight: '500', color: '#1e40af' }}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Notes */}
        {bookmark.notes && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>
              Notes
            </Text>
            <View
              style={{
                backgroundColor: '#fff',
                padding: 12,
                borderRadius: 8,
                borderLeftWidth: 4,
                borderLeftColor: '#3b82f6',
              }}>
              <Text style={{ fontSize: 13, color: '#4b5563', lineHeight: 20 }}>
                {bookmark.notes}
              </Text>
            </View>
          </View>
        )}

        {/* Metadata */}
        <View
          style={{ backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#6b7280', marginBottom: 8 }}>
            Details
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ fontSize: 12, color: '#9ca3af' }}>Type</Text>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: '#1f2937',
                textTransform: 'capitalize',
              }}>
              {bookmark.type}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 12, color: '#9ca3af' }}>Saved</Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#1f2937' }}>
              {new Date(bookmark.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <Pressable
          testID="bookmarkDetail_button_delete"
          onPress={handleDelete}
          style={{
            backgroundColor: '#fee2e2',
            paddingVertical: 12,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
          }}>
          <Icon name="trash-outline" size={18} color="#dc2626" style={{ marginRight: 8 }} />
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#dc2626' }}>Delete Bookmark</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default BookmarkDetailScreen;
