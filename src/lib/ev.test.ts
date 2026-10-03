import { describe, it, expect } from 'vitest';
import { fmtDuration } from './ev';

describe('fmtDuration', () => {
  it('should handle zero correctly', () => {
    expect(fmtDuration(0)).toBe('0 min');
  });

  it('should handle negative numbers correctly by returning 0 min', () => {
    expect(fmtDuration(-10)).toBe('0 min');
    expect(fmtDuration(-59.5)).toBe('0 min');
  });

  it('should handle values under 60 minutes correctly', () => {
    expect(fmtDuration(10)).toBe('10 min');
    expect(fmtDuration(45)).toBe('45 min');
    expect(fmtDuration(59)).toBe('59 min');
  });

  it('should handle exactly 60 minutes correctly', () => {
    expect(fmtDuration(60)).toBe('1h 0m');
  });

  it('should handle values over 60 minutes correctly', () => {
    expect(fmtDuration(61)).toBe('1h 1m');
    expect(fmtDuration(90)).toBe('1h 30m');
    expect(fmtDuration(120)).toBe('2h 0m');
    expect(fmtDuration(125)).toBe('2h 5m');
  });

  it('should round fractional values correctly', () => {
    expect(fmtDuration(10.4)).toBe('10 min');
    expect(fmtDuration(10.5)).toBe('11 min');
    expect(fmtDuration(59.5)).toBe('1h 0m'); // 60 min
    expect(fmtDuration(60.4)).toBe('1h 0m');
    expect(fmtDuration(60.5)).toBe('1h 1m');
  });
});
