import { describe, it, expect } from "vitest";
import { energyFor } from "./ev";

describe("energyFor", () => {
  it("should calculate energy correctly for typical charging session", () => {
    // 50kWh battery, from 20% to 80% -> 60% of 50kWh = 30kWh
    expect(energyFor(50, 20, 80)).toBe(30);
  });

  it("should calculate energy correctly for a full charge", () => {
    // 60kWh battery, from 0% to 100% -> 100% of 60kWh = 60kWh
    expect(energyFor(60, 0, 100)).toBe(60);
  });

  it("should return 0 when from is equal to to", () => {
    expect(energyFor(50, 50, 50)).toBe(0);
  });

  it("should return 0 when from is greater than to", () => {
    expect(energyFor(50, 80, 20)).toBe(0);
  });

  it("should handle 0 capacity correctly", () => {
    expect(energyFor(0, 20, 80)).toBe(0);
  });

  it("should handle negative capacity gracefully", () => {
    expect(energyFor(-50, 20, 80)).toBe(0); // Assuming 0 as it returns max(0, -30)
  });
});
