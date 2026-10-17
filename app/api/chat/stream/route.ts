import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { verifyConversationAccess } from "@/lib/services/chat-authorization";
import { subscribeToChatChannel } from "@/lib/realtime-pubsub";

export const dynamic = "force-dynamic";

/**
 * Realtime Server-Sent Events (SSE) Stream Endpoint.
 * Enables zero-dependency live updates over HTTPS TLS 1.3.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    return new Response("Missing conversationId parameter", { status: 400 });
  }

  // 1. Session token validation
  const sessionToken = req.cookies.get("session_token")?.value;
  if (!sessionToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const session = await getSession(sessionToken);
  if (!session || !session.user || session.user.is_guest) {
    return new Response("Forbidden: Guest or invalid session", { status: 403 });
  }

  // 2. Authorization check
  const participant = await verifyConversationAccess(session.user.id, conversationId);
  if (!participant && session.user.role !== "admin") {
    return new Response("Forbidden: Not a participant", { status: 403 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection ack
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "CONNECTION_ACK", serverTime: new Date().toISOString() })}\n\n`)
      );

      // Subscribe to pubsub channel
      const unsubscribe = subscribeToChatChannel(conversationId, (event) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          unsubscribe();
        }
      });

      // Keepalive heartbeat every 25 seconds
      const heartbeatTimer = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeatTimer);
          unsubscribe();
        }
      }, 25000);

      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeatTimer);
        unsubscribe();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
