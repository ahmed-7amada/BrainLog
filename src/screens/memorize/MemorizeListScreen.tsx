/**
 * Memorize List Screen
 * Display all memorize items for spaced repetition review (FR-045)
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import * as memorizeService from '../../services/firebase/memorizeService';
import type { MemorizeItem } from '../../models/MemorizeItem';

const MemorizeListScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<MemorizeItem[]>([]);
  const [dueItems, setDueItems] = useState<MemorizeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [masteryPercentage, setMasteryPercentage] = useState(0);

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const [allItems, due, mastery] = await Promise.all([
        memorizeService.getAllMemorizeItems(),
        memorizeService.getDueMemorizeItems(),
        memorizeService.getMasteryPercentage(),
      ]);
      setItems(allItems.sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate)));
      setDueItems(due);
      setMasteryPercentage(mastery);
    } catch (error) {
      console.error('Error loading memorize items:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleDelete = useCallback(
    async (id: string) => {
      Alert.alert('Delete Item', 'Are you sure you want to delete this memorize item?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await memorizeService.deleteMemorizeItem(id);
              setItems(items.filter(item => item.id !== id));
            } catch {
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]);
    },
    [items],
  );

  const getTypeIcon = (type: MemorizeItem['type']) => {
    switch (type) {
      case 'note':
        return 'document-text';
      case 'concept':
        return 'bulb';
      case 'vocabulary':
        return 'language';
      default:
        return 'cube';
    }
  };

  const getTypeColor = (type: MemorizeItem['type']) => {
    switch (type) {
      case 'note':
        return '#3b82f6';
      case 'concept':
        return '#f59e0b';
      case 'vocabulary':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const renderItem = ({ item }: { item: MemorizeItem }) => {
    const today = new Date().toISOString().split('T')[0];
    const isDue = item.nextReviewDate <= today;
    return (
      <Pressable
        onPress={() => navigation.navigate('MemorizeDetail', { id: item.id })}
        style={{
          backgroundColor: '#fff',
          padding: 12,
          marginBottom: 8,
          borderRadius: 8,
          borderLeftWidth: 4,
          borderLeftColor: isDue ? '#ef4444' : getTypeColor(item.type),
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: `${getTypeColor(item.type)}20`,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 10,
            }}>
            <Icon name={getTypeIcon(item.type)} size={18} color={getTypeColor(item.type)} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 2 }}>
              {item.title}
            </Text>
            <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }} numberOfLines={1}>
              {item.contentSummary}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 10, color: '#9ca3af', textTransform: 'capitalize' }}>
                {item.type}
              </Text>
              {isDue && (
                <View
                  style={{
                    backgroundColor: '#fee2e2',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 4,
                  }}>
                  <Text style={{ fontSize: 10, color: '#dc2626' }}>Due</Text>
                </View>
              )}
              {item.interval >= 30 && (
                <View
                  style={{
                    backgroundColor: '#dcfce7',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 4,
                  }}>
                  <Text style={{ fontSize: 10, color: '#16a34a' }}>Mastered</Text>
                </View>
              )}
            </View>
          </View>
          <Pressable onPress={() => handleDelete(item.id)} style={{ paddingLeft: 8 }}>
            <Icon name="trash-outline" size={16} color="#ef4444" />
          </Pressable>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb', paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 12 }}>
          Memorize
        </Text>

        {/* Stats Row */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <View style={{ flex: 1, backgroundColor: '#fff', padding: 12, borderRadius: 8 }}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: '#ef4444' }}>
              {dueItems.length}
            </Text>
            <Text style={{ fontSize: 12, color: '#6b7280' }}>Due Today</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#fff', padding: 12, borderRadius: 8 }}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: '#10b981' }}>
              {masteryPercentage}%
            </Text>
            <Text style={{ fontSize: 12, color: '#6b7280' }}>Mastered</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#fff', padding: 12, borderRadius: 8 }}>
            <Text style={{ fontSize: 24, fontWeight: '700', color: '#3b82f6' }}>
              {items.length}
            </Text>
            <Text style={{ fontSize: 12, color: '#6b7280' }}>Total</Text>
          </View>
        </View>

        {/* Start Review Button */}
        {dueItems.length > 0 && (
          <Pressable
            testID="memorizeList_button_startReview"
            onPress={() => navigation.navigate('MemorizeReview')}
            style={{
              backgroundColor: '#3b82f6',
              paddingVertical: 14,
              borderRadius: 8,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
            }}>
            <Icon name="play" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
              Review {dueItems.length} Items
            </Text>
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : items.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 32,
          }}>
          <Icon name="layers-outline" size={48} color="#d1d5db" style={{ marginBottom: 12 }} />
          <Text
            testID="memorizeList_text_empty"
            style={{ fontSize: 16, fontWeight: '600', color: '#6b7280', textAlign: 'center' }}>
            No memorize items yet
          </Text>
          <Text style={{ fontSize: 14, color: '#9ca3af', marginTop: 6, textAlign: 'center' }}>
            Add items to memorize from your notes or create new ones
          </Text>
        </View>
      ) : (
        <FlatList
          testID="memorizeList_list_items"
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        />
      )}

      <Pressable
        testID="memorizeList_button_create"
        onPress={() => navigation.navigate('CreateMemorizeItem')}
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

export default MemorizeListScreen;
