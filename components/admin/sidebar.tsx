"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserCog, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/auth";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState, useEffect } from "react";
import { NAVIGATIONS, NavItem } from "@/constant/admin";

interface SidebarProps {
  user?: User;
}

// Sub-components (SRP)

function SidebarLogo() {
  return (
    <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
      <Link href="/admin" className="flex items-center gap-2">
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
        <span className="text-lg font-semibold">WeCare</span>
      </Link>
    </div>
  );
}

function SidebarNavItem({
  item,
  pathname,
  isChild = false,
}: {
  item: { name: string; href: string; icon: any };
  pathname: string;
  isChild?: boolean;
}) {
  const isActive =
    pathname === item.href ||
    (!isChild && item.href !== "/admin" && pathname.startsWith(item.href));

  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-white",
          isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "",
          isChild ? "ml-7 py-1.5" : "",
        )}
      >
        <item.icon className={cn("w-5 h-5", isChild && "w-4 h-4")} />
        {item.name}
      </Link>
    </li>
  );
}

function SidebarNavGroup({
  item,
  pathname,
  role,
}: {
  item: NavItem;
  pathname: string;
  role: string;
}) {
  const isAnyChildActive = item.children?.some(
    (child) =>
      pathname === child.href ||
      (child.href !== "/admin" && pathname.startsWith(child.href)),
  );

  const [isOpen, setIsOpen] = useState(isAnyChildActive);

  // Sync open state with pathname changes
  useEffect(() => {
    if (isAnyChildActive) setIsOpen(true);
  }, [isAnyChildActive, pathname]);

  return (
    <li>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "flex w-full items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-white",
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
                <SidebarNavItem
                  key={child.name}
                  item={child}
                  pathname={pathname}
                  isChild
                />
              ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}

function SidebarUserInfo({ user }: { user?: User }) {
  const initials =
    `${user?.first_name?.[0] || ""}${user?.last_name?.[0] || ""}`.toUpperCase();

  return (
    <div className="p-4 border-t border-sidebar-border">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
          <span className="text-sm font-semibold">
            {initials || <UserCog className="w-5 h-5" />}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {user?.first_name} {user?.last_name}
          </p>
          <p className="text-xs text-sidebar-foreground/60 capitalize">
            {user?.role}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground hidden lg:flex lg:flex-col">
      <SidebarLogo />

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {NAVIGATIONS.filter((item) =>
            item.allowedRoles.includes(user?.role || ""),
          ).map((item) =>
            item.children ? (
              <SidebarNavGroup
                key={item.name}
                item={item}
                pathname={pathname}
                role={user?.role || ""}
              />
            ) : (
              <SidebarNavItem key={item.name} item={item} pathname={pathname} />
            ),
          )}
        </ul>
      </nav>

      <SidebarUserInfo user={user} />
    </aside>
  );
}
