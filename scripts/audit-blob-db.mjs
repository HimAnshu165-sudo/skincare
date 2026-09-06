import { PrismaClient } from '@prisma/client';
import { list } from '@vercel/blob';

const prisma = new PrismaClient();

async function checkMedia() {
  console.log('--- 1. ENVIRONMENT CHECK ---');
  const hasToken = !!process.env.BLOB_READ_WRITE_TOKEN;
  console.log('BLOB_READ_WRITE_TOKEN exists in process.env:', hasToken);
  if (hasToken) {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const parts = token.split('_');
    console.log('Token prefix:', parts[0]);
    console.log('Token length:', token.length);
  }

  console.log('\n--- 2. POSTGRESQL ProductImage RECORDS ---');
  const dbImages = await prisma.productImage.findMany({
    include: {
      product: { select: { id: true, name: true, slug: true } }
    }
  });
  console.log(`Found ${dbImages.length} ProductImage records in PostgreSQL:`);
  for (const img of dbImages) {
    console.log(`- ID: ${img.id}`);
    console.log(`  Pathname: ${img.pathname}`);
    console.log(`  URL: ${img.url}`);
    console.log(`  Product: ${img.product?.name || 'None'}`);
    console.log(`  isPrimary: ${img.isPrimary}`);
  }

  console.log('\n--- 3. ACTUAL VERCEL BLOB STORE (list()) ---');
  if (hasToken) {
    try {
      const blobList = await list();
      console.log(`Found ${blobList.blobs.length} actual objects in configured Vercel Blob store:`);
      for (const b of blobList.blobs) {
        console.log(`- Pathname: ${b.pathname} | URL: ${b.url} | Size: ${b.size} | Uploaded: ${b.uploadedAt}`);
      }
    } catch (err) {
      console.error('Error calling @vercel/blob list():', err.message);
    }
  } else {
    console.log('BLOB_READ_WRITE_TOKEN is not defined in environment, cannot call list().');
  }
}

checkMedia()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
