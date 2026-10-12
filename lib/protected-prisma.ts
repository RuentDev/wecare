import { prisma } from "@/lib/prisma-db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission, Permission } from "@/lib/rbac";

/**
 * Maps Prisma model methods to required permissions.
 */
const PERMISSION_MAPPING: Record<string, Record<string, Permission>> = {
  users: {
    findMany: "users:read",
    findUnique: "users:read",
    findFirst: "users:read",
    count: "users:read",
    create: "users:create",
    update: "users:update",
    delete: "users:delete",
    upsert: "users:update",
    updateMany: "users:update",
    deleteMany: "users:delete",
  },
  appointments: {
    findMany: "appointments:read",
    findUnique: "appointments:read",
    findFirst: "appointments:read",
    create: "appointments:create",
    update: "appointments:update",
    delete: "appointments:delete",
  },
  medical_records: {
    findMany: "medical_records:read",
    findUnique: "medical_records:read",
    findFirst: "medical_records:read",
    create: "medical_records:create",
    update: "medical_records:update",
    delete: "medical_records:delete",
  },
  billing: {
    findMany: "billing:read",
    findUnique: "billing:read",
    findFirst: "billing:read",
    create: "billing:create",
    update: "billing:update",
    delete: "billing:delete",
  },
  roles: {
    findMany: "roles:read",
    findUnique: "roles:read",
    create: "roles:create",
    update: "roles:update",
    delete: "roles:delete",
  },
  permissions: {
    findMany: "roles:read",
  },
};

/**
 * A Proxy wrapper for Prisma that enforces RBAC permissions.
 * Use this instead of the raw prisma client for operations that require security.
 */
export const protectedPrisma = new Proxy(prisma, {
  get(target: any, modelName: string) {
    const model = target[modelName];

    // Only proxy objects (models) and avoid internal Prisma properties (starting with $)
    if (!model || typeof model !== "object" || modelName.startsWith("$")) {
      return model;
    }

    return new Proxy(model, {
      get(modelTarget, methodName: string) {
        const originalMethod = modelTarget[methodName];

        // Only proxy functions (model methods like findMany, create, etc.)
        if (typeof originalMethod !== "function") {
          return originalMethod;
        }

        return async (...args: any[]) => {
          const requiredPermission = PERMISSION_MAPPING[modelName]?.[methodName];

          if (requiredPermission) {
            const user = await getCurrentUser();

            if (!user) {
              throw new Error("Authentication required to access this resource.");
            }

            const allowed = await hasPermission(user.id, requiredPermission);

            if (!allowed) {
              console.warn(
                `Access denied for user ${user.id} on ${modelName}.${methodName}. Required: ${requiredPermission}`,
              );
              throw new Error(
                `Forbidden: You do not have permission (${requiredPermission}) to perform this action.`,
              );
            }
          }

          // Execute the original Prisma method
          return originalMethod.apply(modelTarget, args);
        };
      },
    });
  },
});

export default protectedPrisma;
