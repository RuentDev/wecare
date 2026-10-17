"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ConversationSummary,
  DecryptedChatMessage,
  ChatParticipant,
} from "@/types/chat";
import {
  getConversations,
  getConversationMessages,
  sendMessage,
  markConversationRead,
} from "@/lib/actions/chat";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { ChatThreadList } from "./chat-thread-list";
import { ChatHeader } from "./chat-header";
import { ChatMessageList } from "./chat-message-list";
import { ChatInputBox } from "./chat-input-box";
import { ShieldCheck, MessageSquareDashed } from "lucide-react";
import { toast } from "sonner";

interface ChatLayoutProps {
  currentUserId: string;
  currentUserRole: string;
  initialConversations?: ConversationSummary[];
  defaultConversationId?: string;
}

export function ChatLayout({
  currentUserId,
  currentUserRole,
  initialConversations = [],
  defaultConversationId,
}: ChatLayoutProps) {
  const [conversations, setConversations] =
    useState<ConversationSummary[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    defaultConversationId || initialConversations[0]?.id || null
  );
  const [messages, setMessages] = useState<DecryptedChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [typingParticipant, setTypingParticipant] = useState<{
    id: string;
    name: string;
    role?: string;
  } | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Active conversation object
  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  // Clear typing indicator when switching conversations
  useEffect(() => {
    setTypingParticipant(null);
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
  }, [activeConversationId]);

  // Sync active conversation when defaultConversationId changes
  useEffect(() => {
    if (defaultConversationId) {
      setActiveConversationId(defaultConversationId);
    }
  }, [defaultConversationId]);

  // Fetch full conversation list
  const refreshConversations = useCallback(async () => {
    const res = await getConversations();
    if (res.success && res.data) {
      setConversations(res.data);
    }
  }, []);

  // Fetch initial messages for active conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    setIsLoadingMessages(true);
    try {
      const res = await getConversationMessages(conversationId);
      if (res.success && res.data) {
        setMessages(res.data.messages as DecryptedChatMessage[]);
        setHasMore(res.data.hasMore);
        setNextCursor(res.data.nextCursor);

        // Mark as read
        if (res.data.messages.length > 0) {
          const lastMsg = res.data.messages[res.data.messages.length - 1];
          markConversationRead(conversationId, lastMsg.id);
        }
      } else {
        toast.error(res.error || "Failed to load messages.");
      }
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Handle active conversation change
  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId, loadMessages]);

  // Realtime hook callbacks
  const handleIncomingMessage = useCallback(
    (newMsg: DecryptedChatMessage) => {
      // Dismiss typing indicator if the message sender was typing
      setTypingParticipant((prev) => (prev?.id === newMsg.senderId ? null : prev));

      if (newMsg.conversationId === activeConversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });

        // Mark read immediately if viewing this conversation
        if (newMsg.senderId !== currentUserId) {
          markConversationRead(newMsg.conversationId, newMsg.id);
        }
      }

      // Update snippet in conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === newMsg.conversationId
            ? {
              ...c,
              lastMessage: newMsg,
              unreadCount:
                newMsg.conversationId === activeConversationId ||
                  newMsg.senderId === currentUserId
                  ? 0
                  : c.unreadCount + 1,
              updatedAt: newMsg.createdAt,
            }
            : c
        )
      );
    },
    [activeConversationId, currentUserId]
  );

  const handleParticipantAdded = useCallback(
    (participant: ChatParticipant) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== participant.conversationId) return c;
          const exists = c.participants.some(
            (p) => p.id === participant.id || p.userId === participant.userId
          );
          if (exists) return c;
          return {
            ...c,
            participants: [...c.participants, participant],
          };
        })
      );
    },
    []
  );

  const handleTypingBroadcast = useCallback(
    (userId: string, isTyping: boolean) => {
      if (userId === currentUserId) return;

      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }

      if (isTyping) {
        const participant = activeConversation?.participants.find(
          (p) => p.userId === userId
        );
        setTypingParticipant({
          id: userId,
          name: participant?.userName || "Care Team Member",
          role: participant?.userRole,
        });

        // 3.5s safety auto-dismiss fallback
        typingTimerRef.current = setTimeout(() => {
          setTypingParticipant(null);
        }, 3500);
      } else {
        setTypingParticipant((prev) => (prev?.id === userId ? null : prev));
      }
    },
    [currentUserId, activeConversation]
  );

  const handleParticipantRemoved = useCallback(
    (conversationId: string, userId: string, removedByName?: string) => {
      // If the removed member is the currently logged-in user
      if (userId === currentUserId) {
        toast.info(
          removedByName
            ? `You were removed from the consultation by ${removedByName}.`
            : "You were removed from the consultation."
        );
        if (activeConversationId === conversationId) {
          setActiveConversationId(null);
        }
        setConversations((prev) => prev.filter((c) => c.id !== conversationId));
        return;
      }

      // If another user was removed, filter them out from the conversation participant list
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== conversationId) return c;
          return {
            ...c,
            participants: c.participants.filter((p) => p.userId !== userId),
          };
        })
      );
    },
    [currentUserId, activeConversationId]
  );

  const { isConnected, sendTyping } = useChatSocket({
    conversationId: activeConversationId,
    currentUserId,
    onMessage: handleIncomingMessage,
    onParticipantAdded: handleParticipantAdded,
    onParticipantRemoved: handleParticipantRemoved,
    onTyping: handleTypingBroadcast,
  });

  // Sending a message
  const handleSendMessage = async (content: string): Promise<boolean> => {
    if (!activeConversationId) return false;

    const res = await sendMessage(activeConversationId, content);
    if (res.success && res.data) {
      const sentMsg = res.data;
      setMessages((prev) => {
        if (prev.some((m) => m.id === sentMsg.id)) return prev;
        return [...prev, sentMsg];
      });

      // Update thread list preview
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? {
              ...c,
              lastMessage: sentMsg,
              updatedAt: sentMsg.createdAt,
            }
            : c
        )
      );
      return true;
    } else {
      toast.error(res.error || "Failed to deliver message.");
      return false;
    }
  };

  // Pagination loading
  const handleLoadMore = async () => {
    if (!activeConversationId || !nextCursor || isLoadingMessages) return;

    const res = await getConversationMessages(activeConversationId, nextCursor);
    if (res.success && res.data) {
      setMessages((prev) => [
        ...(res.data!.messages as DecryptedChatMessage[]),
        ...prev,
      ]);
      setHasMore(res.data.hasMore);
      setNextCursor(res.data.nextCursor);
    }
  };

  return (
    <div className="flex h-[calc(100dvh-13.5rem)] sm:h-[calc(100vh-14.5rem)] min-h-[460px] sm:min-h-[580px] w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs">
      {/* Sidebar: Thread List */}
      <div
        className={`w-full md:w-60 lg:w-70 shrink-0 ${
          activeConversationId ? "hidden md:block" : "block"
        }`}
      >
        <ChatThreadList
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={(id) => setActiveConversationId(id)}
          currentUserId={currentUserId}
        />
      </div>

      {/* Main Chat Area */}
      <div
        className={`flex flex-1 min-w-0 flex-col overflow-hidden bg-background ${
          !activeConversationId ? "hidden md:flex" : "flex"
        }`}
      >
        {activeConversation ? (
          <>
            <ChatHeader
              conversation={activeConversation}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              isConnected={isConnected}
              onBack={() => setActiveConversationId(null)}
              onStaffAdded={refreshConversations}
            />

            <ChatMessageList
              messages={messages}
              currentUserId={currentUserId}
              isLoading={isLoadingMessages}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
              typingParticipant={typingParticipant}
            />

            <ChatInputBox
              onSendMessage={handleSendMessage}
              onTypingChange={sendTyping}
            />
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
              <MessageSquareDashed className="size-7" />
            </div>
            <h2 className="text-base font-semibold text-foreground">
              Select a Consultation
            </h2>
            <p className="max-w-sm text-xs text-muted-foreground">
              Choose a patient encounter or practitioner thread from the left to view
              live, encrypted clinical messages.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
