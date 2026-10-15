import { describe, it, expect } from 'vitest';
import { sortedStations, STATIONS } from './powerloop';

describe('sortedStations', () => {
  it('should return all stations sorted by distance in ascending order', () => {
    const pos = { lat: 12.9279, lng: 77.6271 }; // Same as Koramangala Station (id 1)

    const result = sortedStations(pos);

    // Check that we got all stations
    expect(result.length).toBe(STATIONS.length);

    // First station should be Koramangala Station (distance 0)
    expect(result[0].id).toBe(1);
    expect(result[0].km).toBe(0);
    expect(result[0].distStr).toBe('0 m');
    expect(result[0].timeStr).toBe('0 min');

    // Ensure all stations are sorted correctly by km
    for (let i = 0; i < result.length - 1; i++) {
      expect((result[i].km || 0)).toBeLessThanOrEqual(result[i + 1].km || 0);
    }
  });

  it('should correctly format distance in meters (less than 1 km)', () => {
    // Very close to Koramangala Station, but not exactly 0
    const pos = { lat: 12.9279 + 0.001, lng: 77.6271 };
    const result = sortedStations(pos);

    const station = result.find(s => s.id === 1);
    expect(station).toBeDefined();
    expect(station!.km).toBeGreaterThan(0);
    expect(station!.km).toBeLessThan(1);

    // The string should end in ' m' and contain a number
    expect(station!.distStr).toMatch(/^\d+ m$/);
  });

  it('should correctly format distance in kilometers (1 km or more)', () => {
    // Far from Koramangala Station (roughly 11km away)
    const pos = { lat: 12.9279 + 0.1, lng: 77.6271 };
    const result = sortedStations(pos);

    const station = result.find(s => s.id === 1);
    expect(station).toBeDefined();
    expect(station!.km).toBeGreaterThanOrEqual(1);

    // The string should end in ' km' and contain a decimal number
    expect(station!.distStr).toMatch(/^\d+\.\d km$/);
  });

  it('should calculate time correctly with min and h formats', () => {
    const pos = { lat: 12.9279, lng: 77.6271 };
    const result = sortedStations(pos);

    // Ensure timeStr exists and matches 'min' or 'h m' format
    result.forEach(station => {
      expect(station.timeStr).toMatch(/(min|h .*m)/);
    });
  });
});
