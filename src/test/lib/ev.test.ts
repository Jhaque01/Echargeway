import { describe, it, expect } from "vitest";
import { costBreakdown, PLATFORM_FEE, TAX_RATE } from "../../lib/ev";

describe("costBreakdown", () => {
  it("should calculate correctly for 0 energy", () => {
    const result = costBreakdown(0, 10);
    expect(result).toEqual({
      energyCost: 0,
      platformFee: PLATFORM_FEE,
      taxes: Math.round(PLATFORM_FEE * TAX_RATE * 100) / 100,
      total: Math.round((PLATFORM_FEE + (PLATFORM_FEE * TAX_RATE)) * 100) / 100,
    });
  });

  it("should calculate correctly for normal inputs", () => {
    const result = costBreakdown(50, 10);
    expect(result).toEqual({
      energyCost: 500,
      platformFee: 10,
      taxes: 91.8, // (500 + 10) * 0.18 = 91.8
      total: 601.8, // 500 + 10 + 91.8 = 601.8
    });
  });

  it("should handle rounding properly with 2 decimal places", () => {
    // 33.333333333333 * 7.5 = 249.9999999999975 -> 250
    // taxes = (250 + 10) * 0.18 = 46.8
    // total = 250 + 10 + 46.8 = 306.8
    const result = costBreakdown(33.333333333333, 7.5);
    expect(result).toEqual({
      energyCost: 250,
      platformFee: 10,
      taxes: 46.8,
      total: 306.8,
    });
  });

  it("should handle negative energy as normal math", () => {
    // Note: The function doesn't restrict negative values currently,
    // so we just verify the math is consistent.
    const result = costBreakdown(-10, 10);
    expect(result).toEqual({
      energyCost: -100,
      platformFee: 10,
      taxes: -16.2, // (-100 + 10) * 0.18 = -90 * 0.18 = -16.2
      total: -106.2,
    });
  });
});
