"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";

interface ChatInputBoxProps {
  onSendMessage: (content: string) => Promise<boolean>;
  onTypingChange?: (isTyping: boolean) => void;
  isDisabled?: boolean;
  placeholder?: string;
}

export function ChatInputBox({
  onSendMessage,
  onTypingChange,
  isDisabled = false,
  placeholder = "Type here ...",
}: ChatInputBoxProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTyping = () => {
    if (!onTypingChange) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTypingChange(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // 2.5 seconds idle timeout as confirmed in design interview
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      onTypingChange(false);
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current) {
        onTypingChange?.(false);
      }
    };
  }, [onTypingChange]);

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed || isSending || isDisabled) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTypingChange?.(false);
    }

    setIsSending(true);
    try {
      const success = await onSendMessage(trimmed);
      if (success) {
        setContent("");
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140
      )}px`;
    }
  };

  return (
    <div className="border-t bg-card/60 p-3 sm:p-4 backdrop-blur-xs">
      <div className="flex items-end gap-2 rounded-2xl border border-border bg-background p-1.5 focus-within:border-teal-600 focus-within:ring-1 focus-within:ring-teal-600 transition-colors">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            const nextVal = e.target.value;
            setContent(nextVal);
            if (nextVal.trim().length > 0) {
              handleTyping();
            } else if (isTypingRef.current) {
              if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
              isTypingRef.current = false;
              onTypingChange?.(false);
            }
          }}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          disabled={isDisabled || isSending}
          rows={1}
          placeholder={placeholder}
          className="max-h-36 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden disabled:opacity-50"
        />

        <Button
          type="button"
          size="icon"
          onClick={handleSend}
          disabled={!content.trim() || isSending || isDisabled}
          className="size-9 shrink-0 rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-40"
          aria-label="Send message"
        >
          {isSending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </Button>
      </div>
      <div className="mt-1 flex items-center justify-between px-2 text-[10px] text-muted-foreground">
        <span className="truncate">
          <span className="hidden sm:inline">Press Enter to send, Shift + Enter for new line</span>
          <span className="sm:hidden">Encrypted clinical consultation</span>
        </span>
      </div>
    </div>
  );
}
