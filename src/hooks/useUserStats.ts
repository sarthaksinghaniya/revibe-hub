import { useState, useEffect, useCallback } from 'react';
import { UserStats, ScanRecord, WasteItem, WasteCategory } from '@/types/index';
import { calculateCarbonCredit, aggregateCarbonCredits, getUserLevel } from '@/lib/carbonCredit';

const STORAGE_KEY = 'w2w_user_stats';
const HISTORY_KEY = 'w2w_scan_history';

const DEFAULT_STATS: UserStats = {
  totalScans: 0,
  streakDays: 0,
  longestStreak: 0,
  lastScanDate: '',
  points: 0,
  level: 1,
  levelName: 'Waste Rookie',
  badges: [
    { id: 'first_scan', name: 'First Scan', description: 'Complete your first scan', icon: '🔍', earned: false },
    { id: 'streak_3', name: '3-Day Streak', description: 'Scan 3 days in a row', icon: '🔥', earned: false },
    { id: 'streak_7', name: 'Week Warrior', description: '7-day scan streak', icon: '⚡', earned: false },
    { id: 'recycler', name: 'Recycler', description: 'Recycle 5 items', icon: '♻️', earned: false },
    { id: 'composter', name: 'Composter', description: 'Compost 3 items', icon: '🌱', earned: false },
    { id: 'hazard_hero', name: 'Hazard Hero', description: 'Properly dispose 3 hazardous items', icon: '⚠️', earned: false },
    { id: 'carbon_1kg', name: '1kg CO₂ Saved', description: 'Save 1 kg of CO₂', icon: '🌍', earned: false },
    { id: 'upcycler', name: 'Upcycle Artist', description: 'Identify 3 upcyclable items', icon: '🎨', earned: false },
    { id: 'century', name: 'Century Club', description: 'Earn 100 points', icon: '💯', earned: false },
  ],
  carbonCredits: {
    total: 0,
    thisMonth: 0,
    history: [],
    certificateEligible: false,
  },
  itemsByCategory: {
    recycle: 0,
    compost: 0,
    hazard: 0,
    landfill: 0,
    upcycle: 0,
  },
  weeklyData: Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      day: d.toLocaleDateString('en', { weekday: 'short' }),
      scans: 0,
      carbon: 0,
    };
  }),
};

function computeStreak(lastScanDate: string, currentStreak: number): { streak: number; reset: boolean } {
  if (!lastScanDate) return { streak: 1, reset: false };
  const last = new Date(lastScanDate);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - last.getTime()) / 86400000);   
  if (diffDays === 0) return { streak: currentStreak, reset: false };
  if (diffDays === 1) return { streak: currentStreak + 1, reset: false };       
  return { streak: 1, reset: true };
}

export function useUserStats() {
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_STATS, ...JSON.parse(saved) } : DEFAULT_STATS;
    } catch { return DEFAULT_STATS; }
  });

  const [history, setHistory] = useState<ScanRecord[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [lastResult, setLastResult] = useState<{ item: WasteItem; credit: ReturnType<typeof calculateCarbonCredit> } | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 200)));   
  }, [history]);

  const recordScan = useCallback((item: WasteItem) => {
    setStats(prev => {
      const { streak, reset } = computeStreak(prev.lastScanDate, prev.streakDays);
      const credit = calculateCarbonCredit(item.category, streak, prev.totalScans);

      const newPoints = prev.points + credit.pointsEarned;
      const levelData = getUserLevel(newPoints);

      // Update weekly data
      const today = new Date().toLocaleDateString('en', { weekday: 'short' });  
      const weeklyData = prev.weeklyData.map(d =>
        d.day === today
          ? { ...d, scans: d.scans + 1, carbon: parseFloat((d.carbon + credit.carbonKg).toFixed(3)) }
          : d
      );

      // Update badges
      const newCategoryCount = { ...prev.itemsByCategory, [item.category]: prev.itemsByCategory[item.category] + 1 };
      const newTotalScans = prev.totalScans + 1;
      const newTotalCarbon = prev.carbonCredits.total + credit.carbonKg;        

      const badges = prev.badges.map(b => {
        if (b.earned) return b;
        switch (b.id) {
          case 'first_scan': return newTotalScans === 1 ? { ...b, earned: true, earnedAt: Date.now() } : b;
          case 'streak_3': return streak >= 3 ? { ...b, earned: true, earnedAt: Date.now() } : b;
          case 'streak_7': return streak >= 7 ? { ...b, earned: true, earnedAt: Date.now() } : b;
          case 'recycler': return newCategoryCount.recycle >= 5 ? { ...b, earned: true, earnedAt: Date.now() } : b;
          case 'composter': return newCategoryCount.compost >= 3 ? { ...b, earned: true, earnedAt: Date.now() } : b;
          case 'hazard_hero': return newCategoryCount.hazard >= 3 ? { ...b, earned: true, earnedAt: Date.now() } : b;
          case 'carbon_1kg': return newTotalCarbon >= 1 ? { ...b, earned: true, earnedAt: Date.now() } : b;
          case 'upcycler': return newCategoryCount.upcycle >= 3 ? { ...b, earned: true, earnedAt: Date.now() } : b;
          case 'century': return newPoints >= 100 ? { ...b, earned: true, earnedAt: Date.now() } : b;
          default: return b;
        }
      });

      const newRecord: ScanRecord = {
        id: item.id,
        item,
        timestamp: Date.now(),
        carbonCreditsEarned: credit.carbonKg,
        pointsEarned: credit.pointsEarned,
      };

      setHistory(h => [newRecord, ...h]);
      setLastResult({ item, credit });

      const carbonAgg = aggregateCarbonCredits([newRecord, ...history]);        

      return {
        ...prev,
        totalScans: newTotalScans,
        streakDays: streak,
        longestStreak: Math.max(prev.longestStreak, streak),
        lastScanDate: new Date().toISOString().split('T')[0],
        points: newPoints,
        level: levelData.level,
        levelName: levelData.name,
        badges,
        carbonCredits: {
          total: parseFloat((prev.carbonCredits.total + credit.carbonKg).toFixed(3)),
          thisMonth: parseFloat((prev.carbonCredits.thisMonth + credit.carbonKg).toFixed(3)),
          history: prev.carbonCredits.history,
          certificateEligible: newTotalCarbon >= 5,
        },
        itemsByCategory: newCategoryCount,
        weeklyData,
      };
    });
  }, [history]);

  return { stats, history, lastResult, recordScan };
}
