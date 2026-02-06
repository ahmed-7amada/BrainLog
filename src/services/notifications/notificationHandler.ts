/**
 * Notification Handler
 * Handles notification taps and deep linking (T384)
 */

import notifee, { EventType } from '@notifee/react-native';
import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';

// Navigation ref for use outside of React components
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Navigate to a screen (for use from notification handlers)
 */
export const navigateFromNotification = (screenName: string, params?: Record<string, unknown>) => {
  if (navigationRef.isReady()) {
    // Dynamic navigation - casting to any to allow string screen names
    (navigationRef.navigate as any)('Main', {
      screen: 'Calendar',
      params: {
        screen: screenName,
        params,
      },
    });
  }
};

/**
 * Handle notification press based on notification type
 */
const handleNotificationPress = (data?: Record<string, string>) => {
  if (!data?.type) return;

  switch (data.type) {
    case 'weekly_summary':
      // Navigate to weekly summary screen
      navigateFromNotification('WeeklySummary');
      break;

    case 'daily_review':
      // Navigate to flashcards review
      if (navigationRef.isReady()) {
        navigationRef.navigate('Main', {
          screen: 'Flashcards',
          params: {
            screen: 'ReviewSession',
          },
        });
      }
      break;

    case 'habit_reminder':
      // Navigate to habits screen
      if (navigationRef.isReady()) {
        navigationRef.navigate('Main', {
          screen: 'Profile',
          params: {
            screen: 'Habits',
          },
        });
      }
      break;

    case 'streak_risk':
      // Navigate to dashboard
      if (navigationRef.isReady()) {
        navigationRef.navigate('Main', {
          screen: 'Dashboard',
        });
      }
      break;

    case 'badge':
    case 'level_up':
    case 'streak_milestone':
      // Navigate to badges/profile screen
      if (navigationRef.isReady()) {
        navigationRef.navigate('Main', {
          screen: 'Profile',
          params: {
            screen: 'Badges',
          },
        });
      }
      break;

    default:
      // Default: go to dashboard
      if (navigationRef.isReady()) {
        navigationRef.navigate('Main', {
          screen: 'Dashboard',
        });
      }
      break;
  }
};

/**
 * Set up notification event handlers
 * Call this in App initialization
 */
export const setupNotificationHandlers = () => {
  // Handle foreground events
  const unsubscribeForeground = notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS) {
      handleNotificationPress(detail.notification?.data as Record<string, string>);
    }
  });

  // Handle background events (called when app is in background or killed)
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type === EventType.PRESS) {
      handleNotificationPress(detail.notification?.data as Record<string, string>);
    }
  });

  return unsubscribeForeground;
};

/**
 * Get initial notification if app was opened from a notification
 */
export const getInitialNotification = async () => {
  const initialNotification = await notifee.getInitialNotification();

  if (initialNotification) {
    handleNotificationPress(initialNotification.notification.data as Record<string, string>);
  }
};

export default {
  navigationRef,
  navigateFromNotification,
  setupNotificationHandlers,
  getInitialNotification,
};
