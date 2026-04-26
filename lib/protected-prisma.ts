import { prisma } from "@/lib/prisma-db";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission, Permission } from "@/lib/rbac";

/**
 * Maps Prisma model methods to required permissions.
 */
const PERMISSION_MAPPING: Record<string, Record<string, Permission>> = {
  users: {
    findMany: "users:view",
    findUnique: "users:view",
    findFirst: "users:view",
    count: "users:view",
    create: "users:edit",
    update: "users:edit",
    delete: "users:edit",
    upsert: "users:edit",
    updateMany: "users:edit",
    deleteMany: "users:edit",
  },
  appointments: {
    findMany: "appointments:view",
    findUnique: "appointments:view",
    findFirst: "appointments:view",
    create: "appointments:edit",
    update: "appointments:edit",
    delete: "appointments:edit",
  },
  medical_records: {
    findMany: "medical_records:view",
    findUnique: "medical_records:view",
    findFirst: "medical_records:view",
    create: "medical_records:edit",
    update: "medical_records:edit",
    delete: "medical_records:edit",
  },
  billing: {
    findMany: "billing:view",
    findUnique: "billing:view",
    findFirst: "billing:view",
    create: "billing:edit",
    update: "billing:edit",
    delete: "billing:edit",
  },
  roles: {
    findMany: "roles:manage",
    findUnique: "roles:manage",
    create: "roles:manage",
    update: "roles:manage",
    delete: "roles:manage",
  },
  permissions: {
    findMany: "roles:manage",
  }
};

/**
 * A Proxy wrapper for Prisma that enforces RBAC permissions.
 * Use this instead of the raw prisma client for operations that require security.
 */
export const protectedPrisma = new Proxy(prisma, {
  get(target: any, modelName: string) {
    const model = target[modelName];
    
    // Only proxy objects (models) and avoid internal Prisma properties (starting with $)
    if (!model || typeof model !== 'object' || modelName.startsWith('$')) {
      return model;
    }

    return new Proxy(model, {
      get(modelTarget, methodName: string) {
        const originalMethod = modelTarget[methodName];
        
        // Only proxy functions (model methods like findMany, create, etc.)
        if (typeof originalMethod !== 'function') {
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
              console.warn(`Access denied for user ${user.id} on ${modelName}.${methodName}. Required: ${requiredPermission}`);
              throw new Error(`Forbidden: You do not have permission (${requiredPermission}) to perform this action.`);
            }
          }

          // Execute the original Prisma method
          return originalMethod.apply(modelTarget, args);
        };
      }
    });
  }
});

export default protectedPrisma;
