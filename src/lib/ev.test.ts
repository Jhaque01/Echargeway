import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { availability, Charger } from "./ev";

describe("availability", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockCharger = (overrides?: Partial<Charger>): Charger => ({
    id: "1",
    station_id: "st1",
    charger_code: "C1",
    connector_type: "CCS2",
    power_kw: 50,
    price_per_kwh: 15,
    status: "available",
    reserved_until: null,
    reserved_by: null,
    ...overrides,
  });

  it("returns 0 free and 0 total when no chargers provided", () => {
    expect(availability()).toEqual({ free: 0, total: 0 });
    expect(availability([])).toEqual({ free: 0, total: 0 });
  });

  it("counts available chargers with no reservations", () => {
    const chargers = [
      mockCharger({ id: "1" }),
      mockCharger({ id: "2" }),
    ];
    expect(availability(chargers)).toEqual({ free: 2, total: 2 });
  });

  it("does not count non-available chargers", () => {
    const chargers = [
      mockCharger({ status: "available" }),
      mockCharger({ status: "occupied" }),
      mockCharger({ status: "faulted" }),
      mockCharger({ status: "offline" }),
    ];
    expect(availability(chargers)).toEqual({ free: 1, total: 4 });
  });

  it("does not count available chargers with future reservations", () => {
    const chargers = [
      mockCharger({ status: "available", reserved_until: "2024-01-01T13:00:00.000Z" }), // Future
    ];
    expect(availability(chargers)).toEqual({ free: 0, total: 1 });
  });

  it("counts available chargers with past reservations", () => {
    const chargers = [
      mockCharger({ status: "available", reserved_until: "2024-01-01T11:00:00.000Z" }), // Past
    ];
    expect(availability(chargers)).toEqual({ free: 1, total: 1 });
  });

  it("handles mixed scenarios correctly", () => {
    const chargers = [
      mockCharger({ status: "available" }),
      mockCharger({ status: "occupied" }),
      mockCharger({ status: "available", reserved_until: "2024-01-01T13:00:00.000Z" }), // Future
      mockCharger({ status: "available", reserved_until: "2024-01-01T11:00:00.000Z" }), // Past
    ];
    expect(availability(chargers)).toEqual({ free: 2, total: 4 });
  });
});
