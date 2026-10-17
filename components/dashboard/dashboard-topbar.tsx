"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationDropdown } from "./header/notification-dropdown";
import { ThemeToggle } from "./header/theme-toggle";
import { UserDropdown } from "./header/user-dropdown";
import type { User as UserType } from "@/lib/types/user";

export function DashboardTopBar({ user }: { user: UserType }) {
  const pathname = usePathname();

  // Breadcrumb segment generation
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const label =
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
    return {
      label,
      href: "/" + pathSegments.slice(0, index + 1).join("/"),
      isLast: index === pathSegments.length - 1,
    };
  });

  return (
    <header className="sticky top-0 z-40 h-16 px-4 md:px-6 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors duration-200">
      {/* Left: Sidebar trigger and contextual breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <SidebarTrigger className="-ml-1.5 text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors duration-150 active:scale-95" />

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 truncate"
        >
          <Link
            href="/dashboard"
            className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="sr-only md:not-sr-only">Dashboard</span>
          </Link>

          {breadcrumbs.length > 1 &&
            breadcrumbs.slice(1).map((item) => (
              <div key={item.href} className="flex items-center gap-1.5 truncate">
                <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />
                {item.isLast ? (
                  <span className="text-slate-900 dark:text-slate-100 font-semibold truncate">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors truncate"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
        </nav>
      </div>

      {/* Right: Actions, Notifications, Theme switcher, and User Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <NotificationDropdown />
        <ThemeToggle />

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        <UserDropdown user={user} profileHref="/dashboard/profile" />
      </div>
    </header>
  );
}
