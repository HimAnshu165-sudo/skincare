import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const BASE_URL = 'http://localhost:3000';
const prisma = new PrismaClient();

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failCount++;
  }
}

async function getAuthCookie(email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const cookieHeader = res.headers.get('set-cookie');
  return { status: res.status, cookie: cookieHeader, data: await res.json() };
}

async function runSecurityAudit() {
  console.log('====================================================');
  console.log('VELYRA COMPREHENSIVE PRODUCTION SECURITY AUDIT');
  console.log('Testing Scenarios A through R against Live Server & PostgreSQL');
  console.log('====================================================\n');

  // Setup Test Users in Database
  const adminPasswordHash = await bcrypt.hash('AdminPass@123', 10);
  const customerPasswordHash = await bcrypt.hash('CustomerPass@123', 10);
  const victimPasswordHash = await bcrypt.hash('VictimPass@123', 10);

  const adminEmail = `audit_admin_${Date.now()}@example.com`;
  const customerEmail = `audit_customer_${Date.now()}@example.com`;
  const victimEmail = `audit_victim_${Date.now()}@example.com`;

  const [adminUser, customerUser, victimUser] = await Promise.all([
    prisma.user.create({
      data: { name: 'Audit Admin', email: adminEmail, password: adminPasswordHash, role: 'ADMIN', phone: '9876543210' },
    }),
    prisma.user.create({
      data: { name: 'Audit Customer', email: customerEmail, password: customerPasswordHash, role: 'CUSTOMER', phone: '9876543211' },
    }),
    prisma.user.create({
      data: { name: 'Audit Victim', email: victimEmail, password: victimPasswordHash, role: 'CUSTOMER', phone: '9876543212' },
    }),
  ]);

  // Create Victim Address & Order for IDOR testing
  const victimAddress = await prisma.address.create({
    data: {
      userId: victimUser.id,
      fullName: 'Victim User',
      phone: '9876543212',
      addressLine1: 'Victim Street 123',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India',
    },
  });

  const testProduct = await prisma.product.findFirst();
  if (!testProduct) {
    throw new Error('No product found in database for testing.');
  }

  const victimOrder = await prisma.order.create({
    data: {
      orderNumber: `VEL-TEST-${Date.now().toString().slice(-5)}`,
      userId: victimUser.id,
      customerName: 'Victim User',
      customerEmail: victimEmail,
      customerPhone: '9876543212',
      shippingAddress: JSON.stringify({ addressLine1: 'Victim Street 123', city: 'Mumbai', postalCode: '400001' }),
      paymentMethod: 'ONLINE',
      paymentStatus: 'PENDING',
      orderStatus: 'PLACED',
      subtotal: testProduct.price,
      total: testProduct.price,
      items: {
        create: [
          {
            productId: testProduct.id,
            productName: testProduct.name,
            price: testProduct.price,
            quantity: 1,
          },
        ],
      },
    },
  });

  // Login and get session cookies
  const adminAuth = await getAuthCookie(adminEmail, 'AdminPass@123');
  const customerAuth = await getAuthCookie(customerEmail, 'CustomerPass@123');

  console.log('--- TEST 1: Unauthenticated Admin Access Guard (Scenario A) ---');
  {
    const res = await fetch(`${BASE_URL}/api/admin/orders`);
    assert(res.status === 401, 'Unauthenticated request to /api/admin/orders returns HTTP 401');
    const resDash = await fetch(`${BASE_URL}/api/admin/dashboard`);
    assert(resDash.status === 401, 'Unauthenticated request to /api/admin/dashboard returns HTTP 401');
  }

  console.log('\n--- TEST 2: Customer Role Forbidden from Admin APIs (Scenario B) ---');
  {
    const res = await fetch(`${BASE_URL}/api/admin/orders`, {
      headers: { cookie: customerAuth.cookie || '' },
    });
    assert(res.status === 403, 'Customer role accessing /api/admin/orders returns HTTP 403');
    const resCust = await fetch(`${BASE_URL}/api/admin/customers`, {
      headers: { cookie: customerAuth.cookie || '' },
    });
    assert(resCust.status === 403, 'Customer role accessing /api/admin/customers returns HTTP 403');
  }

  console.log('\n--- TEST 3: Role Escalation Prevention on Signup (Scenario C) ---');
  {
    const attackerEmail = `attacker_${Date.now()}@example.com`;
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Attacker User',
        email: attackerEmail,
        password: 'Password123!',
        phone: '9876543299',
        role: 'ADMIN', // Escalation attempt
      }),
    });
    assert(res.status === 201, 'Signup succeeds');
    const createdUserInDb = await prisma.user.findUnique({ where: { email: attackerEmail } });
    assert(createdUserInDb?.role === 'CUSTOMER', 'User created in PostgreSQL strictly has role: "CUSTOMER" (Escalation payload ignored)');
  }

  console.log('\n--- TEST 4: IDOR Protection on Addresses (Scenario D) ---');
  {
    const resPatch = await fetch(`${BASE_URL}/api/addresses/${victimAddress.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        cookie: customerAuth.cookie || '',
      },
      body: JSON.stringify({ fullName: 'Hacked Address Name' }),
    });
    assert(resPatch.status === 404, 'Customer cannot modify another user address (Returns 404/Isolated)');

    const resDel = await fetch(`${BASE_URL}/api/addresses/${victimAddress.id}`, {
      method: 'DELETE',
      headers: { cookie: customerAuth.cookie || '' },
    });
    assert(resDel.status === 404, 'Customer cannot delete another user address (Returns 404/Isolated)');
  }

  console.log('\n--- TEST 5: IDOR Protection on Customer Orders (Scenario E) ---');
  {
    const resOrder = await fetch(`${BASE_URL}/api/orders/${victimOrder.id}`, {
      headers: { cookie: customerAuth.cookie || '' },
    });
    assert(resOrder.status === 404, 'Customer cannot read another customer order via /api/orders/:id (Returns 404)');
  }

  console.log('\n--- TEST 6: Checkout Price & Total Manipulation Defense (Scenarios F, G, H) ---');
  {
    const fakePrice = 1.0;
    const fakeTotal = 1.0;
    const res = await fetch(`${BASE_URL}/api/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: customerAuth.cookie || '',
      },
      body: JSON.stringify({
        customerName: 'Audit Customer',
        customerEmail,
        customerPhone: '9876543211',
        shippingAddress: {
          addressLine1: 'Test St',
          city: 'Mumbai',
          postalCode: '400001',
          state: 'Maharashtra',
        },
        paymentMethod: 'ONLINE',
        paymentStatus: 'PAID', // Manipulated
        total: fakeTotal,      // Manipulated
        items: [{ productId: testProduct.id, quantity: 1, price: fakePrice }], // Manipulated price
      }),
    });

    const data = await res.json();
    assert(res.status === 201, 'Checkout request placed');
    const placedOrder = data.order || data.data?.order;
    assert(placedOrder?.paymentStatus === 'PENDING', 'Manipulated paymentStatus is rejected; server initialized PENDING');
    assert(placedOrder?.total >= testProduct.price, `Manipulated price ignored; server calculated real total (${placedOrder?.total})`);
  }

  console.log('\n--- TEST 7: Quantity Boundary Validation (Scenarios I, J) ---');
  {
    const resNeg = await fetch(`${BASE_URL}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: customerAuth.cookie || '' },
      body: JSON.stringify({
        customerName: 'Audit Customer',
        customerEmail,
        customerPhone: '9876543211',
        shippingAddress: { addressLine1: 'Test', city: 'Mumbai', postalCode: '400001' },
        items: [{ productId: testProduct.id, quantity: -5 }],
      }),
    });
    assert(resNeg.status === 400, 'Negative quantity rejected with HTTP 400');

    const resMassive = await fetch(`${BASE_URL}/api/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: customerAuth.cookie || '' },
      body: JSON.stringify({
        customerName: 'Audit Customer',
        customerEmail,
        customerPhone: '9876543211',
        shippingAddress: { addressLine1: 'Test', city: 'Mumbai', postalCode: '400001' },
        items: [{ productId: testProduct.id, quantity: 5000 }],
      }),
    });
    assert(resMassive.status === 400, 'Extreme quantity exceeding max limits rejected with HTTP 400');
  }

  console.log('\n--- TEST 8: Razorpay Webhook Signature & Idempotency (Scenarios L, M) ---');
  {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'placeholderWebhookSecret';
    const fakePayload = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_audit_test_123',
            order_id: victimOrder.razorpayOrderId || 'order_audit_fake',
            amount: 1000,
          },
        },
      },
    });

    // Invalid signature test
    const resInvalidSig = await fetch(`${BASE_URL}/api/webhooks/razorpay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': 'invalid_forged_signature_hash',
      },
      body: fakePayload,
    });
    assert(resInvalidSig.status === 400, 'Forged/Invalid Razorpay webhook signature is rejected with HTTP 400');

    // Valid signature test
    const validSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(fakePayload)
      .digest('hex');

    const resValid = await fetch(`${BASE_URL}/api/webhooks/razorpay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': validSignature,
      },
      body: fakePayload,
    });
    assert(resValid.status === 200, 'Valid HMAC signature accepted');

    // Idempotent duplicate call
    const resDup = await fetch(`${BASE_URL}/api/webhooks/razorpay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': validSignature,
      },
      body: fakePayload,
    });
    assert(resDup.status === 200, 'Duplicate webhook call handled idempotently');
  }

  console.log('\n--- TEST 9: Non-Admin Mutation Protection (Scenarios N, O, P) ---');
  {
    // Product mutation attempt by customer
    const resProd = await fetch(`${BASE_URL}/api/admin/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: customerAuth.cookie || '' },
      body: JSON.stringify({ name: 'Hacked Product', sku: 'HACK-1', price: 100 }),
    });
    assert(resProd.status === 403, 'Customer cannot create products via /api/admin/products (HTTP 403)');

    // Inventory mutation attempt by customer
    const resInv = await fetch(`${BASE_URL}/api/admin/inventory`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', cookie: customerAuth.cookie || '' },
      body: JSON.stringify({ productId: testProduct.id, stockQuantity: 9999 }),
    });
    assert(resInv.status === 403, 'Customer cannot modify inventory (HTTP 403)');

    // Order status mutation attempt by customer
    const resOrdStatus = await fetch(`${BASE_URL}/api/admin/orders/${victimOrder.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', cookie: customerAuth.cookie || '' },
      body: JSON.stringify({ orderStatus: 'DELIVERED' }),
    });
    assert(resOrdStatus.status === 403, 'Customer cannot update order status (HTTP 403)');
  }

  console.log('\n--- TEST 10: Sensitive Data Protection & Password Hash Isolation (Scenario Q) ---');
  {
    const resCustList = await fetch(`${BASE_URL}/api/admin/customers`, {
      headers: { cookie: adminAuth.cookie || '' },
    });
    const custListData = await resCustList.json();
    assert(resCustList.status === 200, 'Admin can fetch customer list');
    const hasPasswordInList = JSON.stringify(custListData).includes('password') || JSON.stringify(custListData).includes('$2a$');
    assert(!hasPasswordInList, 'Customer list response NEVER contains passwords or bcrypt hashes');

    const resMe = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { cookie: customerAuth.cookie || '' },
    });
    const meData = await resMe.json();
    const currentUser = meData.user || meData.data?.user || {};
    assert(!('password' in currentUser), 'Current user /api/auth/me response NEVER exposes password field');
  }

  console.log('\n--- TEST 11: Admin Audit Logging Verification ---');
  {
    // Admin update an order to trigger audit log
    await fetch(`${BASE_URL}/api/admin/orders/${victimOrder.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', cookie: adminAuth.cookie || '' },
      body: JSON.stringify({ orderStatus: 'CONFIRMED' }),
    });

    const recentAuditLogs = await prisma.adminAuditLog.findMany({
      where: { adminUserId: adminUser.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    assert(recentAuditLogs.length > 0, `Admin action recorded in AdminAuditLog table in PostgreSQL (Found ${recentAuditLogs.length} logs)`);
    assert(recentAuditLogs[0].action === 'ORDER_STATUS_CHANGED', `Audit log recorded action: ${recentAuditLogs[0].action}`);
  }

  console.log('\n--- TEST 12: Admin MFA Endpoint Verification (Scenario R) ---');
  {
    // Set 6-digit PIN
    const resSetPin = await fetch(`${BASE_URL}/api/admin/mfa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: adminAuth.cookie || '' },
      body: JSON.stringify({ action: 'SET_PIN', pin: '123456' }),
    });
    assert(resSetPin.status === 200, 'Admin can configure 6-digit MFA Security PIN');

    // Verify correct PIN
    const resVerifyGood = await fetch(`${BASE_URL}/api/admin/mfa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: adminAuth.cookie || '' },
      body: JSON.stringify({ action: 'VERIFY_PIN', pin: '123456' }),
    });
    assert(resVerifyGood.status === 200, 'Correct MFA PIN accepted');

    // Verify wrong PIN
    const resVerifyBad = await fetch(`${BASE_URL}/api/admin/mfa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: adminAuth.cookie || '' },
      body: JSON.stringify({ action: 'VERIFY_PIN', pin: '999999' }),
    });
    assert(resVerifyBad.status === 401, 'Incorrect MFA PIN rejected with HTTP 401');
  }

  console.log('\n====================================================');
  console.log(`AUDIT COMPLETE: ${passCount} PASSED | ${failCount} FAILED`);
  console.log('====================================================\n');

  // Clean up audit test records
  await prisma.adminAuditLog.deleteMany({ where: { adminUserId: adminUser.id } });
  await prisma.orderStatusHistory.deleteMany({ where: { orderId: victimOrder.id } });
  await prisma.orderItem.deleteMany({ where: { orderId: victimOrder.id } });
  await prisma.payment.deleteMany({ where: { orderId: victimOrder.id } });
  await prisma.order.deleteMany({ where: { id: victimOrder.id } });
  await prisma.address.deleteMany({ where: { id: victimAddress.id } });
  await prisma.user.deleteMany({ where: { id: { in: [adminUser.id, customerUser.id, victimUser.id] } } });

  if (failCount > 0) {
    process.exit(1);
  }
}

runSecurityAudit()
  .catch((err) => {
    console.error('Audit execution fatal error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
