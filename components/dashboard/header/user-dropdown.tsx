"use client";

import Link from "next/link";
import { User, Settings, LogOut, ExternalLink, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import type { User as UserType } from "@/lib/types/user";

export interface UserDropdownProps {
  user?: UserType;
  profileHref?: string;
  className?: string;
}

export function UserDropdown({
  user,
  profileHref = "/dashboard/profile",
  className,
}: UserDropdownProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutAction();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      window.location.href = "/login";
    }
  };

  const initials = `${user?.first_name?.[0] || ""}${user?.last_name?.[0] || ""}`.toUpperCase() || "WC";
  const fullName = user?.first_name ? `${user.first_name} ${user.last_name}` : "Healthcare User";
  const role = user?.role || "user";

  const getRoleBadgeClasses = (userRole: string) => {
    switch (userRole) {
      case "doctor":
        return "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200/80 dark:border-teal-800";
      case "patient":
        return "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200/80 dark:border-sky-800";
      case "admin":
        return "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/80 dark:border-purple-800";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "p-1 pr-2.5 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-all duration-200 gap-2.5 active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
            className,
          )}
          aria-label="User account menu"
        >
          <div className="relative">
            <Avatar className="h-8 w-8 ring-2 ring-primary/10 dark:ring-primary/20 rounded-lg">
              <AvatarImage src={user?.avatar_url || ""} alt={fullName} />
              <AvatarFallback className="bg-gradient-to-tr from-primary/15 to-teal-500/15 text-primary font-bold text-xs rounded-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
          </div>

          <div className="text-left hidden md:flex flex-col">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight truncate max-w-[120px]">
              {fullName}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize leading-tight">
              {role}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-64 rounded-2xl border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-1.5 shadow-2xl shadow-slate-900/10 dark:shadow-black/40"
      >
        <DropdownMenuLabel className="p-2.5 font-normal">
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-none">
                {fullName}
              </p>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0 h-4 rounded-md border",
                  getRoleBadgeClasses(role),
                )}
              >
                {role}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {user?.email || "user@wecare.clinic"}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />

        <DropdownMenuItem asChild className="rounded-xl gap-2.5 p-2 text-xs font-medium cursor-pointer">
          <Link href={profileHref} className="flex items-center gap-2.5 w-full">
            <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>My Profile</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="rounded-xl gap-2.5 p-2 text-xs font-medium cursor-pointer">
          <Link href={role === "admin" ? "/admin/settings" : "/dashboard"} className="flex items-center gap-2.5 w-full">
            <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Preferences & Settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="rounded-xl gap-2.5 p-2 text-xs font-medium cursor-pointer">
          <Link href="/" target="_blank" className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Clinic Public Portal</span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />

        <DropdownMenuItem
          onClick={handleLogout}
          className="rounded-xl gap-2.5 p-2 text-xs font-semibold text-rose-600 dark:text-rose-400 focus:text-rose-700 dark:focus:text-rose-300 focus:bg-rose-50 dark:focus:bg-rose-950/50 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
