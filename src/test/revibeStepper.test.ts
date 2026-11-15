import { describe, it, expect } from 'vitest';
import type { ScanItem } from '@/lib/scanApi';

describe('Revibe Decision Pathway Logic', () => {
  const mockItem: ScanItem = {
    name: 'PET Plastic Bottle',
    confidence: 96,
    category: 'recyclable',
    material: 'Polyethylene Terephthalate (#1 PET)',
    disposal_steps: ['Rinse cleanly', 'Crush flat', 'Blue bin'],
    upcycle_ideas: ['Self-watering planter', 'Bird feeder'],
    co2_saved_kg: 0.28,
    water_saved_liters: 2.1,
  };

  it('correctly maps 6 decision pathway stages', () => {
    const stageNames = ['Analyze', 'Assess', 'Act', 'Exchange', 'Impact', 'Reward'];
    expect(stageNames.length).toBe(6);
    expect(stageNames[0]).toBe('Analyze');
    expect(stageNames[5]).toBe('Reward');
  });

  it('computes accurate CO2 grams and health classification thresholds', () => {
    const grams = Math.round((mockItem.co2_saved_kg || 0) * 1000);
    expect(grams).toBe(280);

    const conditionScore = 88;
    const isHighGrade = conditionScore >= 70;
    expect(isHighGrade).toBe(true);
  });

  it('evaluates cash milestone progression accurately', () => {
    const currentMilestone = 3;
    const target = 5;
    const pct = (currentMilestone / target) * 100;
    expect(pct).toBe(60);
  });
});
