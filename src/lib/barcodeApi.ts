/**
 * W2W Barcode & FMCG Packaging Scanner Engine
 * --------------------------------------------
 * Instant (0ms / 0 token) packaging and recyclability intelligence.
 * Queries local curated FMCG database + Open Food Facts API (world.openfoodfacts.org).
 */

import { recordProcessedScan, type MultiScanResult, type ScanItem } from "./scanApi";
import type { Category } from "./co2Formula";

export interface PackagingComponent {
  part: string;
  material: string;
  recyclable: boolean;
  disposal: string;
}

export interface BarcodeProduct {
  barcode: string;
  name: string;
  brand: string;
  category: Category;
  material: string;
  packagingBreakdown: PackagingComponent[];
  disposal_steps: string[];
  upcycle_ideas: string[];
  co2_saved_kg: number;
  water_saved_liters: number;
  source: "local_database" | "openfoodfacts" | "fallback";
  imageUrl?: string;
}

export interface QuickTestBarcode {
  label: string;
  barcode: string;
  brand: string;
  material: string;
  icon: string;
}

/** Pre-indexed high-frequency Indian & global FMCG products for 0ms zero-latency offline scanning */
export const LOCAL_FMCG_CATALOG: Record<string, Omit<BarcodeProduct, "barcode" | "source">> = {
  "8906014410012": {
    name: "Bisleri Natural Mineral Water 1L",
    brand: "Bisleri International",
    category: "recyclable",
    material: "PET Plastic (#1)",
    packagingBreakdown: [
      { part: "Bottle Body", material: "Clear Polyethylene Terephthalate (PET #1)", recyclable: true, disposal: "Crush bottle flat and place in Blue Dry Recyclables bin" },
      { part: "Screw Cap", material: "High-Density Polyethylene (HDPE #2)", recyclable: true, disposal: "Keep screwed onto bottle or recycle with hard plastics" },
      { part: "Label Sleeve", material: "Biaxially Oriented Polypropylene (BOPP)", recyclable: false, disposal: "Peel and drop into dry non-recyclable bin" },
    ],
    disposal_steps: [
      "Drain any leftover water completely",
      "Crush bottle flat to save 75% recycling bin volume",
      "Keep the blue cap tightly screwed on so it doesn't get lost in sorting",
      "Place into Blue Dry Recyclables bin",
    ],
    upcycle_ideas: [
      "Cut into self-watering sub-irrigated seed starter",
      "Create a drip irrigation funnel for potted houseplants",
      "Fashion into a hanging wild bird feeder",
    ],
    co2_saved_kg: 0.12,
    water_saved_liters: 15,
  },
  "8901058862217": {
    name: "Maggi 2-Minute Masala Noodles",
    brand: "Nestlé India",
    category: "landfill",
    material: "Multi-Layer Metallized Plastic (MLP)",
    packagingBreakdown: [
      { part: "Outer Wrapper", material: "Polypropylene Film (BOPP)", recyclable: false, disposal: "Drop at EPR collection center or Black Landfill bin" },
      { part: "Tastemaker Sachet", material: "Metallized Plastic-Aluminium Laminate", recyclable: false, disposal: "Black Landfill bin (non-compostable)" },
    ],
    disposal_steps: [
      "Empty all dry noodles and masala crumbs completely",
      "Keep plastic dry; never mix with wet vegetable kitchen compost",
      "Dispose in Black Landfill bin or deposit at municipal EPR multi-layer plastic kiosks",
    ],
    upcycle_ideas: [
      "Clean thoroughly and stuff tightly into plastic bottles to craft structural Ecobricks",
      "Cut into durable waterproof binding strips for outdoor gardening",
    ],
    co2_saved_kg: 0.04,
    water_saved_liters: 2,
  },
  "5449000000996": {
    name: "Coca-Cola Original Taste 300ml",
    brand: "The Coca-Cola Company",
    category: "recyclable",
    material: "Aluminium Can",
    packagingBreakdown: [
      { part: "Can Cylinder", material: "Aluminium Alloy 3004 (100% Recyclable)", recyclable: true, disposal: "Rinse and bin into Blue Dry Recyclables bin" },
      { part: "Stay-on Pull Tab", material: "Aluminium Alloy 5182", recyclable: true, disposal: "Keep attached to can to prevent loose litter" },
    ],
    disposal_steps: [
      "Rinse with a splash of water to wash out sweet sugar residues",
      "Leave pull-tab attached to the can lid",
      "Step on or compress can vertically to save storage room",
      "Drop into Blue Dry Recyclables bin for high-yield aluminium remelting",
    ],
    upcycle_ideas: [
      "Repurpose into a desk pencil and paintbrush holder",
      "Punch pinholes to craft an ambient tea-light lantern",
      "Cut top off to create a desktop succulent planter",
    ],
    co2_saved_kg: 0.28,
    water_saved_liters: 32,
  },
  "8901491101836": {
    name: "Lay's India's Magic Masala Chips 50g",
    brand: "PepsiCo India",
    category: "landfill",
    material: "Metallized Polypropylene Film (MLP)",
    packagingBreakdown: [
      { part: "Foil Pouch", material: "Multi-layer Metallized OPP/PE", recyclable: false, disposal: "Black Landfill bin or cement kiln recovery" },
    ],
    disposal_steps: [
      "Turn pouch inside-out and wipe away residual edible oils",
      "Do not burn or bury in garden soil",
      "Dispose into Black Landfill bin or deposit in plastic drop-off bins",
    ],
    upcycle_ideas: [
      "Compress into building-grade structural Ecobricks for outdoor benches",
      "Use reflective interior lining for mini DIY heat reflectors",
    ],
    co2_saved_kg: 0.03,
    water_saved_liters: 1,
  },
  "8901262010016": {
    name: "Amul Taaza Homogenised Toned Milk 1L",
    brand: "Amul (GCMMF)",
    category: "recyclable",
    material: "Tetra Pak Aseptic Paperboard",
    packagingBreakdown: [
      { part: "Carton Body", material: "75% Virgin Paperboard + 20% Polyethylene + 5% Aluminium Foil", recyclable: true, disposal: "Rinse, flatten, and deposit in Tetra Pak / Paper bin" },
      { part: "Cap & Spout", material: "HDPE / Sugarcane Bio-plastic", recyclable: true, disposal: "Keep screwed on carton" },
    ],
    disposal_steps: [
      "Rinse carton with 50ml water to prevent sour milk odors",
      "Unfold side tabs and flatten carton completely flat",
      "Hand over to local Kabadiwala or municipal paper recycling collector",
    ],
    upcycle_ideas: [
      "Cut in half as heavy-duty seedling germination pots",
      "Fold into a waterproof DIY cardholder / mini wallet",
      "Create waterproof geometric birdhouse for garden balconies",
    ],
    co2_saved_kg: 0.22,
    water_saved_liters: 24,
  },
  "8901030383424": {
    name: "Parle-G Original Glucose Biscuits",
    brand: "Parle Products",
    category: "landfill",
    material: "Polypropylene Plastic Wrapper",
    packagingBreakdown: [
      { part: "Primary Wrapper", material: "Printed BOPP Film", recyclable: false, disposal: "Black Landfill bin" },
    ],
    disposal_steps: [
      "Shake out all biscuit crumbs",
      "Keep dry and separate from biodegradable kitchen waste",
      "Dispose in Black Landfill bin or dry waste bag",
    ],
    upcycle_ideas: [
      "Use as clean filler plastic for structural Ecobricks",
      "Upcycle into colorful plastic woven coasters",
    ],
    co2_saved_kg: 0.03,
    water_saved_liters: 1,
  },
  "8901030865500": {
    name: "Colgate Strong Teeth Toothpaste 100g",
    brand: "Colgate-Palmolive",
    category: "recyclable",
    material: "HDPE Recyclable Tube (#2)",
    packagingBreakdown: [
      { part: "Tube Body", material: "High-Density Polyethylene (HDPE #2)", recyclable: true, disposal: "Blue Recyclables bin" },
      { part: "Flip Cap", material: "Polypropylene (PP #5)", recyclable: true, disposal: "Leave cap attached to tube" },
    ],
    disposal_steps: [
      "Squeeze out as much toothpaste as possible",
      "No need to cut open; recyclable through standard curbside HDPE stream",
      "Keep cap on and place into Blue Dry Recyclables bin",
    ],
    upcycle_ideas: [
      "Cut bottom off and use as a precise caulk / grout applicator",
      "Repurpose as protective blade sheath for scissors or hobby knives",
    ],
    co2_saved_kg: 0.09,
    water_saved_liters: 6,
  },
  "9002490100070": {
    name: "Red Bull Energy Drink 250ml",
    brand: "Red Bull GmbH",
    category: "recyclable",
    material: "Aluminium Can",
    packagingBreakdown: [
      { part: "Can Cylinder", material: "Aluminium (Infinitely Recyclable)", recyclable: true, disposal: "Blue Dry Recyclables bin" },
      { part: "Stay-on Pull Tab", material: "Aluminium Tab", recyclable: true, disposal: "Keep attached to can" },
    ],
    disposal_steps: [
      "Rinse with clean water to prevent sticky residue",
      "Do not remove pull tab",
      "Crush can flat and place in Blue Dry Recyclables bin",
    ],
    upcycle_ideas: [
      "Craft into desktop cable organizer",
      "Convert into mini cactus planter",
    ],
    co2_saved_kg: 0.25,
    water_saved_liters: 28,
  },
};

/** Quick-test barcodes provided for instant user testing in the scanner UI */
export const QUICK_TEST_BARCODES: QuickTestBarcode[] = [
  { label: "Bisleri 1L", barcode: "8906014410012", brand: "Bisleri", material: "PET Bottle", icon: "🥤" },
  { label: "Maggi Noodles", barcode: "8901058862217", brand: "Nestlé", material: "MLP Wrapper", icon: "🍜" },
  { label: "Coke Can", barcode: "5449000000996", brand: "Coca-Cola", material: "Aluminium Can", icon: "🥫" },
  { label: "Amul Milk", barcode: "8901262010016", brand: "Amul", material: "Tetra Pak", icon: "🥛" },
  { label: "Lay's Chips", barcode: "8901491101836", brand: "Lay's", material: "Foil Pouch", icon: "🥔" },
];

/** Fetch product from Open Food Facts API with fallback and timeout */
export async function fetchOpenFoodFacts(barcode: string): Promise<BarcodeProduct | null> {
  const cleanBarcode = barcode.trim().replace(/\D/g, "");
  if (!cleanBarcode) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${cleanBarcode}.json`, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 1 || !data.product) return null;

    const prod = data.product;
    const name: string = prod.product_name || prod.product_name_en || prod.generic_name || "Packaged Food Item";
    const brand: string = prod.brands || "FMCG Brand";
    const packagingText: string = (prod.packaging_text || prod.packaging || "").toLowerCase();
    const packagingsArr: any[] = Array.isArray(prod.packagings) ? prod.packagings : [];

    // Analyze materials
    const combinedDesc = `${packagingText} ${packagingsArr.map((p) => `${p.material || ""} ${p.shape || ""}`).join(" ")}`.toLowerCase();

    let category: Category = "recyclable";
    let material = "Packaged Recyclable Container";

    if (combinedDesc.includes("can") || combinedDesc.includes("alumin") || combinedDesc.includes("tin")) {
      category = "recyclable";
      material = "Aluminium / Metal Can";
    } else if (combinedDesc.includes("pet") || combinedDesc.includes("bottle") || combinedDesc.includes("polyethylene terephthalate")) {
      category = "recyclable";
      material = "PET Plastic (#1)";
    } else if (combinedDesc.includes("glass") || combinedDesc.includes("jar")) {
      category = "recyclable";
      material = "Glass Container";
    } else if (combinedDesc.includes("carton") || combinedDesc.includes("tetra") || combinedDesc.includes("paperboard")) {
      category = "recyclable";
      material = "Tetra Pak / Paperboard";
    } else if (combinedDesc.includes("sachet") || combinedDesc.includes("film") || combinedDesc.includes("pouch") || combinedDesc.includes("plastic bag")) {
      category = "landfill";
      material = "Multi-Layer Plastic (MLP / Film)";
    } else if (combinedDesc.includes("bio") || combinedDesc.includes("compost")) {
      category = "compostable";
      material = "Biodegradable / Compostable";
    }

    const breakdown: PackagingComponent[] = [];
    if (packagingsArr.length > 0) {
      packagingsArr.forEach((p) => {
        const shapeStr = String(p.shape || "Component").replace(/^en:/, "");
        const matStr = String(p.material || "Plastic").replace(/^en:/, "");
        const isRecyclable = !matStr.includes("film") && !matStr.includes("composite");
        breakdown.push({
          part: shapeStr.charAt(0).toUpperCase() + shapeStr.slice(1),
          material: matStr.toUpperCase(),
          recyclable: isRecyclable,
          disposal: isRecyclable ? "Blue Dry Recyclables bin" : "Black Landfill bin",
        });
      });
    } else {
      breakdown.push({
        part: "Primary Packaging",
        material,
        recyclable: category === "recyclable",
        disposal: category === "recyclable" ? "Blue Dry Recyclables bin" : "Black Landfill bin",
      });
    }

    return {
      barcode: cleanBarcode,
      name,
      brand,
      category,
      material,
      packagingBreakdown: breakdown,
      disposal_steps: [
        "Empty and rinse remaining contents",
        category === "recyclable"
          ? "Deposit into Blue Dry Recyclables bin or scrap pickup"
          : "Deposit into Black Landfill bin",
      ],
      upcycle_ideas: [
        "Repurpose clean container for household hardware storage",
        "Cut and fold into seed seedling cups",
      ],
      co2_saved_kg: category === "recyclable" ? 0.15 : 0.02,
      water_saved_liters: category === "recyclable" ? 18 : 2,
      source: "openfoodfacts",
      imageUrl: prod.image_front_url || prod.image_url,
    };
  } catch {
    return null;
  }
}

/**
 * Universal Barcode Lookup:
 * 1. Checks local FMCG zero-latency database
 * 2. Queries Open Food Facts API
 * 3. Falls back gracefully with standard recyclable/landfill prompt
 */
export async function lookupBarcode(rawBarcode: string): Promise<BarcodeProduct> {
  const barcode = rawBarcode.trim().replace(/\D/g, "");

  if (!barcode) {
    throw new Error("Invalid barcode: please scan or enter a numeric barcode");
  }

  // 1. Check local catalog (0ms latency)
  if (LOCAL_FMCG_CATALOG[barcode]) {
    const local = LOCAL_FMCG_CATALOG[barcode];
    return {
      barcode,
      ...local,
      source: "local_database",
    };
  }

  // 2. Fetch from Open Food Facts API
  const offProduct = await fetchOpenFoodFacts(barcode);
  if (offProduct) {
    return offProduct;
  }

  // 3. Fallback for unrecognized product barcodes
  return {
    barcode,
    name: `Packaged FMCG Item (#${barcode})`,
    brand: "Packaged Product",
    category: "recyclable",
    material: "Standard FMCG Packaging",
    packagingBreakdown: [
      { part: "Main Container", material: "Check resin identification code (1–7)", recyclable: true, disposal: "Check local municipal guidance" },
    ],
    disposal_steps: [
      "Check the bottom of the packaging for the triangular resin recycling symbol (1 to 7)",
      "If PET (#1), HDPE (#2), or Aluminium, deposit into Blue Dry Recyclables bin",
      "If multi-layer plastic sachet or metallized film, place in Black Landfill bin",
    ],
    upcycle_ideas: [
      "Rinse and reuse as workshop hardware organizer",
      "Switch to camera AI vision scan for instant automated visual analysis",
    ],
    co2_saved_kg: 0.08,
    water_saved_liters: 10,
    source: "fallback",
  };
}

/**
 * Convert BarcodeProduct into MultiScanResult format and log into user scan history.
 */
export async function convertBarcodeToMultiScan(
  product: BarcodeProduct,
  autoRecord = true
): Promise<MultiScanResult> {
  const primaryItem: Omit<ScanItem, "credits_awarded" | "reduced_credits"> = {
    name: product.brand ? `${product.name} (${product.brand})` : product.name,
    category: product.category,
    material: product.material,
    confidence: 0.99,
    disposal_steps: product.disposal_steps,
    upcycle_ideas: product.upcycle_ideas,
    co2_saved_kg: product.co2_saved_kg,
    water_saved_liters: product.water_saved_liters,
  };

  if (!autoRecord) {
    return {
      items: [
        {
          ...primaryItem,
          credits_awarded: 0,
          reduced_credits: false,
        },
      ],
      total_credits: 0,
      scan_type: "single",
    };
  }

  return await recordProcessedScan(
    [primaryItem],
    "single",
    "barcode",
    `barcode:${product.barcode}`
  );
}
