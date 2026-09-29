import { describe, it, expect } from 'vitest';
import { fmtDist } from './ev';

describe('fmtDist', () => {
  it('should handle undefined or null', () => {
    expect(fmtDist(undefined)).toBe('—');
    // @ts-expect-error testing null input
    expect(fmtDist(null)).toBe('—');
  });

  it('should format distances less than 1 km in meters', () => {
    expect(fmtDist(0)).toBe('0 m');
    expect(fmtDist(0.5)).toBe('500 m');
    expect(fmtDist(0.123)).toBe('123 m');
    expect(fmtDist(0.999)).toBe('999 m');
  });

  it('should format distances 1 km or greater in kilometers with one decimal place', () => {
    expect(fmtDist(1)).toBe('1.0 km');
    expect(fmtDist(1.5)).toBe('1.5 km');
    expect(fmtDist(12.34)).toBe('12.3 km');
    expect(fmtDist(12.35)).toBe('12.3 km'); // Note: floating point toFixed(1) rounds down here
    expect(fmtDist(12.36)).toBe('12.4 km');
    expect(fmtDist(100)).toBe('100.0 km');
  });
});
