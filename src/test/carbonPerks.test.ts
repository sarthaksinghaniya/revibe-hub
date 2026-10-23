import { describe, it, expect, beforeEach } from "vitest";
import {
  PERK_ITEMS,
  getRedemptionHistory,
  saveRedemption,
  type RedemptionRecord,
} from "@/components/CarbonPerksStore";

describe("W2W Carbon Perks & Tree Store", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("contains curated partner perks across categories", () => {
    expect(PERK_ITEMS.length).toBeGreaterThanOrEqual(4);
    const categories = PERK_ITEMS.map((p) => p.category);
    expect(categories).toContain("voucher");
    expect(categories).toContain("tree");
    expect(categories).toContain("certificate");

    PERK_ITEMS.forEach((perk) => {
      expect(perk.costCC).toBeGreaterThan(0);
      expect(perk.brand).toBeTruthy();
      expect(perk.codePrefix).toBeTruthy();
    });
  });

  it("saves and retrieves redemption history in localStorage", () => {
    expect(getRedemptionHistory()).toEqual([]);

    const sampleRecord: RedemptionRecord = {
      id: "red_123",
      perkId: "perk_tree",
      perkTitle: "Plant a Real Native Tree",
      brand: "SankalpTaru",
      costCC: 250,
      code: "TREE-PLANT-TEST",
      timestamp: Date.now(),
    };

    saveRedemption(sampleRecord);
    const history = getRedemptionHistory();
    expect(history.length).toBe(1);
    expect(history[0].code).toBe("TREE-PLANT-TEST");
    expect(history[0].brand).toBe("SankalpTaru");
  });
});
