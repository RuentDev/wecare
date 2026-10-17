"use client";

import Link from "next/link";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HeaderLogoProps {
  href?: string;
  className?: string;
  showText?: boolean;
}

export function HeaderLogo({
  href = "/dashboard",
  className,
  showText = true,
}: HeaderLogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 group transition-transform active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-xl",
        className,
      )}
      aria-label="WeCare Home"
    >
      <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-primary via-primary/95 to-teal-500 text-white shadow-xs shadow-primary/20 transition-all duration-300 group-hover:shadow-md group-hover:shadow-primary/25 shrink-0">
        <Activity className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500 ring-2 ring-white dark:ring-slate-900" />
        </span>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-bold text-base md:text-lg tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
            WeCare
          </span>
          <span className="text-[10px] font-medium tracking-wide text-teal-600 dark:text-teal-400 leading-none">
            Clinic OS
          </span>
        </div>
      )}
    </Link>
  );
}
