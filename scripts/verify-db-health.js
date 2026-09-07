const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStatus() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true } });
  const products = await prisma.product.findMany({ select: { id: true, name: true, price: true, inStock: true } });
  const orders = await prisma.order.findMany({ select: { orderNumber: true, total: true, orderStatus: true } });
  const coupons = await prisma.coupon.findMany({ select: { code: true, discountType: true, discountValue: true } });

  console.log('--- DATABASE HEALTH CHECK ---');
  console.log(`✅ Users (${users.length}):`, users);
  console.log(`✅ Products (${products.length}):`, products);
  console.log(`✅ Orders (${orders.length}):`, orders);
  console.log(`✅ Coupons (${coupons.length}):`, coupons);
}

checkStatus()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('Database query error:', e);
    prisma.$disconnect();
    process.exit(1);
  });
