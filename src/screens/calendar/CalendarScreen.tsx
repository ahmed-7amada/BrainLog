/**
 * Calendar Screen
 * Shows learning activity history with calendar view (FR-032, FR-033)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '../../config/theme';
import type { CalendarScreenProps } from '../../navigation/types';
import * as dailyLogService from '../../services/firebase/dailyLogService';
import type { DailyLog } from '../../models/DailyLog';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  addMonths,
  subMonths,
  getDay,
} from 'date-fns';

type Props = CalendarScreenProps<'CalendarView'>;

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarScreen: React.FC<Props> = ({ navigation }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [logs, setLogs] = useState<Record<string, DailyLog>>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      const allLogs = await dailyLogService.getDailyLogsInRange(start, end);

      const logsMap: Record<string, DailyLog> = {};
      allLogs.forEach(log => {
        logsMap[log.dateKey] = log;
      });
      setLogs(logsMap);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const getActivityLevel = (log?: DailyLog): 'none' | 'low' | 'medium' | 'high' => {
    if (!log?.summary) return 'none';
    const { cardsReviewed, notesCreated, habitsCompleted, habitsTotal } = log.summary;
    const score =
      cardsReviewed * 2 +
      notesCreated * 3 +
      (habitsTotal > 0 ? (habitsCompleted / habitsTotal) * 10 : 0);
    if (score >= 20) return 'high';
    if (score >= 10) return 'medium';
    if (score > 0) return 'low';
    return 'none';
  };

  const getActivityColor = (level: 'none' | 'low' | 'medium' | 'high'): string => {
    switch (level) {
      case 'high':
        return '#22c55e';
      case 'medium':
        return '#86efac';
      case 'low':
        return '#dcfce7';
      default:
        return 'transparent';
    }
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const firstDayOfMonth = getDay(startOfMonth(currentMonth));
  const emptyDays = Array.from({ length: firstDayOfMonth });

  const handleDayPress = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    navigation.navigate('DayDetail', { dateKey });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.light.surface }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: spacing.lg,
        }}>
        <Pressable onPress={goToPreviousMonth} style={{ padding: 8 }}>
          <Icon name="chevron-back" size={24} color={colors.primary} />
        </Pressable>
        <Pressable onPress={goToToday} testID="calendar_button_today">
          <Text
            testID="calendar_text_selectedDate"
            style={{
              fontSize: typography.fontSize.xl,
              fontWeight: '700',
              color: colors.light.text,
            }}>
            {format(currentMonth, 'MMMM yyyy')}
          </Text>
        </Pressable>
        <Pressable onPress={goToNextMonth} style={{ padding: 8 }}>
          <Icon name="chevron-forward" size={24} color={colors.primary} />
        </Pressable>
      </View>

      {/* Weekday Headers */}
      <View
        style={{ flexDirection: 'row', paddingHorizontal: spacing.md, marginBottom: spacing.sm }}>
        {WEEKDAYS.map(day => (
          <View key={day} style={{ flex: 1, alignItems: 'center' }}>
            <Text
              style={{
                fontSize: typography.fontSize.sm,
                fontWeight: '600',
                color: colors.light.textSecondary,
              }}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      {isLoading ? (
        <View style={{ paddingVertical: 60, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <View
          testID="calendar_calendar_main"
          style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.md }}>
          {/* Empty cells for days before the first of the month */}
          {emptyDays.map((_, index) => (
            <View key={`empty-${index}`} style={{ width: '14.28%', aspectRatio: 1 }} />
          ))}

          {/* Days of the month */}
          {daysInMonth.map(date => {
            const dateKey = format(date, 'yyyy-MM-dd');
            const log = logs[dateKey];
            const activityLevel = getActivityLevel(log);
            const isCurrentDay = isToday(date);

            return (
              <Pressable
                key={dateKey}
                onPress={() => handleDayPress(date)}
                style={{
                  width: '14.28%',
                  aspectRatio: 1,
                  padding: 2,
                }}>
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 8,
                    backgroundColor: getActivityColor(activityLevel),
                    borderWidth: isCurrentDay ? 2 : 0,
                    borderColor: colors.primary,
                  }}>
                  <Text
                    style={{
                      fontSize: typography.fontSize.md,
                      fontWeight: isCurrentDay ? '700' : '500',
                      color: isCurrentDay
                        ? colors.primary
                        : activityLevel !== 'none'
                        ? '#15803d'
                        : colors.light.text,
                    }}>
                    {format(date, 'd')}
                  </Text>
                  {log?.summary && log.summary.cardsReviewed > 0 && (
                    <View style={{ position: 'absolute', bottom: 2, right: 2 }}>
                      <Icon name="albums" size={10} color="#16a34a" />
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Legend */}
      <View style={{ padding: spacing.lg, marginTop: spacing.md }}>
        <Text
          style={{
            fontSize: typography.fontSize.sm,
            fontWeight: '600',
            color: colors.light.text,
            marginBottom: spacing.sm,
          }}>
          Activity Level
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                backgroundColor: '#dcfce7',
                marginRight: 6,
              }}
            />
            <Text style={{ fontSize: typography.fontSize.xs, color: colors.light.textSecondary }}>
              Low
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                backgroundColor: '#86efac',
                marginRight: 6,
              }}
            />
            <Text style={{ fontSize: typography.fontSize.xs, color: colors.light.textSecondary }}>
              Medium
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                backgroundColor: '#22c55e',
                marginRight: 6,
              }}
            />
            <Text style={{ fontSize: typography.fontSize.xs, color: colors.light.textSecondary }}>
              High
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={{ padding: spacing.lg, gap: spacing.md }}>
        <Pressable
          onPress={() => navigation.navigate('DailyLog')}
          style={{
            backgroundColor: colors.primary,
            padding: spacing.md,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icon name="create" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={{ fontSize: typography.fontSize.md, fontWeight: '600', color: '#fff' }}>
            Write Today's Journal
          </Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('WeeklySummary')}
          style={{
            backgroundColor: colors.light.card,
            padding: spacing.md,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icon name="analytics" size={20} color={colors.primary} style={{ marginRight: 8 }} />
          <Text
            style={{ fontSize: typography.fontSize.md, fontWeight: '600', color: colors.primary }}>
            View Weekly Summary
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default CalendarScreen;
