import { format, parseISO, isToday, isTomorrow, isPast, isFuture, differenceInMinutes } from 'date-fns';

/**
 * Format a date string to a readable format
 */
export function formatDate(dateString: string, formatStr: string = 'MMM dd, yyyy'): string {
  try {
    return format(parseISO(dateString), formatStr);
  } catch {
    return dateString;
  }
}

/**
 * Format time from ISO string or time string
 */
export function formatTime(timeString: string): string {
  try {
    // Handle full ISO datetime
    if (timeString.includes('T')) {
      return format(parseISO(timeString), 'HH:mm');
    }
    // Handle time-only string (HH:mm)
    return timeString;
  } catch {
    return timeString;
  }
}

/**
 * Format a date with relative context (Today, Tomorrow, etc.)
 */
export function formatRelativeDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEE, MMM dd');
  } catch {
    return dateString;
  }
}

/**
 * Check if a date is in the past
 */
export function isDatePast(dateString: string): boolean {
  try {
    return isPast(parseISO(dateString));
  } catch {
    return false;
  }
}

/**
 * Check if a date is in the future
 */
export function isDateFuture(dateString: string): boolean {
  try {
    return isFuture(parseISO(dateString));
  } catch {
    return false;
  }
}

/**
 * Calculate duration in minutes between two time strings
 */
export function getDurationMinutes(startTime: string, endTime: string): number {
  try {
    const start = parseISO(startTime);
    const end = parseISO(endTime);
    return differenceInMinutes(end, start);
  } catch {
    return 0;
  }
}

/**
 * Format duration from minutes to human readable
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

/**
 * Get current date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Generate time slots for a day (e.g., 08:00, 08:30, 09:00...)
 */
export function generateTimeSlots(
  startHour: number = 8, 
  endHour: number = 20, 
  intervalMinutes: number = 30
): string[] {
  const slots: string[] = [];
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const h = hour.toString().padStart(2, '0');
      const m = minute.toString().padStart(2, '0');
      slots.push(`${h}:${m}`);
    }
  }
  
  // Add the last slot
  const lastH = endHour.toString().padStart(2, '0');
  slots.push(`${lastH}:00`);
  
  return slots;
}
