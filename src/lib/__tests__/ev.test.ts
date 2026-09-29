import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { availability, Charger } from '../ev';

describe('availability function', () => {
  // Helper to create a mock charger
  const createCharger = (overrides?: Partial<Charger>): Charger => ({
    id: 'mock-id',
    station_id: 'mock-station-id',
    charger_code: 'MOCK-1',
    connector_type: 'CCS2',
    power_kw: 50,
    price_per_kwh: 15,
    status: 'available',
    reserved_until: null,
    reserved_by: null,
    ...overrides,
  });

  beforeEach(() => {
    // Mock Date.now() to ensure tests involving time are deterministic
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return 0 free and 0 total when given an empty array', () => {
    const result = availability([]);
    expect(result).toEqual({ free: 0, total: 0 });
  });

  it('should return 0 free and 0 total when no argument is provided', () => {
    const result = availability();
    expect(result).toEqual({ free: 0, total: 0 });
  });

  it('should count all available chargers correctly', () => {
    const chargers: Charger[] = [
      createCharger(),
      createCharger({ id: 'mock-id-2' }),
    ];
    const result = availability(chargers);
    expect(result).toEqual({ free: 2, total: 2 });
  });

  it('should not count non-available chargers (occupied, offline, faulted)', () => {
    const chargers: Charger[] = [
      createCharger(),
      createCharger({ status: 'occupied' }),
      createCharger({ status: 'offline' }),
      createCharger({ status: 'faulted' }),
      createCharger({ status: 'reserved' }),
    ];
    const result = availability(chargers);
    expect(result).toEqual({ free: 1, total: 5 });
  });

  it('should not count chargers reserved for the future as free', () => {
    const futureDate = new Date('2024-01-01T13:00:00Z').toISOString();
    const chargers: Charger[] = [
      createCharger(),
      createCharger({ reserved_until: futureDate }),
    ];
    const result = availability(chargers);
    expect(result).toEqual({ free: 1, total: 2 });
  });

  it('should count chargers with past reserved_until as free', () => {
    const pastDate = new Date('2024-01-01T11:00:00Z').toISOString();
    const chargers: Charger[] = [
      createCharger(),
      createCharger({ reserved_until: pastDate }),
    ];
    const result = availability(chargers);
    expect(result).toEqual({ free: 2, total: 2 });
  });

  it('should handle reserved_until in the exact present as free (technically > now is false)', () => {
      const nowString = new Date('2024-01-01T12:00:00Z').toISOString();
      const chargers: Charger[] = [
          createCharger({ reserved_until: nowString })
      ]
      const result = availability(chargers);
      expect(result).toEqual({ free: 1, total: 1 });
  })
});
