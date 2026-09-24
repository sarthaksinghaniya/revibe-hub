export type WasteCategory = 'recycle' | 'compost' | 'hazard' | 'landfill' | 'upcycle';

export interface GovScheme {
  name: string;
  ministry: string;
  description: string;
  benefit: string;
  link: string;
  icon: string;
}

export interface WasteItem {
  id: string;
  timestamp: number;
  name: string;
  category: WasteCategory;
  material: string;
  resinCode?: string;
  confidence: number;
  instructions: string[];
  reuseIdeas: string[];
  carbonSaved: number;
  waterSaved: number;
  govScheme: GovScheme;
  facts: string[];
}

export interface ScanRecord {
  id: string;
  item: WasteItem;
  timestamp: number;
  carbonCreditsEarned: number;
  pointsEarned: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: number;
}

export interface CarbonCredits {
  total: number;
  thisMonth: number;
  history: ScanRecord[];
  certificateEligible: boolean;
}

export interface DayData {
  day: string;
  scans: number;
  carbon: number;
}

export interface UserStats {
  totalScans: number;
  streakDays: number;
  longestStreak: number;
  lastScanDate: string;
  points: number;
  level: number;
  levelName: string;
  badges: Badge[];
  carbonCredits: CarbonCredits;
  itemsByCategory: Record<WasteCategory, number>;
  weeklyData: DayData[];
}
