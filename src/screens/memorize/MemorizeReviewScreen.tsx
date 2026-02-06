/**
 * Memorize Review Screen
 * Review due memorize items using spaced repetition (FR-047, FR-048)
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import * as memorizeService from '../../services/firebase/memorizeService';
import type { MemorizeItem } from '../../models/MemorizeItem';

type Quality = 0 | 3 | 4 | 5;

const MemorizeReviewScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<MemorizeItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [sessionStats, setSessionStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });

  const loadDueItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const dueItems = await memorizeService.getDueMemorizeItems();
      setItems(dueItems);
    } catch (error) {
      console.error('Error loading due items:', error);
      Alert.alert('Error', 'Failed to load items');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDueItems();
  }, [loadDueItems]);

  const handleRate = async (quality: Quality) => {
    const currentItem = items[currentIndex];
    if (!currentItem) return;

    try {
      await memorizeService.reviewMemorizeItem(currentItem.id, quality);

      // Update session stats
      const ratingKey =
        quality === 0 ? 'again' : quality === 3 ? 'hard' : quality === 4 ? 'good' : 'easy';
      setSessionStats(prev => ({ ...prev, [ratingKey]: prev[ratingKey as keyof typeof prev] + 1 }));
      setReviewedCount(prev => prev + 1);

      // Move to next item
      if (currentIndex < items.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setShowAnswer(false);
      } else {
        // Session complete
        navigation.replace('MemorizeList');
        Alert.alert(
          'Review Complete!',
          `You reviewed ${reviewedCount + 1} items.\n\nAgain: ${
            sessionStats.again + (quality === 0 ? 1 : 0)
          }\nHard: ${sessionStats.hard + (quality === 3 ? 1 : 0)}\nGood: ${
            sessionStats.good + (quality === 4 ? 1 : 0)
          }\nEasy: ${sessionStats.easy + (quality === 5 ? 1 : 0)}`,
        );
      }
    } catch (error) {
      console.error('Error rating item:', error);
      Alert.alert('Error', 'Failed to save review');
    }
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

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f9fafb', paddingTop: insets.top }}>
        <View style={{ padding: 16 }}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="chevron-back" size={24} color="#3b82f6" />
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#3b82f6', marginLeft: 4 }}>
              Back
            </Text>
          </Pressable>
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 32,
          }}>
          <Icon name="checkmark-circle" size={64} color="#10b981" />
          <Text
            style={{
              fontSize: 20,
              fontWeight: '600',
              color: '#1f2937',
              marginTop: 16,
              textAlign: 'center',
            }}>
            All caught up!
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 8, textAlign: 'center' }}>
            No items due for review right now. Check back later.
          </Text>
        </View>
      </View>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb', paddingTop: insets.top }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}>
        <Pressable onPress={() => navigation.goBack()}>
          <Icon name="close" size={28} color="#6b7280" />
        </Pressable>
        <Text
          testID="memorizeReview_text_progress"
          style={{ fontSize: 14, fontWeight: '600', color: '#6b7280' }}>
          {currentIndex + 1} / {items.length}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Progress Bar */}
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        <View style={{ backgroundColor: '#e5e7eb', borderRadius: 4, height: 4 }}>
          <View
            style={{
              backgroundColor: '#3b82f6',
              borderRadius: 4,
              height: 4,
              width: `${((currentIndex + 1) / items.length) * 100}%`,
            }}
          />
        </View>
      </View>

      {/* Card */}
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        <Pressable
          onPress={() => setShowAnswer(true)}
          style={{
            flex: 1,
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: 24,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}>
          {/* Type Badge */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: `${getTypeColor(currentItem.type)}20`,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              alignSelf: 'flex-start',
              marginBottom: 16,
            }}>
            <Icon
              name={getTypeIcon(currentItem.type)}
              size={16}
              color={getTypeColor(currentItem.type)}
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: getTypeColor(currentItem.type),
                marginLeft: 6,
                textTransform: 'capitalize',
              }}>
              {currentItem.type}
            </Text>
          </View>

          {/* Title */}
          <Text
            testID="memorizeReview_text_content"
            style={{ fontSize: 22, fontWeight: '700', color: '#1f2937', marginBottom: 16 }}>
            {currentItem.title}
          </Text>

          {/* Content */}
          {showAnswer ? (
            <View>
              <View
                style={{
                  borderTopWidth: 1,
                  borderTopColor: '#e5e7eb',
                  paddingTop: 16,
                  marginTop: 8,
                }}>
                <Text
                  style={{ fontSize: 14, fontWeight: '600', color: '#6b7280', marginBottom: 8 }}>
                  Content Summary
                </Text>
                <Text style={{ fontSize: 16, color: '#1f2937', lineHeight: 24 }}>
                  {currentItem.contentSummary}
                </Text>
              </View>
            </View>
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: '#9ca3af' }}>Tap to reveal content</Text>
            </View>
          )}
        </Pressable>

        {/* Rating Buttons */}
        {showAnswer ? (
          <View style={{ marginBottom: insets.bottom + 16 }}>
            <Text style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', marginBottom: 12 }}>
              How well did you remember this?
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable
                testID="memorizeReview_button_incorrect"
                onPress={() => handleRate(0)}
                style={{
                  flex: 1,
                  backgroundColor: '#fef2f2',
                  paddingVertical: 14,
                  borderRadius: 8,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#fecaca',
                }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#dc2626' }}>Again</Text>
                <Text style={{ fontSize: 10, color: '#ef4444', marginTop: 2 }}>1 min</Text>
              </Pressable>

              <Pressable
                onPress={() => handleRate(3)}
                style={{
                  flex: 1,
                  backgroundColor: '#fff7ed',
                  paddingVertical: 14,
                  borderRadius: 8,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#fed7aa',
                }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#ea580c' }}>Hard</Text>
                <Text style={{ fontSize: 10, color: '#f97316', marginTop: 2 }}>1 day</Text>
              </Pressable>

              <Pressable
                testID="memorizeReview_button_correct"
                onPress={() => handleRate(4)}
                style={{
                  flex: 1,
                  backgroundColor: '#f0fdf4',
                  paddingVertical: 14,
                  borderRadius: 8,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#bbf7d0',
                }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#16a34a' }}>Good</Text>
                <Text style={{ fontSize: 10, color: '#22c55e', marginTop: 2 }}>
                  {currentItem.interval || 6} days
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleRate(5)}
                style={{
                  flex: 1,
                  backgroundColor: '#eff6ff',
                  paddingVertical: 14,
                  borderRadius: 8,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#bfdbfe',
                }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#2563eb' }}>Easy</Text>
                <Text style={{ fontSize: 10, color: '#3b82f6', marginTop: 2 }}>
                  {Math.round((currentItem.interval || 6) * 1.3)} days
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            testID="memorizeReview_button_reveal"
            onPress={() => setShowAnswer(true)}
            style={{
              backgroundColor: '#3b82f6',
              paddingVertical: 16,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: insets.bottom + 16,
            }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>Show Answer</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default MemorizeReviewScreen;
