import { describe, it, expect } from "vitest";
import { estimateBase64Size, optimizeImageForAi } from "@/lib/imageOptimizer";

describe("W2W Image Optimizer", () => {
  it("accurately estimates base64 payload size in bytes", () => {
    // 4 base64 characters = 3 bytes
    const sample = "data:image/jpeg;base64,AAAA";
    expect(estimateBase64Size(sample)).toBe(3);
    expect(estimateBase64Size("")).toBe(0);
  });

  it("safely handles empty or invalid inputs", async () => {
    const res = await optimizeImageForAi("");
    expect(res.dataUrl).toBe("");
    expect(res.originalBytes).toBe(0);
    expect(res.reductionPercentage).toBe(0);
  });
});
