/**
 * Daily Log Screen
 * Write daily learning journal entries (FR-036)
 * Includes pull-to-refresh support (FR-003)
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import * as dailyLogService from '../../services/firebase/dailyLogService';
import { useStore } from '../../store';
import { colors } from '../../config/theme';
import type { DailyLog } from '../../models/DailyLog';
import { format } from 'date-fns';

const DailyLogScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [log, setLog] = useState<DailyLog | null>(null);
  const [learned, setLearned] = useState('');
  const [challenges, setChallenges] = useState('');
  const [plan, setPlan] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isOnline = useStore(state => state.isOnline);

  const loadTodayLog = useCallback(async () => {
    setIsLoading(true);
    try {
      const todayLog = await dailyLogService.getTodayLog();
      if (todayLog) {
        setLog(todayLog);
        setLearned(todayLog.learned);
        setChallenges(todayLog.challenges);
        setPlan(todayLog.plan);
      }
    } catch (error) {
      console.error('Error loading daily log:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTodayLog();
  }, [loadTodayLog]);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'You are offline. Please check your connection.');
      return;
    }
    setIsRefreshing(true);
    try {
      const todayLog = await dailyLogService.getTodayLog();
      if (todayLog) {
        setLog(todayLog);
        setLearned(todayLog.learned);
        setChallenges(todayLog.challenges);
        setPlan(todayLog.plan);
      }
    } catch (error) {
      console.error('Error refreshing daily log:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isOnline]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const savedLog = await dailyLogService.saveDailyLog({
        learned,
        challenges,
        plan,
      });
      setLog(savedLog);
      Alert.alert('Saved', 'Your daily log has been saved!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save daily log');
      console.error('Error saving daily log:', error);
    } finally {
      setIsSaving(false);
    }
  }, [learned, challenges, plan]);

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
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 16 }}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }>
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
            <Text style={{ fontSize: 24, fontWeight: '700', color: '#1f2937' }}>Daily Log</Text>
            <Text
              testID="dailyLog_text_date"
              style={{ fontSize: 14, color: '#6b7280', marginTop: 2 }}>
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </Text>
          </View>
          <View style={{ backgroundColor: '#dbeafe', padding: 10, borderRadius: 10 }}>
            <Icon name="journal" size={24} color="#1e40af" />
          </View>
        </View>

        {/* Auto-generated Summary */}
        {log?.summary && (
          <View
            testID="dailyLog_list_habits"
            style={{ backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8, marginBottom: 16 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#6b7280', marginBottom: 8 }}>
              Today's Stats
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="albums" size={14} color="#3b82f6" />
                <Text style={{ fontSize: 12, color: '#1f2937', marginLeft: 4 }}>
                  {log.summary.cardsReviewed} cards reviewed
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="document-text" size={14} color="#10b981" />
                <Text style={{ fontSize: 12, color: '#1f2937', marginLeft: 4 }}>
                  {log.summary.notesCreated} notes
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="time" size={14} color="#f59e0b" />
                <Text style={{ fontSize: 12, color: '#1f2937', marginLeft: 4 }}>
                  {log.summary.studyMinutes} min studied
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* What I Learned */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Icon name="bulb" size={18} color="#f59e0b" />
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginLeft: 6 }}>
              What I Learned Today
            </Text>
          </View>
          <TextInput
            testID="dailyLog_input_notes"
            placeholder="Write about what you learned..."
            value={learned}
            onChangeText={setLearned}
            multiline
            numberOfLines={4}
            style={{
              backgroundColor: '#fff',
              borderWidth: 1,
              borderColor: '#e5e7eb',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 14,
              color: '#1f2937',
              textAlignVertical: 'top',
              minHeight: 100,
            }}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Challenges */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Icon name="warning" size={18} color="#ef4444" />
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginLeft: 6 }}>
              Challenges Faced
            </Text>
          </View>
          <TextInput
            placeholder="What did you struggle with..."
            value={challenges}
            onChangeText={setChallenges}
            multiline
            numberOfLines={4}
            style={{
              backgroundColor: '#fff',
              borderWidth: 1,
              borderColor: '#e5e7eb',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 14,
              color: '#1f2937',
              textAlignVertical: 'top',
              minHeight: 100,
            }}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Plan for Tomorrow */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Icon name="rocket" size={18} color="#3b82f6" />
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginLeft: 6 }}>
              Plan for Tomorrow
            </Text>
          </View>
          <TextInput
            placeholder="What do you plan to learn next..."
            value={plan}
            onChangeText={setPlan}
            multiline
            numberOfLines={4}
            style={{
              backgroundColor: '#fff',
              borderWidth: 1,
              borderColor: '#e5e7eb',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 14,
              color: '#1f2937',
              textAlignVertical: 'top',
              minHeight: 100,
            }}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Save Button */}
        <Pressable
          testID="dailyLog_button_save"
          onPress={handleSave}
          disabled={isSaving}
          style={{
            backgroundColor: isSaving ? '#9ca3af' : '#3b82f6',
            paddingVertical: 12,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
          }}>
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Icon name="save" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>Save Log</Text>
            </>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default DailyLogScreen;
