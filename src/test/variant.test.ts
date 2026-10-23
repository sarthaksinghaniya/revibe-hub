import { describe, it, expect } from "vitest";
import {
  hasFeature,
  getAllowedFeatures,
  accountAllowedInVariant,
  VARIANT_LABEL,
} from "@/lib/variant";

describe("W2W Edition & Variant Gating", () => {
  it("enforces variant feature mapping correctly", () => {
    // Individual edition has scanner, mylog, marketplace, facilities
    expect(hasFeature("scanner", "individual")).toBe(true);
    expect(hasFeature("marketplace", "individual")).toBe(true);
    expect(hasFeature("org-dashboard", "individual")).toBe(false);

    // School edition has org-dashboard and school-tools, but no marketplace
    expect(hasFeature("org-dashboard", "school")).toBe(true);
    expect(hasFeature("org-school-tools", "school")).toBe(true);
    expect(hasFeature("marketplace", "school")).toBe(false);

    // Full edition has all features
    expect(hasFeature("wallet", "full")).toBe(true);
    expect(hasFeature("org-dashboard", "full")).toBe(true);
  });

  it("checks account allowed in variant correctly", () => {
    // Full variant allows all account types
    expect(accountAllowedInVariant("student", "full").ok).toBe(true);
    expect(accountAllowedInVariant("company", "full").ok).toBe(true);

    // Specific variant only allows its own account type
    expect(accountAllowedInVariant("student", "student").ok).toBe(true);
    expect(accountAllowedInVariant("company", "student").ok).toBe(false);
  });

  it("provides correct human-readable variant labels", () => {
    expect(VARIANT_LABEL.individual).toBe("Individual");
    expect(VARIANT_LABEL.student).toBe("Student");
    expect(VARIANT_LABEL.company).toBe("Company");
    expect(VARIANT_LABEL.school).toBe("School");
  });
});
