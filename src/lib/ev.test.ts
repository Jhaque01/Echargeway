import { describe, it, expect } from "vitest";
import { energyFor } from "./ev";

describe("energyFor", () => {
  it("calculates energy for a standard charge from 10% to 80%", () => {
    // 70% of 100kWh = 70kWh
    expect(energyFor(100, 10, 80)).toBe(70);
  });

  it("calculates energy for a standard charge from 20% to 50%", () => {
    // 30% of 50kWh = 15kWh
    expect(energyFor(50, 20, 50)).toBe(15);
  });

  it("returns 0 if from and to are the same", () => {
    expect(energyFor(75, 50, 50)).toBe(0);
  });

  it("returns 0 if from is greater than to (negative difference)", () => {
    expect(energyFor(75, 80, 50)).toBe(0);
  });

  it("handles 0 capacity", () => {
    expect(energyFor(0, 10, 80)).toBe(0);
  });

  it("handles full charge from 0% to 100%", () => {
    expect(energyFor(60, 0, 100)).toBe(60);
  });
});
