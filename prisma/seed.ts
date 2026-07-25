import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');
  
  const hashedPassword = await bcrypt.hash('SecurePass123!', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@miva.edu' },
    update: {},
    create: {
      email: 'admin@miva.edu',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'ADMIN',
    },
  });
  console.log('Seeded Super Admin:', admin.email);

  const categories = [
    { name: 'Plumbing', description: 'Water, pipes, and leaks' },
    { name: 'Electrical', description: 'Lights, power outlets, and wiring' },
    { name: 'Internet/WiFi', description: 'Network and connectivity issues' },
    { name: 'Furniture', description: 'Beds, desks, and chairs' }
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log('Seeded Categories');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
