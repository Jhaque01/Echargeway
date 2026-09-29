import { describe, it, expect } from 'vitest';
import { energyFor } from './ev';

describe('energyFor', () => {
  it('calculates energy correctly for a standard charge', () => {
    // 50kWh battery, charging from 20% to 80% (60% of capacity)
    // 50 * 0.6 = 30
    expect(energyFor(50, 20, 80)).toBe(30);
  });

  it('calculates energy correctly for a full charge', () => {
    // 100kWh battery, charging from 0% to 100% (100% of capacity)
    // 100 * 1.0 = 100
    expect(energyFor(100, 0, 100)).toBe(100);
  });

  it('returns 0 when from and to percentages are the same', () => {
    // 50kWh battery, charging from 50% to 50% (0% of capacity)
    expect(energyFor(50, 50, 50)).toBe(0);
  });

  it('returns 0 when target percentage is lower than current percentage', () => {
    // 50kWh battery, charging from 80% to 20%
    // The function has Math.max(0, ...), so it should return 0
    expect(energyFor(50, 80, 20)).toBe(0);
  });

  it('handles 0 capacity correctly', () => {
    expect(energyFor(0, 20, 80)).toBe(0);
  });

  it('handles decimal results correctly', () => {
    // 60kWh battery, charging from 15% to 80% (65% of capacity)
    // 60 * 0.65 = 39
    expect(energyFor(60, 15, 80)).toBe(39);

    // 75kWh battery, charging from 20% to 80% (60% of capacity)
    // 75 * 0.6 = 45
    expect(energyFor(75, 20, 80)).toBe(45);
  });
});
