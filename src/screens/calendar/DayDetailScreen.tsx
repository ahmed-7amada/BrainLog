/**
 * Day Detail Screen
 * Display detailed activity for a specific day (FR-032, FR-033)
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import * as dailyLogService from '../../services/firebase/dailyLogService';
import type { DailyLog } from '../../models/DailyLog';
import { format, parseISO } from 'date-fns';

const DayDetailScreen = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const { dateKey } = route.params;
  const [log, setLog] = useState<DailyLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDayData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await dailyLogService.getDailyLogByDate(dateKey);
      setLog(data);
    } catch (error) {
      console.error('Error loading day data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dateKey]);

  useEffect(() => {
    loadDayData();
  }, [loadDayData]);

  const formatDate = (key: string) => {
    try {
      return format(parseISO(key), 'EEEE, MMMM d, yyyy');
    } catch {
      return key;
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
        <Pressable onPress={() => navigation.navigate('DailyLog', { dateKey })}>
          <Icon name="create-outline" size={24} color="#3b82f6" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Date Header */}
        <Text
          testID="dayDetail_text_date"
          style={{ fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 4 }}>
          {formatDate(dateKey)}
        </Text>
        <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Activity Summary</Text>

        {/* Stats Grid */}
        {log?.summary ? (
          <View
            testID="dayDetail_list_activities"
            style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
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
                {log.summary.cardsReviewed}
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
                {log.summary.newCards}
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
              <Icon name="document-text" size={24} color="#f59e0b" />
              <Text style={{ fontSize: 28, fontWeight: '700', color: '#1f2937', marginTop: 8 }}>
                {log.summary.notesCreated}
              </Text>
              <Text style={{ fontSize: 12, color: '#6b7280' }}>Notes Created</Text>
            </View>

            <View
              style={{
                flex: 1,
                minWidth: '45%',
                backgroundColor: '#fff',
                padding: 16,
                borderRadius: 12,
              }}>
              <Icon name="time" size={24} color="#8b5cf6" />
              <Text style={{ fontSize: 28, fontWeight: '700', color: '#1f2937', marginTop: 8 }}>
                {log.summary.studyMinutes}
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
              <Icon name="checkbox" size={24} color="#10b981" />
              <Text style={{ fontSize: 28, fontWeight: '700', color: '#1f2937', marginTop: 8 }}>
                {log.summary.habitsCompleted}/{log.summary.habitsTotal}
              </Text>
              <Text style={{ fontSize: 12, color: '#6b7280' }}>Habits Completed</Text>
            </View>
          </View>
        ) : (
          <View
            testID="dayDetail_text_empty"
            style={{
              backgroundColor: '#fff',
              padding: 24,
              borderRadius: 12,
              marginBottom: 24,
              alignItems: 'center',
            }}>
            <Icon name="calendar-outline" size={48} color="#d1d5db" />
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#6b7280', marginTop: 12 }}>
              No activity recorded
            </Text>
            <Text style={{ fontSize: 14, color: '#9ca3af', marginTop: 4, textAlign: 'center' }}>
              Activities will appear here when you study on this day
            </Text>
          </View>
        )}

        {/* Journal Entry */}
        {log && (log.learned || log.challenges || log.plan) && (
          <View
            style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 16 }}>
              Journal Entry
            </Text>

            {log.learned && (
              <View style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Icon name="bulb" size={18} color="#f59e0b" />
                  <Text
                    style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginLeft: 8 }}>
                    What I Learned
                  </Text>
                </View>
                <Text style={{ fontSize: 14, color: '#6b7280', lineHeight: 22 }}>
                  {log.learned}
                </Text>
              </View>
            )}

            {log.challenges && (
              <View style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Icon name="warning" size={18} color="#ef4444" />
                  <Text
                    style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginLeft: 8 }}>
                    Challenges Faced
                  </Text>
                </View>
                <Text style={{ fontSize: 14, color: '#6b7280', lineHeight: 22 }}>
                  {log.challenges}
                </Text>
              </View>
            )}

            {log.plan && (
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Icon name="rocket" size={18} color="#3b82f6" />
                  <Text
                    style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginLeft: 8 }}>
                    Plan for Tomorrow
                  </Text>
                </View>
                <Text style={{ fontSize: 14, color: '#6b7280', lineHeight: 22 }}>{log.plan}</Text>
              </View>
            )}
          </View>
        )}

        {/* Linked Items */}
        {log?.linkedItems && log.linkedItems.length > 0 && (
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 12 }}>
              Linked Items
            </Text>
            {log.linkedItems.map((item, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  borderTopWidth: index > 0 ? 1 : 0,
                  borderTopColor: '#f3f4f6',
                }}>
                <Icon
                  name={
                    item.type === 'flashcard'
                      ? 'albums'
                      : item.type === 'note'
                      ? 'document-text'
                      : 'videocam'
                  }
                  size={20}
                  color="#6b7280"
                />
                <Text
                  style={{
                    fontSize: 14,
                    color: '#6b7280',
                    marginLeft: 12,
                    textTransform: 'capitalize',
                  }}>
                  {item.type}: {item.id}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Edit Journal Button */}
        <Pressable
          testID="dayDetail_button_addEntry"
          onPress={() => navigation.navigate('DailyLog', { dateKey })}
          style={{
            backgroundColor: '#3b82f6',
            paddingVertical: 14,
            borderRadius: 8,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 24,
          }}>
          <Icon name="create" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
            {log ? 'Edit Journal Entry' : 'Write Journal Entry'}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

export default DayDetailScreen;
