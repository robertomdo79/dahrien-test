import { describe, it, expect } from '@jest/globals';

/**
 * Unit tests for date overlap logic
 * 
 * These tests verify the business logic for detecting overlapping reservations.
 * Two time ranges overlap if: (start1 < end2) AND (end1 > start2)
 */

interface TimeRange {
  start: Date;
  end: Date;
}

/**
 * Check if two time ranges overlap
 */
function doTimesOverlap(range1: TimeRange, range2: TimeRange): boolean {
  return range1.start < range2.end && range1.end > range2.start;
}

describe('Time Overlap Logic', () => {
  describe('doTimesOverlap', () => {
    it('should detect overlap when ranges completely overlap', () => {
      const range1 = {
        start: new Date('2026-01-20T09:00:00'),
        end: new Date('2026-01-20T11:00:00'),
      };
      const range2 = {
        start: new Date('2026-01-20T09:00:00'),
        end: new Date('2026-01-20T11:00:00'),
      };

      expect(doTimesOverlap(range1, range2)).toBe(true);
    });

    it('should detect overlap when one range contains another', () => {
      const range1 = {
        start: new Date('2026-01-20T08:00:00'),
        end: new Date('2026-01-20T12:00:00'),
      };
      const range2 = {
        start: new Date('2026-01-20T09:00:00'),
        end: new Date('2026-01-20T11:00:00'),
      };

      expect(doTimesOverlap(range1, range2)).toBe(true);
    });

    it('should detect overlap when ranges partially overlap (new starts during existing)', () => {
      const existing = {
        start: new Date('2026-01-20T09:00:00'),
        end: new Date('2026-01-20T11:00:00'),
      };
      const newRange = {
        start: new Date('2026-01-20T10:00:00'),
        end: new Date('2026-01-20T12:00:00'),
      };

      expect(doTimesOverlap(existing, newRange)).toBe(true);
    });

    it('should detect overlap when ranges partially overlap (new ends during existing)', () => {
      const existing = {
        start: new Date('2026-01-20T10:00:00'),
        end: new Date('2026-01-20T12:00:00'),
      };
      const newRange = {
        start: new Date('2026-01-20T09:00:00'),
        end: new Date('2026-01-20T11:00:00'),
      };

      expect(doTimesOverlap(existing, newRange)).toBe(true);
    });

    it('should NOT detect overlap when ranges are adjacent (back-to-back)', () => {
      const range1 = {
        start: new Date('2026-01-20T09:00:00'),
        end: new Date('2026-01-20T11:00:00'),
      };
      const range2 = {
        start: new Date('2026-01-20T11:00:00'), // Starts exactly when range1 ends
        end: new Date('2026-01-20T13:00:00'),
      };

      expect(doTimesOverlap(range1, range2)).toBe(false);
    });

    it('should NOT detect overlap when ranges are completely separate', () => {
      const range1 = {
        start: new Date('2026-01-20T09:00:00'),
        end: new Date('2026-01-20T11:00:00'),
      };
      const range2 = {
        start: new Date('2026-01-20T14:00:00'),
        end: new Date('2026-01-20T16:00:00'),
      };

      expect(doTimesOverlap(range1, range2)).toBe(false);
    });

    it('should NOT detect overlap when ranges are on different days', () => {
      const range1 = {
        start: new Date('2026-01-20T09:00:00'),
        end: new Date('2026-01-20T11:00:00'),
      };
      const range2 = {
        start: new Date('2026-01-21T09:00:00'),
        end: new Date('2026-01-21T11:00:00'),
      };

      expect(doTimesOverlap(range1, range2)).toBe(false);
    });
  });
});

describe('Week Calculation Logic', () => {
  /**
   * Get the Monday of the week containing the given date
   */
  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * Get the Sunday of the week containing the given date
   */
  function getWeekEnd(date: Date): Date {
    const monday = getWeekStart(date);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return sunday;
  }

  it('should correctly calculate Monday for a Wednesday', () => {
    const wednesday = new Date('2026-01-21'); // Wednesday
    const monday = getWeekStart(wednesday);
    
    expect(monday.getDay()).toBe(1); // Monday
    expect(monday.getDate()).toBe(19);
  });

  it('should correctly calculate Monday for a Sunday', () => {
    const sunday = new Date('2026-01-25'); // Sunday
    const monday = getWeekStart(sunday);
    
    expect(monday.getDay()).toBe(1); // Monday
    expect(monday.getDate()).toBe(19);
  });

  it('should correctly calculate Sunday for a week', () => {
    const date = new Date('2026-01-21'); // Wednesday
    const sunday = getWeekEnd(date);
    
    expect(sunday.getDay()).toBe(0); // Sunday
    expect(sunday.getDate()).toBe(25);
  });

  it('should handle week boundaries correctly', () => {
    const monday = new Date('2026-01-19'); // Monday
    const weekStart = getWeekStart(monday);
    
    expect(weekStart.getDate()).toBe(19);
    expect(weekStart.getMonth()).toBe(0); // January
  });
});
