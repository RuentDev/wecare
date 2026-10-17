"use client";

import { useRef, useEffect, useState, UIEvent } from "react";
import { DecryptedChatMessage } from "@/types/chat";
import { ChatBubble } from "./chat-bubble";
import { TypingIndicator } from "./typing-indicator";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowDown, Loader2 } from "lucide-react";

interface ChatMessageListProps {
  messages: DecryptedChatMessage[];
  currentUserId: string;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  typingParticipant?: { id: string; name: string; role?: string } | null;
}

export function ChatMessageList({
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
  const prevMessagesLength = useRef(messages.length);

  // Auto-scroll to bottom on mount and on incoming messages if already near bottom
  useEffect(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;

    if (isNearBottom || messages.length - prevMessagesLength.current === 1) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    prevMessagesLength.current = messages.length;
  }, [messages]);

  // Smooth scroll to bottom when typing begins if near bottom
  useEffect(() => {
    if (!containerRef.current || !typingParticipant) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 180;

    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [typingParticipant]);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 200;
    setShowScrollBottom(isScrolledUp);

    // Load more when reaching near top
    if (scrollTop < 50 && hasMore && !isLoading && onLoadMore) {
      onLoadMore();
    }
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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
          onClick={scrollToBottom}
          className="absolute bottom-4 right-6 flex size-8 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-md backdrop-blur-xs transition hover:bg-muted"
          aria-label="Scroll to newest messages"
        >
          <ArrowDown className="size-4" />
        </button>
      )}
    </div>
  );
}
