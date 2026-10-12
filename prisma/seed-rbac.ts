import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../lib/generated/prisma/index.js";
import ws from "ws";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL!;
const poolConfig = { connectionString };
const adapter = new PrismaNeon(poolConfig);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding Roles and Granular CRUD Permissions...");

  const rolesList = [
    { name: "admin", description: "Full access to the system" },
    { name: "doctor", description: "Manage patients and medical records" },
    { name: "nurse", description: "View patients and assist in appointments" },
    { name: "staff", description: "Manage scheduling and billing" },
    { name: "patient", description: "View own records and schedule appointments" },
  ];

  const permissionsList = [
    // Appointments
    { name: "appointments:create", description: "Can schedule and create new appointments" },
    { name: "appointments:read", description: "Can view appointments and booking details" },
    { name: "appointments:update", description: "Can edit, reschedule, or change appointment status" },
    { name: "appointments:delete", description: "Can cancel or remove appointments" },

    // Articles
    { name: "articles:create", description: "Can draft and publish health articles" },
    { name: "articles:read", description: "Can view published articles and blogs" },
    { name: "articles:update", description: "Can edit and revise existing articles" },
    { name: "articles:delete", description: "Can unpublish or delete articles" },

    // Billing
    { name: "billing:create", description: "Can generate invoices and record billing items" },
    { name: "billing:read", description: "Can view invoices, payment logs, and billing reports" },
    { name: "billing:update", description: "Can modify invoices and update payment statuses" },
    { name: "billing:delete", description: "Can void or delete invoices and payment records" },

    // Locations
    { name: "locations:create", description: "Can add new clinic branches and locations" },
    { name: "locations:read", description: "Can view clinic facilities and location details" },
    { name: "locations:update", description: "Can edit branch hours, address, and facility info" },
    { name: "locations:delete", description: "Can remove clinic branches and locations" },

    // Medical Records
    { name: "medical_records:create", description: "Can create patient consultation and medical records" },
    { name: "medical_records:read", description: "Can view patient medical history and charts" },
    { name: "medical_records:update", description: "Can update clinical notes, diagnoses, and vitals" },
    { name: "medical_records:delete", description: "Can archive or delete medical entries" },

    // Promotions
    { name: "promotions:create", description: "Can create promotional discounts and vouchers" },
    { name: "promotions:read", description: "Can view active promotions and discount codes" },
    { name: "promotions:update", description: "Can edit promotional terms and validity dates" },
    { name: "promotions:delete", description: "Can expire or delete promotions" },

    // Users
    { name: "users:create", description: "Can register new user accounts (patients/staff)" },
    { name: "users:read", description: "Can view user profiles and account directories" },
    { name: "users:update", description: "Can modify user profiles, credentials, and roles" },
    { name: "users:delete", description: "Can deactivate or permanently remove user accounts" },

    // Roles
    { name: "roles:create", description: "Can create custom system roles" },
    { name: "roles:read", description: "Can view roles and permissions configuration" },
    { name: "roles:update", description: "Can configure role permission assignments" },
    { name: "roles:delete", description: "Can delete custom system roles" },
    { name: "roles:manage", description: "Full administrative access to manage all roles & permissions" },
  ];

  // 1. Create or Update Roles
  for (const role of rolesList) {
    await prisma.roles.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }

  // 2. Upsert Granular Permissions
  for (const perm of permissionsList) {
    await prisma.permissions.upsert({
      where: { name: perm.name },
      update: { description: perm.description },
      create: perm,
    });
  }

  // 3. Remove obsolete legacy permissions (:view, :edit) that are superseded
  const validPermissionNames = new Set(permissionsList.map((p) => p.name));
  const existingPermissions = await prisma.permissions.findMany();
  for (const p of existingPermissions) {
    if (!validPermissionNames.has(p.name)) {
      console.log(`Removing obsolete permission: ${p.name}`);
      await prisma.permissions.delete({ where: { id: p.id } });
    }
  }

  // 4. Map Permissions to Roles
  const allPermissions = await prisma.permissions.findMany();
  const permMap = new Map<string, string>(allPermissions.map((p) => [p.name, p.id]));

  const adminRole = await prisma.roles.findUnique({ where: { name: "admin" } });
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

  // Doctor permissions mapping
  const doctorRole = await prisma.roles.findUnique({ where: { name: "doctor" } });
  if (doctorRole) {
    const doctorPermNames = [
      "appointments:read",
      "appointments:update",
      "medical_records:create",
      "medical_records:read",
      "medical_records:update",
      "articles:read",
      "locations:read",
      "promotions:read",
      "users:read",
    ];
    for (const name of doctorPermNames) {
      const permId = permMap.get(name);
      if (permId) {
        await prisma.role_permissions.upsert({
          where: {
            role_id_permission_id: {
              role_id: doctorRole.id,
              permission_id: permId,
            },
          },
          update: {},
          create: {
            role_id: doctorRole.id,
            permission_id: permId,
          },
        });
      }
    }
  }

  // Nurse permissions mapping
  const nurseRole = await prisma.roles.findUnique({ where: { name: "nurse" } });
  if (nurseRole) {
    const nursePermNames = [
      "appointments:read",
      "medical_records:read",
      "medical_records:update",
      "locations:read",
      "users:read",
    ];
    for (const name of nursePermNames) {
      const permId = permMap.get(name);
      if (permId) {
        await prisma.role_permissions.upsert({
          where: {
            role_id_permission_id: {
              role_id: nurseRole.id,
              permission_id: permId,
            },
          },
          update: {},
          create: {
            role_id: nurseRole.id,
            permission_id: permId,
          },
        });
      }
    }
  }

  // Staff permissions mapping
  const staffRole = await prisma.roles.findUnique({ where: { name: "staff" } });
  if (staffRole) {
    const staffPermNames = [
      "appointments:create",
      "appointments:read",
      "appointments:update",
      "appointments:delete",
      "billing:create",
      "billing:read",
      "billing:update",
      "promotions:read",
      "locations:read",
      "users:read",
    ];
    for (const name of staffPermNames) {
      const permId = permMap.get(name);
      if (permId) {
        await prisma.role_permissions.upsert({
          where: {
            role_id_permission_id: {
              role_id: staffRole.id,
              permission_id: permId,
            },
          },
          update: {},
          create: {
            role_id: staffRole.id,
            permission_id: permId,
          },
        });
      }
    }
  }

  // Patient permissions mapping
  const patientRole = await prisma.roles.findUnique({ where: { name: "patient" } });
  if (patientRole) {
    const patientPermNames = [
      "appointments:create",
      "appointments:read",
      "medical_records:read",
      "billing:read",
      "articles:read",
      "locations:read",
      "promotions:read",
    ];
    for (const name of patientPermNames) {
      const permId = permMap.get(name);
      if (permId) {
        await prisma.role_permissions.upsert({
          where: {
            role_id_permission_id: {
              role_id: patientRole.id,
              permission_id: permId,
            },
          },
          update: {},
          create: {
            role_id: patientRole.id,
            permission_id: permId,
          },
        });
      }
    }
  }

  // 5. Migrate Existing Users
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
