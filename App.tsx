/**
 * LearnTracker - Personal Learning & Development Tracker
 * Entry point component
 */

import React, {useEffect} from 'react';
import {AppNavigator} from './src/navigation/AppNavigator';
import {configureGoogleSignIn} from './src/services/firebase/authService';

function App(): React.JSX.Element {
  useEffect(() => {
    // Configure Google Sign-In on app start
    try {
      configureGoogleSignIn();
      console.log('[App] Google Sign-In configured');
    } catch (error) {
      console.error('[App] Failed to configure Google Sign-In:', error);
    }
  }, []);

  return <AppNavigator />;
}

export default App;
