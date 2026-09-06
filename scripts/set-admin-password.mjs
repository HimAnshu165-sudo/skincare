import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function setPassword() {
  const email = process.argv[2] || 'hu98@gmail.com';
  const newPassword = process.argv[3] || 'Admin@1234';

  const hash = await bcrypt.hash(newPassword, 10);
  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      password: hash,
      role: 'ADMIN',
    },
  });

  console.log(`Updated user ${updatedUser.email}:`);
  console.log(`- Role: ${updatedUser.role}`);
  console.log(`- New Password: ${newPassword}`);
}

setPassword()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
