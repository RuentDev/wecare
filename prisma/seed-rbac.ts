import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../lib/generated/prisma/index.js";
import ws from "ws";
import dotenv from "dotenv";

dotenv.config();

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL!;
const poolConfig = { connectionString };
const adapter = new PrismaNeon(poolConfig);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding Roles and Permissions...");

  const rolesList = [
    { name: "admin", description: "Full access to the system" },
    { name: "doctor", description: "Manage patients and medical records" },
    { name: "nurse", description: "View patients and assist in appointments" },
    { name: "staff", description: "Manage scheduling and billing" },
    { name: "patient", description: "View own records and schedule appointments" },
  ];

  const permissionsList = [
    { name: "users:view", description: "Can view user list" },
    { name: "users:edit", description: "Can edit user roles" },
    { name: "appointments:view", description: "Can view appointments" },
    { name: "appointments:edit", description: "Can create/edit appointments" },
    { name: "medical_records:view", description: "Can view medical records" },
    { name: "medical_records:edit", description: "Can edit medical records" },
    { name: "billing:view", description: "Can view invoices and payments" },
    { name: "billing:edit", description: "Can manage billing" },
    { name: "roles:manage", description: "Can manage roles and permissions" },
    { name: "promotions:view", description: "Can view promotions" },
    { name: "promotions:edit", description: "Can manage promotions" },
    { name: "articles:view", description: "Can view articles" },
    { name: "articles:edit", description: "Can manage articles" },
    { name: "locations:view", description: "Can view locations" },
    { name: "locations:edit", description: "Can manage locations" },
  ];

  // 1. Create Roles
  for (const role of rolesList) {
    await prisma.roles.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }

  // 2. Create Permissions
  for (const perm of permissionsList) {
    await prisma.permissions.upsert({
      where: { name: perm.name },
      update: { description: perm.description },
      create: perm,
    });
  }

  // 3. Map Permissions to Roles
  const adminRole = await prisma.roles.findUnique({ where: { name: "admin" } });
  const allPermissions = await prisma.permissions.findMany();

  if (adminRole) {
    for (const perm of allPermissions) {
      await prisma.role_permissions.upsert({
        where: {
          role_id_permission_id: {
            role_id: adminRole.id,
            permission_id: perm.id,
          },
        },
        update: {},
        create: {
          role_id: adminRole.id,
          permission_id: perm.id,
        },
      });
    }
  }

  // 4. Migrate Existing Users
  console.log("Migrating existing users...");
  const users = await prisma.users.findMany();
  
  for (const user of users) {
    if (user.role) {
      const role = await prisma.roles.findUnique({ where: { name: user.role } });
      if (role) {
        await prisma.user_roles.upsert({
          where: {
            user_id_role_id: {
              user_id: user.id,
              role_id: role.id,
            },
          },
          update: {},
          create: {
            user_id: user.id,
            role_id: role.id,
          },
        });
      }
    }
  }

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
