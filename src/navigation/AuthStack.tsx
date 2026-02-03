/**
 * Auth Stack Navigator
 * Navigation for unauthenticated users
 */

import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AuthStackParamList} from './types';

// Placeholder screen - will be implemented in Phase 3
const LoginScreen = () => {
  return null; // TODO: Implement in Phase 3
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
};
