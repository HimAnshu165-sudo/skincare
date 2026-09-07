import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const BASE_URL = 'http://localhost:3000';
const prisma = new PrismaClient();

async function runComprehensiveAudit() {
  console.log('====================================================');
  console.log('VELYRA COMPLETE END-TO-END PRODUCTION AUDIT SUITE');
  console.log('====================================================\n');

  const auditReport = {
    auth: [],
    ecommerce: [],
    coupons: [],
    security: [],
    admin: [],
    database: [],
    performance: [],
  };

  // Helper for asserting and logging
  const test = (category, name, pass, details = '') => {
    const symbol = pass ? '✅ PASS' : '❌ FAIL';
    console.log(`[${category.toUpperCase()}] ${symbol}: ${name} ${details ? '(' + details + ')' : ''}`);
    auditReport[category].push({ name, pass, details });
  };

  // ==========================================
  // SECTION 1: AUTHENTICATION & SESSION AUDIT
  // ==========================================
  console.log('\n--- 1. AUTHENTICATION & SECURITY AUDIT ---');
  
  // Test Existing Admin Login without modifying anything
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'hu98@gmail.com', password: 'Admin@1234' }),
  });
  const adminLoginData = await adminLoginRes.json();
  const adminCookie = adminLoginRes.headers.get('set-cookie');
  test('auth', 'Existing Admin Login (hu98@gmail.com)', adminLoginRes.status === 200 && adminLoginData.user?.role === 'ADMIN', `Status: ${adminLoginRes.status}`);

  // Test Invalid Password on Admin
  const adminBadPassRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'hu98@gmail.com', password: 'WrongPassword99!' }),
  });
  test('auth', 'Invalid Admin Password Rejection', adminBadPassRes.status === 401, `Status: ${adminBadPassRes.status}`);

  // Test Customer Login
  const customerLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'customer@velyra.in', password: 'Customer123!' }),
  });
  const customerLoginData = await customerLoginRes.json();
  const customerCookie = customerLoginRes.headers.get('set-cookie');
  test('auth', 'Customer Login (customer@velyra.in)', customerLoginRes.status === 200 && customerLoginData.user?.role === 'CUSTOMER', `Status: ${customerLoginRes.status}`);

  // Test Role Escalation Defense on Customer trying to access Admin API
  const customerAdminProbeRes = await fetch(`${BASE_URL}/api/admin/orders`, {
    headers: { Cookie: customerCookie || '' },
  });
  test('security', 'Customer Role Accessing /api/admin/orders Forbidden (403)', customerAdminProbeRes.status === 403, `Status: ${customerAdminProbeRes.status}`);

  // ==========================================
  // SECTION 2: E-COMMERCE END-TO-END JOURNEY
  // ==========================================
  console.log('\n--- 2. E-COMMERCE CHECKOUT & INVENTORY AUDIT ---');

  // 1. Fetch Product Catalog
  const productsRes = await fetch(`${BASE_URL}/api/products`);
  const productsData = await productsRes.json();
  const sunscreen = productsData.products?.find(p => p.slug === 'silk-air-fluid-sunscreen-spf50');
  test('ecommerce', 'Public Catalog Fetch', productsRes.status === 200 && productsData.products?.length > 0, `Count: ${productsData.products?.length}`);

  // 2. Add to Cart (Customer Session)
  const addToCartRes = await fetch(`${BASE_URL}/api/cart/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: customerCookie || '' },
    body: JSON.stringify({ productId: sunscreen.id, quantity: 1 }),
  });
  const addToCartData = await addToCartRes.json();
  test('ecommerce', 'Add Product to Cart', addToCartRes.status === 200 && addToCartData.success, `Item added`);

  // 3. Coupon Engine Verification
  console.log('\n--- 3. COUPON TESTING MATRIX ---');
  const couponTests = [
    { code: 'VELYRA10', total: 1000, expectValid: true, desc: '10% Percentage Discount' },
    { code: 'FIRSTGLOW', total: 1000, expectValid: true, desc: '₹150 Flat Discount (>800 threshold)' },
    { code: 'FIRSTGLOW', total: 500, expectValid: false, desc: '₹150 Flat Discount (<800 min cart value)' },
    { code: 'FREESHIP', total: 600, expectValid: true, desc: '₹50 Shipping Discount (>499 threshold)' },
    { code: 'GLOW20', total: 1000, expectValid: false, desc: 'Unseeded Coupon GLOW20' },
    { code: 'WELCOME15', total: 1000, expectValid: false, desc: 'Unseeded Coupon WELCOME15' },
    { code: 'INVALID999', total: 1000, expectValid: false, desc: 'Non-existent Coupon' },
  ];

  for (const ct of couponTests) {
    const cRes = await fetch(`${BASE_URL}/api/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: ct.code, cartTotal: ct.total }),
    });
    const cData = await cRes.json();
    const passed = ct.expectValid ? (cRes.status === 200 && cData.success) : (!cData.success || cRes.status >= 400);
    test('coupons', `Coupon ${ct.code} (${ct.desc})`, passed, `Status: ${cRes.status}, Discount: ₹${cData.discountAmount || 0}`);
  }

  // 4. Server-Side Price Tampering Defense Test
  console.log('\n--- 4. PRICE TAMPERING & IDOR DEFENSE ---');
  const initialStock = sunscreen.stockQuantity;
  const tamperedOrderPayload = {
    customerName: 'Aarav Sharma',
    customerEmail: 'customer@velyra.in',
    customerPhone: '9876543210',
    shippingAddress: {
      fullName: 'Aarav Sharma',
      phone: '9876543210',
      addressLine1: '402 Lotus Grandeur',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400053',
    },
    paymentMethod: 'COD',
    items: [{ productId: sunscreen.id, quantity: 1, price: 1.0 }], // Manipulated price ₹1.0
    couponCode: 'VELYRA10',
  };

  const checkoutRes = await fetch(`${BASE_URL}/api/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: customerCookie || '' },
    body: JSON.stringify(tamperedOrderPayload),
  });
  const checkoutData = await checkoutRes.json();
  const placedOrder = checkoutData.order;

  if (placedOrder) {
    const expectedSubtotal = sunscreen.price; // 899
    const expectedDiscount = Math.round(expectedSubtotal * 0.10); // 89.9 -> 90
    const expectedShipping = expectedSubtotal >= 999 ? 0 : 70; // 70
    const expectedTotal = expectedSubtotal - expectedDiscount + expectedShipping;
    
    const priceRespected = Math.abs(placedOrder.total - expectedTotal) <= 2;
    test('ecommerce', 'Server-Side Price Validation (Ignored Client Price ₹1.0)', priceRespected, `Recorded Total: ₹${placedOrder.total}, Expected: ₹${expectedTotal}`);
    
    // Check Inventory Decrement
    const updatedProd = await prisma.product.findUnique({ where: { id: sunscreen.id } });
    test('ecommerce', 'Atomic Inventory Decrement', updatedProd.stockQuantity === initialStock - 1, `Old: ${initialStock}, New: ${updatedProd.stockQuantity}`);
  } else {
    test('ecommerce', 'Checkout Order Placement', false, checkoutData.message || `Status ${checkoutRes.status}`);
  }

  // ==========================================
  // SECTION 3: ADMIN PANEL OPERATIONS AUDIT
  // ==========================================
  console.log('\n--- 5. ADMIN PANEL OPERATIONS AUDIT ---');
  
  // 1. Admin Dashboard Metrics
  const adminDashRes = await fetch(`${BASE_URL}/api/admin/dashboard`, {
    headers: { Cookie: adminCookie || '' },
  });
  const adminDashData = await adminDashRes.json();
  test('admin', 'Admin Dashboard Metrics Telemetry', adminDashRes.status === 200 && adminDashData.stats?.totalOrders !== undefined, `Orders: ${adminDashData.stats?.totalOrders}, Revenue: ₹${adminDashData.stats?.totalRevenue}`);

  // 2. Admin Customer Management
  const adminCustRes = await fetch(`${BASE_URL}/api/admin/customers`, {
    headers: { Cookie: adminCookie || '' },
  });
  const adminCustData = await adminCustRes.json();
  test('admin', 'Admin Customer Roster Access', adminCustRes.status === 200 && Array.isArray(adminCustData.customers), `Customers Count: ${adminCustData.customers?.length}`);

  // 3. Admin Inventory Management
  const adminInvRes = await fetch(`${BASE_URL}/api/admin/inventory`, {
    headers: { Cookie: adminCookie || '' },
  });
  const adminInvData = await adminInvRes.json();
  test('admin', 'Admin Inventory Read', adminInvRes.status === 200 && Array.isArray(adminInvData.inventory), `Items: ${adminInvData.inventory?.length}`);

  // 4. Admin Order Status Update
  if (placedOrder?.id) {
    const updateStatusRes = await fetch(`${BASE_URL}/api/admin/orders/${placedOrder.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie || '' },
      body: JSON.stringify({ orderStatus: 'PROCESSING', trackingNumber: 'TRK-TEST-9921', courierName: 'Delhivery' }),
    });
    const updateStatusData = await updateStatusRes.json();
    test('admin', 'Admin Order Status Transition (PLACED -> PROCESSING)', updateStatusRes.status === 200 && updateStatusData.order?.orderStatus === 'PROCESSING', `Status: ${updateStatusData.order?.orderStatus}`);
  }

  // ==========================================
  // SECTION 4: DATABASE & PRISMA PERFORMANCE
  // ==========================================
  console.log('\n--- 6. DATABASE & QUERY LATENCY BENCHMARKS ---');
  
  const queryBenchmark = async (name, fn) => {
    const start = performance.now();
    const res = await fn();
    const time = Math.round(performance.now() - start);
    test('performance', `Prisma Query: ${name}`, time < 1500, `Latency: ${time}ms`);
    return res;
  };

  await queryBenchmark('User.findMany with orders aggregate', () => prisma.user.findMany({ include: { orders: true, addresses: true } }));
  await queryBenchmark('Product.findMany with productImages', () => prisma.product.findMany({ include: { productImages: true } }));
  await queryBenchmark('Order.findMany with items and payments', () => prisma.order.findMany({ include: { items: true, payments: true, statusHistory: true } }));
  await queryBenchmark('AdminAuditLog count & slice', () => prisma.adminAuditLog.findMany({ take: 20, orderBy: { createdAt: 'desc' } }));

  console.log('\n====================================================');
  console.log('AUDIT RUN COMPLETED');
  console.log('====================================================');
}

runComprehensiveAudit()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error('Audit run error:', err);
    prisma.$disconnect();
    process.exit(1);
  });
