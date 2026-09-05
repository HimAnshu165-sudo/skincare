const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- VELYRA Media & Vercel Blob Sync Engine ---');

  const artifactDir = path.join('C:', 'Users', 'amitc', '.gemini', 'antigravity-ide', 'brain', '6e1d5003-eacd-4f8a-af25-90c23c6e0b49');
  const publicDir = path.join(__dirname, '..', 'public');

  // Product subdirectories
  const sunscreenDir = path.join(publicDir, 'products', 'silk-air-fluid-sunscreen-spf50');
  const moisturizerDir = path.join(publicDir, 'products', 'ceramide-barrier-cushion-cream');
  const cleanserDir = path.join(publicDir, 'products', 'amino-jelly-balancing-cleanser');

  [sunscreenDir, moisturizerDir, cleanserDir].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  // Find generated images in artifactDir
  let files = [];
  try {
    files = fs.readdirSync(artifactDir);
  } catch (e) {
    console.log('Artifact dir scan:', e.message);
  }

  const findLatest = (prefix) => {
    const matched = files.filter(f => f.startsWith(prefix) && (f.endsWith('.jpg') || f.endsWith('.png')));
    if (matched.length > 0) {
      return path.join(artifactDir, matched[matched.length - 1]);
    }
    return null;
  };

  const sunHero = findLatest('sunscreen_hero_concept');
  const sunTexture = findLatest('sunscreen_texture_concept');
  const sunLifestyle = findLatest('sunscreen_lifestyle_concept');
  const sunBox = findLatest('sunscreen_box_packaging');
  const creamHero = findLatest('moisturizer_concept');
  const cleanHero = findLatest('cleanser_concept');
  const duoHero = findLatest('ritual_duo_concept');

  const setsDir = path.join(publicDir, 'products', 'sets');
  if (!fs.existsSync(setsDir)) fs.mkdirSync(setsDir, { recursive: true });

  // Copy to public directory
  if (sunHero) fs.copyFileSync(sunHero, path.join(sunscreenDir, 'main.jpg'));
  if (sunTexture) fs.copyFileSync(sunTexture, path.join(sunscreenDir, 'texture.jpg'));
  if (sunLifestyle) fs.copyFileSync(sunLifestyle, path.join(sunscreenDir, 'lifestyle.jpg'));
  if (sunBox) fs.copyFileSync(sunBox, path.join(sunscreenDir, 'packaging.jpg'));
  if (creamHero) fs.copyFileSync(creamHero, path.join(moisturizerDir, 'main.jpg'));
  if (cleanHero) fs.copyFileSync(cleanHero, path.join(cleanserDir, 'main.jpg'));
  if (duoHero) {
    fs.copyFileSync(duoHero, path.join(setsDir, 'duo.jpg'));
    fs.copyFileSync(duoHero, path.join(publicDir, 'products', 'set-duo-hero.jpg'));
  }

  console.log('Concept images synced to local storage.');

  // Fetch products from DB
  const products = await prisma.product.findMany();
  const sunProd = products.find(p => p.slug === 'silk-air-fluid-sunscreen-spf50');
  const creamProd = products.find(p => p.slug === 'ceramide-barrier-cushion-cream');
  const cleanProd = products.find(p => p.slug === 'amino-jelly-balancing-cleanser');
  const duoProd = products.find(p => p.slug === 'the-barrier-protection-duo');

  // Update default Product.images array in Product table
  if (sunProd) {
    await prisma.product.update({
      where: { id: sunProd.id },
      data: {
        images: JSON.stringify([
          '/products/silk-air-fluid-sunscreen-spf50/main.jpg',
          '/products/silk-air-fluid-sunscreen-spf50/texture.jpg',
          '/products/silk-air-fluid-sunscreen-spf50/lifestyle.jpg',
          '/products/silk-air-fluid-sunscreen-spf50/packaging.jpg',
        ]),
      },
    });
  }

  if (creamProd) {
    await prisma.product.update({
      where: { id: creamProd.id },
      data: {
        images: JSON.stringify([
          '/products/ceramide-barrier-cushion-cream/main.jpg',
          '/products/ceramide-barrier-cushion-cream/main.jpg',
        ]),
      },
    });
  }

  if (cleanProd) {
    await prisma.product.update({
      where: { id: cleanProd.id },
      data: {
        images: JSON.stringify([
          '/products/amino-jelly-balancing-cleanser/main.jpg',
          '/products/amino-jelly-balancing-cleanser/main.jpg',
        ]),
      },
    });
  }

  if (duoProd) {
    await prisma.product.update({
      where: { id: duoProd.id },
      data: {
        images: JSON.stringify([
          '/products/sets/duo.jpg',
          '/products/sets/duo.jpg',
        ]),
      },
    });
  }

  // Clear existing images to avoid duplicates
  await prisma.productImage.deleteMany();

  const imageEntries = [
    // Sunscreen Image Set
    {
      productId: sunProd ? sunProd.id : null,
      pathname: 'products/silk-air-fluid-sunscreen-spf50/main.jpg',
      url: '/products/silk-air-fluid-sunscreen-spf50/main.jpg',
      alt: 'VELYRA Silk-Air Fluid Sunscreen SPF 50+ Bottle Shot',
      sortOrder: 0,
      isPrimary: true,
      contentType: 'image/jpeg',
    },
    {
      productId: sunProd ? sunProd.id : null,
      pathname: 'products/silk-air-fluid-sunscreen-spf50/texture.jpg',
      url: '/products/silk-air-fluid-sunscreen-spf50/texture.jpg',
      alt: 'VELYRA Silk-Air Sunscreen Weightless Texture Swatch',
      sortOrder: 1,
      isPrimary: false,
      contentType: 'image/jpeg',
    },
    {
      productId: sunProd ? sunProd.id : null,
      pathname: 'products/silk-air-fluid-sunscreen-spf50/lifestyle.jpg',
      url: '/products/silk-air-fluid-sunscreen-spf50/lifestyle.jpg',
      alt: 'VELYRA Sunscreen Sunlight & Palm Shadow Lifestyle',
      sortOrder: 2,
      isPrimary: false,
      contentType: 'image/jpeg',
    },
    {
      productId: sunProd ? sunProd.id : null,
      pathname: 'products/silk-air-fluid-sunscreen-spf50/packaging.jpg',
      url: '/products/silk-air-fluid-sunscreen-spf50/packaging.jpg',
      alt: 'VELYRA Sunscreen Embossed Carton Packaging',
      sortOrder: 3,
      isPrimary: false,
      contentType: 'image/jpeg',
    },
    // Moisturizer Image Set
    {
      productId: creamProd ? creamProd.id : null,
      pathname: 'products/ceramide-barrier-cushion-cream/main.jpg',
      url: '/products/ceramide-barrier-cushion-cream/main.jpg',
      alt: 'VELYRA Ceramide Barrier Cushion Cream Jar',
      sortOrder: 0,
      isPrimary: true,
      contentType: 'image/jpeg',
    },
    // Cleanser Image Set
    {
      productId: cleanProd ? cleanProd.id : null,
      pathname: 'products/amino-jelly-balancing-cleanser/main.jpg',
      url: '/products/amino-jelly-balancing-cleanser/main.jpg',
      alt: 'VELYRA Amino Jelly Balancing Cleanser Bottle Shot',
      sortOrder: 0,
      isPrimary: true,
      contentType: 'image/jpeg',
    },
    // Duo Set Image Set
    {
      productId: duoProd ? duoProd.id : null,
      pathname: 'products/sets/duo.jpg',
      url: '/products/sets/duo.jpg',
      alt: 'VELYRA The Barrier Protection Duo Luxury Skincare Set',
      sortOrder: 0,
      isPrimary: true,
      contentType: 'image/jpeg',
    },
  ];

  // Try Vercel Blob live upload if BLOB_READ_WRITE_TOKEN is available
  const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN;
  let blobSdk = null;
  if (hasBlobToken) {
    try {
      blobSdk = require('@vercel/blob');
      console.log('Vercel Blob token detected. Uploading assets to store: velyra-media...');
    } catch (e) {
      console.log('Blob SDK require error:', e.message);
    }
  }

  for (const entry of imageEntries) {
    let finalUrl = entry.url;
    let finalSize = null;

    const localPath = path.join(publicDir, entry.pathname);
    if (fs.existsSync(localPath)) {
      const stats = fs.statSync(localPath);
      finalSize = stats.size;

      if (blobSdk) {
        try {
          const fileBuffer = fs.readFileSync(localPath);
          const blobRes = await blobSdk.put(entry.pathname, fileBuffer, {
            access: 'public',
            contentType: entry.contentType,
            addRandomSuffix: false,
          });
          finalUrl = blobRes.url;
          console.log(`Uploaded to Vercel Blob: ${entry.pathname} -> ${finalUrl}`);
        } catch (blobErr) {
          console.error(`Blob upload failed for ${entry.pathname}:`, blobErr.message);
        }
      }
    }

    await prisma.productImage.create({
      data: {
        productId: entry.productId,
        url: finalUrl,
        pathname: entry.pathname,
        alt: entry.alt,
        sortOrder: entry.sortOrder,
        isPrimary: entry.isPrimary,
        contentType: entry.contentType,
        size: finalSize,
      },
    });
  }

  // Update Product `images` json string for fast backward compatibility
  for (const prod of products) {
    const prodImages = await prisma.productImage.findMany({
      where: { productId: prod.id },
      orderBy: { sortOrder: 'asc' },
    });
    if (prodImages.length > 0) {
      await prisma.product.update({
        where: { id: prod.id },
        data: {
          images: JSON.stringify(prodImages.map(img => img.url)),
        },
      });
    }
  }

  console.log(`Successfully seeded ${imageEntries.length} ProductImage records into database!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
