import { GovScheme, WasteCategory } from '@/types/index';

export const GOV_SCHEMES: GovScheme[] = [
  {
    name: 'Swachh Bharat Mission',
    ministry: 'Ministry of Housing & Urban Affairs',
    description: 'India\'s flagship cleanliness mission to achieve Clean India by 2025. Citizens who participate in waste segregation can earn recognition and rewards through local ULBs.',
    benefit: 'Earn Swachh Nagar points redeemable at municipal stores. Tax rebate for registered composters.',
    link: 'https://swachhbharatmission.gov.in',
    icon: '🇮🇳',
  },
  {
    name: 'Extended Producer Responsibility (EPR)',
    ministry: 'Ministry of Environment, Forest & Climate Change',
    description: 'Under EPR rules, brands must take back plastic waste. You can drop off packaging at designated PROs (Producer Responsibility Organisations) for free or receive cashback.',
    benefit: 'Some states offer ₹5–15 per kg for certified plastic return. Register at CPCB portal.',
    link: 'https://cpcb.nic.in',
    icon: '♻️',
  },
  {
    name: 'National Composting Initiative',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    description: 'Support home composting and decentralised organic waste management. Home composters can avail subsidies on equipment and compost sell-back programs.',
    benefit: 'Up to ₹3,000 subsidy on compost bins. Compost sell-back at ₹2/kg to local farms.',
    link: 'https://agricoop.gov.in',
    icon: '🌱',
  },
  {
    name: 'E-Waste Recycling Initiative',
    ministry: 'Ministry of Electronics & IT (MeitY)',
    description: 'Proper disposal of electronic waste through authorised recyclers. E-waste contains precious metals and hazardous materials requiring special handling.',
    benefit: 'Cashback ₹100–500 per device via authorised e-waste PROs. Check CPCB authorised recycler list.',
    link: 'https://moef.gov.in/ewaste',
    icon: '💻',
  },
  {
    name: 'Pradhan Mantri Jan Dhan Yojana (Green Wallet)',
    ministry: 'Ministry of Finance',
    description: 'Select states are piloting carbon credit linkages with Jan Dhan accounts, allowing urban households to earn digital green tokens for verified waste recycling.',
    benefit: 'Pilot in select cities: earn ₹50–200/month in green wallet credits linked to bank account.',
    link: 'https://pmjdy.gov.in',
    icon: '💳',
  },
  {
    name: 'SATAT Compressed Biogas Scheme',
    ministry: 'Ministry of Petroleum & Natural Gas',
    description: 'Sustainable Alternative Towards Affordable Transportation — organic waste converted to biogas. Citizens can link their organic waste to nearest SATAT plant.',
    benefit: 'Registered households get priority gas connections and earn ₹1/kg of verified organic waste.',
    link: 'https://petroleum.nic.in',
    icon: '⛽',
  },
  {
    name: 'Plastic Waste Management Rules 2022',
    ministry: 'MoEFCC',
    description: 'Single-use plastic ban enforcement with rewards for reporting violations and turning in banned items. Also covers awareness campaigns.',      
    benefit: 'Report SUP violations for civic rewards. Join local DRY WASTE COLLECTION CENTRES (DWCCs).',
    link: 'https://cpcb.nic.in/plastic-waste',
    icon: '🚫',
  },
];

export const SCHEME_BY_CATEGORY: Record<WasteCategory, GovScheme> = {
  recycle: GOV_SCHEMES[1], // EPR
  compost: GOV_SCHEMES[2], // Composting
  hazard: GOV_SCHEMES[3],  // E-waste
  landfill: GOV_SCHEMES[0], // Swachh Bharat
  upcycle: GOV_SCHEMES[0], // Swachh Bharat
};
