/**
 * LearnTracker - Personal Learning & Development Tracker
 * Entry point component
 */

import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
  };

  return (
    <SafeAreaView style={[styles.container, backgroundStyle]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={styles.content}>
        <Text style={[styles.title, {color: isDarkMode ? '#ffffff' : '#000000'}]}>
          🧠 LearnTracker
        </Text>
        <Text style={[styles.subtitle, {color: isDarkMode ? '#cccccc' : '#666666'}]}>
          Personal Learning & Development Tracker
        </Text>
        <Text style={[styles.status, {color: isDarkMode ? '#888888' : '#999999'}]}>
          Setting up your learning journey...
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  status: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default App;
