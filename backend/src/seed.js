const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      nama: 'Administrator',
      role: 'ADMIN'
    }
  });

  console.log('Seed selesai! Login: admin / admin123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
