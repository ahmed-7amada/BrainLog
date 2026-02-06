/**
 * Bookmark List Screen
 * Display all saved bookmarks with filtering and search
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import * as bookmarkService from '../../services/firebase/bookmarkService';
import type { Bookmark, BookmarkType } from '../../models/Bookmark';

const BookmarkListScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<BookmarkType | 'all'>('all');

  const bookmarkTypes: (BookmarkType | 'all')[] = [
    'all',
    'video',
    'article',
    'course',
    'documentation',
    'other',
  ];

  const loadBookmarks = useCallback(async () => {
    setIsLoading(true);
    try {
      const loaded = await bookmarkService.getAllBookmarks();
      setBookmarks(loaded.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  useEffect(() => {
    let filtered = bookmarks;

    if (selectedType !== 'all') {
      filtered = filtered.filter(b => b.type === selectedType);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        b =>
          b.title.toLowerCase().includes(query) ||
          b.url.toLowerCase().includes(query) ||
          (b.notes && b.notes.toLowerCase().includes(query)),
      );
    }

    setFilteredBookmarks(filtered);
  }, [bookmarks, searchQuery, selectedType]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await bookmarkService.deleteBookmark(id);
        setBookmarks(bookmarks.filter(b => b.id !== id));
      } catch (error) {
        console.error('Error deleting bookmark:', error);
      }
    },
    [bookmarks],
  );

  const getTypeIcon = (type: BookmarkType) => {
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

  const renderBookmark = ({ item }: { item: Bookmark }) => (
    <Pressable
      onPress={() => navigation.navigate('BookmarkDetail', { id: item.id })}
      style={{
        backgroundColor: '#fff',
        padding: 12,
        marginBottom: 8,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#3b82f6',
      }}>
      <View
        style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Icon name={getTypeIcon(item.type)} size={16} color="#666" style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', flex: 1 }}>
              {item.title}
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }} numberOfLines={1}>
            {item.url}
          </Text>
          {item.tags.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
              {item.tags.map(tag => (
                <View
                  key={tag}
                  style={{
                    backgroundColor: '#dbeafe',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 4,
                  }}>
                  <Text style={{ fontSize: 10, color: '#1e40af' }}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <Pressable onPress={() => handleDelete(item.id)} style={{ paddingLeft: 8 }}>
          <Icon name="trash-outline" size={18} color="#ef4444" />
        </Pressable>
      </View>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb', paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 12 }}>
          Bookmarks
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
          <Icon name="search" size={18} color="#9ca3af" />
          <TextInput
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, paddingVertical: 8, paddingHorizontal: 8, fontSize: 14 }}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          {bookmarkTypes.map(type => (
            <Pressable
              key={type}
              onPress={() => setSelectedType(type)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                marginRight: 8,
                backgroundColor: selectedType === type ? '#3b82f6' : '#e5e7eb',
              }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '500',
                  color: selectedType === type ? '#fff' : '#6b7280',
                  textTransform: 'capitalize',
                }}>
                {type}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : filteredBookmarks.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 32,
          }}>
          <Icon name="bookmark-outline" size={48} color="#d1d5db" style={{ marginBottom: 12 }} />
          <Text
            testID="bookmarkList_text_empty"
            style={{ fontSize: 16, fontWeight: '600', color: '#6b7280', textAlign: 'center' }}>
            No bookmarks yet
          </Text>
          <Text style={{ fontSize: 14, color: '#9ca3af', marginTop: 6, textAlign: 'center' }}>
            Start saving useful links and articles
          </Text>
        </View>
      ) : (
        <FlatList
          testID="bookmarkList_list_bookmarks"
          data={filteredBookmarks}
          renderItem={renderBookmark}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          scrollIndicatorInsets={{ right: 1 }}
        />
      )}

      <Pressable
        testID="bookmarkList_button_create"
        onPress={() => navigation.navigate('CreateBookmark')}
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
        <Icon name="add" size={24} color="#fff" />
      </Pressable>
    </View>
  );
};

export default BookmarkListScreen;
