import { prisma } from "./prisma-db";

/**
 * Valid permission strings in the system.
 * These match granular CRUD actions seeded in the database alongside legacy aliases.
 */
export type Permission =
  // Appointments
  | "appointments:create"
  | "appointments:read"
  | "appointments:update"
  | "appointments:delete"
  | "appointments:view"
  | "appointments:edit"
  // Articles
  | "articles:create"
  | "articles:read"
  | "articles:update"
  | "articles:delete"
  | "articles:view"
  | "articles:edit"
  // Billing
  | "billing:create"
  | "billing:read"
  | "billing:update"
  | "billing:delete"
  | "billing:view"
  | "billing:edit"
  // Locations
  | "locations:create"
  | "locations:read"
  | "locations:update"
  | "locations:delete"
  | "locations:view"
  | "locations:edit"
  // Medical Records
  | "medical_records:create"
  | "medical_records:read"
  | "medical_records:update"
  | "medical_records:delete"
  | "medical_records:view"
  | "medical_records:edit"
  // Promotions
  | "promotions:create"
  | "promotions:read"
  | "promotions:update"
  | "promotions:delete"
  | "promotions:view"
  | "promotions:edit"
  // Users
  | "users:create"
  | "users:read"
  | "users:update"
  | "users:delete"
  | "users:view"
  | "users:edit"
  // Roles
  | "roles:create"
  | "roles:read"
  | "roles:update"
  | "roles:delete"
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
                permissions: true,
              },
            },
          },
        },
      },
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
 * Resolves backward compatibility aliases between CRUD and legacy actions.
 */
export async function hasPermission(
  userId: string,
  permission: Permission,
): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  if (permissions.includes(permission)) return true;

  // Global manage fallback for administrative operations
  if (permissions.includes("roles:manage")) {
    return true;
  }

  // Fallback alias resolution for cross-compatibility
  const [resource, action] = permission.split(":");
  if (action === "view" && permissions.includes(`${resource}:read`)) {
    return true;
  }
  if (action === "read" && permissions.includes(`${resource}:view`)) {
    return true;
  }
  if (action === "edit") {
    if (
      permissions.includes(`${resource}:update`) ||
      permissions.includes(`${resource}:create`) ||
      permissions.includes(`${resource}:manage`)
    ) {
      return true;
    }
  }
  if (action === "update" && permissions.includes(`${resource}:edit`)) {
    return true;
  }
  if (permissions.includes(`${resource}:manage`)) {
    return true;
  }

  return false;
}

/**
 * Checks if a user has at least one of the provided permissions.
 */
export async function hasAnyPermission(
  userId: string,
  permissionsToCheck: Permission[],
): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  return permissionsToCheck.some((p) => {
    if (permissions.includes(p)) return true;
    const [resource, action] = p.split(":");
    if (action === "view" && permissions.includes(`${resource}:read`)) return true;
    if (action === "read" && permissions.includes(`${resource}:view`)) return true;
    if (
      action === "edit" &&
      (permissions.includes(`${resource}:update`) ||
        permissions.includes(`${resource}:create`))
    ) {
      return true;
    }
    return false;
  });
}

/**
 * Utility to ensure a user has a permission, otherwise throws an error.
 * Useful for Server Components and Server Actions.
 */
export async function requirePermission(
  userId: string,
  permission: Permission,
) {
  const allowed = await hasPermission(userId, permission);
  if (!allowed) {
    throw new Error(`Forbidden: Missing permission ${permission}`);
  }
}
