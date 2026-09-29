import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fmtWhen } from './ev';

describe('fmtWhen', () => {
  beforeEach(() => {
    // Mock system time to a specific date: November 15, 2023, 14:30:00Z
    vi.useFakeTimers();
    const mockDate = new Date('2023-11-15T14:30:00Z');
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('formats dates for today (diff < 24h)', () => {
    // 5 hours ago (diff = 0)
    const today = new Date('2023-11-15T09:30:00Z');
    const result = fmtWhen(today.toISOString());
    const expectedTime = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    expect(result).toBe(`Today · ${expectedTime}`);
  });

  it('formats dates for yesterday (24h <= diff < 48h)', () => {
    // 29 hours ago (diff = 1)
    const yesterday = new Date('2023-11-14T09:30:00Z');
    const result = fmtWhen(yesterday.toISOString());
    const expectedTime = yesterday.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    expect(result).toBe(`Yesterday · ${expectedTime}`);
  });

  it('formats older dates (diff >= 48h)', () => {
    // 53 hours ago (diff = 2)
    const olderDate = new Date('2023-11-13T09:30:00Z');
    const result = fmtWhen(olderDate.toISOString());
    const expectedDate = olderDate.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
    expect(result).toBe(expectedDate);

    // Much older date
    const veryOldDate = new Date('2022-01-01T12:00:00Z');
    const oldResult = fmtWhen(veryOldDate.toISOString());
    const expectedOldDate = veryOldDate.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
    expect(oldResult).toBe(expectedOldDate);
  });
});
