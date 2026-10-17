"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;

    // Try WebSocket first if explicitly configured
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

      const es = new EventSource(`/api/chat/stream?conversationId=${encodeURIComponent(conversationId!)}`);
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
  }, [conversationId, handleEvent]);

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
        broadcastTypingStatus(conversationId, isTyping).catch(() => {});
      }
    },
    [conversationId, currentUserId]
  );

  return { isConnected, sendTyping };
}
