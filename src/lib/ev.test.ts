import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fmtWhen } from './ev';

describe('fmtWhen', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Set system time to a fixed date: 2024-05-20T12:00:00.000Z
    vi.setSystemTime(new Date('2024-05-20T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('formats dates from today', () => {
    // 2 hours ago from 12:00 UTC = 10:00 UTC
    // Depending on local timezone this might differ, but diff in days should be 0
    const todayStr = '2024-05-20T10:30:00.000Z';
    const date = new Date(todayStr);
    const expectedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    expect(fmtWhen(todayStr)).toBe(`Today · ${expectedTime}`);
  });

  it('formats dates from yesterday', () => {
    // Yesterday: 2024-05-19
    const yesterdayStr = '2024-05-19T08:15:00.000Z';
    const date = new Date(yesterdayStr);
    const expectedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    expect(fmtWhen(yesterdayStr)).toBe(`Yesterday · ${expectedTime}`);
  });

  it('formats older dates using date string', () => {
    // Older date: 2024-05-15
    const olderStr = '2024-05-15T15:45:00.000Z';
    const date = new Date(olderStr);
    const expectedDate = date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
    expect(fmtWhen(olderStr)).toBe(expectedDate);
  });
});
