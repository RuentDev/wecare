"use client";

import { useState } from "react";
import { ConversationSummary, ChatParticipant } from "@/types/chat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, ArrowLeft } from "lucide-react";
import { CareTeamDialog } from "./care-team-dialog";

interface ChatHeaderProps {
  conversation: ConversationSummary;
  currentUserId: string;
  currentUserRole: string;
  isConnected: boolean;
  onBack?: () => void;
  onStaffAdded?: () => void;
}

export function ChatHeader({
  conversation,
  currentUserId,
  currentUserRole,
  isConnected,
  onBack,
  onStaffAdded,
}: ChatHeaderProps) {
  const [isCareTeamOpen, setIsCareTeamOpen] = useState(false);

  // Other participants (excluding current user), deduplicated by userId
  const otherParticipants = Array.from(
    new Map(
      conversation.participants
        .filter((p) => p.userId !== currentUserId)
        .map((p) => [p.userId, p])
    ).values()
  );

  const canManageTeam =
    currentUserRole === "doctor" ||
    currentUserRole === "admin" ||
    conversation.participants.some(
      (p) => p.userId === currentUserId && p.isAdmin
    );

  const title =
    conversation.title ||
    otherParticipants.map((p) => p.userName).join(", ") ||
    "Clinical Encounter";

  return (
    <div className="flex min-h-[64px] items-center justify-between border-b border-border/70 bg-card/80 px-3.5 sm:px-6 py-2.5 backdrop-blur-md">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 mr-2">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="size-8 shrink-0 md:hidden text-muted-foreground hover:text-foreground"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="size-4" />
          </Button>
        )}

        {/* Avatar with Anchored Status Indicator */}
        <div
          className="relative shrink-0 cursor-pointer"
          onClick={() => setIsCareTeamOpen(true)}
          title="View Care Team members"
        >
          <div className="flex -space-x-2">
            {otherParticipants.slice(0, 3).map((p) => (
              <Avatar
                key={`participant-${p.id}-${p.userId}`}
                className="size-9 sm:size-10 border-2 border-background ring-1 ring-border shadow-xs hover:ring-teal-500 transition-all"
              >
                <AvatarImage src={p.avatarUrl || undefined} />
                <AvatarFallback className="bg-teal-100 text-xs font-semibold text-teal-800 dark:bg-teal-950 dark:text-teal-200">
                  {p.userName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          {/* Anchored Status Dot */}
          <span
            className={`absolute -bottom-0.5 -right-0.5 size-2.5 sm:size-3 rounded-full ring-2 ring-card ${
              isConnected ? "bg-emerald-500" : "bg-amber-500"
            }`}
            title={isConnected ? "Live Encrypted Connection" : "Connecting..."}
            aria-label={isConnected ? "Online" : "Connecting"}
          />
        </div>

        {/* Title and Single-Line Subtitle */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-sm sm:text-base font-semibold tracking-tight text-foreground truncate">
              {title}
            </h2>
            {conversation.appointmentNumber && (
              <Badge
                variant="outline"
                className="hidden font-mono text-[10px] text-muted-foreground lg:inline-flex shrink-0"
              >
                {conversation.appointmentNumber}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
            <span className="truncate text-[11px] sm:text-xs">
              {isConnected ? (
                <>
                  <span className="sm:hidden">Active now</span>
                  <span className="hidden sm:inline">Active consultation</span>
                </>
              ) : (
                "Connecting..."
              )}
            </span>
            <span className="hidden sm:inline text-muted-foreground/40">•</span>
            <button
              type="button"
              onClick={() => setIsCareTeamOpen(true)}
              className="hidden sm:inline-flex items-center gap-1 text-[11px] sm:text-xs shrink-0 text-muted-foreground/90 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
            >
              <Users className="size-3 text-teal-600 dark:text-teal-400" />
              {conversation.participants.length} Care Team{" "}
              {conversation.participants.length > 1 ? "Members" : "Member"}
            </button>
          </div>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Care Team Management Trigger (Doctor & Admin Only) */}
        {canManageTeam && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsCareTeamOpen(true)}
            className="h-8 px-2 sm:px-3 gap-1.5 text-xs border-teal-600/30 hover:border-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-xl"
            aria-label="Manage care team"
          >
            <Users className="size-3.5 text-teal-600 dark:text-teal-400" />
            <span className="hidden sm:inline">Care Team</span>
            <span className="flex size-4 items-center justify-center rounded-full bg-teal-100 text-[10px] font-semibold text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
              {conversation.participants.length}
            </span>
          </Button>
        )}
      </div>

      <CareTeamDialog
        conversation={conversation}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        isOpen={isCareTeamOpen}
        onOpenChange={setIsCareTeamOpen}
        onTeamUpdated={onStaffAdded}
      />
    </div>
  );
}
