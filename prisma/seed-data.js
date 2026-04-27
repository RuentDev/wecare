const { Pool, neonConfig } = require("@neondatabase/serverless");
const { PrismaNeon } = require("@prisma/adapter-neon");
const { PrismaClient } = require("../lib/generated/prisma");
const ws = require("ws");
const dotenv = require("dotenv");

dotenv.config();

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
const poolConfig = { connectionString };
const adapter = new PrismaNeon(poolConfig);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding Doctors, Services, and Locations...");

  // 1. Create a Location
  const locationId = "00000000-0000-0000-0000-000000000001";
  const location = await prisma.locations.upsert({
    where: { id: locationId },
    update: {},
    create: {
      id: locationId,
      name: "WeCare Clinic - Main",
      address: "123 Healthcare Ave",
      city: "Olongapo",
      state: "Zambales",
      postal_code: "2200",
      country: "Philippines",
      phone: "+63 912 345 6789",
      email: "main@wecare.com",
    },
  });

  // 2. Create Services
  const service1Id = "00000000-0000-0000-0000-000000000001";
  await prisma.services.upsert({
    where: { id: service1Id },
    update: {},
    create: {
      id: service1Id,
      name: "General Consultation",
      description: "Standard health checkup",
      duration_minutes: 30,
      price: 500,
      category: "General",
    },
  });

  const service2Id = "00000000-0000-0000-0000-000000000002";
  await prisma.services.upsert({
    where: { id: service2Id },
    update: {},
    create: {
      id: service2Id,
      name: "Specialist Consultation",
      description: "Consultation with a specialist",
      duration_minutes: 45,
      price: 1000,
      category: "Specialist",
    },
  });

  // 3. Create a Doctor User
  const doctorEmail = "doctor1@wecare.com";
  const doctorUser = await prisma.users.upsert({
    where: { email: doctorEmail },
    update: {},
    create: {
      email: doctorEmail,
      password_hash: "SECRET", // Placeholder
      first_name: "Sarah",
      last_name: "Chen",
      role: "doctor",
    },
  });

  // 4. Create Doctor record
  const doctor1Id = "00000000-0000-0000-0000-000000000001";
  await prisma.doctors.upsert({
    where: { id: doctor1Id },
    update: {
      user_id: doctorUser.id,
      location_id: location.id,
    },
    create: {
      id: doctor1Id,
      user_id: doctorUser.id,
      location_id: location.id,
      specialization: "IM",
      consultation_fee: 500,
      bio: "Experienced internal medicine specialist.",
    },
  });

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
