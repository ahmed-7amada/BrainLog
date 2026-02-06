/**
 * Weekly Summary List Screen
 * Display historical weekly summaries (T382)
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import * as weeklySummaryService from '../../services/firebase/weeklySummaryService';
import type { WeeklySummary } from '../../models/WeeklySummary';
import { colors, typography, spacing, borderRadius } from '../../config/theme';

interface WeeklySummaryListScreenProps {
  navigation: any;
}

const WeeklySummaryListScreen: React.FC<WeeklySummaryListScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [summaries, setSummaries] = useState<WeeklySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadSummaries = useCallback(async () => {
    try {
      const allSummaries = await weeklySummaryService.getAllWeeklySummaries();
      // Sort by week key in descending order (most recent first)
      const sorted = allSummaries.sort((a, b) => b.weekKey.localeCompare(a.weekKey));
      setSummaries(sorted);
    } catch (error) {
      console.error('Error loading weekly summaries:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSummaries();
  }, [loadSummaries]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadSummaries();
  };

  const formatWeekKey = (weekKey: string): string => {
    // weekKey format: "2026-W05"
    const [year, weekPart] = weekKey.split('-');
    const weekNum = parseInt(weekPart.replace('W', ''), 10);
    return `Week ${weekNum}, ${year}`;
  };

  const getTrendIcon = (trend?: 'improved' | 'declined' | 'stable') => {
    switch (trend) {
      case 'improved':
        return { name: 'trending-up', color: colors.success };
      case 'declined':
        return { name: 'trending-down', color: colors.error };
      default:
        return { name: 'remove', color: colors.light.textSecondary };
    }
  };

  const renderSummaryCard = ({ item }: { item: WeeklySummary }) => {
    const trendInfo = getTrendIcon(item.comparison?.trend);

    return (
      <Pressable
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: borderRadius.lg,
          padding: spacing.lg,
          marginBottom: spacing.md,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
        onPress={() => navigation.navigate('WeeklySummaryDetail', { weekKey: item.weekKey })}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.md,
          }}>
          <Text
            style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              color: colors.light.text,
            }}>
            {formatWeekKey(item.weekKey)}
          </Text>
          {item.comparison && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name={trendInfo.name} size={18} color={trendInfo.color} />
              <Text
                style={{
                  fontSize: typography.fontSize.sm,
                  color: trendInfo.color,
                  marginLeft: 4,
                  textTransform: 'capitalize',
                }}>
                {item.comparison.trend}
              </Text>
            </View>
          )}
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
          <View style={{ flex: 1, minWidth: '40%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="albums" size={16} color={colors.primary} />
              <Text
                style={{
                  fontSize: typography.fontSize.md,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.light.text,
                  marginLeft: spacing.xs,
                }}>
                {item.totalCardsReviewed}
              </Text>
            </View>
            <Text style={{ fontSize: typography.fontSize.xs, color: colors.light.textSecondary }}>
              Cards Reviewed
            </Text>
          </View>

          <View style={{ flex: 1, minWidth: '40%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="time" size={16} color={colors.accent} />
              <Text
                style={{
                  fontSize: typography.fontSize.md,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.light.text,
                  marginLeft: spacing.xs,
                }}>
                {item.totalStudyMinutes}m
              </Text>
            </View>
            <Text style={{ fontSize: typography.fontSize.xs, color: colors.light.textSecondary }}>
              Study Time
            </Text>
          </View>

          <View style={{ flex: 1, minWidth: '40%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="flame" size={16} color={colors.streak} />
              <Text
                style={{
                  fontSize: typography.fontSize.md,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.light.text,
                  marginLeft: spacing.xs,
                }}>
                {item.streakDays}/7
              </Text>
            </View>
            <Text style={{ fontSize: typography.fontSize.xs, color: colors.light.textSecondary }}>
              Active Days
            </Text>
          </View>

          <View style={{ flex: 1, minWidth: '40%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="star" size={16} color={colors.xp} />
              <Text
                style={{
                  fontSize: typography.fontSize.md,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.light.text,
                  marginLeft: spacing.xs,
                }}>
                {item.xpEarned}
              </Text>
            </View>
            <Text style={{ fontSize: typography.fontSize.xs, color: colors.light.textSecondary }}>
              XP Earned
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderEmptyState = () => (
    <View
      testID="weeklySummaryList_text_empty"
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
      <Icon name="analytics-outline" size={64} color={colors.light.textTertiary} />
      <Text
        style={{
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.semibold,
          color: colors.light.text,
          marginTop: spacing.lg,
        }}>
        No Weekly Summaries Yet
      </Text>
      <Text
        style={{
          fontSize: typography.fontSize.md,
          color: colors.light.textSecondary,
          textAlign: 'center',
          marginTop: spacing.sm,
          paddingHorizontal: spacing.xl,
        }}>
        Complete your first week of learning to see your insights here.
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.light.surface,
        }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.light.surface }}>
      <View
        style={{
          paddingTop: insets.top,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.md,
        }}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }}>
          <Icon name="chevron-back" size={24} color={colors.primary} />
          <Text
            style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              color: colors.primary,
              marginLeft: spacing.xs,
            }}>
            Back
          </Text>
        </Pressable>

        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text
              style={{
                fontSize: typography.fontSize.xxl,
                fontWeight: typography.fontWeight.bold,
                color: colors.light.text,
              }}>
              Weekly Insights
            </Text>
            <Text
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.light.textSecondary,
                marginTop: 2,
              }}>
              {summaries.length} {summaries.length === 1 ? 'summary' : 'summaries'}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: colors.primaryLight + '30',
              padding: spacing.md,
              borderRadius: borderRadius.lg,
            }}>
            <Icon name="analytics" size={24} color={colors.primary} />
          </View>
        </View>
      </View>

      <FlatList
        testID="weeklySummaryList_list_summaries"
        data={summaries}
        keyExtractor={item => item.weekKey}
        renderItem={renderSummaryCard}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + spacing.lg,
          flexGrow: summaries.length === 0 ? 1 : undefined,
        }}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
    </View>
  );
};

export default WeeklySummaryListScreen;
