import { describe, it, expect } from 'vitest';
import { costBreakdown } from './ev';

describe('costBreakdown', () => {
  it('calculates costs correctly for standard inputs', () => {
    // 50 kWh at 15 per kWh
    // energyCost: 50 * 15 = 750
    // platformFee: 10
    // taxes: (750 + 10) * 0.18 = 760 * 0.18 = 136.8
    // total: 750 + 10 + 136.8 = 896.8
    const result = costBreakdown(50, 15);
    expect(result).toEqual({
      energyCost: 750,
      platformFee: 10,
      taxes: 136.8,
      total: 896.8,
    });
  });

  it('calculates costs correctly when energy is 0', () => {
    // 0 kWh at 15 per kWh
    // energyCost: 0
    // platformFee: 10
    // taxes: (0 + 10) * 0.18 = 1.8
    // total: 0 + 10 + 1.8 = 11.8
    const result = costBreakdown(0, 15);
    expect(result).toEqual({
      energyCost: 0,
      platformFee: 10,
      taxes: 1.8,
      total: 11.8,
    });
  });

  it('handles fractional energy and price inputs correctly and rounds to 2 decimals', () => {
    // 25.5 kWh at 12.75 per kWh
    // energyCost: 25.5 * 12.75 = 325.125
    // rounded energyCost: 325.13 (in actual code, this value itself is not used directly for tax, the unrounded value is used)
    // platformFee: 10
    // taxes: (325.125 + 10) * 0.18 = 335.125 * 0.18 = 60.3225 -> rounded: 60.32
    // total: 325.125 + 10 + 60.3225 = 395.4475 -> rounded: 395.45
    const result = costBreakdown(25.5, 12.75);
    expect(result).toEqual({
      energyCost: 325.13,
      platformFee: 10,
      taxes: 60.32,
      total: 395.45,
    });
  });

  it('calculates costs correctly with a different price per kWh', () => {
    // 100 kWh at 20 per kWh
    // energyCost: 100 * 20 = 2000
    // platformFee: 10
    // taxes: (2000 + 10) * 0.18 = 361.8
    // total: 2000 + 10 + 361.8 = 2371.8
    const result = costBreakdown(100, 20);
    expect(result).toEqual({
      energyCost: 2000,
      platformFee: 10,
      taxes: 361.8,
      total: 2371.8,
    });
  });
});
