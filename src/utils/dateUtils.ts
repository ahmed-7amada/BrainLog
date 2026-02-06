/**
 * Date Utility Functions
 */

import { format, isToday, isYesterday, differenceInDays, startOfWeek, endOfWeek } from 'date-fns';

/**
 * Format date to ISO date string (YYYY-MM-DD)
 */
export const formatToDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Get today's date key
 */
export const getTodayKey = (): string => {
  return formatToDateKey(new Date());
};

/**
 * Parse ISO date string to Date object
 */
export const parseDateKey = (dateKey: string): Date => {
  return new Date(dateKey + 'T00:00:00');
};

/**
 * Format date for display (e.g., "Jan 15, 2026")
 */
export const formatDisplayDate = (date: Date): string => {
  return format(date, 'MMM d, yyyy');
};

/**
 * Format date with time for display
 */
export const formatDisplayDateTime = (date: Date): string => {
  return format(date, 'MMM d, yyyy h:mm a');
};

/**
 * Get relative date string (Today, Yesterday, or formatted date)
 */
export const getRelativeDate = (date: Date): string => {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return formatDisplayDate(date);
};

/**
 * Get ISO week key (YYYY-Www)
 */
export const getWeekKey = (date: Date): string => {
  const d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNumber =
    1 +
    Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
};

/**
 * Get array of date keys for a month
 */
export const getMonthDateKeys = (year: number, month: number): string[] => {
  const dates: string[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  for (let d = firstDay; d <= lastDay; d.setDate(d.getDate() + 1)) {
    dates.push(formatToDateKey(new Date(d)));
  }

  return dates;
};

/**
 * Get array of date keys for the past N days
 */
export const getPastNDaysKeys = (n: number): string[] => {
  const dates: string[] = [];
  const today = new Date();

  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(formatToDateKey(date));
  }

  return dates;
};

/**
 * Check if date is today
 */
export const isTodayDate = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? parseDateKey(date) : date;
  return isToday(d);
};

/**
 * Get number of days since a date
 */
export const daysSince = (dateKey: string): number => {
  const date = parseDateKey(dateKey);
  return differenceInDays(new Date(), date);
};

/**
 * Check if two dates are consecutive days
 */
export const areConsecutiveDays = (date1: string, date2: string): boolean => {
  const d1 = parseDateKey(date1);
  const d2 = parseDateKey(date2);
  const diff = Math.abs(differenceInDays(d1, d2));
  return diff === 1;
};

/**
 * Get start and end of week for a date
 */
export const getWeekBounds = (date: Date): { start: Date; end: Date } => {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }), // Monday
    end: endOfWeek(date, { weekStartsOn: 1 }),
  };
};

/**
 * Format time string (HH:mm) for display
 */
export const formatTimeDisplay = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

/**
 * Get greeting based on time of day (FR-031)
 */
export const getTimeGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};
