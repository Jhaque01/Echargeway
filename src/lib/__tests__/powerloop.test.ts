import { describe, it, expect } from "vitest";
import { sortedStations, STATIONS, BLR } from "../powerloop";

describe("sortedStations", () => {
  it("should sort stations by distance (closest first)", () => {
    // We use a known coordinate, for example BLR (12.9352, 77.6245)
    // The closest station should be at index 0
    const sorted = sortedStations(BLR);

    // Check that we have the same number of stations
    expect(sorted.length).toBe(STATIONS.length);

    // Check that distances are monotonically increasing
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].km).toBeLessThanOrEqual(sorted[i + 1].km!);
    }
  });

  it("should add km, distStr, and timeStr properties", () => {
    const sorted = sortedStations(BLR);

    // Every station should have these properties added
    for (const station of sorted) {
      expect(station).toHaveProperty("km");
      expect(typeof station.km).toBe("number");

      expect(station).toHaveProperty("distStr");
      expect(typeof station.distStr).toBe("string");

      expect(station).toHaveProperty("timeStr");
      expect(typeof station.timeStr).toBe("string");
    }
  });

  it("should return distance 0 for exact station coordinates", () => {
    // Pick the first station to test against
    const firstStation = STATIONS[0];
    const pos = { lat: firstStation.lat, lng: firstStation.lng };

    const sorted = sortedStations(pos);

    // The closest station should be the one we picked
    expect(sorted[0].id).toBe(firstStation.id);

    // Distance should be 0 (or very close to 0 due to float precision)
    expect(sorted[0].km).toBeCloseTo(0, 5);
    expect(sorted[0].distStr).toBe("0 m"); // fmtDist(0) returns '0 m'
    expect(sorted[0].timeStr).toBe("0 min"); // fmtTime(0) returns '0 min'
  });
});
