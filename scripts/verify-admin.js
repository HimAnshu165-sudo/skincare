const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function run() {
  // Reset admin@velyra.in with known plain text password
  const newHash = await bcrypt.hash('Admin123!', 10);
  const mfaHash = await bcrypt.hash('123456', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@velyra.in' },
    update: {
      password: newHash,
      role: 'ADMIN',
      adminMfaPin: mfaHash,
    },
    create: {
      name: 'Velyra Store Admin',
      email: 'admin@velyra.in',
      password: newHash,
      phone: '9876543210',
      role: 'ADMIN',
      adminMfaPin: mfaHash,
    },
  });

  console.log('✅ Admin account ensured in Neon PostgreSQL:');
  console.log('ID:', admin.id);
  console.log('Email:', admin.email);
  console.log('Role:', admin.role);

  const testMatch = await bcrypt.compare('Admin123!', admin.password);
  console.log('Password test match (Admin123!):', testMatch);
}

run()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
