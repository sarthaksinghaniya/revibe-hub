import { describe, it, expect } from "vitest";
import { computeEsgMetrics } from "@/lib/esgCertificate";

describe("Institutional NAAC & Corporate ESG Certification Engine", () => {
  it("computes accurate NAAC Criterion 7.1.3 metrics for university campus", () => {
    const metrics = computeEsgMetrics(1000, 250, 45, "Delhi Technological University", "naac_green_audit");

    expect(metrics.totalWasteDivertedKg).toBe(320); // 1000 * 0.32
    expect(metrics.co2AvoidedKg).toBe(250);
    expect(metrics.treesEquivalent).toBeCloseTo(250 / 21.77, 1);
    expect(metrics.waterSavedLiters).toBe(Math.round(320 * 14.2));
    expect(metrics.landfillVolumeSavedM3).toBeCloseTo(320 / 450, 2);
    expect(metrics.certificateId).toContain("NAAC-CR7-");
    expect(metrics.complianceStandard).toContain("NAAC Accreditation Criterion 7.1.3");
  });

  it("computes SEBI BRSR Principle 6 metrics for corporate enterprise", () => {
    const metrics = computeEsgMetrics(5000, 1200, 320, "Tata Consultancy Services", "corporate_esg_brsr");

    expect(metrics.totalWasteDivertedKg).toBe(1600); // 5000 * 0.32
    expect(metrics.co2AvoidedKg).toBe(1200);
    expect(metrics.certificateId).toContain("BRSR-ESG-");
    expect(metrics.complianceStandard).toContain("SEBI BRSR Core Principle 6");
  });

  it("produces deterministic certificate verification tokens for audit persistence", () => {
    const run1 = computeEsgMetrics(500, 125, 20, "IIT Bombay", "naac_green_audit");
    const run2 = computeEsgMetrics(500, 125, 20, "IIT Bombay", "naac_green_audit");

    expect(run1.certificateId).toBe(run2.certificateId);
  });

  it("handles empty or boundary zero metrics gracefully", () => {
    const zeroMetrics = computeEsgMetrics(0, 0, 0, "New Green Org");

    expect(zeroMetrics.totalWasteDivertedKg).toBe(0);
    expect(zeroMetrics.co2AvoidedKg).toBe(0);
    expect(zeroMetrics.treesEquivalent).toBe(0);
    expect(zeroMetrics.waterSavedLiters).toBe(0);
    expect(zeroMetrics.totalMembers).toBe(1);
    expect(zeroMetrics.certificateId).toBeTruthy();
  });
});
