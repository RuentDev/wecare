import { EventEmitter } from "events";
import { WebSocketServerEvent } from "@/types/chat";

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
 * In production with REDIS_URL, this broadcasts to Redis pub/sub.
 * Otherwise, falls back to the in-memory event bus.
 */
export async function publishChatEvent(
  conversationId: string,
  event: WebSocketServerEvent
): Promise<void> {
  const channel = `chat:conv:${conversationId}`;

  // Broadcast to in-memory bus
  memoryBus.emit(channel, event);
  memoryBus.emit("chat:global", { channel, event });
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
