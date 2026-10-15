import { describe, it, expect } from 'vitest';
import { sortedStations, STATIONS } from './powerloop';

describe('sortedStations', () => {
  it('should sort stations by distance from a given position', () => {
    // Position of the first station (Koramangala Station)
    const pos = { lat: 12.9279, lng: 77.6271 };

    const sorted = sortedStations(pos);

    // The closest station should be the one at the exact same coordinates
    expect(sorted[0].id).toBe(1);
    expect(sorted[0].km).toBe(0);
    expect(sorted[0].distStr).toBe('0 m');
    expect(sorted[0].timeStr).toBe('0 min');

    // Ensure all stations are returned
    expect(sorted.length).toBe(STATIONS.length);

    // Verify the list is sorted by distance (ascending)
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].km!).toBeLessThanOrEqual(sorted[i + 1].km!);
    }
  });

  it('should calculate distStr and timeStr correctly for all returned stations', () => {
    // Random position in BLR
    const pos = { lat: 12.9352, lng: 77.6245 };

    const sorted = sortedStations(pos);

    sorted.forEach(station => {
      expect(station.km).toBeDefined();
      expect(typeof station.km).toBe('number');
      expect(station.km!).toBeGreaterThanOrEqual(0);

      expect(station.distStr).toBeDefined();
      expect(typeof station.distStr).toBe('string');

      expect(station.timeStr).toBeDefined();
      expect(typeof station.timeStr).toBe('string');
    });
  });
});
