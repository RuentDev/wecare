import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "./generated/prisma";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const globalForPrisma = global as unknown as { prisma_v4: PrismaClient };

const connectionString = process.env.DATABASE_URL!;

const poolConfig = { connectionString };
const adapter = new PrismaNeon(poolConfig);

function getPrismaClient(): PrismaClient {
  if (
    globalForPrisma.prisma_v4 &&
    (globalForPrisma.prisma_v4 as unknown as { chat_conversations?: unknown })
      .chat_conversations
  ) {
    return globalForPrisma.prisma_v4;
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

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma_v4 = prisma;

export default prisma;

// Force reload for schema update: 2026-10-17 14:46 - Realtime Messaging chat_conversations
