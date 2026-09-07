import { prisma } from '../../src/lib/prisma';
import { createOrder } from '../../src/lib/orders';

async function testOrderQty() {
  console.log('Testing createOrder with quantity = 9');
  const prodBefore = await prisma.product.findUnique({
    where: { id: 'prod_sunscreen_01' },
    select: { id: true, name: true, stockQuantity: true, inStock: true }
  });
  console.log('Product Before:', prodBefore);

  const initialStock = prodBefore!.stockQuantity;

  // Run in a transaction where we can inspect, or run createOrder and verify decrement
  const order = await createOrder({
    userId: null,
    customerName: 'Test User 9',
    customerEmail: 'test9@example.com',
    customerPhone: '9876543210',
    shippingAddress: {
      fullName: 'Test User 9',
      phone: '9876543210',
      addressLine1: 'Test Address 9',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560001',
      country: 'India',
    },
    paymentMethod: 'COD',
    items: [
      {
        productId: 'prod_sunscreen_01',
        quantity: 9,
      },
    ],
  });

  console.log('Created Order:', {
    orderNumber: order.orderNumber,
    total: order.total,
    items: order.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
  });

  const prodAfter = await prisma.product.findUnique({
    where: { id: 'prod_sunscreen_01' },
    select: { id: true, name: true, stockQuantity: true, inStock: true }
  });
  console.log('Product After:', prodAfter);
  console.log(`Decremented by: ${initialStock - prodAfter!.stockQuantity}`);

  // Restore the 9 units from this test to maintain inventory integrity
  await prisma.product.update({
    where: { id: 'prod_sunscreen_01' },
    data: { stockQuantity: initialStock },
  });
  // Also clean up this single test order
  await prisma.orderStatusHistory.deleteMany({ where: { orderId: order.id } });
  await prisma.payment.deleteMany({ where: { orderId: order.id } });
  await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
  await prisma.order.delete({ where: { id: order.id } });

  console.log('Cleaned up test order and restored product stock to initial:', initialStock);
}

testOrderQty()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('Test error:', e);
    prisma.$disconnect();
    process.exit(1);
  });
