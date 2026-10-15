import { describe, it, expect } from "vitest";
import { haversine } from "./powerloop";

describe("haversine", () => {
  it("should calculate the distance between the same points as 0", () => {
    expect(haversine(12.9352, 77.6245, 12.9352, 77.6245)).toBe(0);
  });

  it("should calculate the correct distance between two known points", () => {
    const distance = haversine(0, 0, 0, 90);
    expect(distance).toBeCloseTo(10007.54, 1);
  });

  it("should be commutative (distance A to B equals distance B to A)", () => {
    const lat1 = 12.9352, lng1 = 77.6245;
    const lat2 = 12.9279, lng2 = 77.6271;
    const dist1 = haversine(lat1, lng1, lat2, lng2);
    const dist2 = haversine(lat2, lng2, lat1, lng1);
    expect(dist1).toBe(dist2);
  });

  it("should calculate a small real-world distance accurately", () => {
    // BLR (12.9352, 77.6245) to Koramangala Station (12.9279, 77.6271)
    const dist = haversine(12.9352, 77.6245, 12.9279, 77.6271);
    expect(dist).toBeGreaterThan(0.8);
    expect(dist).toBeLessThan(0.9);
  });
});
