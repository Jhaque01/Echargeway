import { describe, it, expect } from 'vitest';
import { fmtTime } from './powerloop';

describe('fmtTime', () => {
  it('formats times less than 60 minutes correctly', () => {
    expect(fmtTime(0)).toBe('0 min');
    expect(fmtTime(10)).toBe('20 min');
    expect(fmtTime(15)).toBe('30 min');
    expect(fmtTime(29.4)).toBe('59 min');
  });

  it('formats times 60 minutes and over into hours and minutes', () => {
    expect(fmtTime(30)).toBe('1h 0m');
    expect(fmtTime(45)).toBe('1h 30m');
    expect(fmtTime(60)).toBe('2h 0m');
    expect(fmtTime(75)).toBe('2h 30m');
    // Testing edge of rounding to 60
    expect(fmtTime(29.8)).toBe('1h 0m');
  });

  it('handles rounding logic correctly', () => {
    expect(fmtTime(14.75)).toBe('30 min');
    expect(fmtTime(14.74)).toBe('29 min');
  });
});
