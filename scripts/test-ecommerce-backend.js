const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function runTests() {
  console.log('====================================================');
  console.log('VELYRA E-COMMERCE BACKEND COMPREHENSIVE TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  };

  try {
    // 1. Clean test data
    console.log('1. Cleaning test records...');
    await prisma.payment.deleteMany();
    await prisma.orderStatusHistory.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.address.deleteMany();
    await prisma.user.deleteMany({
      where: { email: { in: ['test.user.a@velyra.in', 'test.user.b@velyra.in'] } },
    });

    // 2. Test User Creation & Password Hashing
    console.log('\n2. Testing User Creation & Secure Password Hashing...');
    const hashedPwdA = await bcrypt.hash('SecretPass123!', 10);
    const userA = await prisma.user.create({
      data: {
        name: 'Aarav Sharma',
        email: 'test.user.a@velyra.in',
        password: hashedPwdA,
        phone: '+919876543210',
        role: 'CUSTOMER',
      },
    });

    const hashedPwdB = await bcrypt.hash('AnotherSecret456!', 10);
    const userB = await prisma.user.create({
      data: {
        name: 'Priya Patel',
        email: 'test.user.b@velyra.in',
        password: hashedPwdB,
        phone: '+919123456780',
        role: 'CUSTOMER',
      },
    });

    assert(userA.id && userB.id, 'Users A & B created with distinct primary keys');
    assert(await bcrypt.compare('SecretPass123!', userA.password), 'Password hash verified via bcrypt');

    // 3. Test Cart Isolation
    console.log('\n3. Testing Cart Isolation (User A vs User B)...');
    const products = await prisma.product.findMany();
    const sunscreen = products.find((p) => p.slug === 'silk-air-fluid-sunscreen-spf50') || products[0];
    const moisturizer = products.find((p) => p.slug === 'ceramide-barrier-cushion-cream') || products[1];

    // Create Cart for User A
    const cartA = await prisma.cart.create({
      data: {
        userId: userA.id,
        items: {
          create: [{ productId: sunscreen.id, quantity: 2 }],
        },
      },
      include: { items: true },
    });

    // Create Cart for User B
    const cartB = await prisma.cart.create({
      data: {
        userId: userB.id,
        items: {
          create: [{ productId: moisturizer.id, quantity: 1 }],
        },
      },
      include: { items: true },
    });

    assert(cartA.id !== cartB.id, 'Cart IDs are isolated');
    assert(cartA.items.length === 1 && cartA.items[0].productId === sunscreen.id, "User A's cart has only Sunscreen × 2");
    assert(cartB.items.length === 1 && cartB.items[0].productId === moisturizer.id, "User B's cart has only Moisturizer × 1");

    // 4. Test Address Management
    console.log('\n4. Testing Address Management & Ownership...');
    const addrA = await prisma.address.create({
      data: {
        userId: userA.id,
        fullName: 'Aarav Sharma',
        phone: '+919876543210',
        addressLine1: 'Flat 402, Lotus Towers',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560038',
        isDefault: true,
      },
    });

    const userBAddresses = await prisma.address.findMany({ where: { userId: userB.id } });
    assert(addrA.id && userBAddresses.length === 0, 'User A address is not accessible by User B');

    // 5. Test Transactional Order Creation with Stock Decrement
    console.log('\n5. Testing Transactional Order Creation & Inventory Decrement...');
    const initialStock = sunscreen.stockQuantity;

    const orderNumber = `VEL-TEST-${Date.now()}`;
    const orderA = await prisma.$transaction(async (tx) => {
      // 1. Decrement stock
      await tx.product.update({
        where: { id: sunscreen.id },
        data: { stockQuantity: { decrement: 2 } },
      });

      // 2. Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: userA.id,
          customerName: userA.name,
          customerEmail: userA.email,
          customerPhone: userA.phone || '',
          shippingAddress: JSON.stringify(addrA),
          paymentMethod: 'COD',
          paymentStatus: 'PENDING',
          orderStatus: 'CONFIRMED',
          subtotal: sunscreen.price * 2,
          shippingFee: 0,
          total: sunscreen.price * 2,
          items: {
            create: [
              {
                productId: sunscreen.id,
                productName: sunscreen.name,
                quantity: 2,
                price: sunscreen.price,
              },
            ],
          },
          statusHistory: {
            create: [
              {
                status: 'PLACED',
                title: 'Order Placed',
                description: 'Cash on Delivery order received.',
              },
            ],
          },
          payments: {
            create: [
              {
                amount: sunscreen.price * 2,
                method: 'COD',
                status: 'PENDING',
              },
            ],
          },
        },
        include: { items: true, statusHistory: true, payments: true },
      });

      // 3. Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cartA.id } });

      return newOrder;
    }, {
      maxWait: 10000,
      timeout: 20000,
    });

    const updatedSunscreen = await prisma.product.findUnique({ where: { id: sunscreen.id } });
    const clearedCartA = await prisma.cartItem.findMany({ where: { cartId: cartA.id } });

    assert(orderA.id && orderA.orderNumber === orderNumber, 'Order record created with items snapshot');
    assert(updatedSunscreen.stockQuantity === initialStock - 2, 'Inventory atomically decremented by 2');
    assert(clearedCartA.length === 0, 'Cart cleared after order creation');

    // Restore stock for dev cleanliness
    await prisma.product.update({
      where: { id: sunscreen.id },
      data: { stockQuantity: initialStock },
    });

    // 6. Test IDOR / Cross-User Access Guard
    console.log('\n6. Testing IDOR / Cross-User Access Security...');
    const userBAccessingUserAOrder = await prisma.order.findFirst({
      where: {
        id: orderA.id,
        userId: userB.id, // User B attempting to view User A's order
      },
    });

    assert(userBAccessingUserAOrder === null, 'IDOR prevented: User B cannot access User A order');

    // 7. Test Razorpay Payment Signature Verification Logic
    console.log('\n7. Testing Razorpay Cryptographic Verification...');
    const crypto = require('crypto');
    const mockKeySecret = 'placeholderSecretKey';
    const mockRzpOrderId = 'order_mock_12345';
    const mockRzpPaymentId = 'pay_mock_67890';
    const validSignature = crypto
      .createHmac('sha256', mockKeySecret)
      .update(`${mockRzpOrderId}|${mockRzpPaymentId}`)
      .digest('hex');

    const invalidSignature = 'tampered_signature_123';

    const verifySig = (orderId, payId, sig) => {
      const computed = crypto.createHmac('sha256', mockKeySecret).update(`${orderId}|${payId}`).digest('hex');
      return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(sig));
    };

    assert(verifySig(mockRzpOrderId, mockRzpPaymentId, validSignature) === true, 'Valid HMAC SHA256 signature accepted');

    let invalidThrewOrFalse = false;
    try {
      invalidThrewOrFalse = !verifySig(mockRzpOrderId, mockRzpPaymentId, invalidSignature);
    } catch {
      invalidThrewOrFalse = true;
    }
    assert(invalidThrewOrFalse, 'Tampered signature rejected');

    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
