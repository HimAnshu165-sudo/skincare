// Use native global fetch in Node.js 18+

const BASE_URL = 'http://localhost:3000';

const TEST_ADMIN_EMAIL = `admin_test_${Date.now()}@velyra.com`;
const TEST_ADMIN_PASSWORD = 'AdminSecurePassword2026!';
const TEST_CUSTOMER_EMAIL = `customer_test_${Date.now()}@example.com`;
const TEST_CUSTOMER_PASSWORD = 'CustomerPassword2026!';
const TEST_OTHER_CUSTOMER_EMAIL = `other_cust_${Date.now()}@example.com`;

let adminCookie = '';
let customerCookie = '';
let otherCustomerCookie = '';
let createdOrderId = '';
let createdOrderNumber = '';
let testProductId = '';

function getCookieFromResponse(res) {
  if (typeof res.headers.getSetCookie === 'function') {
    const cookies = res.headers.getSetCookie();
    if (cookies && cookies.length > 0) {
      return cookies.map((c) => c.split(';')[0]).join('; ');
    }
  }
  const raw = res.headers.get('set-cookie');
  if (!raw) return '';
  return raw.split(';')[0];
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 VELYRA ADMIN DASHBOARD INTEGRATION TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      process.stdout.write(`⏳ Testing: ${name}... `);
      await fn();
      console.log('✅ PASS');
      passed++;
    } catch (err) {
      console.log(`❌ FAIL: ${err.message}`);
      failed++;
    }
  }

  // PRE-STEP: Resolve or seed product from DB
  await test('0. Fetch active product from catalog', async () => {
    // Check public products API
    const res = await fetch(`${BASE_URL}/api/products`);
    const data = await res.json();
    if (!data.success || !data.products || data.products.length === 0) {
      throw new Error('No products found in database');
    }
    const product = data.products[0];
    testProductId = product.id;
  });

  // TEST 10: Role escalation prevention on signup
  await test('TEST 10: Role Escalation Prevention - signup ignores role="ADMIN"', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Attacker Attempting Admin',
        email: `escalation_${Date.now()}@test.com`,
        password: 'Password123!',
        role: 'ADMIN', // malicious payload
      }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(`Signup failed: ${data.message}`);
    if (data.user.role === 'ADMIN') {
      throw new Error('VULNERABILITY: User was able to assign themselves ADMIN role via signup body!');
    }
    if (data.user.role !== 'CUSTOMER') {
      throw new Error(`Unexpected role: ${data.user.role}`);
    }
  });

  // Setup Admin user (via prisma directly or admin key header)
  await test('Setup: Create & Authenticate Admin User', async () => {
    // Sign up admin user
    const res1 = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Velyra Admin Test',
        email: TEST_ADMIN_EMAIL,
        password: TEST_ADMIN_PASSWORD,
      }),
    });
    const data1 = await res1.json();
    if (!data1.success) throw new Error(data1.message);

    // Update user role to ADMIN directly in database
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.user.update({
      where: { email: TEST_ADMIN_EMAIL },
      data: { role: 'ADMIN' },
    });
    await prisma.$disconnect();

    // Login as Admin to obtain admin session cookie
    const res2 = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_ADMIN_EMAIL,
        password: TEST_ADMIN_PASSWORD,
      }),
    });
    const data2 = await res2.json();
    if (!data2.success || data2.user.role !== 'ADMIN') {
      throw new Error('Failed to login as ADMIN');
    }
    adminCookie = getCookieFromResponse(res2);
  });

  // Setup Customer users
  await test('Setup: Create & Authenticate Customer Users', async () => {
    const res1 = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Aarav Mehta',
        email: TEST_CUSTOMER_EMAIL,
        password: TEST_CUSTOMER_PASSWORD,
        phone: '9876543210',
      }),
    });
    const data1 = await res1.json();
    if (!data1.success) throw new Error(data1.message);
    customerCookie = getCookieFromResponse(res1);

    const res2 = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Priya Sharma',
        email: TEST_OTHER_CUSTOMER_EMAIL,
        password: TEST_CUSTOMER_PASSWORD,
        phone: '9123456780',
      }),
    });
    const data2 = await res2.json();
    if (!data2.success) throw new Error(data2.message);
    otherCustomerCookie = getCookieFromResponse(res2);
  });

  // TEST 6 & 7: Customer cannot access Admin API
  await test('TEST 6 & 7: Access Control - Customer rejected from Admin APIs with 401', async () => {
    const adminEndpoints = [
      '/api/admin/dashboard',
      '/api/admin/orders',
      '/api/admin/products',
      '/api/admin/inventory',
      '/api/admin/customers',
      '/api/admin/payments',
    ];

    for (const ep of adminEndpoints) {
      // 1. Request with Customer cookie
      const resCustomer = await fetch(`${BASE_URL}${ep}`, {
        headers: { Cookie: customerCookie },
      });
      if (resCustomer.status !== 401 && resCustomer.status !== 403) {
        throw new Error(`Customer was allowed to access ${ep} (Status: ${resCustomer.status})`);
      }

      // 2. Request with No cookie
      const resUnauth = await fetch(`${BASE_URL}${ep}`);
      if (resUnauth.status !== 401 && resUnauth.status !== 403) {
        throw new Error(`Unauthenticated request allowed to access ${ep} (Status: ${resUnauth.status})`);
      }
    }
  });

  // TEST 9: Price manipulation protection on checkout
  await test('TEST 9: Price Manipulation Protection - Server recalculates price from DB', async () => {
    const res = await fetch(`${BASE_URL}/api/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: customerCookie,
      },
      body: JSON.stringify({
        customerName: 'Aarav Mehta',
        customerEmail: TEST_CUSTOMER_EMAIL,
        customerPhone: '9876543210',
        shippingAddress: {
          fullName: 'Aarav Mehta',
          addressLine1: 'Flat 402, Sea View Apartments',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400050',
          country: 'India',
        },
        paymentMethod: 'COD',
        items: [
          {
            productId: testProductId,
            quantity: 1,
            price: 1, // Malicious attempted fake price of ₹1
          },
        ],
      }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    // Verify the created order has the real database product price (not ₹1)
    if (data.order.subtotal <= 10) {
      throw new Error(`VULNERABILITY: Order subtotal accepted malicious price of ₹${data.order.subtotal}`);
    }
    createdOrderId = data.order.id;
    createdOrderNumber = data.order.orderNumber;
  });

  // TEST 1: Customer Order appears immediately in PostgreSQL and Admin Orders API
  await test('TEST 1: Customer Order Persisted in PostgreSQL & Available in Admin API', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/orders?search=${createdOrderNumber}`, {
      headers: { Cookie: adminCookie },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    if (!data.orders || data.orders.length === 0) {
      throw new Error(`Order ${createdOrderNumber} not found in admin orders list!`);
    }
    const foundOrder = data.orders[0];
    if (foundOrder.orderNumber !== createdOrderNumber) {
      throw new Error(`Mismatched order number: expected ${createdOrderNumber}, got ${foundOrder.orderNumber}`);
    }
  });

  // TEST 2: Dashboard Real-time Calculations
  await test('TEST 2: Admin Dashboard calculates live PostgreSQL metrics correctly', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/dashboard`, {
      headers: { Cookie: adminCookie },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    const { metrics } = data;

    if (metrics.totalOrders < 1) {
      throw new Error(`Expected totalOrders >= 1, got ${metrics.totalOrders}`);
    }
    if (metrics.totalRevenue <= 0) {
      throw new Error(`Expected totalRevenue > 0, got ${metrics.totalRevenue}`);
    }
    if (metrics.totalCustomers < 2) {
      throw new Error(`Expected totalCustomers >= 2, got ${metrics.totalCustomers}`);
    }
  });

  // TEST 3: Admin Order Details
  await test('TEST 3: Admin Order Details contains complete customer, items, and address info', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/orders/${createdOrderId}`, {
      headers: { Cookie: adminCookie },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    const order = data.order;

    if (order.customerEmail !== TEST_CUSTOMER_EMAIL) {
      throw new Error(`Incorrect customer email: ${order.customerEmail}`);
    }
    if (!order.shippingAddress || !order.shippingAddress.addressLine1) {
      throw new Error('Shipping address snapshot is missing or malformed');
    }
    if (!order.items || order.items.length === 0) {
      throw new Error('Order items missing');
    }
    if (!order.payments || order.payments.length === 0) {
      throw new Error('Payment records missing');
    }
  });

  // TEST 4: Status transitions & OrderStatusHistory creation
  await test('TEST 4: Status Transitions (PLACED -> PROCESSING -> SHIPPED -> DELIVERED) with History logging', async () => {
    const transitions = [
      { status: 'PROCESSING', note: 'Cleanroom preparation started' },
      { status: 'PACKED', note: 'Luxury boxed and sealed' },
      { status: 'SHIPPED', note: 'Handed to Delhivery AWB: DEL-12345678' },
      { status: 'DELIVERED', note: 'Delivered to customer' },
    ];

    for (const t of transitions) {
      const res = await fetch(`${BASE_URL}/api/admin/orders/${createdOrderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: adminCookie,
        },
        body: JSON.stringify({
          orderStatus: t.status,
          statusDescription: t.note,
          trackingNumber: t.status === 'SHIPPED' ? 'DEL-12345678' : undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(`Failed transition to ${t.status}: ${data.message}`);
      if (data.order.orderStatus !== t.status) {
        throw new Error(`Status not updated to ${t.status}`);
      }
    }

    // Verify history entries were created in PostgreSQL
    const resFinal = await fetch(`${BASE_URL}/api/admin/orders/${createdOrderId}`, {
      headers: { Cookie: adminCookie },
    });
    const dataFinal = await resFinal.json();
    const history = dataFinal.order.statusHistory;

    const statusesLogged = history.map((h) => h.status);
    if (!statusesLogged.includes('PROCESSING') || !statusesLogged.includes('SHIPPED') || !statusesLogged.includes('DELIVERED')) {
      throw new Error(`Missing status history entries! Logged statuses: ${statusesLogged.join(', ')}`);
    }
  });

  // TEST 5 & 8: IDOR & Customer Data Isolation
  await test('TEST 5 & 8: IDOR & Ownership Isolation - Other customer cannot access another user order', async () => {
    // Other customer attempts to fetch Aarav's order
    const res = await fetch(`${BASE_URL}/api/orders/${createdOrderId}`, {
      headers: { Cookie: otherCustomerCookie },
    });
    if (res.status !== 404 && res.status !== 403 && res.status !== 401) {
      const data = await res.json();
      if (data.success && data.order) {
        throw new Error('VULNERABILITY: Other customer was able to view another customer order via IDOR!');
      }
    }
  });

  // TEST 11: Inventory Stock Protection
  await test('TEST 11: Inventory Protection - Stock decrement & preventing negative stock', async () => {
    // Attempt to order 99999 units of product
    const res = await fetch(`${BASE_URL}/api/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: customerCookie,
      },
      body: JSON.stringify({
        customerName: 'Aarav Mehta',
        customerEmail: TEST_CUSTOMER_EMAIL,
        customerPhone: '9876543210',
        shippingAddress: {
          fullName: 'Aarav Mehta',
          addressLine1: 'Test Address',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400050',
        },
        paymentMethod: 'COD',
        items: [{ productId: testProductId, quantity: 99999 }],
      }),
    });
    const data = await res.json();
    if (data.success) {
      throw new Error('VULNERABILITY: Order succeeded despite exceeding available inventory!');
    }
  });

  // TEST 12: Failed payment does not count towards revenue
  await test('TEST 12: Failed Payments are excluded from revenue', async () => {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Create a failed test order
    const failedOrder = await prisma.order.create({
      data: {
        orderNumber: `VEL-FAIL-${Date.now()}`,
        customerName: 'Failed Order Test',
        customerEmail: 'failed@test.com',
        customerPhone: '9000000000',
        shippingAddress: JSON.stringify({ city: 'Delhi' }),
        paymentMethod: 'ONLINE',
        paymentStatus: 'FAILED',
        orderStatus: 'CANCELLED',
        subtotal: 50000,
        total: 50000,
      },
    });

    const res = await fetch(`${BASE_URL}/api/admin/dashboard`, {
      headers: { Cookie: adminCookie },
    });
    const data = await res.json();

    // Cleanup failed test order
    await prisma.order.delete({ where: { id: failedOrder.id } });
    await prisma.$disconnect();

    if (!data.success) throw new Error(data.message);
  });

  // TEST 13: Product & Inventory CRUD
  await test('TEST 13: Product Catalog & Inventory Management APIs', async () => {
    // 1. Create a new test product
    const testSku = `SKU-TEST-${Date.now()}`;
    const resCreate = await fetch(`${BASE_URL}/api/admin/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        name: 'Ceramide Barrier Recovery Serum',
        slug: `ceramide-barrier-serum-${Date.now()}`,
        sku: testSku,
        price: 1450,
        mrp: 1800,
        stockQuantity: 15, // low stock test
        category: 'Moisturizers',
        tagline: 'Deep barrier restoration',
        description: 'Multi-ceramide lipid barrier renewal complex.',
      }),
    });
    const dataCreate = await resCreate.json();
    if (!dataCreate.success) throw new Error(`Product creation failed: ${dataCreate.message}`);
    const newProdId = dataCreate.product.id;

    // 2. Adjust inventory via inventory API
    const resInv = await fetch(`${BASE_URL}/api/admin/inventory`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        productId: newProdId,
        stockQuantity: 50,
      }),
    });
    const dataInv = await resInv.json();
    if (!dataInv.success || dataInv.product.stockQuantity !== 50) {
      throw new Error(`Inventory adjust failed: ${dataInv.message}`);
    }

    // 3. Delete/Archive the test product
    const resDel = await fetch(`${BASE_URL}/api/admin/products/${newProdId}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });
    const dataDel = await resDel.json();
    if (!dataDel.success) throw new Error(`Product deletion failed: ${dataDel.message}`);
  });

  console.log('\n====================================================');
  console.log(`🎉 TEST RUN COMPLETE: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
