import { describe, it, expect } from "vitest";
import {
  co2GramsForItem,
  mintFromReservoir,
  verifiedTonneCC,
  co2Equivalents,
  CO2_PROFILE,
  G_PER_CC,
} from "@/lib/co2Formula";

describe("W2W Carbon Credit Engine", () => {
  it("calculates accurate baseline CO2 grams per category", () => {
    expect(co2GramsForItem("recyclable")).toBe(CO2_PROFILE.recyclable.gPerItem);
    expect(co2GramsForItem("compostable")).toBe(CO2_PROFILE.compostable.gPerItem);
    expect(co2GramsForItem("hazardous")).toBe(CO2_PROFILE.hazardous.gPerItem);
    expect(co2GramsForItem("upcyclable")).toBe(CO2_PROFILE.upcyclable.gPerItem);
    expect(co2GramsForItem("landfill")).toBe(0);
  });

  it("doubles CO2 credits for verified drop-offs", () => {
    const normal = co2GramsForItem("recyclable", false);
    const verified = co2GramsForItem("recyclable", true);
    expect(verified).toBe(normal * 2);
  });

  it("mints 1 personal carbon credit for every 1000g accumulated", () => {
    // 600g prev + 500g added = 1100g -> 1 CC minted, 100g pending
    const res = mintFromReservoir(600, 500, 1);
    expect(res.mintedCC).toBe(1);
    expect(res.newPendingG).toBe(100);
    expect(res.multiplier).toBe(1);
  });

  it("applies streak multipliers correctly at mint time", () => {
    // Streak 7+ -> 3x multiplier
    // 0 prev + 2000g added = 2 raw CC * 3x = 6 minted CC
    const res7 = mintFromReservoir(0, 2000, 7);
    expect(res7.mintedCC).toBe(6);
    expect(res7.multiplier).toBe(3);

    // Streak 5 -> 2x multiplier
    const res5 = mintFromReservoir(0, 1000, 5);
    expect(res5.mintedCC).toBe(2);
    expect(res5.multiplier).toBe(2);

    // Streak 3 -> 1.5x multiplier
    const res3 = mintFromReservoir(0, 2000, 3);
    expect(res3.mintedCC).toBe(3); // 2 * 1.5 = 3
    expect(res3.multiplier).toBe(1.5);
  });

  it("calculates IPCC tonne credits properly", () => {
    expect(verifiedTonneCC(1_000_000)).toBe(1);
    expect(verifiedTonneCC(500_000)).toBe(0.5);
  });

  it("computes tangible environmental equivalents", () => {
    const eq = co2Equivalents(1200);
    expect(eq.carKm).toBe(10); // 1200 / 120
    expect(eq.treeDays).toBe(20); // 1200 / 60
    expect(eq.bottlesEquivalent).toBe(1200 / 25);
  });
});
