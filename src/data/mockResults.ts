// Legacy mock data — kept for reference only.
export const mockResults: any[] = [
  {
    name: "PET Plastic Bottle",
    confidence: 94,
    category: "Recyclable",
    material: "PET Plastic (#1)",
    wasteScore: 78,
    disposalSteps: [
      "Empty and rinse the bottle with water",
      "Remove the cap and label if possible",
      "Crush to save space in your recycling bin",
      "Place in your blue recycling bin",
    ],
    upcycleIdeas: [
      { title: "Self-Watering Planter", difficulty: "Easy", time: "15 min" },
      { title: "Bird Feeder", difficulty: "Easy", time: "20 min" },
      { title: "Desk Organizer", difficulty: "Medium", time: "30 min" },
    ],
    impact: {
      co2: "95g",
      water: "1.2L",
      readable: "Recycling this bottle saves enough energy to power a laptop for 2.5 hours.",
    },
  },
  {
    name: "Aluminum Can",
    confidence: 97,
    category: "Recyclable",
    material: "Aluminum",
    wasteScore: 92,
    disposalSteps: [
      "Rinse out any remaining liquid",
      "You can crush it to save space",
      "Place in your recycling bin — no need to remove labels",
    ],
    upcycleIdeas: [
      { title: "Tea Light Holder", difficulty: "Easy", time: "10 min" },
      { title: "Mini Herb Planter", difficulty: "Easy", time: "15 min" },
      { title: "Wind Chime Set", difficulty: "Medium", time: "45 min" },
    ],
    impact: {
      co2: "170g",
      water: "3.8L",
      readable: "Recycling one aluminum can saves enough energy to run a TV for 3 hours.",
    },
  },
  {
    name: "Banana Peel",
    confidence: 91,
    category: "Compostable",
    material: "Organic Matter",
    wasteScore: 85,
    disposalSteps: [
      "Place directly in your compost bin or green waste bin",
      "Cut into smaller pieces for faster decomposition",
      "Can also be used directly as garden fertilizer",
    ],
    upcycleIdeas: [
      { title: "Natural Plant Fertilizer", difficulty: "Easy", time: "5 min" },
      { title: "Shoe Polish", difficulty: "Easy", time: "5 min" },
      { title: "Face Mask Ingredient", difficulty: "Easy", time: "10 min" },
    ],
    impact: {
      co2: "45g",
      water: "0.5L",
      readable: "Composting prevents methane emissions equivalent to driving 0.3 km.",
    },
  },
  {
    name: "AA Battery",
    confidence: 88,
    category: "Hazardous",
    material: "Alkaline / Zinc-Carbon",
    wasteScore: 25,
    disposalSteps: [
      "⚠️ Do NOT place in regular trash or recycling",
      "Store in a non-metallic container until disposal",
      "Take to a designated battery drop-off point or hazardous waste facility",
      "Many electronics stores accept used batteries for free",
    ],
    upcycleIdeas: [
      { title: "Battery Art Magnets", difficulty: "Medium", time: "20 min" },
      { title: "Science Experiment", difficulty: "Hard", time: "1 hour" },
      { title: "Decorative Weight", difficulty: "Easy", time: "10 min" },
    ],
    impact: {
      co2: "30g",
      water: "0.8L",
      readable: "Proper battery disposal prevents heavy metals from contaminating 167,000 liters of water.",
    },
  },
];

export const getRandomResult = (): any => {
  return mockResults[Math.floor(Math.random() * mockResults.length)];
};
