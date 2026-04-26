import { prisma } from "./prisma-db";

/**
 * Valid permission strings in the system.
 * These should match the names seeded in the database.
 */
export type Permission = 
  | "users:view"
  | "users:edit"
  | "appointments:view"
  | "appointments:edit"
  | "medical_records:view"
  | "medical_records:edit"
  | "billing:view"
  | "billing:edit"
  | "roles:manage";

/**
 * Fetches all unique permissions for a given user based on their roles.
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    const userRoles = await prisma.user_roles.findMany({
      where: { user_id: userId },
      include: {
        roles: {
          include: {
            role_permissions: {
              include: {
                permissions: true
              }
            }
          }
        }
      }
    });

    const permissions = new Set<string>();
    for (const ur of userRoles) {
      for (const rp of ur.roles.role_permissions) {
        permissions.add(rp.permissions.name);
      }
    }

    return Array.from(permissions);
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    return [];
  }
}

/**
 * Checks if a user has a specific permission.
 */
export async function hasPermission(userId: string, permission: Permission): Promise<boolean> {
  // Super Admin override could be added here
  const permissions = await getUserPermissions(userId);
  return permissions.includes(permission);
}

/**
 * Checks if a user has at least one of the provided permissions.
 */
export async function hasAnyPermission(userId: string, permissionsToCheck: Permission[]): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  return permissionsToCheck.some(p => permissions.includes(p));
}

/**
 * Utility to ensure a user has a permission, otherwise throws an error.
 * Useful for Server Components and Server Actions.
 */
export async function requirePermission(userId: string, permission: Permission) {
  const allowed = await hasPermission(userId, permission);
  if (!allowed) {
    throw new Error(`Forbidden: Missing permission ${permission}`);
  }
}
