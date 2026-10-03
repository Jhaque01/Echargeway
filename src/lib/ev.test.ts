import { describe, it, expect } from 'vitest';
import { fmtDrive } from './ev';

describe('fmtDrive', () => {
  it('returns "—" when km is undefined or null', () => {
    expect(fmtDrive(undefined)).toBe('—');
  });

  it('returns correctly formatted minutes for short distances', () => {
    // Math.max(1, Math.round((km / 30) * 60))
    // e.g. km = 15 => 15/30 * 60 = 30 mins
    expect(fmtDrive(15)).toBe('30 min');
    // km = 0 => 0 => max(1, 0) = 1 min
    expect(fmtDrive(0)).toBe('1 min');
  });

  it('returns correctly formatted hours and minutes for long distances', () => {
    // e.g. km = 35 => 35/30 * 60 = 70 mins => 1h 10m
    expect(fmtDrive(35)).toBe('1h 10m');
    // e.g. km = 60 => 60/30 * 60 = 120 mins => 2h 0m
    expect(fmtDrive(60)).toBe('2h 0m');
  });
});
