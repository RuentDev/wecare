"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface PermissionItemProps {
  id: string;
  name: string;
  description: string;
  isChecked: boolean;
  onToggle: () => void;
}

export function PermissionItem({
  id,
  name,
  description,
  isChecked,
  onToggle,
}: PermissionItemProps) {
  return (
    <div
      className={cn(
        "group flex items-center space-x-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none",
        isChecked
          ? "bg-primary/10 border-primary/30 shadow-sm shadow-primary/5 ring-1 ring-primary/20"
          : "bg-white/40 dark:bg-slate-900/40 border-white/60 dark:border-slate-800/60 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:border-primary/20"
      )}
      onClick={onToggle}
    >
      <div className="flex items-center justify-center transition-transform group-active:scale-90 pointer-events-none">
        <Checkbox
          checked={isChecked}
          className="h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
      </div>
      <div className="flex-1 flex items-center justify-between overflow-hidden">
        <span className={cn(
          "text-sm font-semibold transition-colors truncate",
          isChecked ? "text-primary dark:text-primary-foreground" : "text-slate-700 dark:text-slate-300"
        )}>
          {name}
        </span>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
              <div className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors shrink-0">
                <Info className="h-4 w-4 text-muted-foreground/70" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[280px] p-3 text-xs leading-relaxed glassmorphism">
              <p className="font-medium text-slate-900 dark:text-slate-100 mb-1">{name}</p>
              <p className="text-muted-foreground">{description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
