/**
 * Memorize Detail Screen
 * Display memorize item details and review history (FR-045, FR-046)
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import * as memorizeService from '../../services/firebase/memorizeService';
import type { MemorizeItem } from '../../models/MemorizeItem';
import { format } from 'date-fns';

const MemorizeDetailScreen = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const { id } = route.params;
  const [item, setItem] = useState<MemorizeItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadItem = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await memorizeService.getMemorizeItemById(id);
      setItem(data);
    } catch (error) {
      console.error('Error loading memorize item:', error);
      Alert.alert('Error', 'Failed to load item');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  const handleDelete = () => {
    Alert.alert('Delete Item', 'Are you sure you want to delete this memorize item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await memorizeService.deleteMemorizeItem(id);
            navigation.goBack();
          } catch {
            Alert.alert('Error', 'Failed to delete item');
          }
        },
      },
    ]);
  };

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

  const getMasteryLevel = (interval: number): { label: string; color: string } => {
    if (interval >= 30) return { label: 'Mastered', color: '#10b981' };
    if (interval >= 14) return { label: 'Learning', color: '#f59e0b' };
    if (interval >= 1) return { label: 'New', color: '#3b82f6' };
    return { label: 'Due', color: '#ef4444' };
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

  if (!item) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f9fafb',
        }}>
        <Text style={{ fontSize: 16, color: '#6b7280' }}>Item not found</Text>
      </View>
    );
  }

  const mastery = getMasteryLevel(item.interval);
  const today = new Date().toISOString().split('T')[0];
  const isDue = item.nextReviewDate <= today;

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
        <Pressable testID="memorizeDetail_button_delete" onPress={handleDelete}>
          <Icon name="trash-outline" size={24} color="#ef4444" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Type Badge */}
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: `${getTypeColor(item.type)}20`,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
            }}>
            <Icon name={getTypeIcon(item.type)} size={16} color={getTypeColor(item.type)} />
            <Text
              testID="memorizeDetail_text_category"
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: getTypeColor(item.type),
                marginLeft: 6,
                textTransform: 'capitalize',
              }}>
              {item.type}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: `${mastery.color}20`,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              marginLeft: 8,
            }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: mastery.color }}>
              {mastery.label}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 12 }}>
          {item.title}
        </Text>

        {/* Content Summary */}
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>
            Content Summary
          </Text>
          <Text
            testID="memorizeDetail_text_content"
            style={{ fontSize: 14, color: '#6b7280', lineHeight: 22 }}>
            {item.contentSummary}
          </Text>
        </View>

        {/* SM-2 Statistics */}
        <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 12 }}>
            Review Statistics
          </Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: '#6b7280' }}>Ease Factor</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937' }}>
              {item.easeFactor.toFixed(2)}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: '#6b7280' }}>Current Interval</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937' }}>
              {item.interval} days
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: '#6b7280' }}>Total Reviews</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937' }}>
              {item.repetitions}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: '#6b7280' }}>Next Review</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: isDue ? '#ef4444' : '#1f2937' }}>
              {isDue ? 'Due now' : item.nextReviewDate}
            </Text>
          </View>

          {item.lastReviewDate && (
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ fontSize: 14, color: '#6b7280' }}>Last Reviewed</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937' }}>
                {item.lastReviewDate}
              </Text>
            </View>
          )}

          {item.lastQualityRating !== undefined && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 14, color: '#6b7280' }}>Last Rating</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937' }}>
                {item.lastQualityRating === 5
                  ? 'Easy'
                  : item.lastQualityRating === 4
                  ? 'Good'
                  : item.lastQualityRating === 3
                  ? 'Hard'
                  : 'Again'}
              </Text>
            </View>
          )}
        </View>

        {/* Source Reference */}
        {item.sourceReferenceType && (
          <View
            style={{ backgroundColor: '#dbeafe', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="link" size={18} color="#1e40af" />
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#1e40af', marginLeft: 8 }}>
                Source: {item.sourceReferenceType}
              </Text>
            </View>
          </View>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 8 }}>
              Tags
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {item.tags.map((tag, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: '#e5e7eb',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                  }}>
                  <Text style={{ fontSize: 12, color: '#4b5563' }}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Review Button */}
        {isDue && (
          <Pressable
            onPress={() => navigation.navigate('MemorizeReview')}
            style={{
              backgroundColor: '#3b82f6',
              paddingVertical: 14,
              borderRadius: 8,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Icon name="play" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>Review Now</Text>
          </Pressable>
        )}

        {/* Created Date */}
        <Text style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 24 }}>
          Added on {format(item.createdAt, 'MMMM d, yyyy')}
        </Text>
      </ScrollView>
    </View>
  );
};

export default MemorizeDetailScreen;
