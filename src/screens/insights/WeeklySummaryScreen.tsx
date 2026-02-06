/**
 * Weekly Summary Screen
 * Display automated weekly learning insights (FR-034)
 * T381 - Now supports viewing past weekly summaries via weekKey parameter
 * T385 - Marks summary as viewed to update badge indicator
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import * as weeklySummaryService from '../../services/firebase/weeklySummaryService';
import type { WeeklySummary } from '../../models/WeeklySummary';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { useStore } from '../../store';

interface WeeklySummaryScreenProps {
  navigation: any;
  route?: {
    params?: {
      weekKey?: string;
    };
  };
}

const WeeklySummaryScreen = ({ navigation, route }: WeeklySummaryScreenProps) => {
  const insets = useSafeAreaInsets();
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // T385 - Get store methods for marking as viewed
  const { markWeeklySummaryViewed, setLatestWeekKey } = useStore();

  // Get weekKey from route params if provided (for viewing past summaries)
  const weekKeyParam = route?.params?.weekKey;
  const isCurrentWeek = !weekKeyParam;

  const loadSummary = useCallback(async () => {
    setIsLoading(true);
    try {
      let loadedSummary: WeeklySummary | null = null;

      if (weekKeyParam) {
        // Load specific week summary
        loadedSummary = await weeklySummaryService.getWeeklySummaryByKey(weekKeyParam);
      } else {
        // Load current week summary
        loadedSummary = await weeklySummaryService.getCurrentWeekSummary();
        if (!loadedSummary) {
          loadedSummary = await weeklySummaryService.generateWeeklySummary();
        }
      }
      setSummary(loadedSummary);
    } catch (error) {
      console.error('Error loading weekly summary:', error);
    } finally {
      setIsLoading(false);
    }
  }, [weekKeyParam]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  // T385 - Mark summary as viewed when it loads
  useEffect(() => {
    if (summary?.weekKey && isCurrentWeek) {
      setLatestWeekKey(summary.weekKey);
      markWeeklySummaryViewed(summary.weekKey);
    }
  }, [summary?.weekKey, isCurrentWeek, setLatestWeekKey, markWeeklySummaryViewed]);

  const getTrendIcon = (trend?: 'improved' | 'declined' | 'stable') => {
    switch (trend) {
      case 'improved':
        return { name: 'trending-up', color: '#10b981' };
      case 'declined':
        return { name: 'trending-down', color: '#ef4444' };
      default:
        return { name: 'remove', color: '#6b7280' };
    }
  };

  // Calculate week date range based on summary weekKey or current date
  const getWeekDateRange = () => {
    if (summary?.weekKey) {
      // Parse weekKey format: "2026-W05"
      const [year, weekPart] = summary.weekKey.split('-');
      const weekNum = parseInt(weekPart.replace('W', ''), 10);
      // Create date from week number
      const jan1 = new Date(parseInt(year, 10), 0, 1);
      const weekDate = new Date(jan1.getTime() + (weekNum - 1) * 7 * 24 * 60 * 60 * 1000);
      const weekStart = format(startOfWeek(weekDate, { weekStartsOn: 1 }), 'MMM d');
      const weekEnd = format(endOfWeek(weekDate, { weekStartsOn: 1 }), 'MMM d, yyyy');
      return { weekStart, weekEnd };
    }
    const now = new Date();
    return {
      weekStart: format(startOfWeek(now, { weekStartsOn: 1 }), 'MMM d'),
      weekEnd: format(endOfWeek(now, { weekStartsOn: 1 }), 'MMM d, yyyy'),
    };
  };

  const { weekStart, weekEnd } = getWeekDateRange();

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

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: '700', color: '#1f2937' }}>
              Weekly Summary
            </Text>
            <Text
              testID="weeklySummary_text_dateRange"
              style={{ fontSize: 14, color: '#6b7280', marginTop: 2 }}>
              {weekStart} - {weekEnd}
            </Text>
          </View>
          <View style={{ backgroundColor: '#dbeafe', padding: 10, borderRadius: 10 }}>
            <Icon name="analytics" size={24} color="#1e40af" />
          </View>
        </View>

        {/* Trend Card */}
        {summary?.comparison && (
          <View
            testID="weeklySummary_card_highlights"
            style={{
              backgroundColor:
                summary.comparison.trend === 'improved'
                  ? '#dcfce7'
                  : summary.comparison.trend === 'declined'
                  ? '#fee2e2'
                  : '#f3f4f6',
              padding: 16,
              borderRadius: 12,
              marginBottom: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Icon
              name={getTrendIcon(summary.comparison.trend).name}
              size={32}
              color={getTrendIcon(summary.comparison.trend).color}
            />
            <View style={{ marginLeft: 12 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#1f2937',
                  textTransform: 'capitalize',
                }}>
                {summary.comparison.trend === 'improved'
                  ? 'Great Progress!'
                  : summary.comparison.trend === 'declined'
                  ? 'Keep Going!'
                  : 'Steady Progress'}
              </Text>
              <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                Compared to last week
              </Text>
            </View>
          </View>
        )}

        {/* Stats Grid */}
        <View
          testID="weeklySummary_card_stats"
          style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <View
            style={{
              flex: 1,
              minWidth: '45%',
              backgroundColor: '#fff',
              padding: 16,
              borderRadius: 12,
            }}>
            <Icon name="albums" size={24} color="#3b82f6" />
            <Text style={{ fontSize: 28, fontWeight: '700', color: '#1f2937', marginTop: 8 }}>
              {summary?.totalCardsReviewed || 0}
            </Text>
            <Text style={{ fontSize: 12, color: '#6b7280' }}>Cards Reviewed</Text>
          </View>

          <View
            style={{
              flex: 1,
              minWidth: '45%',
              backgroundColor: '#fff',
              padding: 16,
              borderRadius: 12,
            }}>
            <Icon name="add-circle" size={24} color="#10b981" />
            <Text style={{ fontSize: 28, fontWeight: '700', color: '#1f2937', marginTop: 8 }}>
              {summary?.newCardsLearned || 0}
            </Text>
            <Text style={{ fontSize: 12, color: '#6b7280' }}>New Cards</Text>
          </View>

          <View
            style={{
              flex: 1,
              minWidth: '45%',
              backgroundColor: '#fff',
              padding: 16,
              borderRadius: 12,
            }}>
            <Icon name="time" size={24} color="#f59e0b" />
            <Text style={{ fontSize: 28, fontWeight: '700', color: '#1f2937', marginTop: 8 }}>
              {summary?.totalStudyMinutes || 0}
            </Text>
            <Text style={{ fontSize: 12, color: '#6b7280' }}>Minutes Studied</Text>
          </View>

          <View
            style={{
              flex: 1,
              minWidth: '45%',
              backgroundColor: '#fff',
              padding: 16,
              borderRadius: 12,
            }}>
            <Icon name="flame" size={24} color="#ef4444" />
            <Text style={{ fontSize: 28, fontWeight: '700', color: '#1f2937', marginTop: 8 }}>
              {summary?.streakDays || 0}
            </Text>
            <Text style={{ fontSize: 12, color: '#6b7280' }}>Active Days</Text>
          </View>
        </View>

        {/* XP and Habits */}
        <View
          testID="weeklySummary_chart_activity"
          style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 12 }}>
            Progress
          </Text>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="star" size={18} color="#f59e0b" />
              <Text style={{ fontSize: 14, color: '#6b7280', marginLeft: 6 }}>XP Earned</Text>
            </View>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1f2937' }}>
              {summary?.xpEarned || 0} XP
            </Text>
          </View>

          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="checkbox" size={18} color="#10b981" />
              <Text style={{ fontSize: 14, color: '#6b7280', marginLeft: 6 }}>
                Habit Completion
              </Text>
            </View>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1f2937' }}>
              {summary?.habitCompletionRate || 0}%
            </Text>
          </View>
        </View>

        {/* Most Forgotten Cards */}
        {summary?.mostForgottenCards && summary.mostForgottenCards.length > 0 && (
          <View
            style={{ backgroundColor: '#fef3c7', padding: 16, borderRadius: 12, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Icon name="warning" size={18} color="#f59e0b" />
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginLeft: 6 }}>
                Cards Needing Review
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: '#6b7280' }}>
              You have {summary.mostForgottenCards.length} cards that need extra attention
            </Text>
          </View>
        )}

        {/* View Past Summaries Button (T381) */}
        {isCurrentWeek && (
          <Pressable
            onPress={() => navigation.navigate('WeeklySummaryList')}
            style={{
              backgroundColor: '#fff',
              padding: 16,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 8,
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="time-outline" size={20} color="#3b82f6" />
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginLeft: 8 }}>
                View Past Summaries
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color="#6b7280" />
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
};

export default WeeklySummaryScreen;
