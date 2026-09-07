import { prisma } from '../src/lib/prisma';
import { createOrder } from '../src/lib/orders';

async function runTestSuite() {
  console.log('====================================================');
  console.log('🚀 RUNNING COMPREHENSIVE VELYRA INVENTORY TEST SUITE');
  console.log('====================================================\n');

  // Create temporary test products to prevent touching production catalog data
  const testProdA = await prisma.product.create({
    data: {
      name: 'Test Product Alpha',
      slug: `test-prod-alpha-${Date.now()}`,
      sku: `TEST-SKU-A-${Date.now()}`,
      tagline: 'Test Alpha',
      description: 'Test Alpha Description',
      price: 500,
      mrp: 600,
      stockQuantity: 10,
      inStock: true,
      volume: '50ml',
      category: 'Sunscreens',
      images: '["/products/sunscreen-hero.webp"]',
      benefits: '["Test benefit"]',
      keyIngredients: '[{"name": "Zinc", "benefit": "Protection"}]',
      fullIngredients: 'Zinc oxide, water',
      howToUse: 'Apply evenly',
    },
  });

  const testProdB = await prisma.product.create({
    data: {
      name: 'Test Product Beta',
      slug: `test-prod-beta-${Date.now()}`,
      sku: `TEST-SKU-B-${Date.now()}`,
      tagline: 'Test Beta',
      description: 'Test Beta Description',
      price: 800,
      mrp: 900,
      stockQuantity: 20,
      inStock: true,
      volume: '100ml',
      category: 'Moisturizers',
      images: '["/products/sunscreen-hero.webp"]',
      benefits: '["Test benefit B"]',
      keyIngredients: '[{"name": "Ceramide", "benefit": "Barrier"}]',
      fullIngredients: 'Ceramide NP, water',
      howToUse: 'Smooth over skin',
    },
  });

  console.log(`✅ Created test products:`);
  console.log(`   - Product A (ID: ${testProdA.id}): Initial Stock = ${testProdA.stockQuantity}`);
  console.log(`   - Product B (ID: ${testProdB.id}): Initial Stock = ${testProdB.stockQuantity}\n`);

  const createdOrderIds: string[] = [];

  try {
    // ----------------------------------------------------
    // TEST 1: Initial stock = 10, Order qty = 9 -> Remaining = 1
    // ----------------------------------------------------
    console.log('▶ TEST 1: Order quantity = 9 on stock = 10');
    const order1 = await createOrder({
      customerName: 'Customer One',
      customerEmail: 'cust1@test.com',
      customerPhone: '9876543210',
      shippingAddress: {
        fullName: 'Customer One',
        phone: '9876543210',
        addressLine1: 'Address 1',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
      },
      paymentMethod: 'COD',
      items: [{ productId: testProdA.id, quantity: 9 }],
    });
    createdOrderIds.push(order1.id);

    const prodA_AfterTest1 = await prisma.product.findUnique({ where: { id: testProdA.id } });
    console.log(`   OrderItem quantity: ${order1.items[0].quantity}`);
    console.log(`   Database stock: ${prodA_AfterTest1?.stockQuantity}`);
    console.log(`   Product inStock: ${prodA_AfterTest1?.inStock}`);

    if (order1.items[0].quantity === 9 && prodA_AfterTest1?.stockQuantity === 1 && prodA_AfterTest1?.inStock === true) {
      console.log('   ✅ TEST 1 PASSED: Stock decreased by EXACTLY 9 (10 -> 1)\n');
    } else {
      throw new Error(`TEST 1 FAILED! Expected stock 1, got ${prodA_AfterTest1?.stockQuantity}`);
    }

    // Reset Product A stock back to 10 for Test 2
    await prisma.product.update({ where: { id: testProdA.id }, data: { stockQuantity: 10, inStock: true } });

    // ----------------------------------------------------
    // TEST 2: Initial stock = 10, Order qty = 5 -> Remaining = 5
    // ----------------------------------------------------
    console.log('▶ TEST 2: Order quantity = 5 on stock = 10');
    const order2 = await createOrder({
      customerName: 'Customer Two',
      customerEmail: 'cust2@test.com',
      customerPhone: '9876543210',
      shippingAddress: {
        fullName: 'Customer Two',
        phone: '9876543210',
        addressLine1: 'Address 2',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
      },
      paymentMethod: 'COD',
      items: [{ productId: testProdA.id, quantity: 5 }],
    });
    createdOrderIds.push(order2.id);

    const prodA_AfterTest2 = await prisma.product.findUnique({ where: { id: testProdA.id } });
    console.log(`   OrderItem quantity: ${order2.items[0].quantity}`);
    console.log(`   Database stock: ${prodA_AfterTest2?.stockQuantity}`);

    if (order2.items[0].quantity === 5 && prodA_AfterTest2?.stockQuantity === 5) {
      console.log('   ✅ TEST 2 PASSED: Stock decreased by EXACTLY 5 (10 -> 5)\n');
    } else {
      throw new Error(`TEST 2 FAILED! Expected stock 5, got ${prodA_AfterTest2?.stockQuantity}`);
    }

    // Reset Product A stock back to 10 for Test 3
    await prisma.product.update({ where: { id: testProdA.id }, data: { stockQuantity: 10, inStock: true } });

    // ----------------------------------------------------
    // TEST 3: Initial stock = 10, Order qty = 1 -> Remaining = 9
    // ----------------------------------------------------
    console.log('▶ TEST 3: Order quantity = 1 on stock = 10');
    const order3 = await createOrder({
      customerName: 'Customer Three',
      customerEmail: 'cust3@test.com',
      customerPhone: '9876543210',
      shippingAddress: {
        fullName: 'Customer Three',
        phone: '9876543210',
        addressLine1: 'Address 3',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
      },
      paymentMethod: 'COD',
      items: [{ productId: testProdA.id, quantity: 1 }],
    });
    createdOrderIds.push(order3.id);

    const prodA_AfterTest3 = await prisma.product.findUnique({ where: { id: testProdA.id } });
    console.log(`   OrderItem quantity: ${order3.items[0].quantity}`);
    console.log(`   Database stock: ${prodA_AfterTest3?.stockQuantity}`);

    if (order3.items[0].quantity === 1 && prodA_AfterTest3?.stockQuantity === 9) {
      console.log('   ✅ TEST 3 PASSED: Stock decreased by EXACTLY 1 (10 -> 9)\n');
    } else {
      throw new Error(`TEST 3 FAILED! Expected stock 9, got ${prodA_AfterTest3?.stockQuantity}`);
    }

    // Reset Product A stock back to 10 for Test 4
    await prisma.product.update({ where: { id: testProdA.id }, data: { stockQuantity: 10, inStock: true } });

    // ----------------------------------------------------
    // TEST 4: Initial stock = 10, Order qty = 10 -> Stock = 0, inStock = false
    // ----------------------------------------------------
    console.log('▶ TEST 4: Order quantity = 10 on stock = 10 (Zero Stock Case)');
    const order4 = await createOrder({
      customerName: 'Customer Four',
      customerEmail: 'cust4@test.com',
      customerPhone: '9876543210',
      shippingAddress: {
        fullName: 'Customer Four',
        phone: '9876543210',
        addressLine1: 'Address 4',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
      },
      paymentMethod: 'COD',
      items: [{ productId: testProdA.id, quantity: 10 }],
    });
    createdOrderIds.push(order4.id);

    const prodA_AfterTest4 = await prisma.product.findUnique({ where: { id: testProdA.id } });
    console.log(`   Database stock: ${prodA_AfterTest4?.stockQuantity}`);
    console.log(`   Product inStock: ${prodA_AfterTest4?.inStock}`);

    if (prodA_AfterTest4?.stockQuantity === 0 && prodA_AfterTest4?.inStock === false) {
      console.log('   ✅ TEST 4 PASSED: Stock became 0 and inStock became false (OUT OF STOCK)\n');
    } else {
      throw new Error(`TEST 4 FAILED! Expected stock 0 and inStock false, got stock=${prodA_AfterTest4?.stockQuantity}, inStock=${prodA_AfterTest4?.inStock}`);
    }

    // ----------------------------------------------------
    // TEST 5: Stock = 0, Direct Order Attempt -> Rejected
    // ----------------------------------------------------
    console.log('▶ TEST 5: Direct Order attempt on stock = 0');
    let test5Rejected = false;
    try {
      await createOrder({
        customerName: 'Customer Five',
        customerEmail: 'cust5@test.com',
        customerPhone: '9876543210',
        shippingAddress: {
          fullName: 'Customer Five',
          phone: '9876543210',
          addressLine1: 'Address 5',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560001',
        },
        paymentMethod: 'COD',
        items: [{ productId: testProdA.id, quantity: 1 }],
      });
    } catch (err: any) {
      test5Rejected = true;
      console.log(`   Expected Rejection: "${err.message}"`);
    }

    const prodA_AfterTest5 = await prisma.product.findUnique({ where: { id: testProdA.id } });
    if (test5Rejected && prodA_AfterTest5?.stockQuantity === 0) {
      console.log('   ✅ TEST 5 PASSED: Out-of-stock order strictly rejected, stock remains 0\n');
    } else {
      throw new Error('TEST 5 FAILED! Order should have been rejected.');
    }

    // ----------------------------------------------------
    // TEST 6: Multi-Step Sequential Exhaustion (Stock 10 -> User A buys 6 -> Stock 4 -> User B buys 4 -> Stock 0 -> User C rejected)
    // ----------------------------------------------------
    console.log('▶ TEST 6: Sequential multi-user stock consumption');
    await prisma.product.update({ where: { id: testProdA.id }, data: { stockQuantity: 10, inStock: true } });

    // User A orders 6
    const order6A = await createOrder({
      customerName: 'User A',
      customerEmail: 'userA@test.com',
      customerPhone: '9876543210',
      shippingAddress: {
        fullName: 'User A',
        phone: '9876543210',
        addressLine1: 'Address A',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
      },
      paymentMethod: 'COD',
      items: [{ productId: testProdA.id, quantity: 6 }],
    });
    createdOrderIds.push(order6A.id);
    const stockAfter6A = (await prisma.product.findUnique({ where: { id: testProdA.id } }))?.stockQuantity;
    console.log(`   User A ordered 6 -> Remaining stock: ${stockAfter6A}`);

    // User B orders 4
    const order6B = await createOrder({
      customerName: 'User B',
      customerEmail: 'userB@test.com',
      customerPhone: '9876543210',
      shippingAddress: {
        fullName: 'User B',
        phone: '9876543210',
        addressLine1: 'Address B',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
      },
      paymentMethod: 'COD',
      items: [{ productId: testProdA.id, quantity: 4 }],
    });
    createdOrderIds.push(order6B.id);
    const prodAfter6B = await prisma.product.findUnique({ where: { id: testProdA.id } });
    console.log(`   User B ordered 4 -> Remaining stock: ${prodAfter6B?.stockQuantity}, inStock: ${prodAfter6B?.inStock}`);

    // User C attempts to order 1
    let userCRejected = false;
    try {
      await createOrder({
        customerName: 'User C',
        customerEmail: 'userC@test.com',
        customerPhone: '9876543210',
        shippingAddress: {
          fullName: 'User C',
          phone: '9876543210',
          addressLine1: 'Address C',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560001',
        },
        paymentMethod: 'COD',
        items: [{ productId: testProdA.id, quantity: 1 }],
      });
    } catch (err: any) {
      userCRejected = true;
      console.log(`   User C rejected: "${err.message}"`);
    }

    if (stockAfter6A === 4 && prodAfter6B?.stockQuantity === 0 && prodAfter6B?.inStock === false && userCRejected) {
      console.log('   ✅ TEST 6 PASSED: Sequential exhaustion accurate and User C blocked.\n');
    } else {
      throw new Error('TEST 6 FAILED!');
    }

    // ----------------------------------------------------
    // TEST 7: Multi-Product Order (Product A qty 3, Product B qty 5)
    // ----------------------------------------------------
    console.log('▶ TEST 7: Multi-Product Order');
    await prisma.product.update({ where: { id: testProdA.id }, data: { stockQuantity: 10, inStock: true } });
    await prisma.product.update({ where: { id: testProdB.id }, data: { stockQuantity: 20, inStock: true } });

    const multiOrder = await createOrder({
      customerName: 'Multi Product Buyer',
      customerEmail: 'multi@test.com',
      customerPhone: '9876543210',
      shippingAddress: {
        fullName: 'Multi Product Buyer',
        phone: '9876543210',
        addressLine1: 'Multi Address',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
      },
      paymentMethod: 'COD',
      items: [
        { productId: testProdA.id, quantity: 3 },
        { productId: testProdB.id, quantity: 5 },
      ],
    });
    createdOrderIds.push(multiOrder.id);

    const prodA_Multi = await prisma.product.findUnique({ where: { id: testProdA.id } });
    const prodB_Multi = await prisma.product.findUnique({ where: { id: testProdB.id } });

    console.log(`   Product A (Initial 10, Ordered 3) -> Remaining: ${prodA_Multi?.stockQuantity}`);
    console.log(`   Product B (Initial 20, Ordered 5) -> Remaining: ${prodB_Multi?.stockQuantity}`);

    if (prodA_Multi?.stockQuantity === 7 && prodB_Multi?.stockQuantity === 15) {
      console.log('   ✅ TEST 7 PASSED: Multi-product quantities independently and accurately decremented.\n');
    } else {
      throw new Error('TEST 7 FAILED!');
    }

    // ----------------------------------------------------
    // TEST 8: Concurrency & Oversell Protection
    // ----------------------------------------------------
    console.log('▶ TEST 8: Concurrency & Oversell Protection (Stock = 10, User 1 requests 7, User 2 requests 5 concurrently)');
    await prisma.product.update({ where: { id: testProdA.id }, data: { stockQuantity: 10, inStock: true } });

    const [res1, res2] = await Promise.allSettled([
      createOrder({
        customerName: 'Concurrent User 1',
        customerEmail: 'concurrent1@test.com',
        customerPhone: '9876543210',
        shippingAddress: {
          fullName: 'Concurrent User 1',
          phone: '9876543210',
          addressLine1: 'Addr 1',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560001',
        },
        paymentMethod: 'COD',
        items: [{ productId: testProdA.id, quantity: 7 }],
      }),
      createOrder({
        customerName: 'Concurrent User 2',
        customerEmail: 'concurrent2@test.com',
        customerPhone: '9876543210',
        shippingAddress: {
          fullName: 'Concurrent User 2',
          phone: '9876543210',
          addressLine1: 'Addr 2',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560001',
        },
        paymentMethod: 'COD',
        items: [{ productId: testProdA.id, quantity: 5 }],
      }),
    ]);

    if (res1.status === 'fulfilled') createdOrderIds.push(res1.value.id);
    if (res2.status === 'fulfilled') createdOrderIds.push(res2.value.id);

    const successCount = [res1, res2].filter((r) => r.status === 'fulfilled').length;
    const failedCount = [res1, res2].filter((r) => r.status === 'rejected').length;
    const finalConcurrentStock = (await prisma.product.findUnique({ where: { id: testProdA.id } }))?.stockQuantity;

    console.log(`   Successful orders: ${successCount}`);
    console.log(`   Rejected orders: ${failedCount}`);
    console.log(`   Final Database Stock: ${finalConcurrentStock}`);

    if (successCount === 1 && failedCount === 1 && (finalConcurrentStock ?? 0) >= 0) {
      console.log('   ✅ TEST 8 PASSED: Concurrency safety verified — exactly 1 order succeeded, no overselling.\n');
    } else {
      throw new Error(`TEST 8 FAILED! successCount=${successCount}, finalStock=${finalConcurrentStock}`);
    }

  } finally {
    // Clean up temporary test data
    console.log('🧹 Cleaning up test artifacts...');
    if (createdOrderIds.length > 0) {
      await prisma.orderStatusHistory.deleteMany({ where: { orderId: { in: createdOrderIds } } });
      await prisma.payment.deleteMany({ where: { orderId: { in: createdOrderIds } } });
      await prisma.orderItem.deleteMany({ where: { orderId: { in: createdOrderIds } } });
      await prisma.order.deleteMany({ where: { id: { in: createdOrderIds } } });
    }
    await prisma.product.deleteMany({ where: { id: { in: [testProdA.id, testProdB.id] } } });
    console.log('✅ Temporary test products and orders cleaned up successfully.\n');
  }

  console.log('====================================================');
  console.log('🎉 ALL 8 INVENTORY INTEGRITY TESTS PASSED 100%');
  console.log('====================================================');
}

runTestSuite()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error('❌ Test suite failed:', err);
    prisma.$disconnect();
    process.exit(1);
  });
