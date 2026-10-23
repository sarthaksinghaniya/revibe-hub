import { describe, it, expect, beforeEach } from "vitest";
import { lookupBarcode, convertBarcodeToMultiScan, LOCAL_FMCG_CATALOG, QUICK_TEST_BARCODES } from "@/lib/barcodeApi";

describe("Barcode & FMCG Packaging Scanner Engine", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("instant lookup for Bisleri 1L Mineral Water (PET #1)", async () => {
    const product = await lookupBarcode("8906014410012");
    expect(product.name).toContain("Bisleri");
    expect(product.category).toBe("recyclable");
    expect(product.material).toContain("PET");
    expect(product.packagingBreakdown.length).toBeGreaterThanOrEqual(2);
    expect(product.source).toBe("local_database");
  });

  it("instant lookup for Maggi 2-Minute Noodles (Multi-Layer Plastic / Landfill)", async () => {
    const product = await lookupBarcode("8901058862217");
    expect(product.name).toContain("Maggi");
    expect(product.category).toBe("landfill");
    expect(product.material).toContain("Multi-Layer");
    expect(product.disposal_steps.length).toBeGreaterThan(0);
  });

  it("instant lookup for Coca-Cola Can (Aluminium Recyclable)", async () => {
    const product = await lookupBarcode("5449000000996");
    expect(product.name).toContain("Coca-Cola");
    expect(product.category).toBe("recyclable");
    expect(product.material).toContain("Aluminium");
  });

  it("cleans dirty barcode inputs with whitespace and formatting", async () => {
    const product = await lookupBarcode("  8901-2620-10016  ");
    expect(product.name).toContain("Amul");
    expect(product.material).toContain("Tetra Pak");
  });

  it("converts BarcodeProduct to valid MultiScanResult structure", async () => {
    const product = await lookupBarcode("8906014410012");
    const scanResult = await convertBarcodeToMultiScan(product, false);

    expect(scanResult.items).toHaveLength(1);
    expect(scanResult.items[0].name).toContain("Bisleri");
    expect(scanResult.items[0].category).toBe("recyclable");
    expect(scanResult.items[0].co2_saved_kg).toBeGreaterThan(0);
    expect(scanResult.items[0].disposal_steps.length).toBeGreaterThan(0);
  });

  it("gracefully falls back on unrecognized barcodes with resin guidelines", async () => {
    const fallback = await lookupBarcode("9999888877771");
    expect(fallback.name).toContain("Packaged FMCG Item");
    expect(fallback.source).toBe("fallback");
    expect(fallback.disposal_steps[0]).toContain("resin");
  });

  it("rejects empty barcode strings", async () => {
    await expect(lookupBarcode("   ")).rejects.toThrow("Invalid barcode");
  });

  it("quick test barcodes catalog is well-defined", () => {
    expect(QUICK_TEST_BARCODES.length).toBeGreaterThanOrEqual(4);
    QUICK_TEST_BARCODES.forEach((b) => {
      expect(b.barcode).toBeTruthy();
      expect(LOCAL_FMCG_CATALOG[b.barcode]).toBeDefined();
    });
  });
});
