import prisma from "@/lib/prisma-db";
import { headers } from "next/headers";

export interface ChatAuditEntry {
  conversationId?: string | null;
  actorId?: string | null;
  action:
    | "channel_create"
    | "participant_added"
    | "participant_removed"
    | "message_sent"
    | "message_read"
    | "attachment_download"
    | "chat_export";
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Records an immutable audit log entry for HIPAA Security Rule compliance (§ 164.312(b)).
 * Asynchronous, fail-safe so operational errors do not break user chat flows.
 */
export async function recordChatAudit(entry: ChatAuditEntry): Promise<void> {
  try {
    let resolvedIp = entry.ipAddress;
    let resolvedUa = entry.userAgent;

    // In Server Actions or Route Handlers, extract from headers if not explicitly passed
    if (!resolvedIp || !resolvedUa) {
      try {
        const headerList = await headers();
        resolvedIp =
          resolvedIp ||
          headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          headerList.get("x-real-ip") ||
          null;
        resolvedUa = resolvedUa || headerList.get("user-agent") || null;
      } catch {
        // Headers might be unavailable in background tasks / standalone scripts
      }
    }

    await prisma.chat_audit_logs.create({
      data: {
        conversation_id: entry.conversationId || null,
        actor_id: entry.actorId || null,
        action: entry.action,
        ip_address: resolvedIp,
        user_agent: resolvedUa,
        metadata: (entry.metadata || {}) as any,
      },
    });
  } catch (error) {
    // Retain failure logging in server stderr without throwing to user
    console.error("[HIPAA Audit Log Failure]", error);
  }
}
