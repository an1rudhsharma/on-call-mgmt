import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Users
  const alice = await prisma.user.create({
    data: {
      name: 'Alice DevOps',
      email: 'alice@example.com',
      phone: '+15550100'
    }
  });

  const bob = await prisma.user.create({
    data: {
      name: 'Bob SRE',
      email: 'bob@example.com',
      phone: '+15550101'
    }
  });

  // Create Escalation Policy
  const policy = await prisma.escalationPolicy.create({
    data: {
      name: 'Default DevOps Policy',
      steps: {
        create: [
          {
            order: 1,
            delayUsers: 0,
            userId: alice.id
          },
          {
            order: 2,
            delayUsers: 15,
            userId: bob.id
          }
        ]
      }
    }
  });

  // Create Service
  const service = await prisma.service.create({
    data: {
      name: 'Payment API',
      policyId: policy.id
    }
  });

  console.log('Seeding finished.');
  console.log(`Created Service: ${service.name} with Policy: ${policy.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
