import { describe, it, expect } from 'vitest';
import { costBreakdown, PLATFORM_FEE } from './ev';

describe('costBreakdown', () => {
  it('calculates costs correctly for standard inputs', () => {
    // 10 kWh at 15/kWh
    // energyCost = 150
    // taxes = (150 + 10) * 0.18 = 28.8
    // total = 150 + 10 + 28.8 = 188.8
    const result = costBreakdown(10, 15);

    expect(result.energyCost).toBeCloseTo(150);
    expect(result.platformFee).toBe(PLATFORM_FEE);
    expect(result.taxes).toBeCloseTo(28.8);
    expect(result.total).toBeCloseTo(188.8);
  });

  it('handles zero energy consumption properly', () => {
    // 0 kWh at 15/kWh
    // energyCost = 0
    // taxes = (0 + 10) * 0.18 = 1.8
    // total = 0 + 10 + 1.8 = 11.8
    const result = costBreakdown(0, 15);

    expect(result.energyCost).toBeCloseTo(0);
    expect(result.platformFee).toBe(PLATFORM_FEE);
    expect(result.taxes).toBeCloseTo(1.8);
    expect(result.total).toBeCloseTo(11.8);
  });

  it('rounds correctly for fractional inputs', () => {
    // 12.345 kWh at 15.67/kWh
    // energyCost = 193.44615 -> rounded: 193.45
    // taxes = (193.44615 + 10) * 0.18 = 36.620307 -> rounded: 36.62
    // total = 193.44615 + 10 + 36.620307 = 240.066457 -> rounded: 240.07
    const result = costBreakdown(12.345, 15.67);

    expect(result.energyCost).toBeCloseTo(193.45);
    expect(result.platformFee).toBe(PLATFORM_FEE);
    expect(result.taxes).toBeCloseTo(36.62);
    expect(result.total).toBeCloseTo(240.07);
  });
});
