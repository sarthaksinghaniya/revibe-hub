export interface Upcycle3DModelConfig {
  id: string;
  materialCategory: 'plastic' | 'cardboard' | 'metal' | 'glass' | 'ewaste' | 'general';
  targetProductName: string;
  subtitle: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  timeEstimate: string;
  co2SavedGrams: number;
  dimensionsCm: { width: number; height: number; depth: number };
  toolsRequired: string[];
  materialsRequired: string[];
  steps: Array<{
    stepNumber: number;
    title: string;
    description: string;
    safetyTip?: string;
  }>;
}

export const UPCYCLE_3D_CATALOG: Record<string, Upcycle3DModelConfig> = {
  plastic: {
    id: 'plastic_planter',
    materialCategory: 'plastic',
    targetProductName: 'Self-Watering Hanging Planter',
    subtitle: 'Crafted from a 2L PET bottle with passive capillary sub-irrigation',
    difficulty: 'Easy',
    timeEstimate: '20 mins',
    co2SavedGrams: 280,
    dimensionsCm: { width: 10, height: 24, depth: 10 },
    toolsRequired: ['Utility knife / Scissors', 'Cotton yarn or shoelace (wick)', 'Awl / heated needle'],
    materialsRequired: ['1x 2L Clean PET Bottle', 'Potting soil mix', 'Small herb / mint sapling'],
    steps: [
      { stepNumber: 1, title: 'Clean & Mark Cut Line', description: 'Rinse bottle and draw a horizontal guideline 10 cm from the bottle neck.' },
      { stepNumber: 2, title: 'Bisection Cut', description: 'Carefully slice bottle into two halves: inverted funnel top and base reservoir.' },
      { stepNumber: 3, title: 'Wicking Hole Prep', description: 'Puncture a 4mm hole in the bottle cap. Thread 15cm cotton wick through.' },
      { stepNumber: 4, title: 'Assemble Inverted Funnel', description: 'Fill bottom half with water. Invert top half and rest inside the base with wick submerged.' },
      { stepNumber: 5, title: 'Planting & Soil Fill', description: 'Add potting soil around the wick and plant your herb. Capillary action hydrates roots autonomously!' },
    ],
  },
  cardboard: {
    id: 'cardboard_organizer',
    materialCategory: 'cardboard',
    targetProductName: 'Geometric Multi-Tier Desk Organizer',
    subtitle: 'Modular interlocking desktop caddy for pens, notes, and cables',
    difficulty: 'Easy',
    timeEstimate: '35 mins',
    co2SavedGrams: 340,
    dimensionsCm: { width: 22, height: 16, depth: 14 },
    toolsRequired: ['Ruler & Pencil', 'Craft knife / X-Acto', 'Eco wood glue / paper tape'],
    materialsRequired: ['Corrugated shipping box', 'Scrap gift wrap or acrylic paint'],
    steps: [
      { stepNumber: 1, title: 'Measure & Score Walls', description: 'Flatten cardboard box and mark 4 tiered wall panels (14cm, 10cm, 6cm).' },
      { stepNumber: 2, title: 'Cut Interlocking Slots', description: 'Slice 3mm interlocking slot grooves halfway down each divider.' },
      { stepNumber: 3, title: 'Assemble Framework', description: 'Slide vertical and horizontal dividers together without glue to test friction fit.' },
      { stepNumber: 4, title: 'Reinforce Base & Joints', description: 'Run a thin bead of wood glue along bottom perimeter edges.' },
      { stepNumber: 5, title: 'Decorative Finish', description: 'Wrap with recycled paper or paint with non-toxic acrylics for a chic aesthetic.' },
    ],
  },
  metal: {
    id: 'metal_lantern',
    materialCategory: 'metal',
    targetProductName: 'Perforated Desk Mood Lantern',
    subtitle: 'Upcycled aluminium soda can with geometric starlight apertures',
    difficulty: 'Medium',
    timeEstimate: '25 mins',
    co2SavedGrams: 420,
    dimensionsCm: { width: 6.6, height: 12.2, depth: 6.6 },
    toolsRequired: ['Thumb tack / Hammer & nail', 'Can opener', 'Protective work gloves'],
    materialsRequired: ['1x Clean Aluminium Soda Can', '1x LED tea light (battery/rechargeable)'],
    steps: [
      { stepNumber: 1, title: 'Remove Can Top', description: 'Use can opener to smoothly remove the top lid with zero sharp burrs.' },
      { stepNumber: 2, title: 'Freeze Water Inside', description: 'Fill can with water and freeze solid for 3 hours to prevent wall denting while punching.' },
      { stepNumber: 3, title: 'Starlight Apertures', description: 'Punch dot patterns (constellations, spirals) through the can walls using a nail.' },
      { stepNumber: 4, title: 'Thaw & Smooth Edge', description: 'Melt ice, dry thoroughly, and sand rim edge with fine grit sandpaper.' },
      { stepNumber: 5, title: 'Insert LED tea light', description: 'Drop warm LED candle inside. Enjoy stunning geometric wall shadows!' },
    ],
  },
  glass: {
    id: 'glass_terrarium',
    materialCategory: 'glass',
    targetProductName: 'Desert Succulent Terrarium',
    subtitle: 'Transparent glass jar transformed into an indoor living ecosystem',
    difficulty: 'Easy',
    timeEstimate: '15 mins',
    co2SavedGrams: 310,
    dimensionsCm: { width: 8.5, height: 15, depth: 8.5 },
    toolsRequired: ['Spoon for layering', 'Tweezers for small plants', 'Spray bottle'],
    materialsRequired: ['1x Wide-mouth glass jam/sauce jar', 'Small drainage pebbles', 'Activated charcoal & succulent soil', 'Mini succulent'],
    steps: [
      { stepNumber: 1, title: 'Label Removal', description: 'Soak glass jar in warm soapy water with a spoon of baking soda to peel off label.' },
      { stepNumber: 2, title: 'Drainage Base Layer', description: 'Add 2 cm of clean gravel/pebbles to prevent root rot from standing water.' },
      { stepNumber: 3, title: 'Filtration Layer', description: 'Sprinkle crushed activated charcoal to keep water fresh and odorless.' },
      { stepNumber: 4, title: 'Soil & Plant Rooting', description: 'Add cactus soil mix, create a small indentation, and nestle the succulent roots.' },
      { stepNumber: 5, title: 'Fairy Light / Moss Touch', description: 'Accent with dried moss and an optional micro LED light string on top.' },
    ],
  },
  ewaste: {
    id: 'ewaste_clock',
    materialCategory: 'ewaste',
    targetProductName: 'Cyberpunk Industrial Desk Clock',
    subtitle: 'Salvaged motherboard circuit board transformed into modern techno-art',
    difficulty: 'Advanced',
    timeEstimate: '45 mins',
    co2SavedGrams: 890,
    dimensionsCm: { width: 18, height: 18, depth: 5 },
    toolsRequired: ['Precision screwdriver', 'Rotary tool / Hand drill', 'Hot glue gun'],
    materialsRequired: ['Obsolete computer motherboard / GPU board', 'Quartz clock movement kit (₹120)'],
    steps: [
      { stepNumber: 1, title: 'Harvest PCB Board', description: 'Disassemble discarded PC, extract motherboard, and wipe clean with isopropyl alcohol.' },
      { stepNumber: 2, title: 'Drill Center Shaft Hole', description: 'Carefully drill a 8mm hole in the center clearance area for the clock spindle.' },
      { stepNumber: 3, title: 'Mount Quartz Movement', description: 'Attach clock mechanism from the rear and tighten brass hexagonal lock nut.' },
      { stepNumber: 4, title: 'Attach Clock Hands', description: 'Press hour, minute, and second hands onto the spindle (neon yellow or metallic).' },
      { stepNumber: 5, title: 'Stand Support & Battery', description: 'Hot-glue two recycled RAM stick stands on the base. Insert AA battery and watch it tick!' },
    ],
  },
};

export function get3DModelForWaste(materialOrName: string): Upcycle3DModelConfig {
  const query = materialOrName.toLowerCase();
  if (query.includes('bottle') || query.includes('pet') || query.includes('plastic') || query.includes('poly')) {
    return UPCYCLE_3D_CATALOG.plastic;
  }
  if (query.includes('cardboard') || query.includes('box') || query.includes('paper') || query.includes('carton')) {
    return UPCYCLE_3D_CATALOG.cardboard;
  }
  if (query.includes('can') || query.includes('aluminium') || query.includes('metal') || query.includes('tin') || query.includes('brass') || query.includes('iron') || query.includes('copper')) {
    return UPCYCLE_3D_CATALOG.metal;
  }
  if (query.includes('glass') || query.includes('jar') || query.includes('bottle') && query.includes('glass')) {
    return UPCYCLE_3D_CATALOG.glass;
  }
  if (query.includes('ewaste') || query.includes('e-waste') || query.includes('battery') || query.includes('circuit') || query.includes('board') || query.includes('cable') || query.includes('phone')) {
    return UPCYCLE_3D_CATALOG.ewaste;
  }
  return UPCYCLE_3D_CATALOG.plastic;
}
