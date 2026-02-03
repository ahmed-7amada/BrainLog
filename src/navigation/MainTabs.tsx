/**
 * Main Tabs Navigator
 * Bottom tab navigation for authenticated users
 */

import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {MainTabsParamList} from './types';

// Placeholder screens - will be implemented in Phase 3+
const DashboardScreen = () => null; // TODO: Phase 5
const FlashcardsScreen = () => null; // TODO: Phase 3
const NotesScreen = () => null; // TODO: Phase 4
const CalendarScreen = () => null; // TODO: Phase 6
const ProfileScreen = () => null; // TODO: Phase 9

const Tab = createBottomTabNavigator<MainTabsParamList>();

export const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#6200EE',
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
          // TODO: Add icon
        }}
      />
      <Tab.Screen
        name="Flashcards"
        component={FlashcardsScreen}
        options={{
          title: 'Flashcards',
          // TODO: Add icon
        }}
      />
      <Tab.Screen
        name="Notes"
        component={NotesScreen}
        options={{
          title: 'Notes',
          // TODO: Add icon
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          title: 'Calendar',
          // TODO: Add icon
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          // TODO: Add icon
        }}
      />
    </Tab.Navigator>
  );
};
