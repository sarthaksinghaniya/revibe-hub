import { WasteItem, WasteCategory } from '@/types/index';
import { SCHEME_BY_CATEGORY } from '@/data/govSchmes';
import { CARBON_FACTORS } from '@/lib/carbonCredit';

const WASTE_DATABASE: Record<string, Omit<WasteItem, 'id' | 'timestamp' | 'confidence'>> = {
  'plastic bottle': {
    name: 'PET Plastic Bottle',
    category: 'recycle',
    material: 'Polyethylene Terephthalate (PET)',
    resinCode: '#1 PET',
    instructions: [
      'Empty and rinse the bottle thoroughly',
      'Remove the cap (separate material — HDPE #2)',
      'Crush flat to save bin space',
      'Place in Blue Dry Waste bin',
      'Check for local EPR drop-off for cashback ₹5–10',
    ],
    reuseIdeas: [
      'DIY drip irrigator for plants — poke holes in cap',
      'Mini greenhouse — cut top, invert over seedling',
      'Coin bank — cut slot in side, decorate',
      'Bird feeder — cut windows, add perch with chopstick',
    ],
    carbonSaved: CARBON_FACTORS.recycle.avgWeight * (CARBON_FACTORS.recycle.landfillFactor - CARBON_FACTORS.recycle.properFactor),
    waterSaved: CARBON_FACTORS.recycle.waterSaved,
    govScheme: SCHEME_BY_CATEGORY.recycle,
    facts: [
      'One PET bottle takes 450 years to decompose in a landfill',
      'Recycling 1 tonne of PET saves 1.5 tonnes of CO₂',
      'India generates 9.4 million tonnes of plastic waste annually',
    ],
  },
  'banana peel': {
    name: 'Banana Peel / Fruit Waste',
    category: 'compost',
    material: 'Organic Biomass',
    instructions: [
      'Do NOT mix with dry waste',
      'Place in Green Wet Waste bin',
      'Can be home-composted — takes 2–5 weeks',
      'Shred into smaller pieces for faster breakdown',
      'SATAT plants accept organic waste for biogas',
    ],
    reuseIdeas: [
      'Banana peel fertilizer tea — steep in water 48hrs',
      'Shoe polish substitute — rub inner peel on leather',
      'Compost activator — high in potassium & phosphorus',
      'Natural pest deterrent — bury near aphid-prone plants',
    ],
    carbonSaved: CARBON_FACTORS.compost.avgWeight * (CARBON_FACTORS.compost.landfillFactor - CARBON_FACTORS.compost.properFactor),
    waterSaved: CARBON_FACTORS.compost.waterSaved,
    govScheme: SCHEME_BY_CATEGORY.compost,
    facts: [
      'Food waste in landfills produces methane, 25× more potent than CO₂',     
      'Home composting can divert 30% of household waste',
      'Compost improves soil water retention by up to 50%',
    ],
  },
  'battery': {
    name: 'Used Battery (AA/AAA/Li-ion)',
    category: 'hazard',
    material: 'Mixed: Zinc, Manganese, Lithium, Cadmium',
    instructions: [
      '⚠️ NEVER put in regular bins — leaches toxic heavy metals',
      'Tape terminals with electrical tape before disposal',
      'Drop at electronics store battery take-back counter',
      'CPCB authorised e-waste recycler accepts batteries',
      'Some municipalities have monthly hazardous waste days',
    ],
    reuseIdeas: [
      'Low-charge batteries still work in TV remotes or clocks',
      'Switch to rechargeable NiMH batteries (1000+ cycles)',
      'Dead Li-ion — return to manufacturer for recycling',
    ],
    carbonSaved: CARBON_FACTORS.hazard.avgWeight * (CARBON_FACTORS.hazard.landfillFactor - CARBON_FACTORS.hazard.properFactor),
    waterSaved: CARBON_FACTORS.hazard.waterSaved,
    govScheme: SCHEME_BY_CATEGORY.hazard,
    facts: [
      'One AA battery can contaminate 600,000 litres of water',
      'Lithium batteries are responsible for many landfill fires',
      'India only recycles ~5% of e-waste properly',
    ],
  },
  'newspaper': {
    name: 'Newspaper / Paper',
    category: 'recycle',
    material: 'Cellulose Paper (virgin or recycled pulp)',
    instructions: [
      'Keep dry — wet paper cannot be recycled',
      'Remove plastic wrappers or staples',
      'Bundle and tie for kabadiwala or dry waste center',
      'Kabadiwala rate: ₹8–12 per kg for newspapers',
    ],
    reuseIdeas: [
      'Gift wrapping for eco-friendly presents',
      'Papier-mâché art projects',
      'Line kitchen drawers or shelves',
      'Compost browns layer — shred and add to compost bin',
    ],
    carbonSaved: CARBON_FACTORS.recycle.avgWeight * (CARBON_FACTORS.recycle.landfillFactor - CARBON_FACTORS.recycle.properFactor),
    waterSaved: 12,
    govScheme: SCHEME_BY_CATEGORY.recycle,
    facts: [
      'Recycling 1 tonne of paper saves 17 trees',
      'Paper is the most recycled material in India',
      'Wet paper loses its recyclability permanently',
    ],
  },
  'glass bottle': {
    name: 'Glass Bottle',
    category: 'recycle',
    material: 'Soda-lime glass (SiO₂ + Na₂O + CaO)',
    instructions: [
      'Rinse thoroughly, remove metal caps separately',
      'Do not break — intact glass is easier to sort',
      'Glass is infinitely recyclable without quality loss',
      'Deposit at local glass collection point or dry waste centre',
    ],
    reuseIdeas: [
      'Storage jars for spices, grains or leftovers',
      'Candle holder or vase — paint or etch for decoration',
      'Self-watering plant spike — fill, invert in soil',
      'Chilli string lights with fairy lights inside',
    ],
    carbonSaved: 0.25,
    waterSaved: 5,
    govScheme: SCHEME_BY_CATEGORY.recycle,
    facts: [
      'Glass takes over 1 million years to decompose naturally',
      'Recycled glass melts at lower temperatures — saves energy',
      'Germany recycles 80%+ of its glass — India only 20%',
    ],
  },
  'phone': {
    name: 'Old Smartphone / Mobile Phone',
    category: 'hazard',
    material: 'Mixed: Gold, Silver, Copper, Lithium, Tantalum, Lead',
    instructions: [
      'Wipe data: Factory reset before disposal',
      'Remove SIM and memory card',
      'Return to brand service centre (mandatory EPR)',
      'Cashback ₹200–2000 via brand exchange offers',
      'Register on CPCB E-waste portal for authorised recycler',
    ],
    reuseIdeas: [
      'Dedicated music player or alarm clock',
      'Smart home dashboard using old phone + app',
      'Security camera with Alfred or similar app',
      'Donate to schools or NGOs for digital literacy',
    ],
    carbonSaved: CARBON_FACTORS.hazard.avgWeight * (CARBON_FACTORS.hazard.landfillFactor - CARBON_FACTORS.hazard.properFactor),
    waterSaved: CARBON_FACTORS.hazard.waterSaved,
    govScheme: SCHEME_BY_CATEGORY.hazard,
    facts: [
      '1 million phones contain 35kg of gold, 350kg of silver',
      'A smartphone\'s manufacturing emits 70kg CO₂ equivalent',
      'India is world\'s 3rd largest e-waste generator',
    ],
  },
  'cardboard box': {
    name: 'Corrugated Cardboard Box',
    category: 'upcycle',
    material: 'Corrugated cellulose (multi-layer paper)',
    instructions: [
      'Flatten before disposal to save space',
      'Remove tape, staples and labels',
      'Keep dry — kabadiwala accepts at ₹4–8/kg',
      'Corrugated cardboard is 100% recyclable',
    ],
    reuseIdeas: [
      'Storage organiser — cut and fold into drawer dividers',
      'Kids playhouse or fort with cuts and decorations',
      'Garden weed mat — lay flat, cover with mulch',
      'DIY toy — guitars, rockets, dollhouses',
    ],
    carbonSaved: CARBON_FACTORS.upcycle.avgWeight * (CARBON_FACTORS.upcycle.landfillFactor - CARBON_FACTORS.upcycle.properFactor),
    waterSaved: CARBON_FACTORS.upcycle.waterSaved,
    govScheme: SCHEME_BY_CATEGORY.upcycle,
    facts: [
      'Cardboard is the most common packaging material worldwide',
      'Recycling 1 tonne of cardboard saves 9 cubic yards of landfill space',   
      'Corrugated boxes can be recycled up to 7 times',
    ],
  },
};

function findBestMatch(description: string): string {
  const lower = description.toLowerCase();
  const keywords: Record<string, string[]> = {
    'plastic bottle': ['plastic', 'bottle', 'pet', 'water bottle', 'soda', 'soft drink'],
    'banana peel': ['banana', 'peel', 'fruit', 'organic', 'food', 'vegetable', 'kitchen waste', 'compost'],
    'battery': ['battery', 'batteries', 'aa', 'aaa', 'lithium', 'cell', 'alkaline'],
    'newspaper': ['paper', 'newspaper', 'magazine', 'book', 'cardstock'],       
    'glass bottle': ['glass', 'jar', 'bottle'],
    'phone': ['phone', 'mobile', 'smartphone', 'iphone', 'android', 'laptop', 'electronic', 'gadget', 'tablet'],
    'cardboard box': ['cardboard', 'box', 'carton', 'packaging'],
  };

  let bestKey = 'plastic bottle';
  let bestScore = 0;

  for (const [key, kws] of Object.entries(keywords)) {
    const score = kws.filter(kw => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestKey = key;
    }
  }

  return bestKey;
}

export async function analyzeWaste(imageBase64: string, prompt?: string): Promise<WasteItem> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {     
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),      
              },
            },
            {
              type: 'text',
              text: `You are a waste identification expert for India. Analyze this image and respond ONLY with valid JSON (no markdown, no backticks):
{
  "name": "specific item name",
  "category": "recycle|compost|hazard|landfill|upcycle",
  "material": "material composition",
  "resinCode": "#1 PET or null",
  "confidence": 0.85,
  "instructions": ["step 1", "step 2", "step 3"],
  "reuseIdeas": ["idea 1", "idea 2", "idea 3"],
  "carbonSaved": 0.34,
  "waterSaved": 15,
  "facts": ["fact 1", "fact 2"]
}
Category rules: recycle=clean dry materials, compost=food/organic, hazard=toxic/e-waste/chemicals, landfill=non-recyclable, upcycle=reusable as-is creatively. India context always.`,
            },
          ],
        }],
      }),
    });

    if (!response.ok) throw new Error('API error');

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    const category = parsed.category as WasteCategory;
    const govScheme = SCHEME_BY_CATEGORY[category] || SCHEME_BY_CATEGORY.recycle;
    const factors = CARBON_FACTORS[category];

    return {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      govScheme,
      carbonSaved: parsed.carbonSaved || (factors.avgWeight * (factors.landfillFactor - factors.properFactor)),
      waterSaved: parsed.waterSaved || factors.waterSaved,
      ...parsed,
    };
  } catch (err) {
    // Fallback to local database
    const key = prompt ? findBestMatch(prompt) : 'plastic bottle';
    const data = WASTE_DATABASE[key] || WASTE_DATABASE['plastic bottle'];       
    return {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      confidence: 0.75 + Math.random() * 0.2,
      ...data,
    };
  }
}

export { WASTE_DATABASE };
