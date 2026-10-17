import { Activity } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  isCollapsed?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function Logo({ isCollapsed = false, className, onClick }: LogoProps) {
  return (
    <div
      className={cn(
        "h-16 flex items-center transition-all duration-200 px-3 w-full justify-start",
        "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
        isCollapsed && "justify-center px-0",
        className
      )}
    >
      <Link
        href="/dashboard"
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 group outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring rounded-xl p-1 transition-all",
          "group-data-[collapsible=icon]:justify-center",
          isCollapsed && "justify-center"
        )}
      >
        <div className="size-9 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-105">
          <Activity className="size-5" />
        </div>
        <div
          className={cn(
            "flex flex-col min-w-0 transition-opacity duration-200 group-data-[collapsible=icon]:hidden",
            isCollapsed && "hidden"
          )}
        >
          <span className="font-bold text-lg tracking-tight text-sidebar-foreground leading-tight">
            WeCare
          </span>
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Health Portal
          </span>
        </div>
      </Link>
    </div>
  );
}
