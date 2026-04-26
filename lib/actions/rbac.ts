"use server";

import { prisma } from "@/lib/prisma-db";
import { revalidatePath, unstable_cache, revalidateTag } from "next/cache";
import { requirePermission } from "@/lib/rbac";
import { getCurrentUser } from "@/lib/auth";

/**
 * Fetches all users from DB (Internal use for caching)
 */
const fetchUsers = async () => {
  return await prisma.users.findMany({
    select: {
      id: true,
      email: true,
      first_name: true,
      last_name: true,
      role: true,
      is_active: true,
      user_roles: {
        include: {
          roles: true
        }
      }
    },
    orderBy: { created_at: "desc" }
  });
};

const getCachedUsers = unstable_cache(
  async () => fetchUsers(),
  ["users-list"],
  { tags: ["users"] }
);

/**
 * Fetches all users with their associated roles.
 */
export async function getUsers() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  
  return await getCachedUsers();
}

/**
 * Updates a user's roles.
 */
export async function updateUserRoles(userId: string, roleIds: string[]) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  // await requirePermission(user.id, "users:edit");

  // Transactions are not fully supported in Neon serverless via standard Prisma
  // but for simple deletes and inserts it's usually fine or we can use raw SQL if needed.
  // Here we use Prisma's $transaction if supported by the adapter.
  
  await prisma.$transaction([
    prisma.user_roles.deleteMany({ where: { user_id: userId } }),
    prisma.user_roles.createMany({
      data: roleIds.map(roleId => ({
        user_id: userId,
        role_id: roleId
      }))
    })
  ]);

  revalidateTag("users", "default");
  revalidatePath("/admin/users");
  return { success: true };
}

/**
 * Fetches all roles from DB (Internal use for caching)
 */
const fetchRoles = async () => {
  return await prisma.roles.findMany({
    include: {
      role_permissions: {
        include: {
          permissions: true
        }
      }
    },
    orderBy: { name: "asc" }
  });
};

const getCachedRoles = unstable_cache(
  async () => fetchRoles(),
  ["roles-list"],
  { tags: ["roles"] }
);

/**
 * Fetches all roles with their associated permissions.
 */
export async function getRoles() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  return await getCachedRoles();
}

/**
 * Fetches all available permissions.
 */
export async function getPermissions() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  return await prisma.permissions.findMany({
    orderBy: { name: "asc" }
  });
}

/**
 * Updates a role's permissions.
 */
export async function updateRolePermissions(roleId: string, permissionIds: string[]) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  // await requirePermission(user.id, "roles:manage");

  await prisma.$transaction([
    prisma.role_permissions.deleteMany({ where: { role_id: roleId } }),
    prisma.role_permissions.createMany({
      data: permissionIds.map(permId => ({
        role_id: roleId,
        permission_id: permId
      }))
    })
  ]);

  revalidateTag("roles", "default");
  revalidatePath("/admin/settings/roles");
  return { success: true };
}

/**
 * Deactivates or Activates a user.
 */
export async function toggleUserStatus(userId: string, isActive: boolean) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  // await requirePermission(user.id, "users:edit");

  await prisma.users.update({
    where: { id: userId },
    data: { is_active: isActive }
  });

  revalidateTag("users", "default");
  revalidatePath("/admin/users");
  return { success: true };
}
