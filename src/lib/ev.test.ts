import { describe, it, expect } from 'vitest';
import { fmtDrive } from './ev';

describe('fmtDrive', () => {
  it('should return "—" if km is undefined', () => {
    expect(fmtDrive()).toBe('—');
  });

  it('should return "1 min" for 0 km (minimum time)', () => {
    expect(fmtDrive(0)).toBe('1 min');
  });

  it('should return minutes format if under 60 minutes', () => {
    // 1 km -> 1 / 30 * 60 = 2 mins
    expect(fmtDrive(1)).toBe('2 min');
    // 29 km -> 29 / 30 * 60 = 58 mins
    expect(fmtDrive(29)).toBe('58 min');
  });

  it('should return hours and minutes format for exactly 60 minutes', () => {
    // 30 km -> 30 / 30 * 60 = 60 mins -> 1h 0m
    expect(fmtDrive(30)).toBe('1h 0m');
  });

  it('should return hours and minutes format for over 60 minutes', () => {
    // 45 km -> 45 / 30 * 60 = 90 mins -> 1h 30m
    expect(fmtDrive(45)).toBe('1h 30m');
    // 75 km -> 75 / 30 * 60 = 150 mins -> 2h 30m
    expect(fmtDrive(75)).toBe('2h 30m');
  });
});
