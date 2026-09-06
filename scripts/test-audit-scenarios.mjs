import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

function extractCookie(res, cookieName) {
  const headers = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get('set-cookie')].filter(Boolean);
  for (const h of headers) {
    if (!h) continue;
    const parts = h.split(';');
    for (const p of parts) {
      const trimmed = p.trim();
      if (trimmed.startsWith(`${cookieName}=`)) {
        return trimmed;
      }
    }
  }
  return null;
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 RUNNING COMPREHENSIVE BACKEND & CART AUDIT TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // Find purchasable product (inStock and not isUpcoming)
  const product = await prisma.product.findFirst({
    where: { inStock: true, isUpcoming: false, stockQuantity: { gt: 10 } },
  });

  if (!product) {
    console.error('No purchasable products found in DB for testing.');
    process.exit(1);
  }

  console.log(`Using test product: "${product.name}" (ID: ${product.id}, Stock: ${product.stockQuantity}, Price: ₹${product.price})\n`);

  const timestamp = Date.now();

  try {
    // -------------------------------------------------------------
    // TEST G: Invalid signup data rejected by backend API
    // -------------------------------------------------------------
    console.log('▶ TEST G: Try invalid signup data -> backend must reject even if frontend validation bypassed');
    {
      const res = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '   ',
          email: 'invalid-email-format',
          password: '123',
        }),
      });
      const data = await res.json();
      assert(res.status === 400 && data.success === false, `Backend rejected invalid signup payload (Status: ${res.status})`);
    }

    // -------------------------------------------------------------
    // TEST H: Invalid login data rejected safely
    // -------------------------------------------------------------
    console.log('\n▶ TEST H: Try invalid login data -> backend must reject safely');
    {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `nonexistent_${timestamp}@example.com`,
          password: 'WrongPassword123!',
        }),
      });
      const data = await res.json();
      assert(res.status === 401 && data.success === false, `Backend rejected invalid credentials (Status: ${res.status})`);
    }

    // -------------------------------------------------------------
    // TEST I: Negative / zero / invalid cart quantity
    // -------------------------------------------------------------
    console.log('\n▶ TEST I: Try negative/zero/huge cart quantity -> API must validate/reject appropriately');
    {
      const resZero = await fetch(`${BASE_URL}/api/cart/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 0 }),
      });
      assert(resZero.status === 400, `Zero quantity rejected (Status: ${resZero.status})`);

      const resNegative = await fetch(`${BASE_URL}/api/cart/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: -5 }),
      });
      assert(resNegative.status === 400, `Negative quantity rejected (Status: ${resNegative.status})`);

      const resHuge = await fetch(`${BASE_URL}/api/cart/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 999999 }),
      });
      assert(resHuge.status === 400, `Huge quantity rejected (Status: ${resHuge.status})`);
    }

    // -------------------------------------------------------------
    // TEST A: Guest -> Add item -> Signup -> Cart should contain item
    // -------------------------------------------------------------
    console.log('\n▶ TEST A: Guest -> Add item -> Signup -> Cart should contain the item');
    const guestEmailA = `test_user_a_${timestamp}@example.com`;
    let guestCookieA = '';
    {
      // 1. Fetch guest cart to get guest cookie
      const cartGetRes = await fetch(`${BASE_URL}/api/cart`);
      guestCookieA = extractCookie(cartGetRes, 'velyra_guest_token') || '';

      // 2. Add product as guest
      const addRes = await fetch(`${BASE_URL}/api/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(guestCookieA ? { Cookie: guestCookieA } : {}),
        },
        body: JSON.stringify({ productId: product.id, quantity: 2 }),
      });
      const addData = await addRes.json();
      const updatedCookie = extractCookie(addRes, 'velyra_guest_token');
      if (updatedCookie) guestCookieA = updatedCookie;

      assert(addData.success && addData.cart?.itemCount >= 2, `Guest added 2 units to cart (Item count: ${addData.cart?.itemCount})`);

      // 3. User signs up with guest cookie
      const signupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(guestCookieA ? { Cookie: guestCookieA } : {}),
        },
        body: JSON.stringify({
          name: 'Test User A',
          email: guestEmailA,
          password: 'Password123!',
          phone: '+919876543210',
        }),
      });
      const signupData = await signupRes.json();
      const sessionCookieA = extractCookie(signupRes, 'velyra_session') || '';
      assert(signupRes.status === 201 && signupData.success, `Signup succeeded for ${guestEmailA}`);

      // 4. Fetch user's cart now that authenticated
      const userCartRes = await fetch(`${BASE_URL}/api/cart`, {
        headers: { Cookie: sessionCookieA },
      });
      const userCartData = await userCartRes.json();
      const userItem = userCartData.cart?.items?.find((i) => i.productId === product.id);
      assert(userItem && userItem.quantity === 2, `Guest cart merged into new user cart: contains ${userItem?.quantity} units of ${product.name}`);
    }

    // -------------------------------------------------------------
    // TEST B: Guest -> Add multiple items -> Signup -> All items remain
    // -------------------------------------------------------------
    console.log('\n▶ TEST B: Guest -> Add multiple items -> Signup -> All items should remain');
    {
      // Ensure we have a second purchasable product for testing
      let prod2 = await prisma.product.findFirst({
        where: { id: { not: product.id } },
      });
      if (prod2 && prod2.isUpcoming) {
        await prisma.product.update({ where: { id: prod2.id }, data: { isUpcoming: false, inStock: true } });
      }

      const guestEmailB = `test_user_b_${timestamp}@example.com`;

      // 1. Get guest session
      const cartInit = await fetch(`${BASE_URL}/api/cart`);
      let guestCookieB = extractCookie(cartInit, 'velyra_guest_token') || '';

      // Add product 1
      const add1 = await fetch(`${BASE_URL}/api/cart/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(guestCookieB ? { Cookie: guestCookieB } : {}) },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      guestCookieB = extractCookie(add1, 'velyra_guest_token') || guestCookieB;

      // Add product 2
      const add2 = await fetch(`${BASE_URL}/api/cart/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(guestCookieB ? { Cookie: guestCookieB } : {}) },
        body: JSON.stringify({ productId: prod2.id, quantity: 3 }),
      });
      guestCookieB = extractCookie(add2, 'velyra_guest_token') || guestCookieB;

      // Signup
      const signupB = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(guestCookieB ? { Cookie: guestCookieB } : {}) },
        body: JSON.stringify({
          name: 'Test User B',
          email: guestEmailB,
          password: 'Password123!',
        }),
      });
      const sessionCookieB = extractCookie(signupB, 'velyra_session') || '';

      // Verify cart
      const cartB = await fetch(`${BASE_URL}/api/cart`, {
        headers: { Cookie: sessionCookieB },
      });
      const cartBData = await cartB.json();
      assert(
        cartBData.cart?.items?.length >= 2 && cartBData.cart?.itemCount === 4,
        `All multiple guest items preserved after signup (Distinct items: ${cartBData.cart?.items?.length}, total units: ${cartBData.cart?.itemCount})`
      );
    }

    // -------------------------------------------------------------
    // TEST C: Guest -> Add item -> Existing user logs in -> Guest cart merged
    // -------------------------------------------------------------
    console.log('\n▶ TEST C: Guest -> Add item -> Existing user logs in -> Guest cart merges with existing user cart');
    {
      // 1. Existing user has cart with 1 unit of product
      const userC = await prisma.user.create({
        data: {
          name: 'Existing User C',
          email: `existing_user_c_${timestamp}@example.com`,
          password: await bcrypt.hash('Password123!', 10),
          role: 'CUSTOMER',
        },
      });

      const userCCart = await prisma.cart.create({
        data: { userId: userC.id },
      });
      await prisma.cartItem.create({
        data: { cartId: userCCart.id, productId: product.id, quantity: 1 },
      });

      // 2. Guest session adds 2 units of same product
      const guestInit = await fetch(`${BASE_URL}/api/cart`);
      let gCookie = extractCookie(guestInit, 'velyra_guest_token') || '';

      const addRes = await fetch(`${BASE_URL}/api/cart/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(gCookie ? { Cookie: gCookie } : {}) },
        body: JSON.stringify({ productId: product.id, quantity: 2 }),
      });
      gCookie = extractCookie(addRes, 'velyra_guest_token') || gCookie;

      // 3. Login as User C with guest cookie
      const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(gCookie ? { Cookie: gCookie } : {}) },
        body: JSON.stringify({
          email: userC.email,
          password: 'Password123!',
        }),
      });
      const loginCookie = extractCookie(loginRes, 'velyra_session') || '';

      // 4. Check merged cart (1 existing + 2 guest = 3 units)
      const mergedRes = await fetch(`${BASE_URL}/api/cart`, {
        headers: { Cookie: loginCookie },
      });
      const mergedData = await mergedRes.json();
      const mergedItem = mergedData.cart?.items?.find((i) => i.productId === product.id);
      assert(
        mergedItem?.quantity === 3,
        `Guest items merged cleanly with existing user cart (Expected: 3 units, Found: ${mergedItem?.quantity})`
      );
    }

    // -------------------------------------------------------------
    // TEST D: User A -> Add items -> Logout -> User B logs in -> User B cannot see User A's cart
    // -------------------------------------------------------------
    console.log('\n▶ TEST D: User A -> Logout -> User B logs in -> User B must NOT see User A\'s cart');
    {
      const userA = await prisma.user.create({
        data: {
          name: 'User A',
          email: `user_a_iso_${timestamp}@example.com`,
          password: await bcrypt.hash('Password123!', 10),
          role: 'CUSTOMER',
        },
      });
      const cartA = await prisma.cart.create({ data: { userId: userA.id } });
      await prisma.cartItem.create({ data: { cartId: cartA.id, productId: product.id, quantity: 5 } });

      const userB = await prisma.user.create({
        data: {
          name: 'User B',
          email: `user_b_iso_${timestamp}@example.com`,
          password: await bcrypt.hash('Password123!', 10),
          role: 'CUSTOMER',
        },
      });

      // Login as User B
      const loginB = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userB.email, password: 'Password123!' }),
      });
      const bSession = extractCookie(loginB, 'velyra_session') || '';

      const cartB = await fetch(`${BASE_URL}/api/cart`, {
        headers: { Cookie: bSession },
      });
      const cartBData = await cartB.json();
      assert(
        cartBData.cart?.items?.length === 0,
        `User B has empty cart and does NOT see User A's 5 items (Items in B: ${cartBData.cart?.items?.length})`
      );
    }

    // -------------------------------------------------------------
    // TEST E: User A -> Add items -> Logout -> Login again -> User A's cart restored
    // -------------------------------------------------------------
    console.log('\n▶ TEST E: User A -> Add items -> Logout -> Login again -> User A\'s cart restored');
    {
      const loginA = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: guestEmailA, password: 'Password123!' }),
      });
      const aSession = extractCookie(loginA, 'velyra_session') || '';

      // Logout
      await fetch(`${BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { Cookie: aSession },
      });

      // Login again
      const reloginA = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: guestEmailA, password: 'Password123!' }),
      });
      const newASession = extractCookie(reloginA, 'velyra_session') || '';

      const restoredCart = await fetch(`${BASE_URL}/api/cart`, {
        headers: { Cookie: newASession },
      });
      const restoredData = await restoredCart.json();
      assert(
        restoredData.cart?.items?.length > 0,
        `User A's cart successfully restored after relogin (Items: ${restoredData.cart?.items?.length})`
      );
    }

    // -------------------------------------------------------------
    // TEST F: Manipulate userId or access another user's addresses/orders
    // -------------------------------------------------------------
    console.log('\n▶ TEST F: Try manipulating userId or modifying another user\'s address -> must be rejected');
    {
      const userX = await prisma.user.create({
        data: {
          name: 'User X',
          email: `user_x_${timestamp}@example.com`,
          password: await bcrypt.hash('Password123!', 10),
          role: 'CUSTOMER',
        },
      });
      const addressX = await prisma.address.create({
        data: {
          userId: userX.id,
          fullName: 'User X',
          phone: '+919876543210',
          addressLine1: 'Secret St 101',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
        },
      });

      const userY = await prisma.user.create({
        data: {
          name: 'User Y',
          email: `user_y_${timestamp}@example.com`,
          password: await bcrypt.hash('Password123!', 10),
          role: 'CUSTOMER',
        },
      });

      const loginY = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userY.email, password: 'Password123!' }),
      });
      const ySession = extractCookie(loginY, 'velyra_session') || '';

      // User Y attempts to DELETE User X's address
      const deleteRes = await fetch(`${BASE_URL}/api/addresses/${addressX.id}`, {
        method: 'DELETE',
        headers: { Cookie: ySession },
      });
      assert(
        deleteRes.status === 404 || deleteRes.status === 401,
        `Cross-user address tampering rejected with 404/401 (Status: ${deleteRes.status})`
      );
    }

    // -------------------------------------------------------------
    // TEST J: Try modifying product price in frontend checkout payload
    // -------------------------------------------------------------
    console.log('\n▶ TEST J: Try modifying product price in frontend payload -> backend must ignore client price');
    {
      const res = await fetch(`${BASE_URL}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: 'Price Hack Tester',
          customerEmail: `hacker_${timestamp}@example.com`,
          customerPhone: '9876543210',
          shippingAddress: {
            addressLine1: '123 Fake Street',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560001',
          },
          paymentMethod: 'COD',
          items: [
            {
              productId: product.id,
              quantity: 1,
              price: 1, // Attempting to buy for ₹1
            },
          ],
        }),
      });

      const data = await res.json();
      assert(
        data.success && data.order?.subtotal === product.price,
        `Server enforced database price ₹${product.price} (ignored client price ₹1; order subtotal: ₹${data.order?.subtotal})`
      );
    }

  } finally {
    await prisma.$disconnect();
  }

  console.log('\n====================================================');
  console.log(`🏁 AUDIT TEST SUITE FINISHED: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Test execution error:', e);
  process.exit(1);
});
