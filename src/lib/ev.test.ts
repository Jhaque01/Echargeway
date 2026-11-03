import { describe, it, expect } from 'vitest';
import { minutesFor } from './ev';

describe('minutesFor', () => {
  it('calculates minutes correctly without taper (<= 80%)', () => {
    // 50kWh battery, 20% to 80% = 30kWh. 50kW charger.
    // 30kWh / 50kW = 0.6 hours = 36 minutes
    expect(minutesFor(50, 20, 80, 50)).toBe(36);
  });

  it('applies taper correctly when target is > 80%', () => {
    // 50kWh battery, 20% to 90% = 35kWh. 50kW charger.
    // 35kWh / 50kW = 0.7 hours = 42 minutes. Taper 1.25 -> 52.5 -> 53
    expect(minutesFor(50, 20, 90, 50)).toBe(53);
  });

  it('enforces a minimum power of 3kW', () => {
    // 50kWh battery, 10% to 20% = 5kWh. Charger 2kW (should use 3kW).
    // 5kWh / 3kW = 1.666 hours = 100 minutes
    expect(minutesFor(50, 10, 20, 2)).toBe(100);
  });

  it('enforces a minimum duration of 1 minute', () => {
    // 50kWh battery, 20% to 21% = 0.5kWh. 350kW charger.
    // 0.5kWh / 350kW = 0.0014 hours = 0.085 minutes. Min 1.
    expect(minutesFor(50, 20, 21, 350)).toBe(1);
  });

  it('returns 1 minute if zero kwh is needed', () => {
    // 50kWh battery, 50% to 50% = 0kWh.
    expect(minutesFor(50, 50, 50, 50)).toBe(1);
  });

  it('returns 1 minute if negative kwh is needed', () => {
    // 50kWh battery, 80% to 20% = 0kWh (energyFor caps at 0).
    expect(minutesFor(50, 80, 20, 50)).toBe(1);
  });
});
