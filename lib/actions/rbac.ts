"use server";

import { prisma } from "@/lib/prisma-db";
import { protectedPrisma } from "@/lib/protected-prisma";
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
          roles: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  });
};

const getCachedUsers = unstable_cache(
  async () => fetchUsers(),
  ["users-list"],
  { tags: ["users"] },
);

/**
 * Fetches all users with their associated roles.
 */
export async function getUsers() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  // Ensure user has permission to view users
  await requirePermission(user.id, "users:view");

  return await getCachedUsers();
}

/**
 * Updates a user's roles.
 */
export async function updateUserRoles(userId: string, roleIds: string[]) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await requirePermission(user.id, "users:edit");

  // Transactions are not fully supported in Neon serverless via standard Prisma
  // but for simple deletes and inserts it's usually fine or we can use raw SQL if needed.
  // Here we use Prisma's $transaction if supported by the adapter.

  await prisma.$transaction([
    prisma.user_roles.deleteMany({ where: { user_id: userId } }),
    prisma.user_roles.createMany({
      data: roleIds.map((roleId) => ({
        user_id: userId,
        role_id: roleId,
      })),
    }),
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
          permissions: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });
};

const getCachedRoles = unstable_cache(
  async () => fetchRoles(),
  ["roles-list"],
  { tags: ["roles"] },
);

/**
 * Fetches all roles with their associated permissions.
 */
export async function getRoles() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  // Optional: Add a specific permission for viewing roles if needed
  await requirePermission(user.id, "roles:manage");

  return await getCachedRoles();
}

/**
 * Fetches all available permissions.
 */
export async function getPermissions() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  return await protectedPrisma.permissions.findMany({
    orderBy: { name: "asc" },
  });
}

/**
 * Updates a role's permissions.
 */
export async function updateRolePermissions(
  roleId: string,
  permissionIds: string[],
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await requirePermission(user.id, "roles:manage");

  await prisma.$transaction([
    prisma.role_permissions.deleteMany({ where: { role_id: roleId } }),
    prisma.role_permissions.createMany({
      data: permissionIds.map((permId) => ({
        role_id: roleId,
        permission_id: permId,
      })),
    }),
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
  await requirePermission(user.id, "users:edit");

  await protectedPrisma.users.update({
    where: { id: userId },
    data: { is_active: isActive },
  });

  revalidateTag("users", "default");
  revalidatePath("/admin/users");
  return { success: true };
}

/**
 * Fetches a single user by ID with their roles.
 */
export async function getUserById(userId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");
  await requirePermission(currentUser.id, "users:view");

  return await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      first_name: true,
      last_name: true,
      phone: true,
      role: true,
      is_active: true,
      avatar_url: true,
      gender: true,
      date_of_birth: true,
      street: true,
      city: true,
      state: true,
      postal_code: true,
      user_roles: {
        include: {
          roles: true,
        },
      },
    },
  });
}

/**
 * Admin action to update user details.
 */
export async function adminUpdateUser(userId: string, data: any) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");
  await requirePermission(currentUser.id, "users:edit");

  const updatedUser = await protectedPrisma.users.update({
    where: { id: userId },
    data: {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      is_active: data.is_active,
    },
  });

  // Sync with RBAC roles if system role changed
  const roleRecord = await prisma.roles.findUnique({
    where: { name: data.role },
  });

  if (roleRecord) {
    // For simplicity, we just ensure they have this role in user_roles
    // In a more complex system, we might manage this differently
    const existing = await prisma.user_roles.findUnique({
      where: { user_id_role_id: { user_id: userId, role_id: roleRecord.id } },
    });

    if (!existing) {
      await prisma.user_roles.create({
        data: { user_id: userId, role_id: roleRecord.id },
      });
    }
  }

  revalidateTag("users", "default");
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { success: true, user: updatedUser };
}

/**
 * Admin action to create a new user.
 */
export async function adminCreateUser(data: any) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");
  await requirePermission(currentUser.id, "users:edit");

  // We reuse the auth createUser which handles hashing and RBAC sync
  const { createUser: authCreateUser } = await import("@/lib/auth");

  const newUser = await authCreateUser({
    email: data.email,
    password: data.password || "ChangeMe123!", // Default password
    first_name: data.first_name,
    last_name: data.last_name,
    phone: data.phone,
    role: data.role,
  });

  revalidateTag("users", "default");
  revalidatePath("/admin/users");
  return { success: true, user: newUser };
}

/**
 * Admin action to set a new password for a user.
 * Invalidates all active sessions.
 */
export async function adminSetUserPassword(
  userId: string,
  newPassword: string,
) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");
  await requirePermission(currentUser.id, "users:edit");

  const { hashPassword, deleteAllUserSessions } = await import("@/lib/auth");

  // Kill all active sessions so the user is immediately signed out
  await deleteAllUserSessions(userId);

  const passwordHash = await hashPassword(newPassword);

  await protectedPrisma.users.update({
    where: { id: userId },
    data: { password_hash: passwordHash },
  });

  revalidatePath(`/admin/users/${userId}`);
  return { success: true };
}
