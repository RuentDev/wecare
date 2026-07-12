const { PrismaClient } = require('./lib/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.services.deleteMany({});
  console.log(`Successfully deleted ${result.count} services from the database.`);
}

main()
  .catch((e) => {
    console.error("Error deleting services:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
