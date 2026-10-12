"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  PlusCircle,
  Eye,
  Edit3,
  Trash2,
  ShieldAlert,
  Info,
  type LucideIcon,
} from "lucide-react";
import { parsePermissionAction } from "@/lib/utils/rbac-helpers";
import { cn } from "@/lib/utils";

interface PermissionActionCardProps {
  id: string;
  name: string;
  description: string | null;
  isChecked: boolean;
  onToggle: () => void;
}

interface ActionTheme {
  icon: LucideIcon;
  pillClass: string;
  activeBorder: string;
  activeBg: string;
}

const ACTION_THEMES: Record<string, ActionTheme> = {
  create: {
    icon: PlusCircle,
    pillClass:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40",
    activeBorder: "border-emerald-400/60 dark:border-emerald-500/60",
    activeBg: "bg-emerald-50/40 dark:bg-emerald-950/20",
  },
  read: {
    icon: Eye,
    pillClass:
      "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800/40",
    activeBorder: "border-sky-400/60 dark:border-sky-500/60",
    activeBg: "bg-sky-50/40 dark:bg-sky-950/20",
  },
  view: {
    icon: Eye,
    pillClass:
      "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800/40",
    activeBorder: "border-sky-400/60 dark:border-sky-500/60",
    activeBg: "bg-sky-50/40 dark:bg-sky-950/20",
  },
  update: {
    icon: Edit3,
    pillClass:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40",
    activeBorder: "border-amber-400/60 dark:border-amber-500/60",
    activeBg: "bg-amber-50/40 dark:bg-amber-950/20",
  },
  edit: {
    icon: Edit3,
    pillClass:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40",
    activeBorder: "border-amber-400/60 dark:border-amber-500/60",
    activeBg: "bg-amber-50/40 dark:bg-amber-950/20",
  },
  delete: {
    icon: Trash2,
    pillClass:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40",
    activeBorder: "border-rose-400/60 dark:border-rose-500/60",
    activeBg: "bg-rose-50/40 dark:bg-rose-950/20",
  },
  manage: {
    icon: ShieldAlert,
    pillClass:
      "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800/40",
    activeBorder: "border-purple-400/60 dark:border-purple-500/60",
    activeBg: "bg-purple-50/40 dark:bg-purple-950/20",
  },
};

export function PermissionActionCard({
  id: _id,
  name,
  description,
  isChecked,
  onToggle,
}: PermissionActionCardProps) {
  const { action, actionLabel } = parsePermissionAction(name);
  const theme =
    ACTION_THEMES[action] || {
      icon: Info,
      pillClass:
        "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800",
      activeBorder: "border-primary/50",
      activeBg: "bg-primary/5",
    };
  const ActionIcon = theme.icon;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      className={cn(
        "group relative flex flex-col justify-between p-3.5 rounded-xl border transition-all duration-200 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        isChecked
          ? cn("shadow-sm ring-1 ring-primary/20", theme.activeBg, theme.activeBorder)
          : "bg-white/70 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700",
      )}
    >
      {/* Top row: Action Badge & Checkbox */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold border shadow-2xs tracking-wide capitalize",
            theme.pillClass,
          )}
        >
          <ActionIcon className="h-3 w-3 shrink-0" />
          {actionLabel}
        </span>

        <div className="flex items-center justify-center transition-transform group-active:scale-95 pointer-events-none">
          <Checkbox
            checked={isChecked}
            className="h-4.5 w-4.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
          />
        </div>
      </div>

      {/* Bottom row: Permission code & info tooltip */}
      <div className="flex items-center justify-between gap-1 mt-auto pt-1 border-t border-slate-100 dark:border-slate-800/50">
        <code className="text-[11px] font-mono text-muted-foreground/80 truncate">
          {name}
        </code>

        {description && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <span
                  className="p-1 text-muted-foreground/60 hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors shrink-0 cursor-help inline-flex items-center"
                  aria-label={`Details for ${name}`}
                >
                  <Info className="h-3.5 w-3.5" />
                </span>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-[260px] p-2.5 text-xs glassmorphism shadow-md"
              >
                <p className="font-semibold text-foreground mb-0.5">{name}</p>
                <p className="text-muted-foreground leading-normal">{description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}
