"use client";

import { DecryptedChatMessage } from "@/types/chat";
import { Badge } from "@/components/ui/badge";
import { Check, CheckCheck, Info, ShieldCheck } from "lucide-react";
import { format } from "date-fns";

interface ChatBubbleProps {
  message: DecryptedChatMessage;
  isCurrentUser: boolean;
}

export function ChatBubble({ message, isCurrentUser }: ChatBubbleProps) {
  // 1. System Notice format (e.g., Staff Additions)
  if (message.messageType === "system_notice" || message.senderRole === "system") {
    return (
      <div className="my-3 flex justify-center px-4">
        <div className="flex max-w-lg items-center gap-2 rounded-full border border-teal-500/20 bg-teal-50/60 px-3.5 py-1 text-center text-xs text-teal-900 shadow-xs dark:border-teal-900/40 dark:bg-teal-950/40 dark:text-teal-200">
          <Info className="size-3.5 shrink-0 text-teal-600 dark:text-teal-400" />
          <span className="font-medium">{message.content}</span>
        </div>
      </div>
    );
  }

  const messageTime = (() => {
    try {
      return format(new Date(message.createdAt), "h:mm a");
    } catch {
      return "";
    }
  })();

  const roleBadge = (() => {
    switch (message.senderRole) {
      case "doctor":
        return <Badge className="bg-teal-600 px-1.5 py-0 text-[10px] text-white">MD</Badge>;
      case "nurse":
        return <Badge className="bg-blue-600 px-1.5 py-0 text-[10px] text-white">RN</Badge>;
      case "staff":
        return <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">Staff</Badge>;
      default:
        return null;
    }
  })();

  return (
    <div
      className={`flex flex-col gap-1 px-4 py-1 sm:px-6 ${
        isCurrentUser ? "items-end" : "items-start"
      }`}
    >
      {/* Sender Header for Incoming Messages */}
      {!isCurrentUser && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{message.senderName}</span>
          {roleBadge}
        </div>
      )}

      {/* Bubble Container */}
      <div
        className={`group relative max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-xs transition-colors sm:max-w-[70%] ${
          isCurrentUser
            ? "rounded-br-xs bg-teal-600 text-white dark:bg-teal-600"
            : "rounded-bl-xs border border-border bg-card text-card-foreground dark:bg-card"
        }`}
      >
        <p className="whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </p>

        {/* Footer info: Timestamp + Status ticks */}
        <div
          className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
            isCurrentUser ? "text-teal-100/90" : "text-muted-foreground"
          }`}
        >
          <span>{messageTime}</span>
          {isCurrentUser && (
            <span className="inline-flex items-center">
              {message.status === "read" ? (
                <CheckCheck className="size-3.5 text-sky-200" />
              ) : message.status === "delivered" ? (
                <CheckCheck className="size-3.5 opacity-80" />
              ) : (
                <Check className="size-3.5 opacity-80" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
