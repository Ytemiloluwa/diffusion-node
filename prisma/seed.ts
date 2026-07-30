import { PrismaClient, Role } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding...');

  // 1. Demo Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@diffusion.com',
      passwordHash: 'hashed_password_placeholder',
      role: Role.ADMIN,
    },
  });

  const dev = await prisma.user.create({
    data: {
      email: 'dev@diffusion.com',
      passwordHash: 'hashed_password_placeholder',
      role: Role.DEVELOPER,
    },
  });

  // 2. Companies & Countries
  const us = await prisma.country.create({
    data: {
      name: 'United States',
      isoCode: 'US',
    }
  });

  const company = await prisma.company.create({
    data: {
      name: 'Acme Corp',
      hqCountryId: us.id,
      entityListStatus: 'Entity List',
    }
  });

  console.log('Created basic users, companies, and countries.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
