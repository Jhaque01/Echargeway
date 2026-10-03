import { describe, it, expect } from 'vitest';
import { minutesFor } from './ev';

describe('minutesFor', () => {
  it('calculates standard charging up to 80% without taper', () => {
    // capacity: 50kWh, from: 20%, to: 80% -> 30kWh energyFor
    // powerKw: 50kW
    // kwh / powerKw = 30 / 50 = 0.6 hours = 36 minutes
    expect(minutesFor(50, 20, 80, 50)).toBe(36);
  });

  it('applies 1.25 taper multiplier when charging above 80%', () => {
    // capacity: 50kWh, from: 80%, to: 90% -> 5kWh energyFor
    // powerKw: 50kW
    // kwh / powerKw = 5 / 50 = 0.1 hours = 6 minutes without taper
    // With taper (1.25), 6 * 1.25 = 7.5 -> rounded to 8 minutes
    expect(minutesFor(50, 80, 90, 50)).toBe(8);

    // capacity: 50kWh, from: 20%, to: 100% -> 40kWh energyFor
    // powerKw: 50kW
    // kwh / powerKw = 40 / 50 = 0.8 hours = 48 minutes without taper
    // With taper (1.25), 48 * 1.25 = 60 minutes
    expect(minutesFor(50, 20, 100, 50)).toBe(60);
  });

  it('clamps powerKw to a minimum of 3 kW', () => {
    // capacity: 50kWh, from: 20%, to: 80% -> 30kWh
    // powerKw: 1kW (should be clamped to 3kW)
    // kwh / powerKw = 30 / 3 = 10 hours = 600 minutes
    expect(minutesFor(50, 20, 80, 1)).toBe(600);

    // powerKw: 0kW (should be clamped to 3kW)
    expect(minutesFor(50, 20, 80, 0)).toBe(600);
  });

  it('returns a minimum of 1 minute when no charging is needed', () => {
    // from >= to
    expect(minutesFor(50, 50, 50, 50)).toBe(1);
    expect(minutesFor(50, 80, 20, 50)).toBe(1);
  });

  it('returns a minimum of 1 minute for extremely fast theoretical charges', () => {
    // capacity: 10kWh, from: 20%, to: 21% -> 0.1kWh
    // powerKw: 350kW
    // 0.1 / 350 * 60 = 0.017 minutes -> rounded to 0 -> should return 1
    expect(minutesFor(10, 20, 21, 350)).toBe(1);
  });
});
