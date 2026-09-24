/**
 * ════════════════════════════════════════════════════════════════
 * W2W Carbon Credit Formula — Indian Baseline (v2)
 * ════════════════════════════════════════════════════════════════
 *
 * SCIENCE
 * -------
 * Recycling 1 kg of PET saves ~2.05 kg CO₂e vs virgin production.
 * A 500ml PET bottle weighs ~10–12 g  →  ~25 g CO₂ saved per bottle.
 * IPCC scale: 1 verified Carbon Credit = 1,000 kg CO₂ saved
 *             (≈ 40,000 PET bottles).
 *
 * MODEL
 * -----
 * Each scan no longer awards CC directly. Instead it deposits
 *   co2_g  =  weight_kg × savedFactor × items × verificationFactor
 * grams of CO₂ into the user's *reservoir* (`co2_pending_g`).
 *
 * For every 1,000 g (1 kg) accumulated in the reservoir, the wallet
 * mints **1 Personal Carbon Credit (CC)**, and the remainder rolls
 * over to the next mint.
 *
 *   Personal CC  : 1 CC per 1 kg CO₂ saved   (gamified, daily progress)
 *   Verified CC  : 1 CC per 1,000 kg saved   (IPCC tonne, real-world)
 *
 *   verifiedCC   = co2_saved_g / 1_000_000
 *
 * Streak multiplier applies at MINT time (not per-scan), so the
 * reservoir is honest CO₂; the multiplier is a reward for habit.
 * ════════════════════════════════════════════════════════════════
 */

export type Category = "recyclable" | "compostable" | "hazardous" | "landfill" | "upcyclable";

/** Savings per item, derived from Indian LCA + IPCC factors. */
export const CO2_PROFILE: Record<Category, {
  avgWeightKg: number;     // typical item weight
  savedFactor: number;     // kg CO₂e saved per kg material recycled vs landfill
  gPerItem: number;        // = avgWeightKg * savedFactor * 1000  (grams)
  label: string;
  example: string;
}> = {
  recyclable:  { avgWeightKg: 0.012, savedFactor: 2.05, gPerItem: 25,   label: "Recyclable",  example: "PET bottle (~25 g CO₂)" },
  compostable: { avgWeightKg: 0.350, savedFactor: 0.50, gPerItem: 175,  label: "Compostable", example: "Food waste (~175 g CO₂)" },
  hazardous:   { avgWeightKg: 0.150, savedFactor: 3.50, gPerItem: 525,  label: "Hazardous",   example: "Battery (~525 g CO₂)" },
  upcyclable:  { avgWeightKg: 0.250, savedFactor: 2.90, gPerItem: 725,  label: "Upcyclable",  example: "Glass jar reuse (~725 g CO₂)" },
  landfill:    { avgWeightKg: 0.300, savedFactor: 0.00, gPerItem: 0,    label: "Landfill",    example: "No CO₂ benefit" },
};

/** Threshold (grams) to mint 1 Personal CC. */
export const G_PER_CC = 1_000;          // 1 kg CO₂ = 1 Personal CC
/** Threshold (grams) to mint 1 Verified Tonne CC (IPCC standard). */
export const G_PER_VERIFIED_CC = 1_000_000;

/**
 * Compute CO₂ saved (grams) for one detected item.
 *
 * @param category   waste category
 * @param verified   true if logged as a verified facility drop-off (×2)
 * @param aiCo2Kg    optional AI-reported co2_saved_kg (used as floor; we still cap to category baseline ×3)
 */
export function co2GramsForItem(
  category: Category,
  verified = false,
  aiCo2Kg?: number,
): number {
  const profile = CO2_PROFILE[category] ?? CO2_PROFILE.landfill;
  const baseG = profile.gPerItem;

  // Trust AI value lightly: blend baseline with AI estimate, capped at 3× baseline
  let g = baseG;
  if (aiCo2Kg && aiCo2Kg > 0) {
    const aiG = aiCo2Kg * 1000;
    g = Math.min(Math.max(baseG, aiG), baseG * 3 || aiG);
  }

  return Math.round(g * (verified ? 2 : 1));
}

/**
 * Mint Personal CCs from a reservoir update.
 *
 * @param prevPendingG   reservoir before this scan
 * @param addedG         grams added by this scan batch
 * @param streakDays     current streak (applied as multiplier on minted CC)
 * @returns { mintedCC, newPendingG, multiplier }
 */
export function mintFromReservoir(
  prevPendingG: number,
  addedG: number,
  streakDays: number,
): { mintedCC: number; newPendingG: number; multiplier: number } {
  const totalG = prevPendingG + addedG;
  const rawMint = Math.floor(totalG / G_PER_CC);
  const remainder = totalG - rawMint * G_PER_CC;

  const multiplier =
    streakDays >= 7 ? 3 :
    streakDays >= 5 ? 2 :
    streakDays >= 3 ? 1.5 : 1;

  const mintedCC = Math.round(rawMint * multiplier);

  return { mintedCC, newPendingG: remainder, multiplier };
}

/** Verified IPCC-grade tonne credits (fractional, for display). */
export function verifiedTonneCC(lifetimeG: number): number {
  return lifetimeG / G_PER_VERIFIED_CC;
}

/** Human-readable equivalents for a CO₂-grams value. */
export function co2Equivalents(g: number) {
  // Sources: avg petrol car emits ~120 g CO₂/km; LED bulb 10W ≈ 0.82 g CO₂/min on Indian grid.
  const km = g / 120;
  const treeDays = g / 60; // 1 mature tree absorbs ~21 kg/year ≈ 57.5 g/day
  return {
    carKm: km,
    treeDays,
    bottlesEquivalent: g / CO2_PROFILE.recyclable.gPerItem,
  };
}
