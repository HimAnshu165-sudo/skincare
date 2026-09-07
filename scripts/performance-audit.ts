import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'velyra-luxury-skincare-secret-jwt-token-2026-production-key-signed'
);

async function runBenchmark() {
  console.log('====================================================');
  console.log('VELYRA PERFORMANCE & LATENCY AUDIT BENCHMARK');
  console.log('====================================================\n');

  // 1. Raw DB Connection / Latency test
  console.log('--- 1. DATABASE & CRYPTO LOW-LEVEL LATENCY ---');
  const dbStart = performance.now();
  await prisma.$queryRaw`SELECT 1`;
  const dbDuration = performance.now() - dbStart;
  console.log(`Prisma $queryRaw SELECT 1: ${dbDuration.toFixed(2)}ms`);

  // Multiple DB queries in sequence vs parallel
  const seqStart = performance.now();
  for (let i = 0; i < 5; i++) {
    await prisma.user.findFirst({ select: { id: true } });
  }
  const seqDuration = performance.now() - seqStart;
  console.log(`5 Sequential DB Queries: ${seqDuration.toFixed(2)}ms (Avg: ${(seqDuration / 5).toFixed(2)}ms per query)`);

  const parStart = performance.now();
  await Promise.all([
    prisma.user.findFirst({ select: { id: true } }),
    prisma.product.findFirst({ select: { id: true } }),
    prisma.cart.findFirst({ select: { id: true } }),
    prisma.order.findFirst({ select: { id: true } }),
    prisma.coupon.findFirst({ select: { id: true } }),
  ]);
  const parDuration = performance.now() - parStart;
  console.log(`5 Parallel DB Queries: ${parDuration.toFixed(2)}ms`);

  // Crypto / bcrypt benchmarks
  const testPassword = 'Password123!';
  const hashStart = performance.now();
  const testHash = await bcrypt.hash(testPassword, 10);
  const hashDuration = performance.now() - hashStart;
  console.log(`bcrypt.hash(10 rounds): ${hashDuration.toFixed(2)}ms`);

  const compStart = performance.now();
  await bcrypt.compare(testPassword, testHash);
  const compDuration = performance.now() - compStart;
  console.log(`bcrypt.compare(10 rounds): ${compDuration.toFixed(2)}ms`);

  // JWT benchmarks
  const jwtStart = performance.now();
  const token = await new SignJWT({ userId: 'test-123', email: 'test@example.com', role: 'CUSTOMER' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
  const jwtDuration = performance.now() - jwtStart;
  console.log(`SignJWT: ${jwtDuration.toFixed(2)}ms`);

  const jwtVStart = performance.now();
  await jwtVerify(token, JWT_SECRET);
  const jwtVDuration = performance.now() - jwtVStart;
  console.log(`jwtVerify: ${jwtVDuration.toFixed(2)}ms`);

  // 2. Trace Login Step-by-Step
  console.log('\n--- 2. STEP-BY-STEP LOGIN FLOW TRACE ---');
  // Ensure a test user exists
  const testEmail = 'benchmark_user@veltest.com';
  let testUser = await prisma.user.findUnique({ where: { email: testEmail } });
  if (!testUser) {
    testUser = await prisma.user.create({
      data: {
        name: 'Benchmark User',
        email: testEmail,
        password: testHash,
        role: 'CUSTOMER',
      },
    });
  }

  const step1Start = performance.now();
  const foundUser = await prisma.user.findUnique({ where: { email: testEmail } });
  const step1 = performance.now() - step1Start;

  const step2Start = performance.now();
  const isMatch = await bcrypt.compare(testPassword, foundUser!.password);
  const step2 = performance.now() - step2Start;

  const step3Start = performance.now();
  const sessionToken = await new SignJWT({
    userId: foundUser!.id,
    email: foundUser!.email,
    role: foundUser!.role,
    name: foundUser!.name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
  const step3 = performance.now() - step3Start;

  console.log(`Step 1: DB Lookup User by Email: ${step1.toFixed(2)}ms`);
  console.log(`Step 2: bcrypt.compare Password: ${step2.toFixed(2)}ms`);
  console.log(`Step 3: JOSE Session Token Creation: ${step3.toFixed(2)}ms`);
  console.log(`Subtotal core login: ${(step1 + step2 + step3).toFixed(2)}ms`);

  // 3. Measure Key Database Queries
  console.log('\n--- 3. KEY PRISMA QUERY BENCHMARKS ---');
  
  // Products Query
  const prodStart = performance.now();
  const products = await prisma.product.findMany({
    include: { productImages: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });
  const prodTime = performance.now() - prodStart;
  console.log(`Products List (Full Relations, count=${products.length}): ${prodTime.toFixed(2)}ms`);

  // Optimized Products Query (with selective fields)
  const optProdStart = performance.now();
  const optProducts = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      tagline: true,
      price: true,
      mrp: true,
      inStock: true,
      stockQuantity: true,
      category: true,
      isFeatured: true,
      isUpcoming: true,
      volume: true,
      spfRating: true,
      finish: true,
      images: true,
      productImages: {
        select: { url: true, alt: true, isPrimary: true, sortOrder: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  const optProdTime = performance.now() - optProdStart;
  console.log(`Products List (Selective Fields, count=${optProducts.length}): ${optProdTime.toFixed(2)}ms`);

  // Admin Dashboard Queries
  const dashStart = performance.now();
  const [orderCount, productCount, customerCount, totalRev] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.order.aggregate({
      where: { paymentStatus: 'PAID' },
      _sum: { total: true },
    }),
  ]);
  const dashTime = performance.now() - dashStart;
  console.log(`Admin Dashboard Aggregates (Parallel): ${dashTime.toFixed(2)}ms`);

  // Admin Orders Query
  const ordStart = performance.now();
  const orders = await prisma.order.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
      payments: true,
    },
  });
  const ordTime = performance.now() - ordStart;
  console.log(`Admin Orders (Page of 20 with Items/Payments): ${ordTime.toFixed(2)}ms`);

  // Admin Customers Query
  const custStart = performance.now();
  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    take: 20,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      _count: {
        select: { orders: true, addresses: true },
      },
    },
  });
  const custTime = performance.now() - custStart;
  console.log(`Admin Customers (Page of 20 with Counts): ${custTime.toFixed(2)}ms`);

  console.log('\n====================================================');
  console.log('BENCHMARK COMPLETE');
  console.log('====================================================');
}

runBenchmark()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
