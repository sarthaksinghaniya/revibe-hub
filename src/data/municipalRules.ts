export interface MunicipalRule {
  accepted: boolean;
  local_instruction: string;
  facility_type: string;
  authority: string;
}

export const municipalRules: Record<string, Record<string, MunicipalRule>> = {
  lucknow: {
    recyclable: { accepted: true, local_instruction: "Deposit at nearest Swachh Bharat dry waste collection point. Lucknow Nagar Nigam collects Tuesdays and Fridays.", facility_type: "Dry Waste MRF", authority: "Lucknow Nagar Nigam" },
    compostable: { accepted: true, local_instruction: "Use green bin. LNN composting units operational in Aliganj, Gomti Nagar, Hazratganj.", facility_type: "Wet Waste Composting Unit", authority: "Lucknow Nagar Nigam" },
    hazardous: { accepted: true, local_instruction: "Do NOT mix with regular waste. Call LNN helpline 1800-180-5566 for hazardous pickup.", facility_type: "Hazardous Waste Collection", authority: "Lucknow Nagar Nigam" },
    landfill: { accepted: true, local_instruction: "Place in black bin. LNN vehicles collect daily 6–9am in residential zones.", facility_type: "General Waste", authority: "Lucknow Nagar Nigam" },
    upcyclable: { accepted: true, local_instruction: "Contact nearest SHG (Self Help Group) center. LNN Swachh app lists pickup points.", facility_type: "Upcycle Collection", authority: "Lucknow Nagar Nigam" },
  },
  indore: {
    recyclable: { accepted: true, local_instruction: "Indore has door-to-door collection daily. Blue bin for dry waste. IMC rated #1 in Swachh Survekshan.", facility_type: "Dry Waste MRF", authority: "Indore Municipal Corporation" },
    compostable: { accepted: true, local_instruction: "Green bin collected daily. IMC processes 550 MT/day wet waste into compost.", facility_type: "Composting Plant", authority: "Indore Municipal Corporation" },
    hazardous: { accepted: true, local_instruction: "IMC hazardous waste collection: call 0731-2530900. E-waste drives held monthly.", facility_type: "Hazardous Facility", authority: "Indore Municipal Corporation" },
    landfill: { accepted: false, local_instruction: "Indore has zero-landfill policy. All waste is processed. Segregate properly or face fine.", facility_type: "Processing Plant", authority: "Indore Municipal Corporation" },
    upcyclable: { accepted: true, local_instruction: "IMC runs 'Swachh Indore' upcycle centres. Drop at Palasia or Rajwada collection points.", facility_type: "Upcycle Centre", authority: "Indore Municipal Corporation" },
  },
  delhi: {
    recyclable: { accepted: true, local_instruction: "Blue bin for dry recyclables. MCD collects Mon/Wed/Fri. Nearest MRF via MCD app.", facility_type: "MRF Centre", authority: "Municipal Corporation of Delhi" },
    compostable: { accepted: true, local_instruction: "Green bin collected daily. RWAs with 50+ households must compost on-site per SWM Rules 2016.", facility_type: "Composting", authority: "Municipal Corporation of Delhi" },
    hazardous: { accepted: true, local_instruction: "E-waste: drop at authorized centers (list on dpcc.delhigovt.nic.in). Batteries: retail take-back.", facility_type: "Authorized TSDF", authority: "Delhi Pollution Control Committee" },
    landfill: { accepted: true, local_instruction: "Black bin. MCD daily collection. Delhi targeting landfill reduction under Mission Zero Waste 2027.", facility_type: "Sanitary Landfill", authority: "Municipal Corporation of Delhi" },
    upcyclable: { accepted: true, local_instruction: "Contact nearest NGO partner or Kabadiwala network. MCD lists registered scrap dealers.", facility_type: "Scrap/Upcycle", authority: "Municipal Corporation of Delhi" },
  },
  default: {
    recyclable: { accepted: true, local_instruction: "Separate dry waste and hand to your local waste collector or nearest recycling center.", facility_type: "Recycling Centre", authority: "Local Municipal Body" },
    compostable: { accepted: true, local_instruction: "Segregate wet waste into green bin. Composting at home is also recommended.", facility_type: "Composting", authority: "Local Municipal Body" },
    hazardous: { accepted: true, local_instruction: "Do NOT mix with general waste. Contact your local municipal helpline for safe disposal.", facility_type: "Hazardous Collection", authority: "Local Municipal Body" },
    landfill: { accepted: true, local_instruction: "Place in general waste bin for municipal collection.", facility_type: "General Waste", authority: "Local Municipal Body" },
    upcyclable: { accepted: true, local_instruction: "Explore local NGOs or upcycle groups. List on W2W marketplace for someone who can reuse it.", facility_type: "Upcycle/Reuse", authority: "Local Municipal Body" },
  },
};

export function getMunicipalRule(city: string, category: string): MunicipalRule {
  const cityKey = (city || "").toLowerCase().trim();
  const rules = municipalRules[cityKey] || municipalRules["default"];
  const cat = (category || "").toLowerCase();
  return rules[cat] || municipalRules["default"][cat] || municipalRules["default"]["landfill"];
}

export function isCityKnown(city: string): boolean {
  const cityKey = (city || "").toLowerCase().trim();
  return cityKey in municipalRules && cityKey !== "default";
}
