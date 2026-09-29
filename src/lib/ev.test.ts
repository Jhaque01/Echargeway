import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { effectiveStatus, Charger } from './ev';

describe('effectiveStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createCharger = (overrides: Partial<Charger> = {}): Charger => ({
    id: 'c1',
    station_id: 's1',
    charger_code: 'code1',
    connector_type: 'CCS2',
    power_kw: 50,
    price_per_kwh: 15,
    status: 'available',
    reserved_until: null,
    reserved_by: null,
    ...overrides,
  });

  it('returns original status when there is no reservation', () => {
    const charger = createCharger({ status: 'available', reserved_until: null });
    expect(effectiveStatus(charger)).toBe('available');
  });

  it('returns reserved when reserved_until is in the future', () => {
    const charger = createCharger({ status: 'available', reserved_until: '2024-01-01T13:00:00Z' });
    expect(effectiveStatus(charger)).toBe('reserved');
  });

  it('returns original status when reserved_until is in the past', () => {
    const charger = createCharger({ status: 'available', reserved_until: '2024-01-01T11:00:00Z' });
    expect(effectiveStatus(charger)).toBe('available');
  });

  it('returns original status when status is not available and no reservation', () => {
    const charger = createCharger({ status: 'occupied', reserved_until: null });
    expect(effectiveStatus(charger)).toBe('occupied');
  });
});
