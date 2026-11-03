import { describe, it, expect } from "vitest";
import { minutesFor } from "./ev";

describe("minutesFor", () => {
  it("calculates correct minutes for normal charging (below 80%, no tapering)", () => {
    // capacity: 50kWh, from 20% to 80% = 30kWh
    // power: 60kW
    // time: (30 / 60) * 60 = 30 mins
    expect(minutesFor(50, 20, 80, 60)).toBe(30);
  });

  it("applies tapering factor for charging above 80%", () => {
    // capacity: 50kWh, from 80% to 100% = 10kWh
    // power: 60kW
    // taper: 1.25
    // time: (10 / 60) * 60 * 1.25 = 12.5 mins (rounded to 13)
    expect(minutesFor(50, 80, 100, 60)).toBe(13);
  });

  it("clamps powerKw to a minimum of 3", () => {
    // capacity: 50kWh, from 20% to 80% = 30kWh
    // power: 2kW (should clamp to 3kW)
    // time: (30 / 3) * 60 = 600 mins
    expect(minutesFor(50, 20, 80, 2)).toBe(600);
  });

  it("returns a minimum of 1 minute", () => {
    // capacity: 50kWh, from 50% to 50.1% = 0.05kWh
    // power: 100kW
    // time: (0.05 / 100) * 60 = 0.03 mins (rounded to 0, clamped to 1)
    expect(minutesFor(50, 50, 50.1, 100)).toBe(1);
  });

  it("returns 1 minute when from >= to (reversed boundaries)", () => {
    // energyFor will return 0
    expect(minutesFor(50, 80, 20, 50)).toBe(1);
    expect(minutesFor(50, 50, 50, 50)).toBe(1);
  });
});
