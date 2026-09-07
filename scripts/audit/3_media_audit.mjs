import fs from 'fs';
import path from 'path';

function auditStaticAssets() {
  console.log('====================================================');
  console.log('STATIC ASSETS & MEDIA AUDIT');
  console.log('====================================================\n');

  const publicDir = path.join(process.cwd(), 'public');
  const files = [];

  function scan(dir) {
    const list = fs.readdirSync(dir);
    for (const item of list) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scan(fullPath);
      } else {
        files.push({
          relPath: path.relative(publicDir, fullPath).replace(/\\/g, '/'),
          sizeKB: Math.round(stat.size / 1024),
        });
      }
    }
  }

  scan(publicDir);

  console.log(`Scanned ${files.length} static assets in /public:`);
  let largeCount = 0;
  for (const f of files) {
    const isLarge = f.sizeKB > 500;
    if (isLarge) largeCount++;
    console.log(`${isLarge ? '⚠️ LARGE' : '✅ OK'} ${f.relPath.padEnd(45)} ${f.sizeKB} KB`);
  }

  console.log(`\nTotal assets: ${files.length}, Over 500KB: ${largeCount}`);
}

auditStaticAssets();
