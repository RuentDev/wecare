import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "./generated/prisma";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const globalForPrisma = global as unknown as { prisma_v3: PrismaClient };

const connectionString = process.env.DATABASE_URL!;

const poolConfig = { connectionString };
const adapter = new PrismaNeon(poolConfig);

function getPrismaClient(): PrismaClient {
  if (
    globalForPrisma.prisma_v3 &&
    (globalForPrisma.prisma_v3 as unknown as { doctor_leave_requests?: unknown })
      .doctor_leave_requests
  ) {
    return globalForPrisma.prisma_v3;
  }
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma = getPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma_v3 = prisma;

export default prisma;

// Force reload for schema update: 2026-10-11 21:15
