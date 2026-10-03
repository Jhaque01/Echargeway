import { describe, it, expect } from 'vitest';
import { fmtDist } from './powerloop';

describe('fmtDist', () => {
  it('formats distances less than 1km in meters', () => {
    expect(fmtDist(0.5)).toBe('500 m');
    expect(fmtDist(0.0)).toBe('0 m');
    expect(fmtDist(0.999)).toBe('999 m');
    expect(fmtDist(0.9994)).toBe('999 m');
    expect(fmtDist(0.9995)).toBe('1000 m');
  });

  it('formats distances 1km or greater in kilometers', () => {
    expect(fmtDist(1.0)).toBe('1.0 km');
    expect(fmtDist(1.5)).toBe('1.5 km');
    expect(fmtDist(2.0)).toBe('2.0 km');
    expect(fmtDist(10.12)).toBe('10.1 km');
  });

  it('handles floating point formatting edge cases correctly', () => {
    // 12.35 rounds down to 12.3 in JS due to IEEE 754 precision
    expect(fmtDist(12.35)).toBe('12.3 km');

    // 12.45 also rounds down to 12.4 in JS
    expect(fmtDist(12.45)).toBe('12.4 km');

    // 12.55 rounds up to 12.6
    expect(fmtDist(12.55)).toBe('12.6 km');
  });
});
