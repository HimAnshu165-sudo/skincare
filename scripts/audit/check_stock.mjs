import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      sku: true,
      slug: true,
      stockQuantity: true,
      inStock: true,
      isUpcoming: true,
      price: true,
    },
    orderBy: { createdAt: 'asc' },
  });
  console.log('=== PRODUCT INVENTORY IN POSTGRESQL ===');
  console.table(products);

  const orders = await prisma.order.findMany({
    include: {
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  console.log('\n=== RECENT ORDERS & ITEMS ===');
  for (const o of orders) {
    console.log(`Order #${o.orderNumber} | Status: ${o.orderStatus} | Total: ${o.total}`);
    for (const item of o.items) {
      console.log(`   - Product: ${item.productName} (${item.productId}) x Qty: ${item.quantity}`);
    }
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
