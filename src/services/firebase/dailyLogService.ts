/**
 * Daily Log Service
 * Firebase integration for daily learning journal (FR-036, FR-037, FR-038)
 */

import { getCurrentUserId, getDatabase, ref, get, set, update } from '../../config/firebase';
import type { DailyLog } from '../../models/DailyLog';
import { format } from 'date-fns';

const getDateKey = (date: Date = new Date()): string => format(date, 'yyyy-MM-dd');

/**
 * Get or create today's daily log
 */
export const getTodayLog = async (): Promise<DailyLog | null> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const dateKey = getDateKey();
  const logRef = ref(getDatabase(), `dailyLogs/${userId}/${dateKey}`);
  const snapshot = await get(logRef);
  return snapshot.exists() ? (snapshot.val() as DailyLog) : null;
};

/**
 * Create or update daily log
 */
export const saveDailyLog = async (log: Partial<DailyLog>): Promise<DailyLog> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const dateKey = log.dateKey || getDateKey();
  const existing = await getDailyLogByDate(dateKey);

  const summary = log.summary ||
    existing?.summary || {
      cardsReviewed: 0,
      newCards: 0,
      notesCreated: 0,
      studyMinutes: 0,
      habitsCompleted: 0,
      habitsTotal: 0,
    };

  const dailyLog: DailyLog = {
    id: existing?.id || `log_${userId}_${dateKey}`,
    userId,
    dateKey,
    learned: log.learned || existing?.learned || '',
    challenges: log.challenges || existing?.challenges || '',
    plan: log.plan || existing?.plan || '',
    summary,
    cardsReviewedCount: summary.cardsReviewed,
    newCardsCount: summary.newCards,
    notesCreatedCount: summary.notesCreated,
    studyMinutes: summary.studyMinutes,
    habitsCompletedCount: summary.habitsCompleted,
    habitsTotalCount: summary.habitsTotal,
    linkedItems: log.linkedItems || existing?.linkedItems || [],
    createdAt: existing?.createdAt || Date.now(),
    updatedAt: Date.now(),
  };

  const logRef = ref(getDatabase(), `dailyLogs/${userId}/${dateKey}`);
  await set(logRef, dailyLog);
  return dailyLog;
};

/**
 * Get daily log by date
 */
export const getDailyLogByDate = async (dateKey: string): Promise<DailyLog | null> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const logRef = ref(getDatabase(), `dailyLogs/${userId}/${dateKey}`);
  const snapshot = await get(logRef);
  return snapshot.exists() ? (snapshot.val() as DailyLog) : null;
};

/**
 * Get all daily logs for user
 */
export const getAllDailyLogs = async (): Promise<DailyLog[]> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const logsRef = ref(getDatabase(), `dailyLogs/${userId}`);
  const snapshot = await get(logsRef);
  if (!snapshot.exists()) return [];

  const data = snapshot.val();
  return Object.values(data) as DailyLog[];
};

/**
 * Get daily logs for a date range
 */
export const getDailyLogsInRange = async (startDate: Date, endDate: Date): Promise<DailyLog[]> => {
  const logs = await getAllDailyLogs();
  const startKey = getDateKey(startDate);
  const endKey = getDateKey(endDate);

  return logs.filter(log => log.dateKey >= startKey && log.dateKey <= endKey);
};

/**
 * Update daily log summary with auto-generated stats
 */
export const updateLogSummary = async (
  dateKey: string,
  summary: Partial<DailyLog['summary']>,
): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const existing = await getDailyLogByDate(dateKey);
  if (!existing) return;

  const logRef = ref(getDatabase(), `dailyLogs/${userId}/${dateKey}`);
  await update(logRef, {
    summary: { ...existing.summary, ...summary },
    updatedAt: Date.now(),
  });
};

/**
 * Link item to daily log
 */
export const linkItemToLog = async (
  dateKey: string,
  itemType: 'flashcard' | 'note' | 'video',
  itemId: string,
): Promise<void> => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const existing = await getDailyLogByDate(dateKey);
  if (!existing) return;

  const linkedItems = existing.linkedItems || [];
  if (!linkedItems.some(item => item.id === itemId)) {
    linkedItems.push({ type: itemType, id: itemId });
    const logRef = ref(getDatabase(), `dailyLogs/${userId}/${dateKey}`);
    await update(logRef, {
      linkedItems,
      updatedAt: Date.now(),
    });
  }
};
