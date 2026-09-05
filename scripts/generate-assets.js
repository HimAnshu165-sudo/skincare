const fs = require('fs');
const path = require('path');

const publicProductsDir = path.join(__dirname, '..', 'public', 'products');
const publicTexturesDir = path.join(__dirname, '..', 'public', 'textures');

if (!fs.existsSync(publicProductsDir)) fs.mkdirSync(publicProductsDir, { recursive: true });
if (!fs.existsSync(publicTexturesDir)) fs.mkdirSync(publicTexturesDir, { recursive: true });

// SVG 1: Sunscreen Hero (Editorial Luxury Bottle)
const sunscreenHero = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#FDFBF7" />
      <stop offset="60%" stop-color="#F2ECE4" />
      <stop offset="100%" stop-color="#E5DDD2" />
    </radialGradient>
    <linearGradient id="bottleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#EDE6DC" />
      <stop offset="25%" stop-color="#FAF7F2" />
      <stop offset="70%" stop-color="#F5F0E8" />
      <stop offset="100%" stop-color="#D9CFBF" />
    </linearGradient>
    <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#B88646" />
      <stop offset="35%" stop-color="#E4BA78" />
      <stop offset="70%" stop-color="#C49350" />
      <stop offset="100%" stop-color="#8E6126" />
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="35" stdDeviation="30" flood-color="#1A1918" flood-opacity="0.12" />
    </filter>
  </defs>
  <rect width="800" height="1000" fill="url(#bgGlow)" />
  <!-- Subtle aesthetic background circle -->
  <circle cx="400" cy="500" r="320" fill="#EAE2D5" opacity="0.4" />
  
  <!-- Bottle Group with Shadow -->
  <g filter="url(#softShadow)">
    <!-- Base Shadow beneath bottle -->
    <ellipse cx="400" cy="810" rx="140" ry="24" fill="#2D2720" opacity="0.15" />
    
    <!-- Bottle Body -->
    <rect x="290" y="360" width="220" height="420" rx="36" fill="url(#bottleGrad)" stroke="#E0D6C8" stroke-width="1.5" />
    
    <!-- Bottle Neck -->
    <rect x="360" y="315" width="80" height="50" rx="4" fill="#D9CFBF" />
    
    <!-- Luxury Gold Cap -->
    <rect x="350" y="220" width="100" height="100" rx="12" fill="url(#capGrad)" stroke="#8E6126" stroke-width="1" />
    <!-- Cap Knurling / Detail Lines -->
    <line x1="365" y1="220" x2="365" y2="320" stroke="#FFF" stroke-opacity="0.25" stroke-width="1.5" />
    <line x1="435" y1="220" x2="435" y2="320" stroke="#000" stroke-opacity="0.15" stroke-width="1.5" />

    <!-- Minimalist Editorial Label on Bottle -->
    <text x="400" y="470" font-family="'Cormorant Garamond', Georgia, serif" font-size="28" font-weight="600" letter-spacing="0.22em" text-anchor="middle" fill="#1A1918">VELYRA</text>
    <line x1="350" y1="495" x2="450" y2="495" stroke="#C49350" stroke-width="1" />
    <text x="400" y="530" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="600" letter-spacing="0.16em" text-anchor="middle" fill="#2A2826">SILK-AIR FLUID</text>
    <text x="400" y="555" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="500" letter-spacing="0.14em" text-anchor="middle" fill="#6A645A">SUNSCREEN</text>
    <text x="400" y="605" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="700" letter-spacing="0.12em" text-anchor="middle" fill="#1A1918">SPF 50+ • PA++++</text>
    <text x="400" y="635" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="400" letter-spacing="0.18em" text-anchor="middle" fill="#887F73">BROAD SPECTRUM UVA/UVB</text>
    <text x="400" y="725" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="500" letter-spacing="0.12em" text-anchor="middle" fill="#485246">50 ml / 1.69 fl. oz.</text>
  </g>
</svg>
`;

// SVG 2: Sunscreen Texture (Macro Droplet)
const sunscreenTexture = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="100%" height="100%">
  <defs>
    <radialGradient id="texBg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#FBF8F3" />
      <stop offset="70%" stop-color="#EDE5D8" />
      <stop offset="100%" stop-color="#DDD2C1" />
    </radialGradient>
    <radialGradient id="dropGrad" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="40%" stop-color="#FBF7EE" />
      <stop offset="85%" stop-color="#EFE6D4" />
      <stop offset="100%" stop-color="#D9CBB5" />
    </radialGradient>
    <filter id="dropShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="15" dy="30" stdDeviation="25" flood-color="#1E1B17" flood-opacity="0.16" />
    </filter>
  </defs>
  <rect width="800" height="1000" fill="url(#texBg)" />
  <g filter="url(#dropShadow)">
    <path d="M400,280 C560,280 660,420 640,580 C620,720 500,780 400,780 C290,780 180,710 160,560 C140,410 250,280 400,280 Z" fill="url(#dropGrad)" />
    <!-- Gloss highlight curve -->
    <path d="M300,360 C380,310 490,320 540,380 C500,345 400,340 330,385 Z" fill="#FFFFFF" opacity="0.85" />
    <ellipse cx="480" cy="450" rx="45" ry="25" transform="rotate(-25 480 450)" fill="#FFFFFF" opacity="0.6" />
  </g>
  <text x="400" y="860" font-family="'Cormorant Garamond', serif" font-size="26" font-style="italic" letter-spacing="0.08em" text-anchor="middle" fill="#60574B">Weightless Silk Fluid • Zero White Cast</text>
</svg>
`;

// SVG 3: Sunscreen Lifestyle (Sunlight beam & Shadow)
const sunscreenLifestyle = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="100%" height="100%">
  <defs>
    <linearGradient id="sunBeam" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF5E5" stop-opacity="0.9" />
      <stop offset="50%" stop-color="#FAF0DF" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#E8DAC4" stop-opacity="1" />
    </linearGradient>
  </defs>
  <rect width="800" height="1000" fill="#E8DEC9" />
  <polygon points="0,0 800,200 800,1000 0,800" fill="url(#sunBeam)" />
  
  <!-- Palm Leaf Botanical Shadow Overlay -->
  <path d="M0,0 Q300,300 150,600 Q450,250 800,150 Q600,450 700,900" stroke="#3A3225" stroke-width="45" stroke-linecap="round" fill="none" opacity="0.08" />
  
  <text x="400" y="480" font-family="'Cormorant Garamond', serif" font-size="44" font-weight="500" letter-spacing="0.14em" text-anchor="middle" fill="#1A1918">VELYRA</text>
  <text x="400" y="530" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" letter-spacing="0.2em" text-anchor="middle" fill="#6A6255">EVERYDAY SUN ARCHITECTURE</text>
</svg>
`;

// SVG 4: Sunscreen Box (Textured Packaging)
const sunscreenBox = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="100%" height="100%">
  <defs>
    <linearGradient id="boxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FBF9F5" />
      <stop offset="100%" stop-color="#E5DDD2" />
    </linearGradient>
  </defs>
  <rect width="800" height="1000" fill="#F0E8DC" />
  <rect x="280" y="240" width="240" height="520" rx="16" fill="url(#boxGrad)" stroke="#D4C8B5" stroke-width="1.5" />
  <!-- Embossed gold line -->
  <rect x="300" y="260" width="200" height="480" rx="8" fill="none" stroke="#C9944D" stroke-width="1" stroke-dasharray="4 2" opacity="0.6" />
  <text x="400" y="380" font-family="'Cormorant Garamond', Georgia, serif" font-size="30" letter-spacing="0.2em" text-anchor="middle" fill="#1A1918">VELYRA</text>
  <text x="400" y="440" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="600" letter-spacing="0.16em" text-anchor="middle" fill="#1A1918">SILK-AIR SUNSCREEN</text>
  <text x="400" y="470" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="700" letter-spacing="0.12em" text-anchor="middle" fill="#C9944D">SPF 50+ • PA++++</text>
  <text x="400" y="660" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" letter-spacing="0.14em" text-anchor="middle" fill="#6E675D">DERMATOLOGIST TESTED</text>
</svg>
`;

// SVG 5: Moisturizer Hero
const moisturizerHero = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="100%" height="100%">
  <defs>
    <radialGradient id="mGrad" cx="50%" cy="50%" r="65%">
      <stop offset="0%" stop-color="#F9F6F0" />
      <stop offset="100%" stop-color="#E2D7C5" />
    </radialGradient>
  </defs>
  <rect width="800" height="1000" fill="url(#mGrad)" />
  <!-- Glass Jar -->
  <g>
    <ellipse cx="400" cy="740" rx="160" ry="25" fill="#201C16" opacity="0.12" />
    <rect x="250" y="450" width="300" height="260" rx="40" fill="#FAF7F2" stroke="#D8CDBD" stroke-width="2" />
    <rect x="270" y="390" width="260" height="70" rx="16" fill="#C9944D" stroke="#8E6126" stroke-width="1.5" />
    <text x="400" y="560" font-family="'Cormorant Garamond', Georgia, serif" font-size="26" letter-spacing="0.2em" text-anchor="middle" fill="#1A1918">VELYRA</text>
    <text x="400" y="600" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="600" letter-spacing="0.14em" text-anchor="middle" fill="#3D372E">CERAMIDE CUSHION CREAM</text>
    <text x="400" y="640" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" letter-spacing="0.12em" text-anchor="middle" fill="#485246">BARRIER RESTORATION</text>
  </g>
</svg>
`;

// SVG 6: Moisturizer Texture
const moisturizerTexture = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="100%" height="100%">
  <rect width="800" height="1000" fill="#F4EFE6" />
  <circle cx="400" cy="500" r="220" fill="#FFFDF8" stroke="#E3D7C5" stroke-width="12" />
  <path d="M300,460 Q400,380 500,480 Q450,560 340,540 Z" fill="#FAF5E8" />
  <text x="400" y="780" font-family="'Cormorant Garamond', serif" font-size="24" font-style="italic" text-anchor="middle" fill="#6A6255">Cloud Soufflé • 5 Essential Ceramides</text>
</svg>
`;

// SVG 7: Cleanser Hero
const cleanserHero = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="100%" height="100%">
  <rect width="800" height="1000" fill="#ECEFEA" />
  <g>
    <ellipse cx="400" cy="780" rx="120" ry="20" fill="#1E241D" opacity="0.12" />
    <rect x="310" y="360" width="180" height="400" rx="30" fill="#F4F8F3" stroke="#D1DDD0" stroke-width="2" />
    <rect x="360" y="280" width="80" height="90" rx="10" fill="#485246" />
    <rect x="390" y="240" width="80" height="45" rx="6" fill="#2E362C" />
    <text x="400" y="500" font-family="'Cormorant Garamond', serif" font-size="26" letter-spacing="0.2em" text-anchor="middle" fill="#1A1918">VELYRA</text>
    <text x="400" y="540" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="600" letter-spacing="0.14em" text-anchor="middle" fill="#485246">AMINO JELLY CLEANSER</text>
    <text x="400" y="570" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" letter-spacing="0.12em" text-anchor="middle" fill="#758273">LOW pH 5.5 BALANCED</text>
  </g>
</svg>
`;

// SVG 8: Cleanser Texture
const cleanserTexture = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="100%" height="100%">
  <rect width="800" height="1000" fill="#E8EFE8" />
  <circle cx="400" cy="500" r="180" fill="#F3FAF2" opacity="0.9" />
  <text x="400" y="780" font-family="'Cormorant Garamond', serif" font-size="24" font-style="italic" text-anchor="middle" fill="#485246">Non-Stripping Amino Foam Transformation</text>
</svg>
`;

// SVG 9: Set Duo Hero
const setDuoHero = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="100%" height="100%">
  <rect width="800" height="1000" fill="#EFE8DD" />
  <rect x="180" y="320" width="440" height="460" rx="24" fill="#FBF8F3" stroke="#D8CCB9" stroke-width="2" />
  <text x="400" y="440" font-family="'Cormorant Garamond', serif" font-size="32" letter-spacing="0.18em" text-anchor="middle" fill="#1A1918">VELYRA</text>
  <text x="400" y="490" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="600" letter-spacing="0.16em" text-anchor="middle" fill="#C9944D">THE DAILY DEFENSE DUO</text>
  <text x="400" y="530" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" letter-spacing="0.12em" text-anchor="middle" fill="#6A6255">Silk Sunscreen (50ml) + Amino Cleanser (120ml)</text>
</svg>
`;

// Textures
const fluidSwatch = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <rect width="600" height="600" fill="#FAF7F2" />
  <path d="M120,300 C200,180 400,220 480,300 C420,440 220,420 120,300 Z" fill="#F1E7D5" />
</svg>
`;

const files = [
  { p: path.join(publicProductsDir, 'sunscreen-hero.webp'), c: sunscreenHero },
  { p: path.join(publicProductsDir, 'sunscreen-hero.svg'), c: sunscreenHero },
  { p: path.join(publicProductsDir, 'sunscreen-texture.webp'), c: sunscreenTexture },
  { p: path.join(publicProductsDir, 'sunscreen-texture.svg'), c: sunscreenTexture },
  { p: path.join(publicProductsDir, 'sunscreen-lifestyle.webp'), c: sunscreenLifestyle },
  { p: path.join(publicProductsDir, 'sunscreen-lifestyle.svg'), c: sunscreenLifestyle },
  { p: path.join(publicProductsDir, 'sunscreen-box.webp'), c: sunscreenBox },
  { p: path.join(publicProductsDir, 'sunscreen-box.svg'), c: sunscreenBox },
  { p: path.join(publicProductsDir, 'moisturizer-hero.webp'), c: moisturizerHero },
  { p: path.join(publicProductsDir, 'moisturizer-hero.svg'), c: moisturizerHero },
  { p: path.join(publicProductsDir, 'moisturizer-texture.webp'), c: moisturizerTexture },
  { p: path.join(publicProductsDir, 'cleanser-hero.webp'), c: cleanserHero },
  { p: path.join(publicProductsDir, 'cleanser-hero.svg'), c: cleanserHero },
  { p: path.join(publicProductsDir, 'cleanser-texture.webp'), c: cleanserTexture },
  { p: path.join(publicProductsDir, 'set-duo-hero.webp'), c: setDuoHero },
  { p: path.join(publicProductsDir, 'set-duo-hero.svg'), c: setDuoHero },
  { p: path.join(publicTexturesDir, 'fluid-swatch.webp'), c: fluidSwatch },
  { p: path.join(publicTexturesDir, 'fluid-swatch.svg'), c: fluidSwatch }
];

for (const f of files) {
  fs.writeFileSync(f.p, f.c.trim(), 'utf8');
}
console.log('Successfully created all high-end SVG & image assets in /public');
