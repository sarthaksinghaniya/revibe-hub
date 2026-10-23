/**
 * W2W Institutional NAAC & Corporate ESG Environmental Certification Engine
 * --------------------------------------------------------------------------
 * Computes verifiable environmental audit metrics for:
 * 1. Indian Higher Education NAAC Accreditation (Criterion 7.1.3: Green Campus Initiatives)
 * 2. Corporate SEBI BRSR (Business Responsibility & Sustainability Reporting) Scope 3
 */

export type CertificateType = "naac_green_audit" | "corporate_esg_brsr";

export interface EsgImpactMetrics {
  totalScans: number;
  totalMembers: number;
  totalWasteDivertedKg: number;
  co2AvoidedKg: number;
  treesEquivalent: number;
  waterSavedLiters: number;
  landfillVolumeSavedM3: number;
  certificateId: string;
  issueDate: string;
  expiryDate: string;
  complianceStandard: string;
  scopeCategory: string;
}

/**
 * Computes scientific environmental audit indicators based on IPCC AR6 and MoEFCC factors.
 */
export function computeEsgMetrics(
  totalScans: number,
  totalCo2Kg: number,
  totalMembers: number,
  orgName: string,
  certType: CertificateType = "naac_green_audit"
): EsgImpactMetrics {
  // Baseline: average waste item diverted is ~0.32 kg across Indian MSW municipal fractions
  const safeScans = Math.max(0, totalScans);
  const safeCo2 = Math.max(0, totalCo2Kg);
  const safeMembers = Math.max(1, totalMembers);

  const totalWasteDivertedKg = Math.round(safeScans * 0.32 * 100) / 100;
  // 1 Mature Indian native tree (Neem / Peepal) absorbs ~21.77 kg CO₂ per year (ICFRE standard)
  const treesEquivalent = Math.round((safeCo2 / 21.77) * 10) / 10;
  // ~14.2 liters of freshwater conserved per kg of recycled packaging vs virgin processing
  const waterSavedLiters = Math.round(totalWasteDivertedKg * 14.2);
  // Compacted municipal solid waste landfill density ~450 kg/m³
  const landfillVolumeSavedM3 = Math.round((totalWasteDivertedKg / 450) * 1000) / 1000;

  // Generate deterministic verification certificate token
  const seed = `${orgName.trim().toUpperCase()}:${safeScans}:${Math.round(safeCo2)}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const token = Math.abs(hash).toString(16).toUpperCase().padStart(8, "0");

  const today = new Date();
  const issueDate = today.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const nextYear = new Date(today);
  nextYear.setFullYear(today.getFullYear() + 1);
  const expiryDate = nextYear.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const isNaac = certType === "naac_green_audit";

  return {
    totalScans: safeScans,
    totalMembers: safeMembers,
    totalWasteDivertedKg,
    co2AvoidedKg: safeCo2,
    treesEquivalent,
    waterSavedLiters,
    landfillVolumeSavedM3,
    certificateId: isNaac ? `NAAC-CR7-${today.getFullYear()}-${token}` : `BRSR-ESG-${today.getFullYear()}-${token}`,
    issueDate,
    expiryDate,
    complianceStandard: isNaac
      ? "NAAC Accreditation Criterion 7.1.3 & MoEFCC Solid Waste Management Rules 2016"
      : "SEBI BRSR Core Principle 6 & GHG Protocol Scope 3 Category 5 (Waste in Operations)",
    scopeCategory: isNaac ? "Institutional Green Campus Audit" : "Corporate Scope 3 Waste Diversion",
  };
}
