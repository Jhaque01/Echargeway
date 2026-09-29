import { describe, it, expect } from 'vitest';
import { fmtDrive } from '../ev';

describe('fmtDrive', () => {
  it('returns "—" when input is null or undefined', () => {
    expect(fmtDrive(undefined)).toBe('—');
  });

  it('formats distances taking less than 60 minutes correctly', () => {
    // Math.round((15 / 30) * 60) = 30 min
    expect(fmtDrive(15)).toBe('30 min');

    // Math.max(1, Math.round((0.1 / 30) * 60)) = 1 min
    expect(fmtDrive(0.1)).toBe('1 min');
  });

  it('formats distances taking exactly 60 minutes correctly', () => {
    // Math.round((30 / 30) * 60) = 60 min -> 1h 0m
    expect(fmtDrive(30)).toBe('1h 0m');
  });

  it('formats distances taking more than 60 minutes correctly', () => {
    // Math.round((45 / 30) * 60) = 90 min -> 1h 30m
    expect(fmtDrive(45)).toBe('1h 30m');

    // Math.round((75 / 30) * 60) = 150 min -> 2h 30m
    expect(fmtDrive(75)).toBe('2h 30m');
  });
});
