"use client";

import { useState } from "react";
import { ConversationSummary } from "@/types/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MessageSquare, Calendar } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";

interface ChatThreadListProps {
  conversations: ConversationSummary[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  currentUserId: string;
}

export function ChatThreadList({
  conversations,
  activeConversationId,
  onSelectConversation,
  currentUserId,
}: ChatThreadListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = conversations.filter((c) => {
    const query = searchQuery.toLowerCase();
    const otherParticipants = c.participants
      .filter((p) => p.userId !== currentUserId)
      .map((p) => p.userName.toLowerCase())
      .join(" ");

    return (
      (c.title && c.title.toLowerCase().includes(query)) ||
      (c.appointmentNumber && c.appointmentNumber.toLowerCase().includes(query)) ||
      otherParticipants.includes(query)
    );
  });

  return (
    <div className="flex h-full flex-col border-r bg-card/30">
      {/* Header & Search */}
      <div className="border-b p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Conversations
          </h2>
          <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-800 dark:bg-teal-950 dark:text-teal-300">
            {conversations.length} Active
          </span>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="h-9 pl-9 text-xs"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center p-4 text-center text-xs text-muted-foreground">
            <MessageSquare className="mb-2 size-6 text-muted-foreground/40" />
            <p>No conversations found.</p>
          </div>
        ) : (
          filtered.map((conv) => {
            const isActive = conv.id === activeConversationId;
            const otherParticipants = conv.participants.filter(
              (p) => p.userId !== currentUserId
            );
            const primaryOther = otherParticipants[0];
            const title =
              conv.title ||
              otherParticipants.map((p) => p.userName).join(", ") ||
              "Clinical Consultation";

            const timeAgo = (() => {
              try {
                return formatDistanceToNowStrict(new Date(conv.updatedAt), {
                  addSuffix: false,
                });
              } catch {
                return "";
              }
            })();

            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => onSelectConversation(conv.id)}
                className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors ${
                  isActive
                    ? "bg-teal-50/80 text-foreground dark:bg-teal-950/40"
                    : "hover:bg-muted/60 text-muted-foreground"
                }`}
              >
                <div className="relative">
                  <Avatar className="size-10 border ring-1 ring-border">
                    <AvatarImage src={primaryOther?.avatarUrl || undefined} />
                    <AvatarFallback className="bg-teal-100 text-xs font-semibold text-teal-800 dark:bg-teal-950 dark:text-teal-200">
                      {(primaryOther?.userName || "C").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-teal-600 text-[9px] font-bold text-white shadow-xs">
                      {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                    </span>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`truncate text-xs font-semibold ${
                        isActive ? "text-teal-950 dark:text-teal-100" : "text-foreground"
                      }`}
                    >
                      {title}
                    </span>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {timeAgo}
                    </span>
                  </div>

                  {conv.appointmentNumber && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Calendar className="size-3" />
                      <span>{conv.appointmentNumber}</span>
                    </div>
                  )}

                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {conv.lastMessage?.content || "Conversation created."}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
