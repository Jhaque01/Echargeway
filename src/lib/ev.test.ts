import { describe, it, expect } from 'vitest';
import { costBreakdown, PLATFORM_FEE, TAX_RATE } from './ev';

describe('costBreakdown', () => {
  it('should correctly calculate cost breakdown for standard usage', () => {
    const energyKwh = 50;
    const pricePerKwh = 0.5;
    const energyCost = energyKwh * pricePerKwh;
    const taxes = (energyCost + PLATFORM_FEE) * TAX_RATE;
    const total = energyCost + PLATFORM_FEE + taxes;

    const result = costBreakdown(energyKwh, pricePerKwh);

    expect(result.energyCost).toBe(Math.round(energyCost * 100) / 100);
    expect(result.platformFee).toBe(PLATFORM_FEE);
    expect(result.taxes).toBe(Math.round(taxes * 100) / 100);
    expect(result.total).toBe(Math.round(total * 100) / 100);
  });

  it('should correctly calculate cost breakdown when energy Kwh is zero', () => {
    const energyKwh = 0;
    const pricePerKwh = 0.5;
    const energyCost = 0;
    const taxes = (energyCost + PLATFORM_FEE) * TAX_RATE;
    const total = energyCost + PLATFORM_FEE + taxes;

    const result = costBreakdown(energyKwh, pricePerKwh);

    expect(result.energyCost).toBe(0);
    expect(result.platformFee).toBe(PLATFORM_FEE);
    expect(result.taxes).toBe(Math.round(taxes * 100) / 100);
    expect(result.total).toBe(Math.round(total * 100) / 100);
  });

  it('should correctly calculate cost breakdown with float values leading to rounding', () => {
    const energyKwh = 33.333;
    const pricePerKwh = 0.333;
    const result = costBreakdown(energyKwh, pricePerKwh);

    // energyCost: 33.333 * 0.333 = 11.099889 -> rounded: 11.1
    // taxes: (11.099889 + 10) * 0.18 = 21.099889 * 0.18 = 3.79798002 -> rounded: 3.8
    // total: 11.099889 + 10 + 3.79798002 = 24.89786902 -> rounded: 24.9

    expect(result.energyCost).toBe(11.1);
    expect(result.platformFee).toBe(10);
    expect(result.taxes).toBe(3.8);
    expect(result.total).toBe(24.9);
  });
});
