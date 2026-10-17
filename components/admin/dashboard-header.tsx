"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Menu,
  ChevronDown,
  Home,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { User as UserType } from "@/lib/types/user";
import { NAVIGATIONS, type NavItem } from "@/constant/admin";
import { HeaderLogo } from "@/components/dashboard/header/header-logo";
import { NotificationDropdown } from "@/components/dashboard/header/notification-dropdown";
import { ThemeToggle } from "@/components/dashboard/header/theme-toggle";
import { UserDropdown } from "@/components/dashboard/header/user-dropdown";

interface AdminHeaderProps {
  user?: UserType;
}

function findActiveNavItem(items: NavItem[], pathname: string): NavItem | undefined {
  const flattenItems = (navItems: NavItem[]): NavItem[] => {
    return navItems.reduce((acc: NavItem[], item) => {
      acc.push(item);
      if (item.children) {
        acc.push(...flattenItems(item.children as NavItem[]));
      }
      return acc;
    }, []);
  };

  const allItems = flattenItems(items);

  // Exact match first
  const exactMatch = allItems.find((item) => item.href === pathname);
  if (exactMatch) return exactMatch;

  // Prefix match (more specific first - longest href)
  return allItems
    .filter((item) => item.href !== "/admin" && pathname.startsWith(item.href))
    .sort((a, b) => b.href.length - a.href.length)[0];
}

function MobileNavItem({
  item,
  pathname,
  onOpenChange,
  isChild = false,
}: {
  item: { name: string; href: string; icon: LucideIcon };
  pathname: string;
  onOpenChange: (open: boolean) => void;
  isChild?: boolean;
}) {
  const isActive =
    pathname === item.href ||
    (!isChild && item.href !== "/admin" && pathname.startsWith(item.href));

  return (
    <li>
      <Link
        href={item.href}
        onClick={() => onOpenChange(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
          isChild && "ml-7 py-1.5",
        )}
      >
        <item.icon className={cn("w-5 h-5", isChild && "w-4 h-4")} />
        {item.name}
      </Link>
    </li>
  );
}

function MobileNavGroup({
  item,
  pathname,
  role,
  onOpenChange,
}: {
  item: NavItem;
  pathname: string;
  role: string;
  onOpenChange: (open: boolean) => void;
}) {
  const isAnyChildActive = item.children?.some(
    (child) =>
      pathname === child.href ||
      (child.href !== "/admin" && pathname.startsWith(child.href)),
  );

  const [isOpen, setIsOpen] = useState(isAnyChildActive);

  return (
    <li>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "flex w-full items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              isAnyChildActive && !isOpen ? "bg-sidebar-accent/30" : "",
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5" />
              {item.name}
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                isOpen ? "rotate-180" : "",
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-1">
          <ul className="space-y-1">
            {item.children
              ?.filter((child) => child.allowedRoles.includes(role))
              .map((child) => (
                <MobileNavItem
                  key={child.name}
                  item={child}
                  pathname={pathname}
                  onOpenChange={onOpenChange}
                  isChild
                />
              ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}

export function DashboardHeader({ user }: AdminHeaderProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 transition-colors duration-200">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left Side: Mobile Menu Button + Responsive Logo + Page Title */}
        <div className="flex items-center gap-3">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary active:scale-95 transition-all"
              >
                <Menu className="w-5 h-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-sidebar border-r border-sidebar-border">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

              {/* Mobile Drawer Header with WeCare Branding */}
              <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
                <HeaderLogo href="/admin" showText={true} />
              </div>

              <nav className="flex-1 py-4 px-3 overflow-y-auto">
                <ul className="space-y-1">
                  {NAVIGATIONS.filter((item) =>
                    item.allowedRoles.includes(user?.role || ""),
                  ).map((item) =>
                    item.children ? (
                      <MobileNavGroup
                        key={item.name}
                        item={item}
                        pathname={pathname}
                        role={user?.role || ""}
                        onOpenChange={setSidebarOpen}
                      />
                    ) : (
                      <MobileNavItem
                        key={item.name}
                        item={item}
                        pathname={pathname}
                        onOpenChange={setSidebarOpen}
                      />
                    ),
                  )}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Page Title */}
          <div className="flex items-center">
            <h1 className="text-sm lg:text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate">
              {findActiveNavItem(NAVIGATIONS, pathname)?.name || "Dashboard"}
            </h1>
          </div>
        </div>

        {/* Right side: View Site, Notifications, Theme switcher, and User Menu */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Public Portal Link */}
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hidden sm:flex text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-primary rounded-xl h-9 px-3 gap-1.5"
          >
            <Link href="/" target="_blank">
              <Home className="w-3.5 h-3.5" />
              <span>View Site</span>
            </Link>
          </Button>

          {/* Interactive Notifications */}
          <NotificationDropdown />

          {/* Dark / Light Mode Switcher */}
          <ThemeToggle />

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* Polished User Menu */}
          <UserDropdown user={user} profileHref="/admin/settings" />
        </div>
      </div>
    </header>
  );
}
