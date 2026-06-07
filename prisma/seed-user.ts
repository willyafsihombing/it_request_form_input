// scripts/seed-user.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin@123', 12);

  const user = await prisma.user.upsert({
    where: { emailAddrs: 'admin@ungguldinamika.com' },
    update: {},
    create: {
      emailAddrs:       'admin@ungguldinamika.com',
      userName:    'admin',
      fullName: 'Administrator',
      role:        'admin',
      department:  'IT',
      titleUser:       'IT Administrator',
      passwordHash,
    },
  });

  console.log('✅ User created:', user.email);
}

main()
  .finally(() => prisma.$disconnect());