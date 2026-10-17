import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { subscribeToGlobalEvents, publishChatEvent } from "../lib/realtime-pubsub";
import { WebSocketClientEvent, WebSocketServerEvent } from "../types/chat";

const PORT = parseInt(process.env.WS_PORT || "3001", 10);
const server = createServer();
const wss = new WebSocketServer({ server });

interface ExtendedSocket extends WebSocket {
  isAlive: boolean;
  userId?: string;
  subscribedChannels: Set<string>;
}

// Track connected sockets by user ID for presence and targeted dispatch
const activeUserSockets = new Map<string, Set<ExtendedSocket>>();

wss.on("connection", (ws: WebSocket, req) => {
  const socket = ws as ExtendedSocket;
  socket.isAlive = true;
  socket.subscribedChannels = new Set();

  socket.on("pong", () => {
    socket.isAlive = true;
  });

  socket.on("message", (raw) => {
    try {
      const data = JSON.parse(raw.toString()) as WebSocketClientEvent;

      switch (data.type) {
        case "SUBSCRIBE_CONVERSATION":
          socket.subscribedChannels.add(`chat:conv:${data.conversationId}`);
          break;

        case "UNSUBSCRIBE_CONVERSATION":
          socket.subscribedChannels.delete(`chat:conv:${data.conversationId}`);
          break;

        case "TYPING_START":
          publishChatEvent(data.conversationId, {
            type: "TYPING_BROADCAST",
            conversationId: data.conversationId,
            userId: data.userId || socket.userId || "anonymous",
            isTyping: true,
          }).catch(() => {});
          break;

        case "TYPING_STOP":
          publishChatEvent(data.conversationId, {
            type: "TYPING_BROADCAST",
            conversationId: data.conversationId,
            userId: data.userId || socket.userId || "anonymous",
            isTyping: false,
          }).catch(() => {});
          break;

        case "HEARTBEAT_PING":
          socket.send(JSON.stringify({ type: "CONNECTION_ACK", serverTime: new Date().toISOString() }));
          break;

        default:
          break;
      }
    } catch {
      // Ignore malformed frames
    }
  });

  socket.on("close", () => {
    if (socket.userId) {
      const userSockets = activeUserSockets.get(socket.userId);
      if (userSockets) {
        userSockets.delete(socket);
        if (userSockets.size === 0) {
          activeUserSockets.delete(socket.userId);
        }
      }
    }
  });

  // Welcome ACK
  socket.send(
    JSON.stringify({
      type: "CONNECTION_ACK",
      connectionId: Math.random().toString(36).substring(2, 9),
      serverTime: new Date().toISOString(),
    })
  );
});

// Subscribe to pub/sub bus to broadcast events to subscribed sockets
subscribeToGlobalEvents(({ channel, event }) => {
  const messageStr = JSON.stringify(event);

  for (const client of wss.clients) {
    const ext = client as ExtendedSocket;
    if (ext.readyState === WebSocket.OPEN && ext.subscribedChannels.has(channel)) {
      ext.send(messageStr);
    }
  }
});

// Periodic heartbeat sweep every 30 seconds
const heartbeatInterval = setInterval(() => {
  for (const client of wss.clients) {
    const ext = client as ExtendedSocket;
    if (!ext.isAlive) {
      ext.terminate();
      continue;
    }
    ext.isAlive = false;
    ext.ping();
  }
}, 30000);

wss.on("close", () => {
  clearInterval(heartbeatInterval);
});

server.listen(PORT, () => {
  console.log(`[WeCare Realtime WebSocket Gateway] listening on ws://localhost:${PORT}`);
});
