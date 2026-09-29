import { describe, it, expect } from 'vitest';
import { minutesFor } from '../lib/ev';

describe('minutesFor', () => {
  it('calculates charge time correctly without taper (up to 80%)', () => {
    // capacity: 50kWh, from: 20%, to: 80% => 30kWh
    // powerKw: 50kW
    // time = (30 / 50) * 60 * 1 = 36 minutes
    expect(minutesFor(50, 20, 80, 50)).toBe(36);
  });

  it('calculates charge time correctly with taper (above 80%)', () => {
    // capacity: 50kWh, from: 50%, to: 90% => 20kWh
    // powerKw: 50kW
    // time = (20 / 50) * 60 * 1.25 = 30 minutes
    expect(minutesFor(50, 50, 90, 50)).toBe(30);
  });

  it('clamps powerKw to a minimum of 3', () => {
    // capacity: 10kWh, from: 0%, to: 50% => 5kWh
    // powerKw: 1kW (clamped to 3)
    // time = (5 / 3) * 60 * 1 = 100 minutes
    expect(minutesFor(10, 0, 50, 1)).toBe(100);
  });

  it('returns a minimum of 1 minute even if energy needed is 0', () => {
    // capacity: 50kWh, from: 50%, to: 50% => 0kWh
    // powerKw: 50kW
    // time = max(1, 0) = 1 minute
    expect(minutesFor(50, 50, 50, 50)).toBe(1);
    // capacity: 50kWh, from: 60%, to: 50% (negative energy) => 0kWh
    expect(minutesFor(50, 60, 50, 50)).toBe(1);
  });
});
