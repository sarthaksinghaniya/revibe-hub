import { describe, it, expect } from "vitest";
import {
  getDecompositionYear,
  getHumanGenerations,
  isDecomposedByYear,
  decayData,
} from "@/components/DecayTimeline";

describe("W2W Decay Timeline & Time Machine Calculations", () => {
  it("computes accurate future decomposition calendar year", () => {
    // 450 years from 2026 is 2476 AD
    expect(getDecompositionYear(450, 2026)).toBe(2476);
    // 50 years from 2026 is 2076 AD
    expect(getDecompositionYear(50, 2026)).toBe(2076);
    // Sub-year decomposes in the same year
    expect(getDecompositionYear(0.5, 2026)).toBe(2027);
  });

  it("calculates human generation equivalents accurately (~25 yrs/generation)", () => {
    expect(getHumanGenerations(450)).toBe(18); // 450 / 25
    expect(getHumanGenerations(500)).toBe(20); // 500 / 25
    expect(getHumanGenerations(50)).toBe(2);   // 50 / 25
    expect(getHumanGenerations(0.12)).toBe(0); // Sub-year produces 0
  });

  it("evaluates whether an item is decomposed by a given simulation year", () => {
    // Banana peel (0.04 years)
    expect(isDecomposedByYear(0.04, 2027, 2026)).toBe(true);

    // Plastic bottle (450 years)
    expect(isDecomposedByYear(450, 2100, 2026)).toBe(false); // Only 74 years elapsed
    expect(isDecomposedByYear(450, 2475, 2026)).toBe(false); // 449 years elapsed
    expect(isDecomposedByYear(450, 2480, 2026)).toBe(true);  // 454 years elapsed (decomposed!)

    // Glass bottle (1,000,000 years)
    expect(isDecomposedByYear(1000000, 3000, 2026)).toBe(false);
  });

  it("contains complete and valid dataset with categories", () => {
    expect(decayData.length).toBeGreaterThanOrEqual(9);
    decayData.forEach((item) => {
      expect(item.name).toBeTruthy();
      expect(item.years).toBeGreaterThan(0);
      expect(item.emoji).toBeTruthy();
      expect(item.category).toBeTruthy();
    });
  });
});
