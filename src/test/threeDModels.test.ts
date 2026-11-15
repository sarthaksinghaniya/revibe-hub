import { describe, it, expect } from 'vitest';
import { get3DModelForWaste, UPCYCLE_3D_CATALOG } from '@/lib/threeDModels';

describe('Web-AR & 3D Upcycle Model Catalog', () => {
  it('contains valid models for all primary materials', () => {
    expect(UPCYCLE_3D_CATALOG.plastic).toBeDefined();
    expect(UPCYCLE_3D_CATALOG.cardboard).toBeDefined();
    expect(UPCYCLE_3D_CATALOG.metal).toBeDefined();
    expect(UPCYCLE_3D_CATALOG.glass).toBeDefined();
    expect(UPCYCLE_3D_CATALOG.ewaste).toBeDefined();
  });

  it('maps plastic bottle queries to the Self-Watering Planter model', () => {
    const model = get3DModelForWaste('PET Plastic Bottle');
    expect(model.id).toBe('plastic_planter');
    expect(model.targetProductName).toContain('Planter');
    expect(model.steps.length).toBe(5);
    expect(model.dimensionsCm.height).toBeGreaterThan(0);
  });

  it('maps cardboard boxes to the Desk Organizer model', () => {
    const model = get3DModelForWaste('Corrugated Cardboard Box');
    expect(model.id).toBe('cardboard_organizer');
    expect(model.toolsRequired.length).toBeGreaterThan(0);
  });

  it('maps aluminium soda can to the Perforated Lantern model', () => {
    const model = get3DModelForWaste('Aluminium Can');
    expect(model.id).toBe('metal_lantern');
    expect(model.co2SavedGrams).toBeGreaterThan(0);
  });

  it('provides safe fallback for general waste materials', () => {
    const fallback = get3DModelForWaste('unknown residual scrap');
    expect(fallback).toBeDefined();
    expect(fallback.steps.length).toBe(5);
  });
});
