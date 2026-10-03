import { describe, it, expect } from 'vitest';
import { fmtTime } from './powerloop';

describe('fmtTime', () => {
  it('formats duration under 60 minutes correctly', () => {
    expect(fmtTime(0)).toBe('0 min');
    expect(fmtTime(15)).toBe('30 min');
    expect(fmtTime(29.5)).toBe('59 min');
  });

  it('formats exactly 60 minutes as 1h 0m', () => {
    expect(fmtTime(30)).toBe('1h 0m');
  });

  it('formats durations over 60 minutes correctly', () => {
    expect(fmtTime(45)).toBe('1h 30m');
    expect(fmtTime(60)).toBe('2h 0m');
    expect(fmtTime(75)).toBe('2h 30m');
  });

  it('handles edge cases involving rounding', () => {
    // 29.74 / 30 * 60 = 59.48, rounds to 59
    expect(fmtTime(29.74)).toBe('59 min');
    // 29.75 / 30 * 60 = 59.5, rounds to 60
    expect(fmtTime(29.75)).toBe('1h 0m');
    // 30.24 / 30 * 60 = 60.48, rounds to 60
    expect(fmtTime(30.24)).toBe('1h 0m');
    // 30.25 / 30 * 60 = 60.5, rounds to 61
    expect(fmtTime(30.25)).toBe('1h 1m');
  });
});
