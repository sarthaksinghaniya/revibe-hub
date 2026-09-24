import { WasteCategory, WasteItem, ScanRecord } from '@/types/index';

/**
 * CARBON CREDIT ALGORITHM — Waste-to-Worth
 *
 * Based on Life Cycle Analysis (LCA) data and IPCC emissions factors.
 * Carbon credit = CO2 equivalent saved by proper disposal vs landfill baseline.
 *
 * Formula:
 *   CC = (EmissionFactor_landfill - EmissionFactor_proper) × MaterialWeight × ActivityMultiplier
 *
 * Where:
 *   - EmissionFactor is kg CO2e per kg of material
 *   - ActivityMultiplier rewards: first scan, streak bonus, rare materials
 *   - Points = CC × 10 + CategoryBonus + StreakMultiplier
 */

export const CARBON_FACTORS: Record<WasteCategory, {
  landfillFactor: number;   // kg CO2e per kg material if landfilled
  properFactor: number;     // kg CO2e per kg if properly disposed
  avgWeight: number;        // avg item weight in kg
  waterSaved: number;       // litres of water saved per item
  pointsBase: number;       // base points
  categoryBonus: number;    // bonus points
}> = {
  recycle: {
    landfillFactor: 2.1,
    properFactor: 0.4,
    avgWeight: 0.2,
    waterSaved: 15,
    pointsBase: 25,
    categoryBonus: 10,
  },
  compost: {
    landfillFactor: 1.8,
    properFactor: 0.05,
    avgWeight: 0.35,
    waterSaved: 8,
    pointsBase: 20,
    categoryBonus: 8,
  },
  hazard: {
    landfillFactor: 5.2,
    properFactor: 0.3,
    avgWeight: 0.15,
    waterSaved: 50,
    pointsBase: 40,
    categoryBonus: 20,
  },
  landfill: {
    landfillFactor: 1.5,
    properFactor: 1.5,
    avgWeight: 0.3,
    waterSaved: 0,
    pointsBase: 5,
    categoryBonus: 0,
  },
  upcycle: {
    landfillFactor: 3.0,
    properFactor: 0.1,
    avgWeight: 0.25,
    waterSaved: 20,
    pointsBase: 35,
    categoryBonus: 15,
  },
};

/**
 * Calculate carbon credits earned from a single scan.
 *
 * @param category - waste category
 * @param streakDays - current streak (for multiplier)
 * @param totalScans - total scans ever (first scan bonus)
 * @returns { carbonKg, waterLitres, pointsEarned, breakdown }
 */
export function calculateCarbonCredit(
  category: WasteCategory,
  streakDays: number = 0,
  totalScans: number = 0,
): {
  carbonKg: number;
  waterLitres: number;
  pointsEarned: number;
  breakdown: string;
  streakMultiplier: number;
} {
  const factor = CARBON_FACTORS[category];

  // Base carbon saved
  const baseCarbonKg = (factor.landfillFactor - factor.properFactor) * factor.avgWeight;
  const carbonKg = Math.max(0, parseFloat(baseCarbonKg.toFixed(3)));

  // Streak multiplier: 1x at 0 days, up to 2x at 30 days
  const streakMultiplier = Math.min(2.0, 1 + (streakDays * 0.033));

  // First scan bonus
  const firstScanBonus = totalScans === 0 ? 50 : 0;

  // Points calculation
  const rawPoints = factor.pointsBase + factor.categoryBonus;
  const pointsEarned = Math.round(rawPoints * streakMultiplier + firstScanBonus);

  const breakdown = [
    `Base carbon saved: ${baseCarbonKg.toFixed(3)} kg CO₂e`,
    `Streak (${streakDays}d): ${streakMultiplier.toFixed(2)}x multiplier`,
    `Points: ${rawPoints} × ${streakMultiplier.toFixed(2)} = ${pointsEarned}`,
    firstScanBonus > 0 ? `First scan bonus: +${firstScanBonus} pts` : null,
  ].filter(Boolean).join(' | ');

  return {
    carbonKg,
    waterLitres: factor.waterSaved,
    pointsEarned,
    breakdown,
    streakMultiplier,
  };
}

/**
 * Aggregate carbon credits from all scan records.
 */
export function aggregateCarbonCredits(records: ScanRecord[]) {
  const total = records.reduce((sum, r) => sum + r.carbonCreditsEarned, 0);
  const thisMonth = records
    .filter(r => {
      const d = new Date(r.timestamp);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, r) => sum + r.carbonCreditsEarned, 0);

  return {
    total: parseFloat(total.toFixed(3)),
    thisMonth: parseFloat(thisMonth.toFixed(3)),
    certificateEligible: total >= 5, // 5 kg CO2 = certificate eligible
  };
}

/**
 * User level system based on points
 */
export const LEVELS = [
  { min: 0, name: 'Waste Rookie', icon: '🌱', color: '#86efac' },
  { min: 100, name: 'Green Starter', icon: '🍃', color: '#4ade80' },
  { min: 300, name: 'Eco Warrior', icon: '🌿', color: '#22c55e' },
  { min: 600, name: 'Planet Protector', icon: '🌍', color: '#16a34a' },
  { min: 1000, name: 'Carbon Crusher', icon: '⚡', color: '#15803d' },
  { min: 2000, name: 'Zero Waste Hero', icon: '🏆', color: '#14532d' },
];

export function getUserLevel(points: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].min) return { ...LEVELS[i], level: i + 1 };
  }
  return { ...LEVELS[0], level: 1 };
}

export function getNextLevel(points: number) {
  const idx = LEVELS.findIndex((_, i) => {
    const next = LEVELS[i + 1];
    return !next || points < next.min;
  });
  const next = LEVELS[Math.min(idx + 1, LEVELS.length - 1)];
  return { ...next, pointsNeeded: Math.max(0, next.min - points) };
}
