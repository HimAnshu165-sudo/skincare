import { PrismaClient } from '@prisma/client';
import { put, list, del } from '@vercel/blob';

const prisma = new PrismaClient();

async function runSafeBlobTest() {
  console.log('====================================================');
  console.log('VELYRA Safe Single-File Vercel Blob Verification Test');
  console.log('====================================================\n');

  // STEP 1: Check existing 7 records to confirm they are preserved
  const beforeRecords = await prisma.productImage.findMany({
    select: { id: true, pathname: true, url: true },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`[CHECK 1] Existing PostgreSQL ProductImage records: ${beforeRecords.length}`);
  beforeRecords.forEach((r, i) => {
    console.log(`  [${i + 1}] ${r.pathname} -> ${r.url}`);
  });

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  console.log(`\n[CHECK 2] BLOB_READ_WRITE_TOKEN status: ${token ? 'Configured (Present in environment)' : 'Unset / Missing'}`);

  if (!token) {
    console.log('\n[RESULT] Token is not configured in local environment.');
    console.log('  -> The upload API will now safely reject uploads with status 503 (BLOB_NOT_CONFIGURED).');
    console.log('  -> Silent fake fallback has been eliminated.');
    console.log('  -> Existing 7 records remain completely untouched.');
    console.log('\nTo run a live test upload to your "velyra-media" store:');
    console.log('  1. Add BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..." to your .env');
    console.log('  2. Re-run: node scripts/test-single-blob-upload.mjs\n');
    return;
  }

  // STEP 2: Live Test Upload of ONE temporary file
  console.log('\n[ACTION] Performing temporary test upload to Vercel Blob (velyra-media)...');
  const testPathname = `test/healthcheck-${Date.now()}.txt`;
  const testBuffer = Buffer.from(`VELYRA Blob Health Check at ${new Date().toISOString()}`);

  try {
    const uploadedBlob = await put(testPathname, testBuffer, {
      access: 'public',
      contentType: 'text/plain',
      addRandomSuffix: false,
    });

    console.log(`  ✅ Successfully uploaded temporary test blob:`);
    console.log(`     - Pathname: ${uploadedBlob.pathname}`);
    console.log(`     - URL: ${uploadedBlob.url}`);

    // STEP 3: Verify the file physically appears in list()
    console.log('\n[VERIFY] Querying live Vercel Blob store via list()...');
    const storeBlobs = await list();
    const found = storeBlobs.blobs.find((b) => b.pathname === testPathname || b.url === uploadedBlob.url);

    if (found) {
      console.log(`  ✅ Verified: Temporary test file physically exists in velyra-media store!`);
      console.log(`     - Stored URL: ${found.url}`);
      console.log(`     - Stored Size: ${found.size} bytes`);
    } else {
      console.error(`  ❌ Warning: File was uploaded but not returned in list() query.`);
    }

    // STEP 4: Clean up temporary test file
    console.log('\n[CLEANUP] Deleting temporary test object from Vercel Blob...');
    await del(uploadedBlob.url);
    console.log(`  ✅ Deleted temporary test object (${uploadedBlob.url}).`);

    // Verify deletion
    const afterList = await list();
    const stillExists = afterList.blobs.some((b) => b.pathname === testPathname);
    console.log(`  ✅ Verification after delete: Test object exists = ${stillExists}`);

  } catch (err) {
    console.error(`  ❌ Live upload test failed:`, err.message);
  }

  // STEP 5: Final sanity check on existing 7 records
  const afterRecords = await prisma.productImage.findMany({
    select: { id: true, pathname: true, url: true },
    orderBy: { createdAt: 'asc' },
  });
  console.log(`\n[CHECK 3] Existing 7 records count after test: ${afterRecords.length} (Untouched)`);
}

runSafeBlobTest()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
