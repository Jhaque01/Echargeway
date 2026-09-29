import { describe, it, expect } from 'vitest';
import { haversine } from './ev';

describe('haversine', () => {
  it('should return 0 for identical points', () => {
    expect(haversine(0, 0, 0, 0)).toBe(0);
    expect(haversine(12.9352, 77.6245, 12.9352, 77.6245)).toBe(0);
    expect(haversine(-40, 120, -40, 120)).toBe(0);
  });

  it('should calculate distance correctly for points on the equator', () => {
    // 90 degrees longitude difference on the equator is exactly one quarter of the circumference
    // (6371 * 2 * PI) / 4 = 10007.543398...
    const dist = haversine(0, 0, 0, 90);
    expect(dist).toBeCloseTo(10007.54, 1);
  });

  it('should calculate distance correctly across poles', () => {
    // North pole to South pole
    // 180 degrees latitude difference is exactly half of the circumference
    // (6371 * 2 * PI) / 2 = 20015.086...
    const dist = haversine(90, 0, -90, 0);
    expect(dist).toBeCloseTo(20015.09, 1);
  });

  it('should calculate real-world distances accurately', () => {
    // New York (40.7128, -74.0060) to London (51.5074, -0.1278)
    // Distance is approx 5570 km
    const nyToLondon = haversine(40.7128, -74.0060, 51.5074, -0.1278);
    // Allow a small margin due to Earth's shape approximations, haversine uses perfectly spherical Earth with R=6371
    expect(nyToLondon).toBeCloseTo(5570, -1);

    // San Francisco (37.7749, -122.4194) to Los Angeles (34.0522, -118.2437)
    // Distance is approx 559 km
    const sfToLa = haversine(37.7749, -122.4194, 34.0522, -118.2437);
    expect(sfToLa).toBeCloseTo(559, -1);
  });

  it('should handle negative coordinates and crossing the equator/prime meridian', () => {
    // Sydney (-33.8688, 151.2093) to Tokyo (35.6762, 139.6503)
    // Distance is approx 7825 km
    const sydToTokyo = haversine(-33.8688, 151.2093, 35.6762, 139.6503);
    expect(sydToTokyo).toBeCloseTo(7826, 0);
  });

  it('should be symmetric (distance from A to B is the same as B to A)', () => {
    const lat1 = 12.34;
    const lng1 = 56.78;
    const lat2 = -9.87;
    const lng2 = -65.43;
    const dist1 = haversine(lat1, lng1, lat2, lng2);
    const dist2 = haversine(lat2, lng2, lat1, lng1);
    expect(dist1).toBe(dist2);
  });
});
