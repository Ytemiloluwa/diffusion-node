import { PrismaClient, Role, PolicyStatus } from '@prisma/client';
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

  // 3. Policy, Jurisdiction, and Timeline
  const restriction = await prisma.restrictionType.create({
    data: {
      name: 'Entity List',
      description: 'Companies added to the Entity List.'
    }
  });

  const policy = await prisma.policy.create({
    data: {
      title: 'Export Controls on Semiconductor Manufacturing',
      summary: 'Restricts advanced chips to certain regions.',
      status: PolicyStatus.ACTIVE,
      controlNumber: 'BIS-2023-001',
      effectiveDate: new Date(),
    }
  });

  const jurisdiction = await prisma.jurisdiction.create({
    data: {
      policyId: policy.id,
      countryId: us.id,
      restrictionTypeId: restriction.id,
    }
  });

  const timelineEvent = await prisma.timelineEvent.create({
    data: {
      policyId: policy.id,
      eventDate: new Date(),
      eventType: 'Initial Publication',
      description: 'Policy was officially published.'
    }
  });

  console.log('Created policy, jurisdiction, and timeline data.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
