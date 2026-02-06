/**
 * BrainLog - Personal Learning & Development Tracker
 * Main Application Entry Point
 */

import React from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import {ToastProvider} from './src/components/common/ToastProvider';
import {OptimisticToastConnector} from './src/components/common/OptimisticToastConnector';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />
        <ToastProvider>
          <OptimisticToastConnector>
            <AppNavigator />
          </OptimisticToastConnector>
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
