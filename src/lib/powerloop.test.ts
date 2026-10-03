import { describe, it, expect } from 'vitest';
import { haversine, fmtDist, fmtTime } from './powerloop';

describe('powerloop utils', () => {
  describe('haversine', () => {
    it('calculates the correct distance between two points', () => {
      // Coordinates for Bangalore (BLR) and Mysore
      const blr = { lat: 12.9352, lng: 77.6245 };
      const mys = { lat: 12.2958, lng: 76.6394 };

      const distance = haversine(blr.lat, blr.lng, mys.lat, mys.lng);

      // Known distance between BLR and Mysore is ~129 km
      expect(distance).toBeCloseTo(129, -1);
    });

    it('returns 0 for the same point', () => {
      const blr = { lat: 12.9352, lng: 77.6245 };
      const distance = haversine(blr.lat, blr.lng, blr.lat, blr.lng);
      expect(distance).toBe(0);
    });

    it('is symmetric', () => {
      const blr = { lat: 12.9352, lng: 77.6245 };
      const mys = { lat: 12.2958, lng: 76.6394 };

      const distance1 = haversine(blr.lat, blr.lng, mys.lat, mys.lng);
      const distance2 = haversine(mys.lat, mys.lng, blr.lat, blr.lng);

      expect(distance1).toBeCloseTo(distance2);
    });
  });

  describe('fmtDist', () => {
    it('formats distances less than 1 km in meters', () => {
      expect(fmtDist(0.5)).toBe('500 m');
      expect(fmtDist(0.999)).toBe('999 m');
      expect(fmtDist(0.001)).toBe('1 m');
    });

    it('formats distances exactly 1 km or greater in kilometers', () => {
      expect(fmtDist(1)).toBe('1.0 km');
      expect(fmtDist(1.5)).toBe('1.5 km');
      expect(fmtDist(12.34)).toBe('12.3 km');
      expect(fmtDist(10)).toBe('10.0 km');
    });
  });

  describe('fmtTime', () => {
    it('formats times less than 60 minutes correctly', () => {
      // 30 km/h speed assumption: 15 km -> 30 mins
      expect(fmtTime(15)).toBe('30 min');

      // 29 km -> ~58 mins
      expect(fmtTime(29)).toBe('58 min');

      // 0 km -> 0 mins
      expect(fmtTime(0)).toBe('0 min');
    });

    it('formats times 60 minutes or greater as hours and minutes', () => {
      // 30 km -> 60 mins -> 1h 0m
      expect(fmtTime(30)).toBe('1h 0m');

      // 45 km -> 90 mins -> 1h 30m
      expect(fmtTime(45)).toBe('1h 30m');

      // 70 km -> 140 mins -> 2h 20m
      expect(fmtTime(70)).toBe('2h 20m');
    });
  });
});
