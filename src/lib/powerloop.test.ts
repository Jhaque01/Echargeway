import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fmtAge } from './powerloop';

describe('fmtAge', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Set a fixed system time so tests are deterministic
    // Using a fixed date where timezone differences won't push us into the wrong day
    vi.setSystemTime(new Date('2023-10-15T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('formats dates from today', () => {
    const today = new Date('2023-10-15T08:30:00.000Z');
    const expectedTime = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    expect(fmtAge('2023-10-15T08:30:00.000Z')).toBe(`Today · ${expectedTime}`);
  });

  it('formats dates from yesterday', () => {
    const yesterday = new Date('2023-10-14T10:00:00.000Z');
    const expectedTime = yesterday.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    expect(fmtAge('2023-10-14T10:00:00.000Z')).toBe(`Yesterday · ${expectedTime}`);
  });

  it('formats older dates', () => {
    const olderDate = new Date('2023-10-10T10:00:00.000Z');
    const expectedDate = olderDate.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
    expect(fmtAge('2023-10-10T10:00:00.000Z')).toBe(expectedDate);
  });
});
