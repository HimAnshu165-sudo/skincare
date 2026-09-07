import { PrismaClient } from '@prisma/client';

const BASE_URL = 'http://localhost:3000';
const prisma = new PrismaClient();

async function runFinalHealthCheck() {
  console.log('====================================================');
  console.log('FINAL PRODUCTION BACKEND & DATABASE VERIFICATION');
  console.log('====================================================\n');

  // 1. Database Health & Models Check
  console.log('--- 1. DATABASE (Neon PostgreSQL) VERIFICATION ---');
  const userCount = await prisma.user.count();
  const productCount = await prisma.product.count();
  const orderCount = await prisma.order.count();
  const couponCount = await prisma.coupon.count();

  console.log(`✅ Database Connection: ACTIVE`);
  console.log(`✅ Users in DB: ${userCount}`);
  console.log(`✅ Products in DB: ${productCount}`);
  console.log(`✅ Orders in DB: ${orderCount}`);
  console.log(`✅ Coupons in DB: ${couponCount}\n`);

  // 2. Full Live API Tests
  console.log('--- 2. LIVE BACKEND API ENDPOINTS VERIFICATION ---');
  const tests = [];

  const runTest = async (name, method, url, options = {}) => {
    const start = performance.now();
    try {
      const res = await fetch(`${BASE_URL}${url}`, {
        method,
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
      const latency = Math.round(performance.now() - start);
      let data = null;
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      const pass = res.status >= 200 && res.status < 300;
      tests.push({ name, method, url, status: res.status, latency, pass });
      return { res, data, headers: res.headers };
    } catch (err) {
      const latency = Math.round(performance.now() - start);
      tests.push({ name, method, url, status: 0, latency, pass: false, error: err.message });
      return { res: null, data: null };
    }
  };

  // Auth test with existing Admin
  const adminLogin = await runTest('Admin Login (hu98@gmail.com)', 'POST', '/api/auth/login', {
    body: { email: 'hu98@gmail.com', password: 'Admin@1234' },
  });
  const rawCookie = adminLogin.headers?.get('set-cookie');
  const sessionCookie = rawCookie ? rawCookie.split(';')[0] : '';

  // Public Catalog
  await runTest('Public Products List', 'GET', '/api/products');
  await runTest('Product PDP Detail', 'GET', '/api/products/silk-air-fluid-sunscreen-spf50');

  // Coupon Engine
  await runTest('Validate Coupon (VELYRA10)', 'POST', '/api/coupons/validate', {
    body: { code: 'VELYRA10', subtotal: 1000 },
  });

  // Cart API
  await runTest('Fetch Cart', 'GET', '/api/cart', {
    headers: { Cookie: sessionCookie },
  });

  // Current User Session
  await runTest('Session Profile Check (/api/auth/me)', 'GET', '/api/auth/me', {
    headers: { Cookie: sessionCookie },
  });

  // Admin Dashboard
  await runTest('Admin Telemetry (/api/admin/dashboard)', 'GET', '/api/admin/dashboard', {
    headers: { Cookie: sessionCookie },
  });

  // Admin Orders
  await runTest('Admin Orders Roster', 'GET', '/api/admin/orders', {
    headers: { Cookie: sessionCookie },
  });

  // Admin Customers
  await runTest('Admin Customers Roster', 'GET', '/api/admin/customers', {
    headers: { Cookie: sessionCookie },
  });

  // Admin Inventory
  await runTest('Admin Inventory Roster', 'GET', '/api/admin/inventory', {
    headers: { Cookie: sessionCookie },
  });

  // Razorpay Order Creation Intent
  await runTest('Razorpay Create Order Intent', 'POST', '/api/razorpay/create-order', {
    headers: { Cookie: sessionCookie },
    body: {
      customerName: 'Admin User',
      customerEmail: 'hu98@gmail.com',
      customerPhone: '9876543210',
      shippingAddress: {
        fullName: 'Admin User',
        phone: '9876543210',
        addressLine1: '402 Lotus Grandeur',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400053',
      },
      items: [{ productId: 'prod_sunscreen_01', quantity: 1 }],
      couponCode: 'VELYRA10',
    },
  });

  console.log('----------------------------------------------------');
  console.log('| Status | Method | Endpoint | Latency | Test Name |');
  console.log('----------------------------------------------------');
  let passedCount = 0;
  for (const t of tests) {
    const symbol = t.pass ? '✅ [PASS]' : '❌ [FAIL]';
    if (t.pass) passedCount++;
    console.log(`${symbol} ${String(t.status).padEnd(3)} | ${t.method.padEnd(5)} | ${t.url.padEnd(45)} | ${String(t.latency + 'ms').padEnd(7)} | ${t.name}`);
  }

  console.log('----------------------------------------------------');
  console.log(`TOTAL TESTS: ${tests.length}`);
  console.log(`PASSED: ${passedCount} / ${tests.length}`);
  console.log(`BACKEND & DATABASE HEALTH: ${Math.round((passedCount / tests.length) * 100)}% SUCCESS`);
  console.log('====================================================\n');
}

runFinalHealthCheck()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error('Test execution error:', err);
    prisma.$disconnect();
    process.exit(1);
  });
