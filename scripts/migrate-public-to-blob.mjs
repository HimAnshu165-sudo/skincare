import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { put, list } from '@vercel/blob';

const prisma = new PrismaClient();

async function migratePublicToVercelBlob() {
  console.log('====================================================');
  console.log('VELYRA /public to Vercel Blob Migration Utility');
  console.log('====================================================\n');

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.error('❌ ERROR: BLOB_READ_WRITE_TOKEN is not defined in environment.');
    console.error('Please add your Vercel Blob token to .env before running migration:');
    console.error('BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."\n');
    process.exit(1);
  }

  console.log('✅ BLOB_READ_WRITE_TOKEN detected.');

  // Find all ProductImage records currently using local paths
  const dbImages = await prisma.productImage.findMany({
    include: {
      product: true,
    },
  });

  console.log(`Found ${dbImages.length} ProductImage records in database.\n`);

  let migratedCount = 0;
  let skippedCount = 0;

  for (const img of dbImages) {
    if (img.url.startsWith('https://') && img.url.includes('blob.vercel-storage.com')) {
      console.log(`⏩ Skipping ${img.pathname} (Already on Vercel Blob CDN: ${img.url})`);
      skippedCount++;
      continue;
    }

    // Resolve local file path
    const localRelPath = img.url.replace(/^\/+/, '');
    const localAbsPath = path.join(process.cwd(), 'public', localRelPath);

    if (!fs.existsSync(localAbsPath)) {
      console.warn(`⚠️ Warning: Local file not found at ${localAbsPath}`);
      continue;
    }

    console.log(`📤 Uploading ${img.pathname} to Vercel Blob...`);
    const fileBuffer = fs.readFileSync(localAbsPath);
    const mimeType = img.pathname.endsWith('.png')
      ? 'image/png'
      : img.pathname.endsWith('.webp')
      ? 'image/webp'
      : 'image/jpeg';

    try {
      const blob = await put(img.pathname, fileBuffer, {
        access: 'public',
        contentType: mimeType,
        addRandomSuffix: false,
      });

      console.log(`  ✅ Uploaded: ${blob.url}`);

      // Update ProductImage in PostgreSQL
      await prisma.productImage.update({
        where: { id: img.id },
        data: {
          url: blob.url,
          size: fileBuffer.length,
          contentType: mimeType,
        },
      });

      // Update Product.images legacy array if applicable
      if (img.productId && img.product) {
        let currentImgs = [];
        try {
          currentImgs = typeof img.product.images === 'string' ? JSON.parse(img.product.images) : img.product.images;
        } catch {
          currentImgs = [];
        }

        const updatedImgs = currentImgs.map((u) => (u === img.url ? blob.url : u));
        if (!updatedImgs.includes(blob.url)) {
          updatedImgs.push(blob.url);
        }

        await prisma.product.update({
          where: { id: img.productId },
          data: {
            images: JSON.stringify(updatedImgs),
          },
        });
      }

      migratedCount++;
    } catch (err) {
      console.error(`  ❌ Failed to upload ${img.pathname}:`, err.message);
    }
  }

  console.log('\n====================================================');
  console.log(`MIGRATION COMPLETE: ${migratedCount} Uploaded | ${skippedCount} Skipped`);
  console.log('====================================================\n');

  // Verify blobs in Vercel Blob store
  try {
    const listResult = await list();
    console.log(`Active Blobs in store (${listResult.blobs.length} total):`);
    listResult.blobs.forEach((b) => {
      console.log(`- ${b.pathname} (${(b.size / 1024).toFixed(1)} KB) -> ${b.url}`);
    });
  } catch (err) {
    console.error('Could not list blobs:', err.message);
  }
}

migratePublicToVercelBlob()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
