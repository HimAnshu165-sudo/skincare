import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function runTrace() {
  console.log('--- STEP 1: VERIFY PRODUCT BEFORE TEST ---');
  const product = await prisma.product.findUnique({
    where: { id: 'prod_sunscreen_01' },
    select: { id: true, name: true, stockQuantity: true, inStock: true }
  });
  console.log('Current DB Stock:', product);

  console.log('\n--- STEP 2: SIMULATE DIRECT createOrder WITH QUANTITY = 9 ---');
  // We can import createOrder from src/lib/orders.ts
  const { createOrder } = await import('../../src/lib/orders.js').catch(async () => {
    // If TypeScript needs transpilation, we test the logic directly
    return { createOrder: null };
  });

  if (!createOrder) {
    console.log('TypeScript file needs ts-node or direct evaluation');
  }

  await prisma.$disconnect();
}

runTrace().catch(console.error);
