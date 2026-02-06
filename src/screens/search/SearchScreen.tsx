/**
 * Search Screen
 * Unified search across all content types (FR-014, FR-015, FR-016)
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import debounce from 'lodash/debounce';
import * as searchService from '../../services/search/searchService';
import type { SearchResult, ContentType } from '../../services/search/searchService';

const CONTENT_TYPE_CONFIG: Record<ContentType, { icon: string; color: string; label: string }> = {
  flashcard: { icon: 'albums', color: '#3b82f6', label: 'Flashcard' },
  note: { icon: 'document-text', color: '#10b981', label: 'Note' },
  bookmark: { icon: 'bookmark', color: '#f59e0b', label: 'Bookmark' },
  video: { icon: 'videocam', color: '#ef4444', label: 'Video' },
  voiceNote: { icon: 'mic', color: '#8b5cf6', label: 'Voice Note' },
  memorize: { icon: 'layers', color: '#06b6d4', label: 'Memorize' },
};

const SearchScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<ContentType[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Ref to track the latest selectedTypes for debounced callback
  const selectedTypesRef = useRef(selectedTypes);
  selectedTypesRef.current = selectedTypes;

  // Debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
          setResults([]);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        try {
          const types = selectedTypesRef.current;
          const searchResults = await searchService.searchAllContent(searchQuery, {
            contentTypes: types.length > 0 ? types : undefined,
            limit: 50,
          });
          setResults(searchResults);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsLoading(false);
        }
      }, 300),
    [],
  );

  useEffect(() => {
    debouncedSearch(query);
    return () => debouncedSearch.cancel();
  }, [query, selectedTypes, debouncedSearch]);

  const toggleTypeFilter = (type: ContentType) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type],
    );
  };

  const handleResultPress = (result: SearchResult) => {
    // Save to recent searches
    if (query && !recentSearches.includes(query)) {
      setRecentSearches(prev => [query, ...prev.slice(0, 9)]);
    }

    // Navigate based on content type (navigate through Main to nested screens)
    switch (result.type) {
      case 'flashcard':
        navigation.navigate('Main', {
          screen: 'Flashcards',
          params: { screen: 'FlashcardDetail', params: { flashcardId: result.id } },
        });
        break;
      case 'note':
        navigation.navigate('Main', {
          screen: 'Notes',
          params: { screen: 'NoteDetail', params: { noteId: result.id } },
        });
        break;
      case 'bookmark':
        navigation.navigate('Main', {
          screen: 'Notes',
          params: { screen: 'BookmarkDetail', params: { id: result.id } },
        });
        break;
      case 'video':
        navigation.navigate('Main', {
          screen: 'Notes',
          params: { screen: 'VideoDetail', params: { id: result.id } },
        });
        break;
      case 'voiceNote':
        navigation.navigate('Main', {
          screen: 'Notes',
          params: { screen: 'VoiceNoteDetail', params: { id: result.id } },
        });
        break;
      case 'memorize':
        navigation.navigate('Main', {
          screen: 'Profile',
          params: { screen: 'MemorizeDetail', params: { id: result.id } },
        });
        break;
    }
  };

  const renderResult = ({ item }: { item: SearchResult }) => {
    const config = CONTENT_TYPE_CONFIG[item.type];

    return (
      <Pressable
        onPress={() => handleResultPress(item)}
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
            width: 40,
            height: 40,
            borderRadius: 8,
            backgroundColor: `${config.color}20`,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
          }}>
          <Icon name={config.icon} size={20} color={config.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937' }} numberOfLines={1}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }} numberOfLines={1}>
              {item.subtitle}
            </Text>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 }}>
            <View
              style={{
                backgroundColor: `${config.color}20`,
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
              }}>
              <Text style={{ fontSize: 10, color: config.color, fontWeight: '600' }}>
                {config.label}
              </Text>
            </View>
            {item.tags.slice(0, 2).map((tag, idx) => (
              <View
                key={idx}
                style={{
                  backgroundColor: '#f3f4f6',
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                }}>
                <Text style={{ fontSize: 10, color: '#6b7280' }}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
        <Icon name="chevron-forward" size={20} color="#d1d5db" />
      </Pressable>
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#f9fafb', paddingTop: insets.top }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Pressable onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
            <Icon name="arrow-back" size={24} color="#1f2937" />
          </Pressable>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#fff',
              borderRadius: 8,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderColor: '#e5e7eb',
            }}>
            <Icon name="search" size={20} color="#9ca3af" />
            <TextInput
              testID="search_input_query"
              value={query}
              onChangeText={setQuery}
              placeholder="Search all content..."
              placeholderTextColor="#9ca3af"
              autoFocus
              style={{
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 8,
                fontSize: 16,
                color: '#1f2937',
              }}
            />
            {query.length > 0 && (
              <Pressable testID="search_button_clear" onPress={() => setQuery('')}>
                <Icon name="close-circle" size={20} color="#9ca3af" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Type Filters */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {(Object.keys(CONTENT_TYPE_CONFIG) as ContentType[]).map(type => {
            const config = CONTENT_TYPE_CONFIG[type];
            const isSelected = selectedTypes.includes(type);
            return (
              <Pressable
                key={type}
                onPress={() => toggleTypeFilter(type)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: isSelected ? `${config.color}20` : '#fff',
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: isSelected ? config.color : '#e5e7eb',
                }}>
                <Icon name={config.icon} size={14} color={isSelected ? config.color : '#6b7280'} />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '500',
                    color: isSelected ? config.color : '#6b7280',
                    marginLeft: 4,
                  }}>
                  {config.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Results */}
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : query.length === 0 ? (
        <View style={{ flex: 1, paddingHorizontal: 16 }}>
          {recentSearches.length > 0 && (
            <View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 12 }}>
                Recent Searches
              </Text>
              {recentSearches.map((search, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => setQuery(search)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: '#f3f4f6',
                  }}>
                  <Icon name="time-outline" size={18} color="#9ca3af" />
                  <Text style={{ fontSize: 14, color: '#6b7280', marginLeft: 10 }}>{search}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {recentSearches.length === 0 && (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Icon name="search-outline" size={48} color="#d1d5db" />
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#6b7280', marginTop: 12 }}>
                Search your content
              </Text>
              <Text style={{ fontSize: 14, color: '#9ca3af', marginTop: 4, textAlign: 'center' }}>
                Find flashcards, notes, bookmarks, and more
              </Text>
            </View>
          )}
        </View>
      ) : results.length === 0 ? (
        <View
          testID="search_text_empty"
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 32,
          }}>
          <Icon name="document-outline" size={48} color="#d1d5db" />
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#6b7280', marginTop: 12 }}>
            No results found
          </Text>
          <Text style={{ fontSize: 14, color: '#9ca3af', marginTop: 4, textAlign: 'center' }}>
            Try a different search term or adjust your filters
          </Text>
        </View>
      ) : (
        <FlatList
          testID="search_list_results"
          data={results}
          renderItem={renderResult}
          keyExtractor={item => `${item.type}-${item.id}`}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 16 }}
          ListHeaderComponent={
            <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
              {results.length} result{results.length !== 1 ? 's' : ''} found
            </Text>
          }
        />
      )}
    </KeyboardAvoidingView>
  );
};

export default SearchScreen;
