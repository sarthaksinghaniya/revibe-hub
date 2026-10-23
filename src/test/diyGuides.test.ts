import { describe, it, expect } from "vitest";
import {
  DIY_GUIDES,
  findMatchingDiyGuide,
} from "@/components/Results/DiyUpcycleGuideModal";

describe("W2W EcoBot DIY Upcycle Assistant", () => {
  it("matches materials to tailored DIY projects accurately", () => {
    const plastic = findMatchingDiyGuide("Plastic", "Mineral Water Bottle");
    expect(plastic.id).toBe("diy_plastic_planter");
    expect(plastic.marketplaceCategory).toBe("Decor");

    const glass = findMatchingDiyGuide("Glass", "Pickle Jar");
    expect(glass.id).toBe("diy_glass_lantern");

    const cardboard = findMatchingDiyGuide("Cardboard", "Amazon Delivery Carton");
    expect(cardboard.id).toBe("diy_cardboard_organizer");

    const cloth = findMatchingDiyGuide("Textile", "Old Cotton Shirt");
    expect(cloth.id).toBe("diy_textile_tote");

    const can = findMatchingDiyGuide("Aluminium", "Soda Can");
    expect(can.id).toBe("diy_metal_caddy");
  });

  it("contains complete and safe tutorial steps for all projects", () => {
    expect(DIY_GUIDES.length).toBeGreaterThanOrEqual(5);

    DIY_GUIDES.forEach((guide) => {
      expect(guide.projectTitle).toBeTruthy();
      expect(guide.toolsNeeded.length).toBeGreaterThanOrEqual(3);
      expect(guide.safetyTip).toBeTruthy();
      expect(guide.steps.length).toBe(5); // 5 sequential steps

      guide.steps.forEach((step) => {
        expect(step.title).toBeTruthy();
        expect(step.description).toBeTruthy();
      });
    });
  });
});
