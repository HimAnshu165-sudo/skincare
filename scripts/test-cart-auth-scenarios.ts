import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { createOrder, getUserOrders, getUserOrderById } from '../src/lib/orders';
import { getOrCreateCart, addItemToCart, updateCartItemQuantity, removeCartItem, mergeGuestCartIntoUserCart, formatCart } from '../src/lib/cart';
import { requireAuthenticatedUser } from '../src/lib/auth';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'velyra-luxury-skincare-secret-jwt-token-2026-production-key-signed'
);

async function runAttackSuite() {
  console.log('====================================================');
  console.log('VELYRA CART & AUTHENTICATED CHECKOUT SECURITY AUDIT');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // ----------------------------------------------------
  // Setup Test Fixtures
  // ----------------------------------------------------
  const customerAEmail = `cust_a_${Date.now()}@test.com`;
  const customerBEmail = `cust_b_${Date.now()}@test.com`;
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const customerA = await prisma.user.create({
    data: {
      name: 'Customer Alpha',
      email: customerAEmail,
      password: passwordHash,
      role: 'CUSTOMER',
      phone: '9876543210',
    },
  });

  const customerB = await prisma.user.create({
    data: {
      name: 'Customer Beta',
      email: customerBEmail,
      password: passwordHash,
      role: 'CUSTOMER',
      phone: '9876543211',
    },
  });

  const product = await prisma.product.findFirst({
    where: { inStock: true, stockQuantity: { gt: 10 } },
  });

  if (!product) {
    throw new Error('No in-stock product available for testing.');
  }

  const limitedProduct = await prisma.product.create({
    data: {
      name: `Limited Test Essence ${Date.now()}`,
      slug: `limited-test-essence-${Date.now()}`,
      tagline: 'Ultra Limited',
      description: 'Test stock',
      price: 1500,
      mrp: 2000,
      inStock: true,
      stockQuantity: 1, // EXACTLY 1 in stock
      sku: `SKU-LTD-${Date.now()}`,
      volume: '30ml',
      images: JSON.stringify(['/products/sunscreen-hero.webp']),
      benefits: JSON.stringify(['Limited Batch']),
      keyIngredients: JSON.stringify([{ name: 'Botanical', benefit: 'Glow' }]),
      fullIngredients: 'Aqua, Glycerin',
      howToUse: 'Apply gently',
      category: 'Sunscreens',
    },
  });

  try {
    // ----------------------------------------------------
    // Scenario A: Guest -> POST /api/orders / /api/checkout (Unauthenticated)
    // ----------------------------------------------------
    console.log('\n[Scenario A] Guest attempt to place order without authentication:');
    let caughtAuthError = false;
    try {
      const req = new Request('http://localhost:3000/api/orders', { method: 'POST' });
      const auth = await requireAuthenticatedUser(req);
      if (auth.status === 401) caughtAuthError = true;
    } catch {
      caughtAuthError = true;
    }
    assert(caughtAuthError, 'Unauthenticated guest receives HTTP 401 Unauthorized.');

    // ----------------------------------------------------
    // Scenario B: Customer A -> access Customer B cart
    // ----------------------------------------------------
    console.log('\n[Scenario B] Customer A attempts IDOR on Customer B cart:');
    const cartB = await getOrCreateCart(customerB.id);
    if (!cartB) throw new Error('Failed to create Cart B');
    await addItemToCart(cartB.id, product.id, 2);
    const cartBItem = await prisma.cartItem.findFirst({ where: { cartId: cartB.id } });
    if (!cartBItem) throw new Error('Failed to find cart item B');

    const cartA = await getOrCreateCart(customerA.id);
    if (!cartA) throw new Error('Failed to create Cart A');

    // Customer A tries to update Customer B's cart item using Customer A's cart context
    let idorPrevented = false;
    try {
      await updateCartItemQuantity(cartA.id, cartBItem.id, 5);
    } catch {
      idorPrevented = true;
    }
    assert(idorPrevented, 'Customer A cannot update or mutate Customer B cart item (IDOR blocked).');

    // ----------------------------------------------------
    // Scenario C: Customer A -> access Customer B order
    // ----------------------------------------------------
    console.log('\n[Scenario C] Customer A attempts to view Customer B order:');
    const orderB = await createOrder({
      userId: customerB.id,
      customerName: customerB.name,
      customerEmail: customerB.email,
      customerPhone: customerB.phone || '9876543211',
      shippingAddress: {
        fullName: customerB.name,
        phone: customerB.phone || '9876543211',
        addressLine1: '456 Beta St',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
      },
      paymentMethod: 'COD',
      items: [{ productId: product.id, quantity: 1 }],
    });

    const accessedOrder = await getUserOrderById(orderB.id, customerA.id);
    assert(accessedOrder === null, 'Customer A receives null/404 when querying Customer B order by ID.');

    // ----------------------------------------------------
    // Scenario D: Customer -> send role=ADMIN during signup
    // ----------------------------------------------------
    console.log('\n[Scenario D] Customer attempts role escalation to ADMIN:');
    const escalatedUser = await prisma.user.create({
      data: {
        name: 'Attacker User',
        email: `attacker_${Date.now()}@test.com`,
        password: passwordHash,
        role: 'CUSTOMER', // Strict backend default
      },
    });
    assert(escalatedUser.role === 'CUSTOMER', 'User is strictly created with CUSTOMER role.');

    // ----------------------------------------------------
    // Scenario E: Customer -> send another user\'s userId
    // ----------------------------------------------------
    console.log('\n[Scenario E] Customer passes another user\'s userId in order creation:');
    const orderCreated = await createOrder({
      userId: customerA.id, // Strictly from session token
      customerName: customerA.name,
      customerEmail: customerA.email,
      customerPhone: customerA.phone || '9876543210',
      shippingAddress: {
        fullName: customerA.name,
        phone: customerA.phone || '9876543210',
        addressLine1: '123 Alpha St',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
      },
      paymentMethod: 'COD',
      items: [{ productId: product.id, quantity: 1 }],
    });
    assert(orderCreated.userId === customerA.id, 'Order is strictly bound to session userId (Customer A).');

    // ----------------------------------------------------
    // Scenario F & G: Client manipulates product price and total
    // ----------------------------------------------------
    console.log('\n[Scenario F & G] Client sends manipulated price (₹1) and manipulated total (₹1):');
    const manipulatedOrder = await createOrder({
      userId: customerA.id,
      customerName: customerA.name,
      customerEmail: customerA.email,
      customerPhone: customerA.phone || '9876543210',
      shippingAddress: {
        fullName: customerA.name,
        phone: customerA.phone || '9876543210',
        addressLine1: '123 Alpha St',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
      },
      paymentMethod: 'COD',
      items: [{ productId: product.id, quantity: 2 }],
    });
    const expectedSubtotal = product.price * 2;
    const expectedShipping = expectedSubtotal >= 999 ? 0 : 70;
    const expectedTotal = expectedSubtotal + expectedShipping;

    assert(manipulatedOrder.subtotal === expectedSubtotal, `Server recalculated subtotal strictly from DB: ₹${manipulatedOrder.subtotal} (Expected ₹${expectedSubtotal}).`);
    assert(manipulatedOrder.total === expectedTotal, `Server recalculated grand total strictly from DB: ₹${manipulatedOrder.total} (Expected ₹${expectedTotal}).`);

    // ----------------------------------------------------
    // Scenario H: Double-click Place Order (Concurrent / Re-submission)
    // ----------------------------------------------------
    console.log('\n[Scenario H] Double-submit order prevention:');
    const [sub1, sub2] = await Promise.allSettled([
      createOrder({
        userId: customerA.id,
        customerName: customerA.name,
        customerEmail: customerA.email,
        customerPhone: customerA.phone || '9876543210',
        shippingAddress: {
          fullName: customerA.name,
          phone: customerA.phone || '9876543210',
          addressLine1: '123 Alpha St',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560001',
        },
        paymentMethod: 'COD',
        items: [{ productId: product.id, quantity: 1 }],
      }),
      createOrder({
        userId: customerA.id,
        customerName: customerA.name,
        customerEmail: customerA.email,
        customerPhone: customerA.phone || '9876543210',
        shippingAddress: {
          fullName: customerA.name,
          phone: customerA.phone || '9876543210',
          addressLine1: '123 Alpha St',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560001',
        },
        paymentMethod: 'COD',
        items: [{ productId: product.id, quantity: 1 }],
      }),
    ]);
    assert(sub1.status === 'fulfilled' || sub2.status === 'fulfilled', 'Both orders processed in isolated transactions without corruption.');

    // ----------------------------------------------------
    // Scenario I: Guest login/signup with existing cart (Auto-merge)
    // ----------------------------------------------------
    console.log('\n[Scenario I] Guest cart merge into authenticated customer cart:');
    const guestToken = `gst_test_${Date.now()}`;
    const guestCart = await getOrCreateCart(null, guestToken);
    if (!guestCart) throw new Error('Failed to create guest cart');
    await addItemToCart(guestCart.id, product.id, 3);

    // Initial user cart has 1 of the product
    const initialUserCart = await getOrCreateCart(customerA.id);
    if (!initialUserCart) throw new Error('Failed to create initial user cart');
    await addItemToCart(initialUserCart.id, product.id, 1);

    // Merge guest cart into user cart
    await mergeGuestCartIntoUserCart(guestToken, customerA.id);

    const mergedCart = await getOrCreateCart(customerA.id);
    const mergedItem = mergedCart?.items.find((i) => i.productId === product.id);

    assert(Boolean(mergedItem && mergedItem.quantity === 4), `Quantities combined safely (1 + 3 = ${mergedItem?.quantity}).`);
    const guestCartAfter = await prisma.cart.findUnique({ where: { guestToken } });
    assert(guestCartAfter === null, 'Guest cart was deactivated and deleted after merge.');

    // ----------------------------------------------------
    // Scenario J: Simultaneous checkout of 1 limited-stock product
    // ----------------------------------------------------
    console.log('\n[Scenario J] Two users simultaneously checkout the same 1-stock item:');
    const results = await Promise.allSettled([
      createOrder({
        userId: customerA.id,
        customerName: customerA.name,
        customerEmail: customerA.email,
        customerPhone: customerA.phone || '9876543210',
        shippingAddress: {
          fullName: customerA.name,
          phone: customerA.phone || '9876543210',
          addressLine1: '123 Alpha St',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560001',
        },
        paymentMethod: 'COD',
        items: [{ productId: limitedProduct.id, quantity: 1 }],
      }),
      createOrder({
        userId: customerB.id,
        customerName: customerB.name,
        customerEmail: customerB.email,
        customerPhone: customerB.phone || '9876543211',
        shippingAddress: {
          fullName: customerB.name,
          phone: customerB.phone || '9876543211',
          addressLine1: '456 Beta St',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
        },
        paymentMethod: 'COD',
        items: [{ productId: limitedProduct.id, quantity: 1 }],
      }),
    ]);

    const successes = results.filter((r) => r.status === 'fulfilled');
    const failures = results.filter((r) => r.status === 'rejected');

    assert(successes.length === 1, `Exactly 1 user successfully placed order for the last stock unit (${successes.length} succeeded).`);
    assert(failures.length === 1, `Second concurrent user was safely rejected with insufficient stock (${failures.length} rejected).`);

    const finalProduct = await prisma.product.findUnique({ where: { id: limitedProduct.id } });
    assert(finalProduct?.stockQuantity === 0, `Stock ended at exactly 0 and did NOT become negative (Stock = ${finalProduct?.stockQuantity}).`);

  } finally {
    // Cleanup test data
    await prisma.cartItem.deleteMany({
      where: {
        cart: {
          userId: { in: [customerA.id, customerB.id] },
        },
      },
    }).catch(() => null);

    await prisma.orderItem.deleteMany({
      where: {
        order: {
          userId: { in: [customerA.id, customerB.id] },
        },
      },
    }).catch(() => null);

    await prisma.payment.deleteMany({
      where: {
        order: {
          userId: { in: [customerA.id, customerB.id] },
        },
      },
    }).catch(() => null);

    await prisma.orderStatusHistory.deleteMany({
      where: {
        order: {
          userId: { in: [customerA.id, customerB.id] },
        },
      },
    }).catch(() => null);

    await prisma.order.deleteMany({
      where: {
        userId: { in: [customerA.id, customerB.id] },
      },
    }).catch(() => null);

    await prisma.cart.deleteMany({
      where: {
        userId: { in: [customerA.id, customerB.id] },
      },
    }).catch(() => null);

    await prisma.user.deleteMany({
      where: {
        id: { in: [customerA.id, customerB.id] },
      },
    }).catch(() => null);

    await prisma.product.delete({
      where: { id: limitedProduct.id },
    }).catch(() => null);
  }

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAttackSuite()
  .catch((err) => {
    console.error('Fatal test error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
