"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import PusherClient, { Channel } from "pusher-js";
import { WebSocketServerEvent, DecryptedChatMessage, ChatParticipant } from "@/types/chat";
import { broadcastTypingStatus } from "@/lib/actions/chat";

interface UseChatSocketProps {
  conversationId: string | null;
  currentUserId?: string;
  onMessage?: (message: DecryptedChatMessage) => void;
  onParticipantAdded?: (participant: ChatParticipant) => void;
  onParticipantRemoved?: (conversationId: string, userId: string, removedByName?: string) => void;
  onReadReceipt?: (userId: string, messageId: string) => void;
  onTyping?: (userId: string, isTyping: boolean) => void;
}

// Client-side singleton cache for Pusher to prevent redundant WebSocket handshakes
let cachedPusherClient: PusherClient | null = null;

function getPusherClient(): PusherClient | null {
  const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1";

  if (!pusherKey) {
    return null;
  }

  if (!cachedPusherClient) {
    cachedPusherClient = new PusherClient(pusherKey, {
      cluster: pusherCluster,
      forceTLS: true,
    });
  }

  return cachedPusherClient;
}

export function useChatSocket({
  conversationId,
  currentUserId,
  onMessage,
  onParticipantAdded,
  onParticipantRemoved,
  onReadReceipt,
  onTyping,
}: UseChatSocketProps) {
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pusherChannelRef = useRef<Channel | null>(null);

  const handleEvent = useCallback(
    (event: WebSocketServerEvent) => {
      switch (event.type) {
        case "MESSAGE_RECEIVED":
          onMessage?.(event.message);
          break;
        case "PARTICIPANT_ADDED":
          onParticipantAdded?.(event.participant);
          break;
        case "PARTICIPANT_REMOVED":
          onParticipantRemoved?.(event.conversationId, event.userId, event.removedByName);
          break;
        case "READ_RECEIPT_BROADCAST":
          onReadReceipt?.(event.userId, event.messageId);
          break;
        case "TYPING_BROADCAST":
          onTyping?.(event.userId, event.isTyping);
          break;
        default:
          break;
      }
    },
    [onMessage, onParticipantAdded, onParticipantRemoved, onReadReceipt, onTyping]
  );

  useEffect(() => {
    if (!conversationId) {
      setIsConnected(false);
      return;
    }

    let isUnmounted = false;

    // 1. PRIMARY: Pusher Managed Realtime Gateway (Vercel Serverless Ready)
    const pusher = getPusherClient();
    if (pusher) {
      const channelName = `chat-conv-${conversationId}`;
      const channel = pusher.subscribe(channelName);
      pusherChannelRef.current = channel;

      if (pusher.connection.state === "connected") {
        setIsConnected(true);
      }

      const handleConnectionStateChange = (states: { current: string }) => {
        if (!isUnmounted) {
          setIsConnected(states.current === "connected");
        }
      };

      pusher.connection.bind("state_change", handleConnectionStateChange);

      // Bind all incoming event frames
      channel.bind("MESSAGE_RECEIVED", (data: { message: DecryptedChatMessage }) => {
        if (!isUnmounted && data?.message) {
          onMessage?.(data.message);
        }
      });

      channel.bind("TYPING_BROADCAST", (data: { userId: string; isTyping: boolean }) => {
        if (!isUnmounted && data) {
          onTyping?.(data.userId, data.isTyping);
        }
      });

      channel.bind("PARTICIPANT_ADDED", (data: { participant: ChatParticipant }) => {
        if (!isUnmounted && data?.participant) {
          onParticipantAdded?.(data.participant);
        }
      });

      channel.bind(
        "PARTICIPANT_REMOVED",
        (data: { conversationId: string; userId: string; removedByName?: string }) => {
          if (!isUnmounted && data) {
            onParticipantRemoved?.(data.conversationId, data.userId, data.removedByName);
          }
        }
      );

      channel.bind(
        "READ_RECEIPT_BROADCAST",
        (data: { userId: string; messageId: string }) => {
          if (!isUnmounted && data) {
            onReadReceipt?.(data.userId, data.messageId);
          }
        }
      );

      return () => {
        isUnmounted = true;
        pusher.connection.unbind("state_change", handleConnectionStateChange);
        channel.unbind_all();
        pusher.unsubscribe(channelName);
        pusherChannelRef.current = null;
      };
    }

    // 2. FALLBACK: Direct WebSocket (local development) or Server-Sent Events (SSE)
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;

    if (wsUrl) {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (isUnmounted) return;
          setIsConnected(true);
          ws.send(JSON.stringify({ type: "SUBSCRIBE_CONVERSATION", conversationId }));
        };

        ws.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data) as WebSocketServerEvent;
            handleEvent(data);
          } catch {
            // Ignore parse errors
          }
        };

        ws.onclose = () => {
          if (!isUnmounted) {
            setIsConnected(false);
            connectSSE();
          }
        };

        ws.onerror = () => {
          ws.close();
        };

        return () => {
          isUnmounted = true;
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "UNSUBSCRIBE_CONVERSATION", conversationId }));
            ws.close();
          }
        };
      } catch {
        connectSSE();
      }
    } else {
      connectSSE();
    }

    function connectSSE() {
      if (isUnmounted) return;

      const es = new EventSource(
        `/api/chat/stream?conversationId=${encodeURIComponent(conversationId!)}`
      );
      eventSourceRef.current = es;

      es.onopen = () => {
        if (!isUnmounted) setIsConnected(true);
      };

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data) as WebSocketServerEvent;
          handleEvent(data);
        } catch {
          // Ignore keepalive heartbeats
        }
      };

      es.onerror = () => {
        if (!isUnmounted) {
          setIsConnected(false);
        }
      };
    }

    return () => {
      isUnmounted = true;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [
    conversationId,
    handleEvent,
    onMessage,
    onParticipantAdded,
    onParticipantRemoved,
    onReadReceipt,
    onTyping,
  ]);

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!conversationId) return;

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: isTyping ? "TYPING_START" : "TYPING_STOP",
            conversationId,
            userId: currentUserId,
          })
        );
      } else {
        // Dispatches through Server Action -> Pusher / PubSub
        broadcastTypingStatus(conversationId, isTyping).catch(() => {});
      }
    },
    [conversationId, currentUserId]
  );

  return { isConnected, sendTyping };
}
