import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inspectAndOptionallyCleanTestData() {
  const isPurge = process.argv.includes('--purge');

  console.log('====================================================');
  console.log('VELYRA Database Test Data Inspection & Audit');
  console.log('====================================================\n');

  const testUsers = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: 'test', mode: 'insensitive' } },
        { email: { contains: 'attacker', mode: 'insensitive' } },
        { email: { contains: 'escalation', mode: 'insensitive' } },
        { email: { contains: 'user_a', mode: 'insensitive' } },
        { email: { contains: 'user_b', mode: 'insensitive' } },
        { name: { contains: 'Attacker', mode: 'insensitive' } },
        { name: { contains: 'Test User', mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { orders: true, addresses: true } },
    },
  });

  console.log(`Found ${testUsers.length} identified development/test user records:`);
  testUsers.forEach((u, i) => {
    console.log(`  [${i + 1}] ID: ${u.id} | Email: ${u.email} | Name: ${u.name} | Role: ${u.role} | Orders: ${u._count.orders}`);
  });

  if (isPurge) {
    console.log('\nPurging identified test records...');
    const ids = testUsers.map((u) => u.id);
    const deleteResult = await prisma.user.deleteMany({
      where: { id: { in: ids } },
    });
    console.log(`Purged ${deleteResult.count} test records from PostgreSQL.`);
  } else {
    console.log('\n(To delete these test records prior to production release, run: node scripts/cleanup-test-data.mjs --purge)');
  }
}

inspectAndOptionallyCleanTestData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
