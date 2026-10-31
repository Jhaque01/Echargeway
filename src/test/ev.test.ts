import { describe, it, expect } from "vitest";
import { haversine } from "../lib/ev";

describe("haversine", () => {
  it("should return 0 for the exact same point", () => {
    expect(haversine(40.7128, -74.0060, 40.7128, -74.0060)).toBeCloseTo(0, 4);
  });

  it("should calculate distance between New York and London", () => {
    // New York: 40.7128° N, 74.0060° W
    // London: 51.5074° N, 0.1278° W
    // The exact distance varies slightly based on the radius used, but should be around 5570 km
    expect(haversine(40.7128, -74.0060, 51.5074, -0.1278)).toBeCloseTo(5570, 0);
  });

  it("should calculate distance for 1 degree on the equator", () => {
    // 1 degree on the equator is approximately 111.19 km (with R=6371)
    expect(haversine(0, 0, 0, 1)).toBeCloseTo(111.19, 1);
  });

  it("should calculate distance from North Pole to South Pole", () => {
    // Distance from North Pole to South Pole is half the Earth's circumference
    // pi * R = pi * 6371 ≈ 20015 km
    expect(haversine(90, 0, -90, 0)).toBeCloseTo(20015, 0);
  });

  it("should handle crossing the anti-meridian", () => {
    // Testing near 180 / -180 longitude
    const dist1 = haversine(0, 179, 0, -179);
    const dist2 = haversine(0, 179, 0, 181);

    // Both should be 2 degrees apart, distance roughly 222 km
    expect(dist1).toBeCloseTo(222.39, 1);
    expect(dist2).toBeCloseTo(222.39, 1);
  });
});
