import { Product } from '@/types';

export interface VelyraSunscreen {
  id: string;
  code: string;
  name: string;
  tagline: string;
  spf: string;
  pa: string;
  finish: string;
  skinType: string;
  volume: string;
  price: number;
  mrp: number;
  image: string;
  video?: string;
  videoPoster?: string;
  videoTitle?: string;
  videoDescription?: string;
  hoverFeatures: {
    label: string;
    value: string;
  }[];
  description: string;
  benefits: string[];
  keyIngredients: {
    name: string;
    benefit: string;
  }[];
  textureNote: string;
  routineStep: number;
  quizProfile: {
    skinTypes: string[];
    finishes: string[];
    outdoorHours: string[];
    environments: string[];
    priorities: string[];
  };
}

export const VELYRA_SUNSCREENS: VelyraSunscreen[] = [
  {
    id: 'prod_sunscreen_01',
    code: 'VEL-01',
    name: 'Silk-Air Fluid Sunscreen',
    tagline: 'Featherlight photoprotection that dissolves instantly into bare skin.',
    spf: 'SPF 50+',
    pa: 'PA++++',
    finish: 'Invisible Velvet Dew',
    skinType: 'All Skin Types • Melanin-Calibrated',
    volume: '50 ml / 1.69 fl. oz.',
    price: 899,
    mrp: 1099,
    image: '/products/sunscreen-collection/01-silk-air.jpg',
    hoverFeatures: [
      { label: 'Protection', value: 'SPF 50+ PA++++' },
      { label: 'Cast', value: '100% Zero White Cast' },
      { label: 'Finish', value: 'Invisible Velvet Dew' },
      { label: 'Weight', value: 'Micro-Fluid Break' },
      { label: 'Shield', value: 'Broad Spectrum UVA/UVB' }
    ],
    description: 'Our inaugural, award-winning daily fluid. Engineered specifically for Indian humidity and intense UV indices, it melts upon touch with zero stinging, stickiness, or white residue.',
    benefits: [
      'Next-generation European filters: Tinosorb S + Uvinul A Plus',
      'Infused with 2% Niacinamide & Centella Asiatica to calm heat erythema',
      'Non-comedogenic base safe for acne-prone & sensitive skin',
      'Acts as an invisible smoothing primer beneath makeup or bare skin'
    ],
    keyIngredients: [
      { name: 'Tinosorb S & Uvinul A Plus', benefit: 'Photostable modern organic UV filters that do not degrade.' },
      { name: '2% Pure Niacinamide', benefit: 'Refines skin texture, regulates sebum, and balances tone.' },
      { name: 'Centella Asiatica (Cica)', benefit: 'Botanical antioxidant that soothes tropical sun-stress.' }
    ],
    textureNote: 'Featherlight serum milk that breaks into water droplets on skin contact.',
    routineStep: 4,
    quizProfile: {
      skinTypes: ['combination', 'normal', 'all'],
      finishes: ['velvet-dew', 'invisible'],
      outdoorHours: ['moderate', 'daily-commute'],
      environments: ['humid', 'urban'],
      priorities: ['zero-cast', 'lightweight']
    }
  },
  {
    id: 'prod_sunscreen_02',
    code: 'VEL-02',
    name: 'Mineral Matte Veil',
    tagline: 'Pore-blurring 100% non-nano mineral shield with an all-day soft-matte finish.',
    spf: 'SPF 50+',
    pa: 'PA++++',
    finish: 'Soft Ultra-Matte',
    skinType: 'Oily • Acne-Prone • Sensitive',
    volume: '50 ml / 1.69 fl. oz.',
    price: 949,
    mrp: 1199,
    image: '/products/sunscreen-collection/02-mineral-matte.jpg',
    hoverFeatures: [
      { label: 'Filter', value: '100% Non-Nano Zinc' },
      { label: 'Finish', value: 'Soft Ultra-Matte' },
      { label: 'Oil Control', value: '12-Hour Sebum Balance' },
      { label: 'Pores', value: 'Instant Blurring Effect' },
      { label: 'Safety', value: 'Reef & Rosacea Safe' }
    ],
    description: 'A physical sunscreen that defies physical sunscreen stereotypes. Pure micro-dispersed Zinc Oxide delivers broad-spectrum protection with an airbrushed matte finish that keeps shine at bay all day.',
    benefits: [
      'Micro-porous silica spheres absorb midday humidity and sebum',
      'No chalky residue on Fitzpatrick skin phototypes III to VI',
      'Soothes reactive redness with colloidal oat extract',
      'Clean mineral formula non-stinging around eye contours'
    ],
    keyIngredients: [
      { name: '100% Non-Nano Zinc Oxide', benefit: 'Pure physical barrier reflecting broad UVA/UVB photons.' },
      { name: 'Oil-Absorbing Silica', benefit: 'Absorbs sweat and surface lipids for 12-hour shine control.' },
      { name: 'Colloidal Oat Flour', benefit: 'Calms redness, micro-itching, and skin barrier stress.' }
    ],
    textureNote: 'Whipped cloud cream that dries down to an airbrushed matte veil.',
    routineStep: 4,
    quizProfile: {
      skinTypes: ['oily', 'acne-prone'],
      finishes: ['matte'],
      outdoorHours: ['moderate', 'outdoors'],
      environments: ['humid', 'urban'],
      priorities: ['oil-control', 'zero-cast']
    }
  },
  {
    id: 'prod_sunscreen_03',
    code: 'VEL-03',
    name: 'Aqua Gel Water Drop',
    tagline: 'Hydrating water-gel burst that floods parched skin with cooling moisture.',
    spf: 'SPF 50',
    pa: 'PA++++',
    finish: 'Fresh Dew Hydration',
    skinType: 'Dehydrated • Dry • Combination',
    volume: '50 ml / 1.69 fl. oz.',
    price: 879,
    mrp: 1049,
    image: '/products/sunscreen-collection/03-aqua-gel.jpg',
    hoverFeatures: [
      { label: 'Base', value: 'Triple Hyaluronic Matrix' },
      { label: 'Cooling', value: '-3°C Instant Heat Drop' },
      { label: 'Finish', value: 'Weightless Water Dew' },
      { label: 'Residue', value: 'Zero Film or Greasiness' },
      { label: 'Comfort', value: 'Deep Dermal Hydration' }
    ],
    description: 'Infused with a multi-molecular Hyaluronic Acid complex and Aloe Vera leaf water. The cooling gel instantly bursts into micro-droplets of hydration upon application, recharging thirsty skin.',
    benefits: [
      '72-hour moisture reservoir that prevents AC-induced dryness',
      'Instant -3°C sensorial cooling effect on hot summer days',
      'Zero stickiness under tropical sun and humid monsoons',
      'Infused with Birch Sap for essential electrolyte replenishment'
    ],
    keyIngredients: [
      { name: 'Triple Hyaluronic Acid', benefit: 'Multi-depth molecular weights hydrate both surface and deeper layers.' },
      { name: 'Aloe Ferox Leaf Juice', benefit: 'Cools surface skin temperature and quenches UV thirst.' },
      { name: 'Electrolyte Mineral Complex', benefit: 'Rebalances osmotic cellular pressure in hot climates.' }
    ],
    textureNote: 'Translucent watery gel that breaks into instant hydration ripples.',
    routineStep: 4,
    quizProfile: {
      skinTypes: ['dry', 'dehydrated', 'normal'],
      finishes: ['dewy', 'fresh'],
      outdoorHours: ['moderate', 'daily-commute'],
      environments: ['dry-heat', 'air-conditioned'],
      priorities: ['hydration', 'lightweight']
    }
  },
  {
    id: 'prod_sunscreen_04',
    code: 'VEL-04',
    name: 'Radiance Glow Serum Shield',
    tagline: 'Illuminating photoprotection with crushed light-reflecting micro-pearls.',
    spf: 'SPF 50+',
    pa: 'PA++++',
    finish: 'Luminous Glass Glow',
    skinType: 'Dull • Uneven • Normal to Dry',
    volume: '30 ml / 1.0 fl. oz.',
    price: 999,
    mrp: 1249,
    image: '/products/sunscreen-collection/04-radiance-glow.jpg',
    hoverFeatures: [
      { label: 'Finish', value: 'Lit-From-Within Glass Glow' },
      { label: 'Actives', value: 'Niacinamide + Glutathione' },
      { label: 'Blue Light', value: 'HEV Indoor Screen Shield' },
      { label: 'Tone', value: 'Subtle Golden Radiance' },
      { label: 'Formula', value: 'Antioxidant Rich Serum' }
    ],
    description: 'The marriage of high-potency radiance serum and uncompromising photoprotection. Delivers a lit-from-within golden-hour glow while shielding skin against UV and modern device blue light.',
    benefits: [
      'Imparts a natural luminous sheen with zero glitter or greasy shine',
      'Contains Glutathione & Vitamin C ester to target sun spots',
      'Blocks 88% of High Energy Visible (HEV) blue light from screens',
      'Can be worn alone as a radiant skin-tint base or highlighter'
    ],
    keyIngredients: [
      { name: 'Glutathione & Vitamin C', benefit: 'Synergistic brightening duo that fades post-sun pigmentation.' },
      { name: 'Micro-Reflective Pearls', benefit: 'Diffuses ambient light to soften fine lines and enhance bone structure.' },
      { name: 'Squalane Barrier Lipids', benefit: 'Locks in serum luminosity with silky, breathable glide.' }
    ],
    textureNote: 'Silky golden serum elixir that leaves an ethereal glow.',
    routineStep: 4,
    quizProfile: {
      skinTypes: ['dry', 'normal', 'dull'],
      finishes: ['glow', 'luminous'],
      outdoorHours: ['moderate', 'indoor-screens'],
      environments: ['urban', 'air-conditioned'],
      priorities: ['glow', 'anti-pigmentation']
    }
  },
  {
    id: 'prod_sunscreen_05',
    code: 'VEL-05',
    name: 'Ceramide Barrier Defense',
    tagline: 'Lipid-replenishing moisture cushion that reinforces compromised skin barriers.',
    spf: 'SPF 50+',
    pa: 'PA++++',
    finish: 'Soft Satin Cushion',
    skinType: 'Dry • Sensitive • Compromised Barrier',
    volume: '50 ml / 1.69 fl. oz.',
    price: 949,
    mrp: 1199,
    image: '/products/sunscreen-collection/05-ceramide-barrier.jpg',
    hoverFeatures: [
      { label: 'Lipids', value: '5 Essential Ceramides' },
      { label: 'Barrier', value: '24-Hour TEWL Defense' },
      { label: 'Finish', value: 'Nourishing Satin Velvet' },
      { label: 'Tolerance', value: 'Dermatologist Tested' },
      { label: 'Scent', value: '100% Fragrance Free' }
    ],
    description: 'Crafted for skin compromised by over-exfoliation, retinoids, or severe environmental stress. 5 bio-identical ceramides lock in moisture while advanced filters shield against UV-induced collagen breakdown.',
    benefits: [
      'Repairs cellular lipid bilayers to prevent transepidermal water loss',
      'Rich satin finish that immediately comforts stinging, sensitized skin',
      'Safe for post-laser, chemical peel, and retinoid recovery',
      'Completely hypoallergenic with zero synthetic fragrances'
    ],
    keyIngredients: [
      { name: '5 Essential Ceramides (NP, AP, EOP, AS, NS)', benefit: 'Reconstructs the lipid matrix for lasting moisture defense.' },
      { name: 'Plant Cholesterol & Fatty Acids', benefit: 'Restores the golden 3:1:1 lipid ratio found in youthful skin.' },
      { name: 'Madecassoside', benefit: 'Deep cellular healing to calm inflammation and heat irritation.' }
    ],
    textureNote: 'Rich soufflé cream that cushions without feeling suffocating.',
    routineStep: 4,
    quizProfile: {
      skinTypes: ['dry', 'sensitive', 'compromised'],
      finishes: ['satin', 'cushion'],
      outdoorHours: ['moderate', 'daily-commute'],
      environments: ['dry-heat', 'urban'],
      priorities: ['barrier-repair', 'comfort']
    }
  },
  {
    id: 'prod_sunscreen_06',
    code: 'VEL-06',
    name: 'Invisible Active Sport Mist',
    tagline: 'High-endurance sweat & water resistant mist that sets in 3 seconds.',
    spf: 'SPF 50+',
    pa: 'PA++++',
    finish: 'Breathable Dry-Touch',
    skinType: 'Active • High-Perspiration • All Skin Types',
    volume: '100 ml / 3.4 fl. oz.',
    price: 1049,
    mrp: 1299,
    image: '/products/sunscreen-collection/06-sport-mist.jpg',
    hoverFeatures: [
      { label: 'Resistance', value: '80-Min Water & Sweat Proof' },
      { label: 'Setting', value: '3-Second Flash Dry' },
      { label: 'Application', value: '360° Continuous Mist' },
      { label: 'Eyes', value: 'Zero Sting Sweat Lock' },
      { label: 'Coverage', value: 'Full Body & Face Safe' }
    ],
    description: 'Engineered for high-intensity athletes, runners, and beach days. Uses an aerosol-free continuous micro-atomizer that sprays evenly at any angle, including upside down, with zero eye burn during heavy sweat.',
    benefits: [
      '80-minute verified water and sweat immersion resistance',
      'Dry-touch polymer matrix bonds directly to skin without running',
      'Can be applied directly over makeup or sweaty skin without clumping',
      'Ultra-fine aerosol-free propellant mechanism'
    ],
    keyIngredients: [
      { name: 'Hydro-Polymer Shield Matrix', benefit: 'Forms a flexible, breathable waterproof net over the skin.' },
      { name: 'Green Tea Polyphenols', benefit: 'Neutralizes free radicals triggered by active outdoor exercise.' },
      { name: 'Mentha Extract', benefit: 'Delivers subtle crisp refreshment during peak midday training.' }
    ],
    textureNote: 'Microscopic aerosol-free mist that instantly flash-dries matte.',
    routineStep: 4,
    quizProfile: {
      skinTypes: ['all', 'active', 'oily'],
      finishes: ['dry-touch', 'matte'],
      outdoorHours: ['outdoors', 'extreme'],
      environments: ['humid', 'tropical-beach'],
      priorities: ['sweat-resistant', 'fast-reapplication']
    }
  },
  {
    id: 'prod_sunscreen_07',
    code: 'VEL-07',
    name: 'Tinted Complexion Shield',
    tagline: 'Tone-evening mineral protection calibrated for South Asian skin undertones.',
    spf: 'SPF 50+',
    pa: 'PA++++',
    finish: 'Natural Skin Radiance',
    skinType: 'All Skin Tones • Hyperpigmentation-Prone',
    volume: '50 ml / 1.69 fl. oz.',
    price: 979,
    mrp: 1199,
    image: '/products/sunscreen-collection/07-tinted-shield.jpg',
    hoverFeatures: [
      { label: 'Pigments', value: 'Iron Oxides (Blue Light Defense)' },
      { label: 'Match', value: 'Adaptive Tone Chameleon' },
      { label: 'Finish', value: 'Second-Skin Natural' },
      { label: 'Melasma', value: 'Clinical Hyperpigmentation Guard' },
      { label: 'Texture', value: 'Silky Emulsion Fluid' }
    ],
    description: 'Enriched with medical-grade Iron Oxides specifically formulated to block pigment-triggering Visible Light. Blends seamlessly into South Asian warm, olive, and golden undertones with zero ashy cast.',
    benefits: [
      'Iron Oxide pigments provide superior protection against melasma triggers',
      'Self-adjusting tone technology blurs redness and mild hyperpigmentation',
      'Replaces light foundation or tinted moisturizer for effortless mornings',
      'Zero chalkiness or grey ashiness on deeper Indian skin tones'
    ],
    keyIngredients: [
      { name: 'Spectra-Fine Iron Oxides', benefit: 'Blocks High Energy Visible (HEV) blue light and prevents melasma flares.' },
      { name: 'Zinc Oxide 12%', benefit: 'Broad-spectrum physical protection calibrated for high tolerance.' },
      { name: 'Licorice Root Glabridin', benefit: 'Inhibits tyrosinase to prevent sun-induced post-inflammatory dark spots.' }
    ],
    textureNote: 'Smooth fluid emulsion that self-adjusts to skin undertone.',
    routineStep: 4,
    quizProfile: {
      skinTypes: ['all', 'hyperpigmentation-prone'],
      finishes: ['natural-skin', 'tinted'],
      outdoorHours: ['moderate', 'daily-commute'],
      environments: ['urban', 'humid'],
      priorities: ['anti-pigmentation', 'even-tone']
    }
  },
  {
    id: 'prod_sunscreen_08',
    code: 'VEL-08',
    name: 'Cica Soothing Calming Fluid',
    tagline: 'Instant anti-redness photoprotection infused with concentrated Gotu Kola.',
    spf: 'SPF 50',
    pa: 'PA++++',
    finish: 'Weightless Calming Dew',
    skinType: 'Rosacea • Sensitive • Acne-Prone',
    volume: '30 ml / 1.0 fl. oz.',
    price: 899,
    mrp: 1099,
    image: '/products/sunscreen-collection/08-cica-calm.jpg',
    hoverFeatures: [
      { label: 'Core Active', value: 'Centella Asiatica Complex' },
      { label: 'Redness', value: 'Reduces Heat Flushing' },
      { label: 'Finish', value: 'Calming Weightless Dew' },
      { label: 'Irritation', value: 'Zero Alcohol or Fragrance' },
      { label: 'Testing', value: 'Dermatologist Verified' }
    ],
    description: 'Formulated for reactive skin that flushes, itches, or reddens under tropical sun. Highly concentrated Indian Gotu Kola and Madecassoside quell inflammation while providing photostable UV defense.',
    benefits: [
      'Reduces visible capillary redness and sun-induced heat flushing',
      'Ultra-mild clean formulation that does not trigger rosacea flares',
      'Non-pore clogging fluid that dries to a clean, comfortable touch',
      'Contains Artemisia (Mugwort) extract for instant soothing relief'
    ],
    keyIngredients: [
      { name: 'Indian Centella Asiatica (Gotu Kola)', benefit: 'Potent botanical triterpenes calm skin thermal stress.' },
      { name: 'Madecassoside & Asiaticoside', benefit: 'Clinically strengthens capillaries and micro-vascular wall integrity.' },
      { name: 'Mugwort & Green Tea', benefit: 'Provides high antioxidant defense against ozone and smog.' }
    ],
    textureNote: 'Soothing jade-tinted fluid that dissolves transparent upon contact.',
    routineStep: 4,
    quizProfile: {
      skinTypes: ['sensitive', 'rosacea', 'acne-prone'],
      finishes: ['calming', 'dewy'],
      outdoorHours: ['moderate', 'daily-commute'],
      environments: ['humid', 'urban'],
      priorities: ['soothing', 'zero-cast']
    }
  },
  {
    id: 'prod_sunscreen_09',
    code: 'VEL-09',
    name: 'Peptide Sculpt Sun Cream',
    tagline: 'Multi-peptide anti-photoaging daily treatment that firms while protecting.',
    spf: 'SPF 50+',
    pa: 'PA++++',
    finish: 'Nourishing Velvet Soft',
    skinType: 'Mature • Fine Lines • Dry to Normal',
    volume: '50 ml / 1.69 fl. oz.',
    price: 1099,
    mrp: 1349,
    image: '/products/sunscreen-collection/09-peptide-cream.jpg',
    hoverFeatures: [
      { label: 'Anti-Aging', value: 'Matrixyl 3000 + Copper Peptides' },
      { label: 'Firming', value: 'Boosts Pro-Collagen I' },
      { label: 'Finish', value: 'Nourishing Velvet Cushion' },
      { label: 'Protection', value: 'UVA-I & UVA-II Complete Block' },
      { label: 'Texture', value: 'Sublime Rich Fluid' }
    ],
    description: 'An intensive anti-photoaging formulation designed to prevent and reverse the collagen degradation caused by prolonged UVA ray penetration. Packed with signaling peptides, Vitamin E, and CoQ10.',
    benefits: [
      'Inhibits collagen-degrading MMP enzymes triggered by sun exposure',
      'Firms facial contours and plumps dehydrated micro-creases',
      'Sublime velvet cream finish that locks in moisture all day',
      'Formulated with modern photostable European filters'
    ],
    keyIngredients: [
      { name: 'Matrixyl 3000 & Copper Peptides', benefit: 'Signals cellular collagen synthesis and elasticity retention.' },
      { name: 'Tocopherol (Pure Vitamin E)', benefit: 'Synergistic lipid-soluble antioxidant guarding cell membranes.' },
      { name: 'Coenzyme Q10 (Ubiquinone)', benefit: 'Energizes mitochondrial repair and prevents solar elastosis.' }
    ],
    textureNote: 'Luxurious velvet cream that melts like butter without greasiness.',
    routineStep: 4,
    quizProfile: {
      skinTypes: ['dry', 'mature', 'normal'],
      finishes: ['nourishing', 'velvet'],
      outdoorHours: ['moderate', 'outdoors'],
      environments: ['urban', 'air-conditioned'],
      priorities: ['anti-aging', 'hydration']
    }
  },
  {
    id: 'prod_sunscreen_10',
    code: 'VEL-10',
    name: 'Multi-Action Sun Stick',
    tagline: 'Pocket-sized touchless reapplication stick with an invisible matte velvet finish.',
    spf: 'SPF 50+',
    pa: 'PA++++',
    finish: 'Velvet Soft-Touch',
    skinType: 'All Skin Types • Touch-Up Reapplication',
    volume: '20 g / 0.70 oz.',
    price: 799,
    mrp: 999,
    image: '/products/sunscreen-collection/10-sun-stick.jpg',
    hoverFeatures: [
      { label: 'Format', value: 'Touchless Oval Twist Stick' },
      { label: 'Reapply', value: 'Glides Seamlessly Over Makeup' },
      { label: 'Finish', value: 'Zero Clumping Velvet Matte' },
      { label: 'Portability', value: 'Pocket & Handbag Essential' },
      { label: 'Pores', value: 'Zero Clogged Pores' }
    ],
    description: 'The ultimate on-the-go reapplication solution. An ergonomic oval twist-up stick that glides effortlessly across facial contours without disturbing foundation, eyeliner, or skincare layers.',
    benefits: [
      'Allows frictionless 2-hour reapplication anywhere with clean hands',
      'Zero disturbance to existing makeup, foundation, or powder',
      'Ergonomic curved oval tip hugs cheeks, nose bridge, and brow',
      'Enriched with Camellia Sinensis extract for instant sebum balancing'
    ],
    keyIngredients: [
      { name: 'Silica Powder & Porous Polymers', benefit: 'Provides effortless glide with zero tugging or white streakiness.' },
      { name: 'Camellia Seed Oil', benefit: 'Lightweight botanical lipid providing touchless cushion.' },
      { name: 'Bisabolol (German Chamomile)', benefit: 'Anti-irritant that soothes friction and calms windburn.' }
    ],
    textureNote: 'Solid velvet balm that glides smoothly into a powder-soft veil.',
    routineStep: 4,
    quizProfile: {
      skinTypes: ['all', 'oily', 'combination'],
      finishes: ['velvet', 'matte'],
      outdoorHours: ['daily-commute', 'outdoors', 'travel'],
      environments: ['urban', 'tropical-beach', 'humid'],
      priorities: ['fast-reapplication', 'portability']
    }
  }
];

export interface StorySlide {
  id: string;
  category: string;
  headline: string;
  description: string;
  image: string;
  sunscreenUsed: string;
}

export const VELYRA_STORIES: StorySlide[] = [
  {
    id: 'story_city',
    category: 'City Life',
    headline: 'Urban Commute & Blue Light Shield',
    description: 'Navigating high-smog traffic, metro transitions, and glass-tower glare with invisible, breathable photoprotection.',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop',
    sunscreenUsed: 'Silk-Air Fluid SPF 50+'
  },
  {
    id: 'story_commute',
    category: 'Daily Transit',
    headline: 'Sweat-Resistant Heat Transit',
    description: 'Engineered not to run, drip, or sting eyes when stepping into intense afternoon humidity.',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200&auto=format&fit=crop',
    sunscreenUsed: 'Mineral Matte Veil SPF 50+'
  },
  {
    id: 'story_travel',
    category: 'Modern Travel',
    headline: 'Compact High-Altitude Cabin Comfort',
    description: 'Counteracting cabin air dehydration and intense cloud-level UV radiation with 5-ceramide defense.',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200&auto=format&fit=crop',
    sunscreenUsed: 'Ceramide Barrier Defense'
  },
  {
    id: 'story_beach',
    category: 'Coastal Retreat',
    headline: 'High-Exposure Tropical Sand & Saltwater',
    description: 'Photostable European filters that maintain broad-spectrum SPF 50+ integrity even under equator sun.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
    sunscreenUsed: 'Invisible Active Sport Mist'
  },
  {
    id: 'story_work',
    category: 'Studio & Office',
    headline: 'All-Day Screen Glare & Fluorescent Defense',
    description: 'Iron oxides and antioxidant actives blocking High Energy Visible (HEV) rays across 8 hours of screen time.',
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1200&auto=format&fit=crop',
    sunscreenUsed: 'Radiance Glow Serum Shield'
  },
  {
    id: 'story_weekend',
    category: 'Weekend Leisure',
    headline: 'Carefree Alfresco Brunches & Strolls',
    description: 'Invisible dewy skin finish that looks effortless in natural sunlight without heavy foundation.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop',
    sunscreenUsed: 'Tinted Complexion Shield'
  },
  {
    id: 'story_outdoor',
    category: 'Active Pursuits',
    headline: 'Touchless Reapplication on the Move',
    description: 'Quick 10-second glide over cheeks and forehead with the Multi-Action Sun Stick. Zero greasy fingers.',
    image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=1200&auto=format&fit=crop',
    sunscreenUsed: 'Multi-Action Sun Stick'
  }
];

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  descriptor: string;
  location: string;
  product: string;
  rating: number;
  skinType: string;
}

export const VELYRA_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test_01',
    quote: 'I finally found a sunscreen that feels invisible on my skin. No purple cast, no stinging eyes during workouts, just weightless skin that feels like bare silk.',
    author: 'Ananya Deshmukh',
    descriptor: 'Architect & Daily Commuter',
    location: 'Mumbai',
    product: 'Silk-Air Fluid Sunscreen SPF 50+',
    rating: 5,
    skinType: 'Fitzpatrick Type IV • Oily-Combination'
  },
  {
    id: 'test_02',
    quote: 'Mineral sunscreens in India always made me look like a ghost. VELYRA Mineral Matte Veil completely changed my routine—matte all day in 90% humidity.',
    author: 'Rohan Mehra',
    descriptor: 'Product Designer',
    location: 'Bengaluru',
    product: 'Mineral Matte Veil SPF 50+',
    rating: 5,
    skinType: 'Fitzpatrick Type V • Sensitive & Acne-Prone'
  },
  {
    id: 'test_03',
    quote: 'The Radiance Glow Serum is now my everyday base. It gives that post-facial golden-hour sheen while keeping my pigmentation completely protected.',
    author: 'Kavita Sundaram',
    descriptor: 'Creative Director',
    location: 'New Delhi',
    product: 'Radiance Glow Serum Shield',
    rating: 5,
    skinType: 'Fitzpatrick Type III • Dry Skin'
  },
  {
    id: 'test_04',
    quote: 'The Sun Stick is pure genius. I reapply in my car at traffic signals without touching my face with dirty hands. It doesn’t smudge my blush at all.',
    author: 'Dr. Meera Nambiar',
    descriptor: 'Dermatology Resident',
    location: 'Kochi',
    product: 'Multi-Action Sun Stick SPF 50+',
    rating: 5,
    skinType: 'Fitzpatrick Type IV • Normal Skin'
  },
  {
    id: 'test_05',
    quote: 'I have severe rosacea that flares up in Delhi summer heat. The Cica Soothing Fluid is the only formula that actually cools my skin down on application.',
    author: 'Pooja Taneja',
    descriptor: 'Financial Analyst',
    location: 'Gurugram',
    product: 'Cica Soothing Calming Fluid',
    rating: 5,
    skinType: 'Fitzpatrick Type III • Rosacea-Prone'
  }
];

export interface IngredientFeature {
  id: string;
  name: string;
  shortName: string;
  role: string;
  tagline: string;
  description: string;
  benefits: string[];
  visual: string;
  image: string;
  badge: string;
}

export const VELYRA_INGREDIENTS: IngredientFeature[] = [
  {
    id: 'ing_tinosorb',
    name: 'Tinosorb S & Uvinul A Plus',
    shortName: 'Tinosorb & Uvinul',
    role: 'Next-Generation European UV Filters',
    tagline: 'Ultra-photostable organic filter system engineered in Germany for peak broad-spectrum protection.',
    description: 'Advanced organic filters that do not degrade in harsh midday sunlight or cause eye stinging.',
    benefits: [
      'Peak broad-spectrum UVA + UVB photoprotection',
      'Zero ocular irritation and non-sensitizing formula',
      'Exceptional photostability through humid weather'
    ],
    visual: '/brand/filters-clean.svg',
    image: '/ingredients/01-tinosorb.jpg',
    badge: 'ACTIVE 01 • UV SHIELD'
  },
  {
    id: 'ing_niacinamide',
    name: '2% Pure Niacinamide',
    shortName: 'Niacinamide',
    role: 'Vitamin B3 Cellular Barrier Clarifier',
    tagline: 'Clinically calibrated to balance midday sebum, clarify pores, and support radiant tone.',
    description: 'A gentle concentration that refines skin texture without flushing or sensitization.',
    benefits: [
      'Balances surface sebum in humid tropical climates',
      'Strengthens natural ceramide lipid barrier',
      'Prevents sun-induced uneven pigmentation'
    ],
    visual: '/brand/niacinamide-clean.svg',
    image: '/ingredients/02-niacinamide.jpg',
    badge: 'ACTIVE 02 • BARRIER CLARIFIER'
  },
  {
    id: 'ing_cica',
    name: 'Centella Asiatica (Gotu Kola)',
    shortName: 'Centella Asiatica',
    role: 'Ancient Ayurvedic Botanical Soother',
    tagline: 'Pure botanical extract rich in Madecassoside to comfort sun-stressed skin.',
    description: 'Soothes thermal skin irritation and diminishes heat-induced redness from outdoor exposure.',
    benefits: [
      'Immediate soothing of sun-stressed skin',
      'Reduces heat flushing and vascular redness',
      'Antioxidant botanical defense against urban stressors'
    ],
    visual: '/brand/cica-clean.svg',
    image: '/ingredients/03-centella.jpg',
    badge: 'ACTIVE 03 • BOTANICAL SOOTHER'
  },
  {
    id: 'ing_hyaluronic',
    name: 'Multi-Molecular Hyaluronic Acid',
    shortName: 'Hyaluronic Acid',
    role: 'Triple-Depth Moisture Matrix',
    tagline: 'Tiered molecular weights that drench superficial and deeper layers with cooling dew.',
    description: 'Floods dehydrated skin with non-sticky hydration that resists air-conditioned dryness.',
    benefits: [
      'Weightless dewy hydration with zero greasiness',
      'Plumps dehydration lines caused by UV exposure',
      'Sustains comfortable all-day dermal moisture'
    ],
    visual: '/brand/hyaluronic-clean.svg',
    image: '/ingredients/04-hyaluronic.jpg',
    badge: 'ACTIVE 04 • HYDRATION MATRIX'
  },
  {
    id: 'ing_ceramides',
    name: '5 Bio-Identical Ceramides',
    shortName: 'Bio-Identical Ceramides',
    role: 'Cellular Lipid Bilayer Rebuilder',
    tagline: 'Replicates natural intercellular skin cement to seal in hydration.',
    description: 'Reinforces compromised acid mantles against particulate pollution and daily weather stress.',
    benefits: [
      'Reinforces the natural skin barrier shield',
      'Prevents transepidermal water evaporation',
      'Enhances smooth, velvety skin resilience'
    ],
    visual: '/brand/ceramides-clean.svg',
    image: '/ingredients/05-ceramides.jpg',
    badge: 'ACTIVE 05 • BARRIER CARE'
  },
  {
    id: 'ing_vit_e',
    name: 'Tocopherol (Pure Vitamin E)',
    shortName: 'Vitamin E (Tocopherol)',
    role: 'Lipid-Soluble Radical Scavenger',
    tagline: 'Formidable cell membrane antioxidant that works synergistically with UV filters.',
    description: 'Neutralizes free radicals generated by UV rays before they impact dermal elasticity.',
    benefits: [
      'Protects surface lipids from photo-oxidation',
      'Works synergistically with UV filters for higher efficacy',
      'Enhances smooth, velvety skin feel'
    ],
    visual: '/brand/vitamin-e-clean.svg',
    image: '/ingredients/06-vitamin-e.jpg',
    badge: 'ACTIVE 06 • ANTIOXIDANT'
  }
];

export interface RoutineStep {
  step: string;
  title: string;
  subtitle: string;
  time: string;
  description: string;
  keyAction: string;
  dermatologistTip: string;
  image: string;
}

export const VELYRA_ROUTINE: RoutineStep[] = [
  {
    step: '01',
    title: 'CLEANSE',
    subtitle: 'Amino Jelly Gentle Wash',
    time: 'Morning • 60 Seconds',
    description: 'Sweep away overnight sebum and dead cellular build-up without stripping the skin’s delicate acid mantle.',
    keyAction: 'Massage low-pH cleanser onto damp skin, rinse with lukewarm water.',
    dermatologistTip: 'Never use steaming hot water—it weakens the moisture barrier before sun exposure.',
    image: '/routine/01-cleanse.jpg'
  },
  {
    step: '02',
    title: 'TREAT',
    subtitle: 'Antioxidant Vitamin Serum',
    time: 'Morning • 30 Seconds',
    description: 'Layer an antioxidant serum like Niacinamide or Vitamin C to neutralize free radicals from morning commute pollution.',
    keyAction: 'Press 3-4 drops gently over face and neck until absorbed.',
    dermatologistTip: 'Antioxidants beneath sunscreen multiply your photoprotective defense by up to 4x.',
    image: '/routine/02-treat.jpg'
  },
  {
    step: '03',
    title: 'MOISTURIZE',
    subtitle: 'Lightweight Barrier Hydration',
    time: 'Morning • 45 Seconds',
    description: 'Lock in cellular hydration with featherlight squalane or ceramide emulsion suited to your specific skin phototype.',
    keyAction: 'Smooth a pea-sized amount across face and let sink in for 60 seconds.',
    dermatologistTip: 'If your skin is naturally oily in humid climates, a hydrating sunscreen alone may suffice.',
    image: '/routine/03-moisturize.jpg'
  },
  {
    step: '04',
    title: 'VELYRA SPF',
    subtitle: 'Broad Spectrum Photoprotection',
    time: 'Morning • 60 Seconds',
    description: 'The non-negotiable step. Two generous finger lengths applied to face, neck, ears, and back of hands 15 minutes before stepping out.',
    keyAction: 'Apply evenly using gentle press-and-glide motions. Reapply every 2-3 hours.',
    dermatologistTip: 'Don’t forget ears and eyelids. Our formulas are ophthalmologist tested to never sting.',
    image: '/routine/04-spf.jpg'
  },
  {
    step: '05',
    title: 'MAKEUP / GO',
    subtitle: 'Effortless Invisible Base',
    time: 'Morning • Ready for the Day',
    description: 'Enjoy bare radiant skin with zero white cast, or use VELYRA as a smooth velvet primer beneath foundation or concealer.',
    keyAction: 'Your skin is completely shielded from UVA, UVB, and blue light.',
    dermatologistTip: 'Use the Multi-Action Sun Stick for touchless reapplication without disturbing makeup.',
    image: '/routine/05-base.jpg'
  }
];

export interface QuizQuestion {
  id: number;
  question: string;
  subtitle: string;
  options: {
    label: string;
    description: string;
    tag: string;
  }[];
}

export const VELYRA_QUIZ: QuizQuestion[] = [
  {
    id: 1,
    question: "What is your primary skin type?",
    subtitle: "We calibrate textures to match your skin's natural lipid production.",
    options: [
      { label: "Oily / Acne-Prone", description: "Prone to shine, enlarged pores, or midday breakout flares", tag: "oily" },
      { label: "Dry / Dehydrated", description: "Feels tight, flakey, or thirsty throughout the day", tag: "dry" },
      { label: "Combination", description: "Oily T-zone (forehead/nose) with normal or dry cheeks", tag: "combination" },
      { label: "Sensitive / Reactive", description: "Easily flushed, redness-prone, or stung by standard formulas", tag: "sensitive" }
    ]
  },
  {
    id: 2,
    question: "What skin finish do you look forward to?",
    subtitle: "How you want your skin to look and feel under natural light.",
    options: [
      { label: "Invisible Velvet Dew", description: "Natural, weightless skin finish that feels like nothing", tag: "velvet-dew" },
      { label: "Soft Ultra-Matte", description: "Zero shine, airbrushed pore blur that stays matte all day", tag: "matte" },
      { label: "Luminous Glass Glow", description: "Radiant, lit-from-within golden-hour glow", tag: "glow" },
      { label: "Natural Tinted Tone", description: "Subtle sheer evening of skin undertone and melasma guard", tag: "tinted" }
    ]
  },
  {
    id: 3,
    question: "How much time do you spend outdoors daily?",
    subtitle: "Determines the necessary endurance matrix and sweat resistance.",
    options: [
      { label: "Urban Transit & Indoors", description: "Mostly desk-bound with daily commute in car/metro", tag: "daily-commute" },
      { label: "Moderate Sun Exposure", description: "1-3 hours of outdoor meetings, errands, and walking", tag: "moderate" },
      { label: "Active Outdoor & Sports", description: "High-intensity outdoor workouts, running, or water sports", tag: "outdoors" },
      { label: "Frequent Travel / Flying", description: "Changing climates, high-altitude sun, and cabin air", tag: "travel" }
    ]
  },
  {
    id: 4,
    question: "What is your typical climate environment?",
    subtitle: "Our formulations are tuned for specific humidity and temperature stress.",
    options: [
      { label: "High Tropical Humidity", description: "Hot, muggy weather where traditional creams melt or feel sticky", tag: "humid" },
      { label: "Air-Conditioned Offices", description: "Dry indoor air conditioned environments that leech moisture", tag: "air-conditioned" },
      { label: "Dry Heat & Intense Sun", description: "Arid climates with high UV indices and low humidity", tag: "dry-heat" },
      { label: "High-Smog Urban Center", description: "Heavy particulate pollution, traffic exhaust, and screen glare", tag: "urban" }
    ]
  },
  {
    id: 5,
    question: "What matters most to you in a daily sunscreen?",
    subtitle: "Your non-negotiable benchmark for everyday wear.",
    options: [
      { label: "True Zero White Cast", description: "Must disappear 100% on deeper Indian skin phototypes", tag: "zero-cast" },
      { label: "Featherlight Weightlessness", description: "Must absorb in 10 seconds without clogging pores", tag: "lightweight" },
      { label: "Anti-Pigmentation Defense", description: "Target dark spots, melasma, and blue light damage", tag: "anti-pigmentation" },
      { label: "Barrier Repair & Comfort", description: "Soothe redness and reinforce the cellular lipid matrix", tag: "barrier-repair" }
    ]
  }
];

export function getQuizRecommendation(answers: Record<number, string>): VelyraSunscreen {
  const skinType = answers[1] || 'all';
  const finish = answers[2] || 'invisible';
  const outdoor = answers[3] || 'moderate';
  const environment = answers[4] || 'humid';
  const priority = answers[5] || 'zero-cast';

  // Scoring algorithm based on matching tags
  let bestScore = -1;
  let bestMatch: VelyraSunscreen = VELYRA_SUNSCREENS[0];

  for (const prod of VELYRA_SUNSCREENS) {
    let score = 0;
    const profile = prod.quizProfile;

    if (profile.skinTypes.includes(skinType) || profile.skinTypes.includes('all')) score += 3;
    if (profile.finishes.includes(finish) || profile.finishes.includes('invisible')) score += 3;
    if (profile.outdoorHours.includes(outdoor)) score += 2;
    if (profile.environments.includes(environment)) score += 2;
    if (profile.priorities.includes(priority)) score += 3;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = prod;
    }
  }

  return bestMatch;
}

export function getStaticFallbackProducts(): Product[] {
  return VELYRA_SUNSCREENS.map((s) => {
    // Secondary visual mapping for interactive card hover
    const secondaryMap: Record<string, string> = {
      'VEL-01': '/products/sunscreen-texture.webp',
      'VEL-02': '/textures/02-glide.jpg',
      'VEL-03': '/textures/03-absorption.jpg',
      'VEL-04': '/textures/04-finish.jpg',
      'VEL-05': '/products/sunscreen-lifestyle.webp',
      'VEL-06': '/textures/01-dispense.jpg',
      'VEL-07': '/products/sunscreen-box.webp',
      'VEL-08': '/textures/02-glide.jpg',
      'VEL-09': '/textures/04-finish.jpg',
      'VEL-10': '/textures/03-absorption.jpg',
    };

    return {
      id: s.id,
      name: s.name,
      slug: s.id === 'prod_sunscreen_01' ? 'silk-air-fluid-sunscreen-spf50' : s.id.replace('prod_', ''),
      tagline: s.tagline,
      description: s.description,
      price: s.price,
      mrp: s.mrp,
      inStock: true,
      stockQuantity: 100,
      sku: s.code,
      volume: s.volume,
      spfRating: `${s.spf} ${s.pa}`,
      finish: s.finish,
      skinType: s.skinType,
      images: [s.image, secondaryMap[s.code] || '/products/sunscreen-hero.webp'],
      benefits: s.benefits,
      keyIngredients: s.keyIngredients.map((k) =>
        typeof k === 'string' ? { name: k, benefit: 'Skin barrier protection' } : k
      ),
      fullIngredients: 'Aqua, Diethylamino Hydroxybenzoyl Hexyl Benzoate, Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine, Niacinamide, Centella Asiatica Extract, Sodium Hyaluronate...',
      howToUse: 'Apply generously as the final step of your morning skincare routine, 15 minutes before sun exposure.',
      isFeatured: true,
      isUpcoming: false,
      category: 'Sunscreens',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
}

/**
 * Returns the unified catalog preserving all 10 Velyra sunscreens while merging
 * any existing database products (Moisturizers, Cleansers, Sets) non-destructively.
 */
export function getAllCatalogProducts(dbProducts: Product[] = []): Product[] {
  const staticProducts = getStaticFallbackProducts();
  const map = new Map<string, Product>();

  // 1. First register all 10 Velyra Sunscreens
  for (const sp of staticProducts) {
    map.set(sp.id, sp);
  }

  // 2. Seamlessly merge database products (preserves DB slugs, blob images, price overrides, other categories)
  for (const dp of dbProducts) {
    const existing = map.get(dp.id);
    const parsedImages = Array.isArray(dp.images)
      ? dp.images
      : typeof dp.images === 'string'
      ? JSON.parse(dp.images)
      : existing?.images || ['/products/sunscreen-hero.webp'];

    map.set(dp.id, {
      ...existing,
      ...dp,
      slug: dp.slug || existing?.slug || dp.id.replace('prod_', ''),
      images: parsedImages && parsedImages.length > 0 ? parsedImages : existing?.images || ['/products/sunscreen-hero.webp'],
    });
  }

  return Array.from(map.values());
}
