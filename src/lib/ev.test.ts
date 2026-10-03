import { describe, it, expect } from 'vitest';
import { energyFor } from './ev';

describe('energyFor', () => {
  it('calculates the energy correctly for a standard charge', () => {
    // 50kWh battery from 20% to 80% should be 30kWh
    expect(energyFor(50, 20, 80)).toBeCloseTo(30);
  });

  it('calculates the energy correctly with floating point capacities', () => {
    // 40.5kWh battery from 10% to 50% should be 16.2kWh
    expect(energyFor(40.5, 10, 50)).toBeCloseTo(16.2);
  });

  it('returns 0 if target percentage is equal to current percentage', () => {
    expect(energyFor(50, 50, 50)).toBeCloseTo(0);
  });

  it('returns 0 if target percentage is lower than current percentage', () => {
    expect(energyFor(50, 80, 20)).toBeCloseTo(0);
  });

  it('returns 0 if capacity is 0', () => {
    expect(energyFor(0, 20, 80)).toBeCloseTo(0);
  });

  it('handles negative starting percentages gracefully', () => {
    // Assuming the function handles raw math: (80 - (-10)) / 100 * 50 = 45
    expect(energyFor(50, -10, 80)).toBeCloseTo(45);
  });

  it('handles percentages over 100 gracefully', () => {
    // (120 - 20) / 100 * 50 = 50
    expect(energyFor(50, 20, 120)).toBeCloseTo(50);
  });
});
