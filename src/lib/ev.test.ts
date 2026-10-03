import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { effectiveStatus, Charger } from './ev';

describe('effectiveStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const baseCharger: Charger = {
    id: 'c1',
    station_id: 's1',
    charger_code: 'CODE1',
    connector_type: 'Type 2',
    power_kw: 22,
    price_per_kwh: 15,
    status: 'available',
    reserved_until: null,
    reserved_by: null,
  };

  it('should return the original status if reserved_until is null', () => {
    expect(effectiveStatus({ ...baseCharger, status: 'available', reserved_until: null })).toBe('available');
    expect(effectiveStatus({ ...baseCharger, status: 'faulted', reserved_until: null })).toBe('faulted');
  });

  it('should return the original status if reserved_until is in the past', () => {
    vi.setSystemTime(new Date('2023-01-01T12:00:00Z'));
    expect(effectiveStatus({
      ...baseCharger,
      status: 'available',
      reserved_until: '2023-01-01T11:00:00Z'
    })).toBe('available');
  });

  it('should return "reserved" if reserved_until is in the future', () => {
    vi.setSystemTime(new Date('2023-01-01T12:00:00Z'));
    expect(effectiveStatus({
      ...baseCharger,
      status: 'available',
      reserved_until: '2023-01-01T13:00:00Z'
    })).toBe('reserved');
  });

  it('should return original status if reserved_until is exactly now', () => {
    vi.setSystemTime(new Date('2023-01-01T12:00:00Z'));
    expect(effectiveStatus({
      ...baseCharger,
      status: 'available',
      reserved_until: '2023-01-01T12:00:00Z'
    })).toBe('available');
  });
});
