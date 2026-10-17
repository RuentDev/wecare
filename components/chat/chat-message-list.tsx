"use client";

import { useRef, useEffect, useState, useCallback, UIEvent } from "react";
import { DecryptedChatMessage } from "@/types/chat";
import { ChatBubble } from "./chat-bubble";
import { TypingIndicator } from "./typing-indicator";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowDown, Loader2 } from "lucide-react";

interface ChatMessageListProps {
  conversationId?: string | null;
  messages: DecryptedChatMessage[];
  currentUserId: string;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  typingParticipant?: { id: string; name: string; role?: string } | null;
}

export function ChatMessageList({
  conversationId,
  messages,
  currentUserId,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  typingParticipant = null,
}: ChatMessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Scroll tracking references
  const hasInitializedScroll = useRef(false);
  const prevMessagesLength = useRef(0);
  const prevScrollHeightRef = useRef(0);

  // Instantly anchor to bottom (zero animation delay for initial load)
  const scrollToBottomInstant = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);

  // Smooth scroll to bottom for live incoming/outgoing messages
  const scrollToBottomSmooth = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Reset scroll initialization flag when conversation changes
  useEffect(() => {
    hasInitializedScroll.current = false;
    prevMessagesLength.current = 0;
    prevScrollHeightRef.current = 0;
  }, [conversationId]);

  // Main scroll engine
  useEffect(() => {
    if (!containerRef.current) return;

    // Phase 1: Initial conversation load or page refresh
    if (!hasInitializedScroll.current && messages.length > 0) {
      scrollToBottomInstant();

      // Additional frames to ensure accurate layout positioning after DOM paints and font metrics
      const rafId = requestAnimationFrame(() => {
        scrollToBottomInstant();
      });
      const timerId = setTimeout(() => {
        scrollToBottomInstant();
      }, 50);

      hasInitializedScroll.current = true;
      prevMessagesLength.current = messages.length;
      prevScrollHeightRef.current = containerRef.current.scrollHeight;

      return () => {
        cancelAnimationFrame(rafId);
        clearTimeout(timerId);
      };
    }

    // Phase 2: Pagination (older messages prepended via load-more)
    if (
      messages.length > prevMessagesLength.current &&
      messages.length - prevMessagesLength.current > 1
    ) {
      const currentScrollHeight = containerRef.current.scrollHeight;
      const heightDifference = currentScrollHeight - prevScrollHeightRef.current;
      if (heightDifference > 0) {
        containerRef.current.scrollTop += heightDifference;
      }
      prevMessagesLength.current = messages.length;
      prevScrollHeightRef.current = currentScrollHeight;
      return;
    }

    // Phase 3: Single new message arrived or sent
    if (messages.length - prevMessagesLength.current === 1) {
      const latestMessage = messages[messages.length - 1];
      const isSentByMe = latestMessage?.senderId === currentUserId;

      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 180;

      if (isSentByMe || isNearBottom) {
        scrollToBottomSmooth();
        setShowScrollBottom(false);
      } else {
        setShowScrollBottom(true);
      }
    }

    prevMessagesLength.current = messages.length;
    prevScrollHeightRef.current = containerRef.current.scrollHeight;
  }, [messages, currentUserId, scrollToBottomInstant, scrollToBottomSmooth]);

  // Keep pinned to bottom during initial image/avatar expansions
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      if (!hasInitializedScroll.current && messages.length > 0) {
        scrollToBottomInstant();
      } else {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 120;
        if (isNearBottom) {
          container.scrollTop = container.scrollHeight;
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [messages.length, scrollToBottomInstant]);

  // Smooth scroll when typing begins if near bottom
  useEffect(() => {
    if (!containerRef.current || !typingParticipant) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;

    if (isNearBottom) {
      scrollToBottomSmooth();
    }
  }, [typingParticipant, scrollToBottomSmooth]);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 180;
    setShowScrollBottom(isScrolledUp);

    // Load more when reaching near top
    if (scrollTop < 50 && hasMore && !isLoading && onLoadMore) {
      prevScrollHeightRef.current = scrollHeight;
      onLoadMore();
    }
  };

  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto py-4"
      >
        {/* Load more trigger */}
        {hasMore && (
          <div className="mb-4 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLoadMore}
              disabled={isLoading}
              className="text-xs text-muted-foreground"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  Loading older messages...
                </>
              ) : (
                "Load earlier messages"
              )}
            </Button>
          </div>
        )}

        {/* Empty state */}
        {messages.length === 0 && !isLoading && (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
              <ShieldCheck className="size-6" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Secure Clinical Consultation
            </h3>
            <p className="max-w-xs text-xs text-muted-foreground">
              This conversation is active and encrypted with AES-256-GCM. All records
              are maintained in compliance with HIPAA § 164.312.
            </p>
          </div>
        )}

        {/* Message stream */}
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message}
            isCurrentUser={message.senderId === currentUserId}
          />
        ))}

        {/* Realtime Typing Indicator */}
        {typingParticipant && (
          <TypingIndicator
            userName={typingParticipant.name}
            userRole={typingParticipant.role}
          />
        )}

        <div ref={bottomRef} className="h-2" />
      </div>

      {/* Floating scroll to bottom button */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={scrollToBottomSmooth}
          className="absolute bottom-4 right-6 flex size-8 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-md backdrop-blur-xs transition hover:bg-muted"
          aria-label="Scroll to newest messages"
        >
          <ArrowDown className="size-4" />
        </button>
      )}
    </div>
  );
}
