const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAdmin() {
  const admin = await prisma.user.create({
    data: {
      name: 'todoAdmin',
      email: 'abc@mail.com',
      password: 'Abc@1234',
      role: 'Admin',
    },
  });
  console.log('Admin created:', admin);
}

async function main() {
  await createAdmin();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });