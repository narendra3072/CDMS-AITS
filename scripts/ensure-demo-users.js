process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:D:/CDMS-main/db/custom.db';

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.count();
  if (existing > 0) {
    console.log(`Users already exist (${existing}).`);
    return;
  }

  const hash = (value) => bcrypt.hash(value, 10);

  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@example.com',
      password: await hash('admin123'),
      name: 'Admin',
      role: 'admin',
      isActive: true,
    },
  });

  const faculty = await prisma.user.create({
    data: {
      username: 'udaykumar',
      email: 'udaykumar@example.com',
      password: await hash('udaykumar123'),
      name: 'Uday Kumar',
      role: 'faculty',
      isActive: true,
    },
  });

  const student = await prisma.user.create({
    data: {
      username: 'narasimha',
      email: 'narasimha@example.com',
      password: await hash('narasimha123'),
      name: 'Narasimha',
      role: 'student',
      isActive: true,
    },
  });

  console.log('Created demo accounts:', { admin, faculty, student });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
