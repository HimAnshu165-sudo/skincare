import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const BASE_URL = 'http://localhost:3000';
const prisma = new PrismaClient();

async function runApiAudit() {
  console.log('====================================================');
  console.log('1. RUNNING FULL API ENDPOINT HEALTH & LATENCY AUDIT');
  console.log('====================================================\n');

  const results = [];

  const measure = async (name, method, url, options = {}) => {
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
        data = '<Non-JSON Response>';
      }
      results.push({
        name,
        method,
        url,
        status: res.status,
        latency,
        success: data?.success ?? (res.status >= 200 && res.status < 300),
        dataSummary: typeof data === 'object' ? Object.keys(data || {}).join(', ') : 'string',
        error: data?.message || data?.error || (res.status >= 400 ? `HTTP ${res.status}` : null),
      });
    } catch (err) {
      const latency = Math.round(performance.now() - start);
      results.push({
        name,
        method,
        url,
        status: 0,
        latency,
        success: false,
        dataSummary: 'Network Error',
        error: err.message,
      });
    }
  };

  // 1. Public Products
  await measure('Get All Products', 'GET', '/api/products');
  await measure('Get Products by Category', 'GET', '/api/products?category=Sunscreens');
  await measure('Get Featured Products', 'GET', '/api/products?featured=true');
  await measure('Get Valid Product Detail', 'GET', '/api/products/silk-air-fluid-sunscreen-spf50');
  await measure('Get Invalid Product Slug', 'GET', '/api/products/non-existent-product-slug-xyz');

  // 2. Coupons
  await measure('Validate Active Coupon (VELYRA10)', 'POST', '/api/coupons/validate', { body: { code: 'VELYRA10', cartTotal: 1000 } });
  await measure('Validate Low Cart Value Coupon (FIRSTGLOW < 800)', 'POST', '/api/coupons/validate', { body: { code: 'FIRSTGLOW', cartTotal: 500 } });
  await measure('Validate Non-Existent Coupon (FAKE99)', 'POST', '/api/coupons/validate', { body: { code: 'FAKE99', cartTotal: 1000 } });
  await measure('Validate Empty Coupon Payload', 'POST', '/api/coupons/validate', { body: {} });

  // 3. Auth Unauthenticated Probing
  await measure('Current User /api/auth/me (Unauthenticated)', 'GET', '/api/auth/me');
  await measure('Login with Invalid Password', 'POST', '/api/auth/login', { body: { email: 'customer@velyra.in', password: 'WrongPassword999!' } });
  await measure('Login with Non-existent User', 'POST', '/api/auth/login', { body: { email: 'nobody_12345@example.com', password: 'Password123!' } });
  await measure('Login with Empty Payload', 'POST', '/api/auth/login', { body: {} });
  await measure('Signup with Short Password', 'POST', '/api/auth/signup', { body: { name: 'Test', email: 'test_short@example.com', password: '123' } });
  await measure('Signup with Invalid Email', 'POST', '/api/auth/signup', { body: { name: 'Test', email: 'notanemail', password: 'ValidPass123!' } });

  // 4. Cart Probing (Guest & Stateless)
  await measure('Get Cart (Empty Guest Header)', 'GET', '/api/cart');
  await measure('Add Invalid Product ID to Cart', 'POST', '/api/cart/items', { body: { productId: 'invalid_prod_id_99', quantity: 1 } });
  await measure('Add Negative Quantity to Cart', 'POST', '/api/cart/items', { body: { productId: 'prod_sunscreen_01', quantity: -5 } });
  await measure('Add Zero Quantity to Cart', 'POST', '/api/cart/items', { body: { productId: 'prod_sunscreen_01', quantity: 0 } });
  await measure('Add Excessive Quantity (9999) to Cart', 'POST', '/api/cart/items', { body: { productId: 'prod_sunscreen_01', quantity: 9999 } });

  // 5. Checkout & Orders Probing (Unauthenticated)
  await measure('Direct Checkout Empty Payload', 'POST', '/api/checkout', { body: {} });
  await measure('Orders List (Unauthenticated)', 'GET', '/api/orders');
  await measure('Get Order Detail (Unauthenticated Non-existent)', 'GET', '/api/orders/VEL-NONEXISTENT-999');

  // 6. Admin Security Barrier (Unauthenticated Requests to /api/admin/*)
  await measure('Admin Orders (Unauthenticated)', 'GET', '/api/admin/orders');
  await measure('Admin Dashboard Stats (Unauthenticated)', 'GET', '/api/admin/dashboard');
  await measure('Admin Customers (Unauthenticated)', 'GET', '/api/admin/customers');
  await measure('Admin Inventory (Unauthenticated)', 'GET', '/api/admin/inventory');
  await measure('Admin Payments (Unauthenticated)', 'GET', '/api/admin/payments');
  await measure('Admin Media (Unauthenticated)', 'GET', '/api/admin/media');
  await measure('Admin Products List (Unauthenticated)', 'GET', '/api/admin/products');

  // 7. Razorpay Payment Gateway Probing
  await measure('Razorpay Create Order Empty Payload', 'POST', '/api/razorpay/create-order', { body: {} });
  await measure('Razorpay Verify Fake Signature', 'POST', '/api/razorpay/verify', { body: { razorpayOrderId: 'order_fake', razorpayPaymentId: 'pay_fake', razorpaySignature: 'sig_fake' } });
  await measure('Razorpay Webhook Invalid Signature', 'POST', '/api/webhooks/razorpay', { body: { event: 'payment.captured' } });

  console.log('----------------------------------------------------');
  console.log('| Endpoint | Method | Status | Latency | Result |');
  console.log('----------------------------------------------------');
  for (const r of results) {
    const mark = (r.status >= 200 && r.status < 300) || (r.status === 401 && r.url.startsWith('/api/admin')) || (r.status === 400 && r.error) ? '✅' : '⚠️';
    console.log(`${mark} [${r.status}] ${r.method.padEnd(5)} ${r.url.padEnd(45)} ${r.latency}ms - ${r.error || 'OK'}`);
  }

  return results;
}

runApiAudit()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error('API Audit error:', err);
    prisma.$disconnect();
    process.exit(1);
  });
