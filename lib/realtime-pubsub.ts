import { EventEmitter } from "events";
import { WebSocketServerEvent } from "@/types/chat";
import { getPusherServer } from "@/lib/pusher/server";

declare global {
  // eslint-disable-next-line no-var
  var __wecare_chat_bus__: EventEmitter | undefined;
}

const memoryBus = global.__wecare_chat_bus__ || new EventEmitter();
if (process.env.NODE_ENV !== "production") {
  global.__wecare_chat_bus__ = memoryBus;
}

// Set maximum listeners to accommodate high concurrent thread fanouts
memoryBus.setMaxListeners(10000);

/**
 * Publishes a realtime chat event to all interested subscribers.
 * In serverless production environments (such as Vercel), dispatches
 * through Pusher Channels via REST API across isolated Lambda containers.
 * Concurrently emits to the local in-memory event bus.
 */
export async function publishChatEvent(
  conversationId: string,
  event: WebSocketServerEvent
): Promise<void> {
  const memoryChannel = `chat:conv:${conversationId}`;
  const pusherChannel = `chat-conv-${conversationId}`;

  // 1. Broadcast to in-memory bus (for local dev and background servers)
  memoryBus.emit(memoryChannel, event);
  memoryBus.emit("chat:global", { channel: memoryChannel, event });

  // 2. Broadcast via Pusher Channels for Vercel Serverless cross-container delivery
  const pusher = getPusherServer();
  if (pusher) {
    try {
      await pusher.trigger(pusherChannel, event.type, event);
    } catch (err: unknown) {
      console.error("[Pusher Serverless Dispatch Error]:", err);
    }
  }
}

/**
 * Subscribes to conversation events.
 * Returns an unsubscribe callback.
 */
export function subscribeToChatChannel(
  conversationId: string,
  handler: (event: WebSocketServerEvent) => void
): () => void {
  const channel = `chat:conv:${conversationId}`;
  memoryBus.on(channel, handler);

  return () => {
    memoryBus.off(channel, handler);
  };
}

/**
 * Subscribes to all global chat events (used by the WebSocket gateway server).
 */
export function subscribeToGlobalEvents(
  handler: (payload: { channel: string; event: WebSocketServerEvent }) => void
): () => void {
  memoryBus.on("chat:global", handler);

  return () => {
    memoryBus.off("chat:global", handler);
  };
}
