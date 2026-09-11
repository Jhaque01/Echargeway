import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fmtAge } from './powerloop';

describe('fmtAge', () => {
  const SYSTEM_TIME = new Date('2024-05-15T12:00:00.000Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(SYSTEM_TIME);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('formats date as Today when time difference is 0 days', () => {
    const today = new Date('2024-05-15T10:00:00.000Z');
    const result = fmtAge(today.toISOString());
    const expectedTime = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    expect(result).toBe(`Today · ${expectedTime}`);
  });

  it('formats date as Yesterday when time difference is 1 day', () => {
    const yesterday = new Date('2024-05-14T10:00:00.000Z');
    const result = fmtAge(yesterday.toISOString());
    const expectedTime = yesterday.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    expect(result).toBe(`Yesterday · ${expectedTime}`);
  });

  it('formats older dates with standard date string format (diff >= 2)', () => {
    const older = new Date('2024-05-10T10:00:00.000Z');
    const result = fmtAge(older.toISOString());
    const expectedDate = older.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
    expect(result).toBe(expectedDate);
  });

  it('correctly calculates day diff across daylight boundaries or specific hours (using generic formula)', () => {
    // 25 hours ago, so diff is 25 / 24 = 1.04 -> floor to 1 -> Yesterday
    const yesterday25h = new Date(SYSTEM_TIME.getTime() - 25 * 3600 * 1000);
    const result = fmtAge(yesterday25h.toISOString());
    const expectedTime = yesterday25h.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    expect(result).toBe(`Yesterday · ${expectedTime}`);
  });
});
