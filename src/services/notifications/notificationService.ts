/**
 * Notification Service
 * Push notifications and reminders (FR-050 through FR-056)
 */

import {
  getCurrentUserId,
  getDatabase,
  ref,
  get,
  set,
  update,
  remove,
  query,
  orderByChild,
  equalTo,
} from '../../config/firebase';
import notifee, {
  AndroidImportance,
  TimestampTrigger,
  TriggerType,
  RepeatFrequency,
} from '@notifee/react-native';

export interface NotificationSettings {
  dailyReminderEnabled: boolean;
  dailyReminderTime: string; // HH:mm format
  habitReminderEnabled: boolean;
  habitReminderTime: string; // HH:mm format
  weeklyInsightsEnabled: boolean;
  achievementAlertsEnabled: boolean;
  streakRiskAlertsEnabled: boolean;
}

export interface ScheduledNotification {
  id: string;
  type: 'daily_review' | 'habit_reminder' | 'weekly_summary' | 'streak_risk' | 'achievement';
  title: string;
  body: string;
  scheduledTime: number;
  data?: Record<string, any>;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  dailyReminderEnabled: true,
  dailyReminderTime: '09:00',
  habitReminderEnabled: true,
  habitReminderTime: '20:00',
  weeklyInsightsEnabled: true,
  achievementAlertsEnabled: true,
  streakRiskAlertsEnabled: true,
};

// Notification Channel IDs
const CHANNEL_ID = {
  REMINDERS: 'brainlog-reminders',
  ACHIEVEMENTS: 'brainlog-achievements',
  ALERTS: 'brainlog-alerts',
};

/**
 * Initialize notification channels (call on app startup)
 */
export const initializeNotifications = async (): Promise<void> => {
  // Create notification channels for Android
  await notifee.createChannel({
    id: CHANNEL_ID.REMINDERS,
    name: 'Reminders',
    description: 'Daily review and habit reminders',
    importance: AndroidImportance.HIGH,
  });

  await notifee.createChannel({
    id: CHANNEL_ID.ACHIEVEMENTS,
    name: 'Achievements',
    description: 'Badge unlocks and level ups',
    importance: AndroidImportance.DEFAULT,
  });

  await notifee.createChannel({
    id: CHANNEL_ID.ALERTS,
    name: 'Alerts',
    description: 'Streak risk and important alerts',
    importance: AndroidImportance.HIGH,
  });
};

/**
 * Get user's notification settings
 */
export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const settingsRef = ref(getDatabase(), `users/${userId}/settings/notifications`);
  const snapshot = await get(settingsRef);
  const data = snapshot.val();

  return {
    ...DEFAULT_SETTINGS,
    ...data,
  };
};

/**
 * Update notification settings
 */
export const updateNotificationSettings = async (
  settings: Partial<NotificationSettings>,
): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const settingsRef = ref(getDatabase(), `users/${userId}/settings/notifications`);
  await update(settingsRef, settings);

  // Reschedule notifications based on new settings
  await rescheduleNotifications();
};

/**
 * Schedule daily review reminder (FR-050)
 * T436-T437: Now includes both flashcards and memorize items
 */
export const scheduleDailyReviewReminder = async (
  dueCount: number,
  breakdownInfo?: { flashcards: number; memorizeItems: number },
): Promise<void> => {
  const settings = await getNotificationSettings();

  if (!settings.dailyReminderEnabled || dueCount === 0) {
    // Cancel existing reminder if disabled
    await notifee.cancelNotification('daily_review');
    return;
  }

  const scheduledTime = getNextScheduledTime(settings.dailyReminderTime);

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: scheduledTime,
    repeatFrequency: RepeatFrequency.DAILY,
  };

  // Build notification body with breakdown if available
  let body: string;
  if (breakdownInfo && (breakdownInfo.flashcards > 0 || breakdownInfo.memorizeItems > 0)) {
    const parts: string[] = [];
    if (breakdownInfo.flashcards > 0) {
      parts.push(
        `${breakdownInfo.flashcards} flashcard${breakdownInfo.flashcards !== 1 ? 's' : ''}`,
      );
    }
    if (breakdownInfo.memorizeItems > 0) {
      parts.push(
        `${breakdownInfo.memorizeItems} memorize item${
          breakdownInfo.memorizeItems !== 1 ? 's' : ''
        }`,
      );
    }
    body = `You have ${parts.join(' and ')} to review today`;
  } else {
    body = `You have ${dueCount} item${dueCount !== 1 ? 's' : ''} waiting for review`;
  }

  await notifee.createTriggerNotification(
    {
      id: 'daily_review',
      title: 'Time to Review!',
      body,
      android: {
        channelId: CHANNEL_ID.REMINDERS,
        pressAction: { id: 'default' },
      },
      data: {
        type: 'daily_review',
        dueCount: String(dueCount),
        flashcards: String(breakdownInfo?.flashcards || 0),
        memorizeItems: String(breakdownInfo?.memorizeItems || 0),
      },
    },
    trigger,
  );

  // Also save to Firebase for tracking
  const notification: ScheduledNotification = {
    id: 'daily_review',
    type: 'daily_review',
    title: 'Time to Review!',
    body,
    scheduledTime,
    data: {
      dueCount,
      flashcards: breakdownInfo?.flashcards || 0,
      memorizeItems: breakdownInfo?.memorizeItems || 0,
    },
  };
  await saveScheduledNotification(notification);
};

/**
 * Schedule habit reminder (FR-051, FR-053)
 */
export const scheduleHabitReminder = async (
  incompleteHabits: number,
  totalHabits: number,
): Promise<void> => {
  const settings = await getNotificationSettings();

  if (!settings.habitReminderEnabled || incompleteHabits === 0) {
    await notifee.cancelNotification('habit_reminder');
    return;
  }

  const scheduledTime = getNextScheduledTime(settings.habitReminderTime);

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: scheduledTime,
  };

  await notifee.createTriggerNotification(
    {
      id: 'habit_reminder',
      title: 'Complete Your Habits',
      body: `${incompleteHabits} of ${totalHabits} habits remaining for today`,
      android: {
        channelId: CHANNEL_ID.REMINDERS,
        pressAction: { id: 'default' },
      },
      data: { type: 'habit_reminder', incompleteHabits: String(incompleteHabits) },
    },
    trigger,
  );

  const notification: ScheduledNotification = {
    id: 'habit_reminder',
    type: 'habit_reminder',
    title: 'Complete Your Habits',
    body: `${incompleteHabits} of ${totalHabits} habits remaining for today`,
    scheduledTime,
    data: { incompleteHabits, totalHabits },
  };
  await saveScheduledNotification(notification);
};

/**
 * Schedule weekly summary notification (FR-052)
 */
export const scheduleWeeklySummaryNotification = async (): Promise<void> => {
  const settings = await getNotificationSettings();

  if (!settings.weeklyInsightsEnabled) {
    return;
  }

  // Schedule for Sunday at 8 PM
  const notification: ScheduledNotification = {
    id: 'weekly_summary',
    type: 'weekly_summary',
    title: 'Weekly Learning Summary',
    body: 'Your weekly learning insights are ready!',
    scheduledTime: getNextSundayEvening(),
  };

  await saveScheduledNotification(notification);
};

/**
 * Send achievement notification (FR-054, FR-055)
 */
export const sendAchievementNotification = async (
  achievementType: 'badge' | 'level_up' | 'streak_milestone',
  data: { name: string; description?: string },
): Promise<void> => {
  const settings = await getNotificationSettings();

  if (!settings.achievementAlertsEnabled) {
    return;
  }

  let title: string;
  let body: string;

  switch (achievementType) {
    case 'badge':
      title = 'Badge Unlocked!';
      body = `You earned the "${data.name}" badge!`;
      break;
    case 'level_up':
      title = 'Level Up!';
      body = `Congratulations! You reached ${data.name}!`;
      break;
    case 'streak_milestone':
      title = 'Streak Milestone!';
      body = `Amazing! You've maintained a ${data.name} streak!`;
      break;
  }

  // Display immediate notification
  await notifee.displayNotification({
    title,
    body,
    android: {
      channelId: CHANNEL_ID.ACHIEVEMENTS,
      pressAction: { id: 'default' },
    },
    data: { type: achievementType, name: data.name },
  });
};

/**
 * Send streak risk notification
 */
export const sendStreakRiskNotification = async (currentStreak: number): Promise<void> => {
  const settings = await getNotificationSettings();

  if (!settings.streakRiskAlertsEnabled || currentStreak === 0) {
    return;
  }

  await notifee.displayNotification({
    title: "Don't Break Your Streak!",
    body: `Your ${currentStreak}-day streak is at risk. Complete a review to keep it going!`,
    android: {
      channelId: CHANNEL_ID.ALERTS,
      pressAction: { id: 'default' },
    },
    data: { type: 'streak_risk', currentStreak: String(currentStreak) },
  });
};

/**
 * Cancel scheduled notification
 */
export const cancelNotification = async (notificationId: string): Promise<void> => {
  // Cancel from Notifee
  await notifee.cancelNotification(notificationId);

  // Also remove from Firebase
  const userId = getCurrentUserId();
  if (!userId) return;

  const notificationRef = ref(
    getDatabase(),
    `users/${userId}/scheduledNotifications/${notificationId}`,
  );
  await remove(notificationRef);
};

/**
 * Cancel habit reminder (when all habits completed)
 */
export const cancelHabitReminder = async (): Promise<void> => {
  await cancelNotification('habit_reminder');
};

/**
 * Reschedule all notifications based on current settings
 * T436-T437: Now includes memorize items in daily review reminder count
 */
export const rescheduleNotifications = async (): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) return;

  // Cancel all existing Notifee scheduled notifications
  await notifee.cancelAllNotifications();

  // Clear from Firebase
  const scheduledRef = ref(getDatabase(), `users/${userId}/scheduledNotifications`);
  await remove(scheduledRef);

  // Get current settings
  const settings = await getNotificationSettings();

  // Reschedule daily review reminder if enabled
  if (settings.dailyReminderEnabled) {
    const today = new Date().toISOString().split('T')[0];

    // Get due flashcards count
    const flashcardsRef = ref(getDatabase(), `users/${userId}/flashcards`);
    const flashcardsSnapshot = await get(flashcardsRef);
    let flashcardsDueCount = 0;
    if (flashcardsSnapshot.exists()) {
      const flashcardsData = flashcardsSnapshot.val();
      flashcardsDueCount = Object.values(flashcardsData || {}).filter(
        (card: any) => card.nextReviewDate <= today,
      ).length;
    }

    // Get due memorize items count (T436-T437)
    const memorizeRef = ref(getDatabase(), `users/${userId}/memorizeItems`);
    const memorizeSnapshot = await get(memorizeRef);
    let memorizeItemsDueCount = 0;
    if (memorizeSnapshot.exists()) {
      const memorizeData = memorizeSnapshot.val();
      memorizeItemsDueCount = Object.values(memorizeData || {}).filter(
        (item: any) => item.nextReviewDate <= today,
      ).length;
    }

    const totalDueCount = flashcardsDueCount + memorizeItemsDueCount;

    if (totalDueCount > 0) {
      await scheduleDailyReviewReminder(totalDueCount, {
        flashcards: flashcardsDueCount,
        memorizeItems: memorizeItemsDueCount,
      });
    }
  }

  // Reschedule habit reminder if enabled
  if (settings.habitReminderEnabled) {
    // Get today's habit status
    const today = new Date().toISOString().split('T')[0];
    const habitsRef = ref(getDatabase(), `users/${userId}/habitDefinitions`);
    const habitsQuery = query(habitsRef, orderByChild('isActive'), equalTo(true));
    const habitsSnapshot = await get(habitsQuery);
    const habitLogRef = ref(getDatabase(), `users/${userId}/habitLogEntries/${today}`);
    const habitLogSnapshot = await get(habitLogRef);

    const totalHabits = habitsSnapshot.numChildren();
    const completions = habitLogSnapshot.val()?.habitCompletions || {};
    const completedCount = Object.values(completions).filter(Boolean).length;
    const incompleteHabits = totalHabits - completedCount;

    if (incompleteHabits > 0) {
      await scheduleHabitReminder(incompleteHabits, totalHabits);
    }
  }

  // Reschedule weekly summary if enabled
  if (settings.weeklyInsightsEnabled) {
    await scheduleWeeklySummaryNotification();
  }
};

// Helper functions

const saveScheduledNotification = async (notification: ScheduledNotification): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) return;

  const notificationRef = ref(
    getDatabase(),
    `users/${userId}/scheduledNotifications/${notification.id}`,
  );
  await set(notificationRef, notification);
};

const getNextScheduledTime = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const now = new Date();
  const scheduled = new Date();
  scheduled.setHours(hours, minutes, 0, 0);

  // If time has passed today, schedule for tomorrow
  if (scheduled <= now) {
    scheduled.setDate(scheduled.getDate() + 1);
  }

  return scheduled.getTime();
};

const getNextSundayEvening = (): number => {
  const now = new Date();
  const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + daysUntilSunday);
  nextSunday.setHours(20, 0, 0, 0);

  return nextSunday.getTime();
};

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  const settings = await notifee.requestPermission();
  return settings.authorizationStatus >= 1; // 1 = authorized
};

/**
 * Check if notifications are enabled
 */
export const areNotificationsEnabled = async (): Promise<boolean> => {
  const settings = await notifee.getNotificationSettings();
  return settings.authorizationStatus >= 1;
};

/**
 * Get all scheduled notifications
 */
export const getScheduledNotifications = async () => {
  return notifee.getTriggerNotifications();
};

/**
 * Cancel all notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  await notifee.cancelAllNotifications();

  const userId = getCurrentUserId();
  if (userId) {
    const scheduledRef = ref(getDatabase(), `users/${userId}/scheduledNotifications`);
    await remove(scheduledRef);
  }
};
