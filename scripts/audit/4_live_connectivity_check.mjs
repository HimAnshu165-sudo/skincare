import { PrismaClient } from '@prisma/client';

const BASE_URL = 'http://localhost:3000';
const prisma = new PrismaClient();

async function runLiveConnectivityAudit() {
  console.log('====================================================');
  console.log('LIVE FRONTEND ↔ BACKEND API CONNECTIVITY TEST SUITE');
  console.log('====================================================\n');

  const results = [];

  const callApi = async (category, name, method, endpoint, options = {}) => {
    const start = performance.now();
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
      const latency = Math.round(performance.now() - start);
      let data = null;
      try {
        data = await res.json();
      } catch {
        data = '<Non-JSON>';
      }

      const isSuccess = res.status >= 200 && res.status < 300;
      results.push({
        category,
        name,
        method,
        endpoint,
        status: res.status,
        latency,
        isSuccess,
        details: isSuccess ? 'Connected & Verified' : (data?.message || `HTTP ${res.status}`),
      });

      return { res, data, headers: res.headers };
    } catch (err) {
      const latency = Math.round(performance.now() - start);
      results.push({
        category,
        name,
        method,
        endpoint,
        status: 0,
        latency,
        isSuccess: false,
        details: `Connection Failed: ${err.message}`,
      });
      return { res: null, data: null, headers: null };
    }
  };

  // 1. Authenticate Sessions
  console.log('1. Establishing Authenticated Sessions...');
  const customerAuth = await callApi('Auth', 'Customer Sign In', 'POST', '/api/auth/login', {
    body: { email: 'customer@velyra.in', password: 'Customer123!' },
  });
  const customerCookie = customerAuth.headers?.get('set-cookie') || '';

  const adminAuth = await callApi('Auth', 'Admin Sign In (Original Credentials)', 'POST', '/api/auth/login', {
    body: { email: 'hu98@gmail.com', password: 'Admin@1234' },
  });
  const adminCookie = adminAuth.headers?.get('set-cookie') || '';

  // 2. Public Catalog APIs
  console.log('2. Testing Public Catalog Endpoints...');
  const prodList = await callApi('Catalog', 'Get Products Catalog', 'GET', '/api/products');
  const products = prodList.data?.products || [];
  const heroProd = products[0] || { slug: 'silk-air-fluid-sunscreen-spf50', id: 'prod_sunscreen_01' };

  await callApi('Catalog', 'Filter by Category (Sunscreens)', 'GET', '/api/products?category=Sunscreens');
  await callApi('Catalog', 'Filter Featured Products', 'GET', '/api/products?featured=true');
  await callApi('Catalog', 'Single Product Detail (PDP)', 'GET', `/api/products/${heroProd.slug}`);

  // 3. Cart Management APIs (Customer Session)
  console.log('3. Testing Cart Management Endpoints...');
  await callApi('Cart', 'Fetch Active Cart', 'GET', '/api/cart', {
    headers: { Cookie: customerCookie },
  });

  const addCart = await callApi('Cart', 'Add Item to Cart', 'POST', '/api/cart/items', {
    headers: { Cookie: customerCookie },
    body: { productId: heroProd.id, quantity: 1 },
  });

  const cartItemId = addCart.data?.cart?.items?.[0]?.id;
  if (cartItemId) {
    await callApi('Cart', 'Update Item Quantity in Cart', 'PATCH', `/api/cart/items/${cartItemId}`, {
      headers: { Cookie: customerCookie },
      body: { quantity: 2 },
    });
  }

  // 4. Coupons Engine
  console.log('4. Testing Coupon Validation API...');
  await callApi('Coupons', 'Validate Coupon (VELYRA10)', 'POST', '/api/coupons/validate', {
    body: { code: 'VELYRA10', subtotal: 1000 },
  });

  // 5. Customer Account & Order History
  console.log('5. Testing Customer Profile & Orders Endpoints...');
  await callApi('Customer', 'Current User Session Profile', 'GET', '/api/auth/me', {
    headers: { Cookie: customerCookie },
  });

  await callApi('Customer', 'Customer Address Book', 'GET', '/api/addresses', {
    headers: { Cookie: customerCookie },
  });

  const ordersList = await callApi('Customer', 'Customer Order History', 'GET', '/api/orders', {
    headers: { Cookie: customerCookie },
  });

  const sampleOrderNumber = ordersList.data?.orders?.[0]?.orderNumber || 'VEL-98241';
  await callApi('Customer', 'Customer Single Order Tracking', 'GET', `/api/orders/${sampleOrderNumber}`, {
    headers: { Cookie: customerCookie },
  });

  // 6. Admin Panel Operations (Admin Session)
  console.log('6. Testing Admin Operations Portal Endpoints...');
  await callApi('Admin', 'Admin Telemetry & Dashboard Stats', 'GET', '/api/admin/dashboard', {
    headers: { Cookie: adminCookie },
  });

  await callApi('Admin', 'Admin Orders Roster', 'GET', '/api/admin/orders', {
    headers: { Cookie: adminCookie },
  });

  await callApi('Admin', 'Admin Customers Roster', 'GET', '/api/admin/customers', {
    headers: { Cookie: adminCookie },
  });

  await callApi('Admin', 'Admin Inventory & Stock Control', 'GET', '/api/admin/inventory', {
    headers: { Cookie: adminCookie },
  });

  await callApi('Admin', 'Admin Payment Ledger', 'GET', '/api/admin/payments', {
    headers: { Cookie: adminCookie },
  });

  await callApi('Admin', 'Admin Product Manager', 'GET', '/api/admin/products', {
    headers: { Cookie: adminCookie },
  });

  await callApi('Admin', 'Admin Media Library', 'GET', '/api/admin/media', {
    headers: { Cookie: adminCookie },
  });

  // 7. Payment Gateway Initiation
  console.log('7. Testing Payment Gateway API...');
  await callApi('Payments', 'Razorpay Order Intent Creation', 'POST', '/api/razorpay/create-order', {
    headers: { Cookie: customerCookie },
    body: { amount: 899, receipt: 'rec_live_test_01' },
  });

  // Summary Report
  console.log('\n====================================================');
  console.log('API CONNECTIVITY & HEALTH REPORT');
  console.log('====================================================');
  
  let successCount = 0;
  for (const r of results) {
    const symbol = r.isSuccess ? '✅ [PASS]' : '❌ [FAIL]';
    if (r.isSuccess) successCount++;
    console.log(`${symbol} ${r.method.padEnd(5)} ${r.endpoint.padEnd(42)} | ${String(r.status).padEnd(3)} | ${String(r.latency + 'ms').padEnd(7)} | ${r.name}`);
  }

  console.log('----------------------------------------------------');
  console.log(`TOTAL APIs TESTED: ${results.length}`);
  console.log(`SUCCESSFUL: ${successCount}`);
  console.log(`FAILED: ${results.length - successCount}`);
  console.log(`CONNECTIVITY HEALTH: ${Math.round((successCount / results.length) * 100)}%`);
  console.log('====================================================');
}

runLiveConnectivityAudit()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('Connectivity test error:', e);
    prisma.$disconnect();
    process.exit(1);
  });
