/**
 * Main Tab Navigator
 * Includes OfflineIndicator for network status (FR-022)
 * Includes UploadStatusBadge and ActivityLogSheet (FR-015, FR-016)
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import type {
  MainTabParamList,
  FlashcardsStackParamList,
  NotesStackParamList,
  CalendarStackParamList,
  ProfileStackParamList,
} from './types';
import { colors } from '../config/theme';
import { useStore } from '../store';
import { UploadStatusBadge, ActivityLogSheet } from '../components/upload';

// Import screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import FlashcardListScreen from '../screens/flashcards/FlashcardListScreen';
import CreateFlashcardScreen from '../screens/flashcards/CreateFlashcardScreen';
import ReviewSessionScreen from '../screens/flashcards/ReviewSessionScreen';
import ReviewCompleteScreen from '../screens/flashcards/ReviewCompleteScreen';
import EditFlashcardScreen from '../screens/flashcards/EditFlashcardScreen';
import FlashcardDetailScreen from '../screens/flashcards/FlashcardDetailScreen';
import NoteListScreen from '../screens/notes/NoteListScreen';
import CreateNoteScreen from '../screens/notes/CreateNoteScreen';
import EditNoteScreen from '../screens/notes/EditNoteScreen';
import NoteDetailScreen from '../screens/notes/NoteDetailScreen';
import CalendarScreen from '../screens/calendar/CalendarScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import HabitsScreen from '../screens/profile/HabitsScreen';
import CreateHabitScreen from '../screens/profile/CreateHabitScreen';
import EditHabitScreen from '../screens/profile/EditHabitScreen';
import BadgesScreen from '../screens/profile/BadgesScreen';
import StatisticsScreen from '../screens/profile/StatisticsScreen';

// New screens
import BookmarkListScreen from '../screens/bookmarks/BookmarkListScreen';
import CreateBookmarkScreen from '../screens/bookmarks/CreateBookmarkScreen';
import BookmarkDetailScreen from '../screens/bookmarks/BookmarkDetailScreen';
import DailyLogScreen from '../screens/dailylog/DailyLogScreen';
import DayDetailScreen from '../screens/calendar/DayDetailScreen';
import VideoListScreen from '../screens/videos/VideoListScreen';
import VideoDetailScreen from '../screens/videos/VideoDetailScreen';
import UploadVideoScreen from '../screens/videos/UploadVideoScreen';
import VoiceNoteListScreen from '../screens/voiceNotes/VoiceNoteListScreen';
import VoiceNoteDetailScreen from '../screens/voiceNotes/VoiceNoteDetailScreen';
import RecordVoiceNoteScreen from '../screens/voiceNotes/RecordVoiceNoteScreen';
import WeeklySummaryScreen from '../screens/insights/WeeklySummaryScreen';
import WeeklySummaryListScreen from '../screens/insights/WeeklySummaryListScreen';
import MemorizeListScreen from '../screens/memorize/MemorizeListScreen';
import MemorizeDetailScreen from '../screens/memorize/MemorizeDetailScreen';
import MemorizeReviewScreen from '../screens/memorize/MemorizeReviewScreen';
import CreateMemorizeItemScreen from '../screens/memorize/CreateMemorizeItemScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const FlashcardsStack = createNativeStackNavigator<FlashcardsStackParamList>();
const NotesStack = createNativeStackNavigator<NotesStackParamList>();
const CalendarStack = createNativeStackNavigator<CalendarStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

// Flashcards Stack Navigator
const FlashcardsNavigator: React.FC = () => (
  <FlashcardsStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: { fontWeight: '600' },
      freezeOnBlur: false, // Disable screen freezing to prevent Fabric view recycling crash
    }}>
    <FlashcardsStack.Screen
      name="FlashcardList"
      component={FlashcardListScreen}
      options={{ title: 'Flashcards' }}
    />
    <FlashcardsStack.Screen
      name="CreateFlashcard"
      component={CreateFlashcardScreen}
      options={{ title: 'Create Flashcard' }}
    />
    <FlashcardsStack.Screen
      name="ReviewSession"
      component={ReviewSessionScreen}
      options={{ title: 'Review', headerShown: false }}
    />
    <FlashcardsStack.Screen
      name="ReviewComplete"
      component={ReviewCompleteScreen}
      options={{ title: 'Complete', headerShown: false }}
    />
    <FlashcardsStack.Screen
      name="EditFlashcard"
      component={EditFlashcardScreen}
      options={{ title: 'Edit Flashcard' }}
    />
    <FlashcardsStack.Screen
      name="FlashcardDetail"
      component={FlashcardDetailScreen}
      options={{ title: 'Flashcard Details' }}
    />
  </FlashcardsStack.Navigator>
);

// Notes Stack Navigator (includes Bookmarks, Videos, Voice Notes)
const NotesNavigator: React.FC = () => (
  <NotesStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: { fontWeight: '600' },
      freezeOnBlur: false, // Disable screen freezing to prevent Fabric view recycling crash
    }}>
    <NotesStack.Screen name="NoteList" component={NoteListScreen} options={{ title: 'Notes' }} />
    <NotesStack.Screen
      name="CreateNote"
      component={CreateNoteScreen}
      options={{ title: 'Create Note' }}
    />
    <NotesStack.Screen
      name="EditNote"
      component={EditNoteScreen}
      options={{ title: 'Edit Note' }}
    />
    <NotesStack.Screen name="NoteDetail" component={NoteDetailScreen} options={{ title: 'Note' }} />
    {/* Bookmarks */}
    <NotesStack.Screen
      name="BookmarkList"
      component={BookmarkListScreen}
      options={{ title: 'Bookmarks', headerShown: false }}
    />
    <NotesStack.Screen
      name="CreateBookmark"
      component={CreateBookmarkScreen}
      options={{ title: 'Save Bookmark', headerShown: false }}
    />
    <NotesStack.Screen
      name="BookmarkDetail"
      component={BookmarkDetailScreen}
      options={{ title: 'Bookmark', headerShown: false }}
    />
    {/* Videos */}
    <NotesStack.Screen
      name="VideoList"
      component={VideoListScreen}
      options={{ title: 'Videos', headerShown: false }}
    />
    <NotesStack.Screen
      name="VideoDetail"
      component={VideoDetailScreen}
      options={{ title: 'Video', headerShown: false }}
    />
    <NotesStack.Screen
      name="UploadVideo"
      component={UploadVideoScreen}
      options={{ title: 'Upload Video', headerShown: false }}
    />
    {/* Voice Notes */}
    <NotesStack.Screen
      name="VoiceNoteList"
      component={VoiceNoteListScreen}
      options={{ title: 'Voice Notes', headerShown: false }}
    />
    <NotesStack.Screen
      name="VoiceNoteDetail"
      component={VoiceNoteDetailScreen}
      options={{ title: 'Voice Note', headerShown: false }}
    />
    <NotesStack.Screen
      name="RecordVoiceNote"
      component={RecordVoiceNoteScreen}
      options={{ title: 'Record', headerShown: false }}
    />
  </NotesStack.Navigator>
);

// Calendar Stack Navigator
const CalendarNavigator: React.FC = () => (
  <CalendarStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: { fontWeight: '600' },
      freezeOnBlur: false, // Disable screen freezing to prevent Fabric view recycling crash
    }}>
    <CalendarStack.Screen
      name="CalendarView"
      component={CalendarScreen}
      options={{ title: 'Calendar' }}
    />
    <CalendarStack.Screen
      name="DayDetail"
      component={DayDetailScreen}
      options={{ title: 'Day Details', headerShown: false }}
    />
    <CalendarStack.Screen
      name="DailyLog"
      component={DailyLogScreen}
      options={{ title: 'Daily Log', headerShown: false }}
    />
    <CalendarStack.Screen
      name="WeeklySummary"
      component={WeeklySummaryScreen}
      options={{ title: 'Weekly Summary', headerShown: false }}
    />
    <CalendarStack.Screen
      name="WeeklySummaryList"
      component={WeeklySummaryListScreen}
      options={{ title: 'Weekly Insights', headerShown: false }}
    />
    <CalendarStack.Screen
      name="WeeklySummaryDetail"
      component={WeeklySummaryScreen}
      options={{ title: 'Weekly Summary', headerShown: false }}
    />
  </CalendarStack.Navigator>
);

// Profile Stack Navigator
const ProfileNavigator: React.FC = () => (
  <ProfileStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: { fontWeight: '600' },
      freezeOnBlur: false, // Disable screen freezing to prevent Fabric view recycling crash
    }}>
    <ProfileStack.Screen
      name="ProfileMain"
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
    <ProfileStack.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ title: 'Settings' }}
    />
    <ProfileStack.Screen name="Habits" component={HabitsScreen} options={{ title: 'Habits' }} />
    <ProfileStack.Screen
      name="CreateHabit"
      component={CreateHabitScreen}
      options={{ title: 'Create Habit' }}
    />
    <ProfileStack.Screen
      name="EditHabit"
      component={EditHabitScreen}
      options={{ title: 'Edit Habit' }}
    />
    <ProfileStack.Screen name="Badges" component={BadgesScreen} options={{ title: 'Badges' }} />
    <ProfileStack.Screen
      name="Statistics"
      component={StatisticsScreen}
      options={{ title: 'Statistics' }}
    />
    {/* Memorize */}
    <ProfileStack.Screen
      name="MemorizeList"
      component={MemorizeListScreen}
      options={{ title: 'Memorize', headerShown: false }}
    />
    <ProfileStack.Screen
      name="MemorizeDetail"
      component={MemorizeDetailScreen}
      options={{ title: 'Memorize Item', headerShown: false }}
    />
    <ProfileStack.Screen
      name="MemorizeReview"
      component={MemorizeReviewScreen}
      options={{ title: 'Review', headerShown: false }}
    />
    <ProfileStack.Screen
      name="CreateMemorizeItem"
      component={CreateMemorizeItemScreen}
      options={{ title: 'Add to Memorize', headerShown: false }}
    />
  </ProfileStack.Navigator>
);

// Tab icon component - wrapped in View for Fabric compatibility
// collapsable={false} prevents Fabric from optimizing away the wrapper View
// React.memo prevents unnecessary re-renders that cause Fabric view recycling crash
const TabIcon = React.memo<{
  name: string;
  focused: boolean;
  color: string;
  size: number;
}>(({ name, focused, color, size }) => {
  const iconName = focused ? name : `${name}-outline`;
  return (
    <View
      collapsable={false}
      style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Icon name={iconName} size={size} color={color} />
    </View>
  );
});

// Main Tab Navigator
const MainTabs: React.FC = () => {
  const dueCount = useStore(state => state.dueCount);
  const [activitySheetVisible, setActivitySheetVisible] = useState(false);

  const handleOpenActivitySheet = useCallback(() => {
    setActivitySheetVisible(true);
  }, []);

  const handleCloseActivitySheet = useCallback(() => {
    setActivitySheetVisible(false);
  }, []);

  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.light.textSecondary,
          tabBarStyle: {
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
          },
          lazy: false, // Pre-render all tabs to prevent Fabric view recycling crash
        }}>
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ focused, color, size }) => (
              <TabIcon name="home" focused={focused} color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Flashcards"
          component={FlashcardsNavigator}
          options={{
            tabBarLabel: 'Cards',
            tabBarIcon: ({ focused, color, size }) => (
              <TabIcon name="albums" focused={focused} color={color} size={size} />
            ),
            tabBarBadge: dueCount > 0 ? dueCount : undefined,
          }}
        />
        <Tab.Screen
          name="Notes"
          component={NotesNavigator}
          options={{
            tabBarLabel: 'Notes',
            tabBarIcon: ({ focused, color, size }) => (
              <TabIcon name="document-text" focused={focused} color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Calendar"
          component={CalendarNavigator}
          options={{
            tabBarLabel: 'Calendar',
            tabBarIcon: ({ focused, color, size }) => (
              <TabIcon name="calendar" focused={focused} color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileNavigator}
          options={{
            tabBarLabel: 'Profile',
            tabBarIcon: ({ focused, color, size }) => (
              <TabIcon name="person" focused={focused} color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>

      {/* Upload Status Badge */}
      <UploadStatusBadge onPress={handleOpenActivitySheet} />

      {/* Activity Log Sheet */}
      <ActivityLogSheet visible={activitySheetVisible} onClose={handleCloseActivitySheet} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MainTabs;
