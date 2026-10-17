"use client";

import { Badge } from "@/components/ui/badge";

interface TypingIndicatorProps {
  userName: string;
  userRole?: string;
}

export function TypingIndicator({ userName, userRole }: TypingIndicatorProps) {
  const roleBadge = (() => {
    switch (userRole) {
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
      className="flex flex-col gap-1 px-4 py-1.5 sm:px-6 items-start transition-all duration-200 ease-out animate-in fade-in-0 zoom-in-95"
      role="status"
      aria-live="polite"
      aria-label={`${userName} is typing`}
    >
      {/* Sender Header */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{userName}</span>
        {roleBadge}
        <span className="text-[11px] text-muted-foreground/80">is typing...</span>
      </div>

      {/* Bubble Container with Staggered Bouncing Dots */}
      <div className="relative rounded-2xl rounded-bl-xs border border-border bg-card px-4 py-2.5 shadow-xs text-card-foreground">
        <div className="flex items-center gap-1.5 py-0.5">
          <span
            className="size-2 rounded-full bg-teal-600 dark:bg-teal-400 motion-safe:animate-[typingBounce_1.2s_infinite_ease-in-out] motion-reduce:animate-pulse"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="size-2 rounded-full bg-teal-600 dark:bg-teal-400 motion-safe:animate-[typingBounce_1.2s_infinite_ease-in-out] motion-reduce:animate-pulse"
            style={{ animationDelay: "160ms" }}
          />
          <span
            className="size-2 rounded-full bg-teal-600 dark:bg-teal-400 motion-safe:animate-[typingBounce_1.2s_infinite_ease-in-out] motion-reduce:animate-pulse"
            style={{ animationDelay: "320ms" }}
          />
        </div>
      </div>

      {/* Embedded CSS Keyframes for GPU-accelerated bounce */}
      <style jsx global>{`
        @keyframes typingBounce {
          0%, 80%, 100% {
            transform: translateY(0);
            opacity: 0.35;
          }
          40% {
            transform: translateY(-5px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
