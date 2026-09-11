import { describe, it, expect } from 'vitest';
import { haversine } from './powerloop';

describe('haversine distance calculation', () => {
  it('should return 0 for the exact same point', () => {
    expect(haversine(0, 0, 0, 0)).toBe(0);
    expect(haversine(45, 45, 45, 45)).toBe(0);
    expect(haversine(-90, 180, -90, 180)).toBe(0);
  });

  it('should calculate distance correctly between two known points (e.g. New York and London)', () => {
    // New York: 40.7128° N, -74.0060° W
    // London: 51.5074° N, -0.1278° W
    const nyLat = 40.7128;
    const nyLon = -74.0060;
    const lonLat = 51.5074;
    const lonLon = -0.1278;

    const distance = haversine(nyLat, nyLon, lonLat, lonLon);

    // Distance between NY and London is approx 5570 km
    expect(distance).toBeGreaterThan(5500);
    expect(distance).toBeLessThan(5650);
  });

  it('should correctly calculate distance for points on the equator', () => {
    // 1 degree on equator is approx 111.195 km
    // Given R = 6371 in the function, 1 degree = 6371 * pi / 180 = 111.1949...
    const distance = haversine(0, 0, 0, 1);
    expect(distance).toBeCloseTo(111.19, 1);
  });

  it('should correctly calculate distance from North Pole to South Pole', () => {
    // North pole (90, 0) to South Pole (-90, 0)
    // Distance should be half circumference of earth: pi * R = 3.14159 * 6371 = 20015 km
    const distance = haversine(90, 0, -90, 0);
    expect(distance).toBeCloseTo(20015, 0);
  });

  it('should be symmetric: distance from A to B equals B to A', () => {
    const lat1 = 34.0522; // LA
    const lon1 = -118.2437;
    const lat2 = 35.6895; // Tokyo
    const lon2 = 139.6917;

    const distAB = haversine(lat1, lon1, lat2, lon2);
    const distBA = haversine(lat2, lon2, lat1, lon1);

    expect(distAB).toBeCloseTo(distBA, 5);
  });

  it('should handle negative coordinates correctly', () => {
    // Sydney: -33.8688° S, 151.2093° E
    // Cape Town: -33.9249° S, 18.4241° E
    const sydLat = -33.8688;
    const sydLon = 151.2093;
    const cptLat = -33.9249;
    const cptLon = 18.4241;

    const distance = haversine(sydLat, sydLon, cptLat, cptLon);

    // Approx 11000 km
    expect(distance).toBeGreaterThan(10000);
    expect(distance).toBeLessThan(12000);
  });
});
