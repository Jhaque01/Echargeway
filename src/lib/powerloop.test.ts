import { describe, it, expect } from 'vitest';
import { sortedStations } from './powerloop';

describe('sortedStations', () => {
  it('should sort stations by distance', () => {
    const pos = { lat: 12.9116, lng: 77.6389 }; // Exactly at HSR Layout Point

    const sorted = sortedStations(pos);

    // HSR Layout should be first (id: 3)
    expect(sorted[0].id).toBe(3);

    // Verify it is sorted by distance (km)
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].km).toBeLessThanOrEqual(sorted[i+1].km!);
    }
  });

  it('should include km, distStr, and timeStr properties', () => {
    const pos = { lat: 12.9116, lng: 77.6389 };
    const sorted = sortedStations(pos);

    expect(sorted[0]).toHaveProperty('km');
    expect(sorted[0]).toHaveProperty('distStr');
    expect(sorted[0]).toHaveProperty('timeStr');
    expect(typeof sorted[0].km).toBe('number');
    expect(typeof sorted[0].distStr).toBe('string');
    expect(typeof sorted[0].timeStr).toBe('string');
  });

  it('should correctly sort when position is different', () => {
    const pos = { lat: 12.9784, lng: 77.6408 }; // Indiranagar Hub
    const sorted = sortedStations(pos);

    // Indiranagar Hub should be first (id: 2)
    expect(sorted[0].id).toBe(2);

    // Verify it is sorted by distance (km)
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].km).toBeLessThanOrEqual(sorted[i+1].km!);
    }
  });
});
