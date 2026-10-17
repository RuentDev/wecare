"use client";

import { useState } from "react";
import {
  Bell,
  CheckCheck,
  Calendar,
  FileText,
  Activity,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface HeaderNotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  category: "appointment" | "lab" | "clinical";
}

const INITIAL_NOTIFICATIONS: HeaderNotificationItem[] = [
  {
    id: "notif-1",
    title: "Appointment Confirmed",
    description: "Follow-up consultation scheduled with Dr. Sarah Chen.",
    time: "10m ago",
    unread: true,
    category: "appointment",
  },
  {
    id: "notif-2",
    title: "Lab Results Ready",
    description: "Comprehensive Metabolic Panel (CMP) uploaded to portal.",
    time: "45m ago",
    unread: true,
    category: "lab",
  },
  {
    id: "notif-3",
    title: "Clinical Note Updated",
    description: "Vital signs and treatment protocol signed by attending physician.",
    time: "2h ago",
    unread: false,
    category: "clinical",
  },
];

export interface NotificationDropdownProps {
  className?: string;
}

export function NotificationDropdown({ className }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<HeaderNotificationItem[]>(
    INITIAL_NOTIFICATIONS,
  );

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, unread: false })),
    );
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, unread: !item.unread } : item,
      ),
    );
  };

  const getCategoryIcon = (category: HeaderNotificationItem["category"]) => {
    switch (category) {
      case "appointment":
        return <Calendar className="w-3.5 h-3.5 text-blue-500" />;
      case "lab":
        return <FileText className="w-3.5 h-3.5 text-emerald-500" />;
      case "clinical":
        return <Activity className="w-3.5 h-3.5 text-teal-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative w-9 h-9 rounded-xl text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-all duration-200 active:scale-95 hover:bg-slate-100 dark:hover:bg-slate-800/80",
            className,
          )}
          aria-label={`Notifications (${unreadCount} unread)`}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 rounded-2xl border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-0 shadow-2xl shadow-slate-900/10 dark:shadow-black/40 overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <DropdownMenuLabel className="p-0 text-sm font-bold text-slate-900 dark:text-slate-100">
              Notifications
            </DropdownMenuLabel>
            {unreadCount > 0 ? (
              <Badge
                variant="secondary"
                className="h-5 px-1.5 text-[11px] font-semibold bg-primary/10 text-primary dark:bg-primary/20"
              >
                {unreadCount} new
              </Badge>
            ) : (
              <span className="text-[11px] text-slate-400">All caught up</span>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-7 px-2 text-xs text-primary hover:text-primary/80 hover:bg-primary/10 rounded-lg gap-1 font-medium transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No notifications yet.
            </div>
          ) : (
            notifications.map((item) => (
              <DropdownMenuItem
                key={item.id}
                onClick={() => handleToggleRead(item.id)}
                className={cn(
                  "p-3.5 flex items-start gap-3 cursor-pointer rounded-none transition-colors duration-150 focus:bg-slate-50 dark:focus:bg-slate-800/60",
                  item.unread
                    ? "bg-primary/[0.03] dark:bg-primary/[0.06]"
                    : "opacity-80 hover:opacity-100",
                )}
              >
                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                  {getCategoryIcon(item.category)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p
                      className={cn(
                        "text-xs font-semibold truncate",
                        item.unread
                          ? "text-slate-900 dark:text-slate-100"
                          : "text-slate-600 dark:text-slate-400",
                      )}
                    >
                      {item.title}
                    </p>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {item.unread && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 self-center" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>

        <DropdownMenuSeparator className="m-0" />
        <div className="p-2 bg-slate-50/50 dark:bg-slate-800/30 text-center">
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-primary justify-center gap-1 rounded-lg"
          >
            <span>View all activity</span>
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
