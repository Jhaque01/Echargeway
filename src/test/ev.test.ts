import { describe, it, expect } from "vitest";
import { haversine } from "../lib/ev";

describe("haversine", () => {
  it("should return 0 for identical coordinates", () => {
    expect(haversine(0, 0, 0, 0)).toBeCloseTo(0);
    expect(haversine(50, 50, 50, 50)).toBeCloseTo(0);
    expect(haversine(-50, -50, -50, -50)).toBeCloseTo(0);
  });

  it("should calculate distance correctly between two points (New York and London)", () => {
    // New York: 40.7128° N, 74.0060° W
    // London: 51.5074° N, 0.1278° W
    // Approximate distance is 5570 km
    expect(haversine(40.7128, -74.0060, 51.5074, -0.1278)).toBeCloseTo(5570, -1);
  });

  it("should calculate distance across the equator", () => {
    // 1 degree of latitude is approximately 111.195 km
    expect(haversine(1, 0, -1, 0)).toBeCloseTo(222.3898, 1);
  });

  it("should calculate distance across the prime meridian", () => {
    // 2 degrees of longitude at the equator is approximately 222.3898 km
    expect(haversine(0, -1, 0, 1)).toBeCloseTo(222.3898, 1);
  });
});
