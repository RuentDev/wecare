"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Menu,
  Bell,
  ChevronDown,
  User,
  LogOut,
  Home,
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  MapPin,
  Tag,
  FileText,
  Settings,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { User as UserType } from "@/lib/auth";
import { NAVIGATIONS, type NavItem } from "@/constant/admin";
import { useApp } from "@/contexts/app-context";

interface AdminHeaderProps {
  user?: UserType;
}

function findActiveNavItem(items: NavItem[], pathname: string): NavItem | undefined {
  // Get all items flattened
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
  item: { name: string; href: string; icon: any };
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
  const router = useRouter();
  const { logout } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="flex h-16 items-center justify-between p-4">
        {/* Mobile menu button */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="w-5 h-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-sidebar">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            {/* Mobile Logo */}
            <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
              <Link
                href="/admin"
                className="flex items-center gap-2"
                onClick={() => setSidebarOpen(false)}
              >
                <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="w-5 h-5 text-sidebar-primary-foreground"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                  </svg>
                </div>
                <span className="text-lg font-semibold text-sidebar-foreground">
                  Denteria
                </span>
              </Link>
            </div>

            <nav className="flex-1 py-4 px-3">
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

        {/* Page Title - Hidden on mobile */}
        <div className="hidden lg:block">
          <h1 className="text-lg font-semibold text-foreground">
            {findActiveNavItem(NAVIGATIONS, pathname)?.name || "Dashboard"}
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* View Site Link */}
          <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              View Site
            </Link>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
            <span className="sr-only">Notifications</span>
          </Button>

          {/* User Menu */}
          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary">
                    {user?.first_name[0]}
                    {user?.last_name[0]}
                  </span>
                </div>
                <span className="hidden sm:inline text-sm font-medium">
                  {user?.first_name}
                </span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/admin/settings">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
        </div>
      </div>
    </header>
  );
}
