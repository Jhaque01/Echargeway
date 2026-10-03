import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { availability, effectiveStatus, Charger } from './ev';

const createCharger = (overrides: Partial<Charger> = {}): Charger => ({
  id: 'c1',
  station_id: 's1',
  charger_code: 'C01',
  connector_type: 'Type 2',
  power_kw: 22,
  price_per_kwh: 0.15,
  status: 'available',
  reserved_until: null,
  reserved_by: null,
  ...overrides,
});

describe('ev.ts', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('availability', () => {
    it('returns 0 free and 0 total for empty array', () => {
      expect(availability([])).toEqual({ free: 0, total: 0 });
    });

    it('returns 0 free and 0 total when undefined is passed', () => {
      expect(availability(undefined)).toEqual({ free: 0, total: 0 });
    });

    it('counts available chargers correctly', () => {
      const chargers = [
        createCharger({ status: 'available' }),
        createCharger({ status: 'available' }),
      ];
      expect(availability(chargers)).toEqual({ free: 2, total: 2 });
    });

    it('does not count non-available chargers as free', () => {
      const chargers = [
        createCharger({ status: 'available' }),
        createCharger({ status: 'occupied' }),
        createCharger({ status: 'offline' }),
        createCharger({ status: 'faulted' }),
      ];
      expect(availability(chargers)).toEqual({ free: 1, total: 4 });
    });

    it('does not count chargers as free if they are currently reserved', () => {
      const chargers = [
        createCharger({ status: 'available', reserved_until: '2024-01-01T13:00:00Z' }), // future
      ];
      expect(availability(chargers)).toEqual({ free: 0, total: 1 });
    });

    it('counts chargers as free if their reservation has expired', () => {
      const chargers = [
        createCharger({ status: 'available', reserved_until: '2024-01-01T11:00:00Z' }), // past
      ];
      expect(availability(chargers)).toEqual({ free: 1, total: 1 });
    });

    it('handles a mix of different statuses and reservations', () => {
      const chargers = [
        createCharger({ status: 'available' }),
        createCharger({ status: 'available', reserved_until: '2024-01-01T13:00:00Z' }), // reserved
        createCharger({ status: 'available', reserved_until: '2024-01-01T11:00:00Z' }), // reservation expired
        createCharger({ status: 'occupied' }),
      ];
      expect(availability(chargers)).toEqual({ free: 2, total: 4 });
    });
  });

  describe('effectiveStatus', () => {
    it('returns actual status when not reserved', () => {
      const charger = createCharger({ status: 'available' });
      expect(effectiveStatus(charger)).toBe('available');
    });

    it('returns actual status when reserved_until is null', () => {
      const charger = createCharger({ status: 'occupied', reserved_until: null });
      expect(effectiveStatus(charger)).toBe('occupied');
    });

    it('returns reserved when reserved_until is in the future', () => {
      const charger = createCharger({ status: 'available', reserved_until: '2024-01-01T13:00:00Z' });
      expect(effectiveStatus(charger)).toBe('reserved');
    });

    it('returns actual status when reserved_until is in the past', () => {
      const charger = createCharger({ status: 'available', reserved_until: '2024-01-01T11:00:00Z' });
      expect(effectiveStatus(charger)).toBe('available');
    });
  });
});
