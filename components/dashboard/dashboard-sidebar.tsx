"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Logo from "../logo";
import {
  SIDEBAR_NAVS,
  DASHBOARD_SECTIONS,
  type DashboardNavSection,
  type SidebarItem,
} from "@/constant/dashboard";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { DashboardSidebarFooter } from "./dashboard-sidebar-footer";
import type { User } from "@/lib/types/user";

interface DashboardSidebarProps {
  userRole: string;
  userPermissions?: string[];
  user?: User | null;
}

export function DashboardSidebar({
  userRole,
  userPermissions = [],
  user,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { state, setOpenMobile, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleNavigate = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const permittedNavItems = SIDEBAR_NAVS.filter((item) => {
    if (!item.roles.includes(userRole)) return false;
    if (item.requiredPermission) {
      const hasPerm =
        userPermissions.includes(item.requiredPermission) ||
        userPermissions.includes("roles:manage");
      if (!hasPerm) return false;
    }
    return true;
  });

  // Group items by semantic sections
  const groupedSections = DASHBOARD_SECTIONS.map((section) => {
    const items = permittedNavItems.filter((item) => item.section === section.id);
    return {
      ...section,
      items,
    };
  }).filter((section) => section.items.length > 0);

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar transition-all duration-200"
    >
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-sidebar-border/60 bg-sidebar px-2">
        <Logo isCollapsed={isCollapsed} onClick={handleNavigate} />
      </SidebarHeader>

      <SidebarContent className="bg-sidebar px-2 py-3 overflow-x-hidden">
        {groupedSections.map((section, idx) => (
          <SidebarGroup
            key={section.id}
            className={cn("p-0 mb-3 last:mb-0", idx > 0 && "pt-1")}
          >
            <SidebarGroupLabel
              className={cn(
                "px-2.5 text-[10px] font-bold tracking-wider uppercase text-muted-foreground/80 h-7 transition-opacity duration-200",
                "group-data-[collapsible=icon]:hidden"
              )}
            >
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {section.items.map((item: SidebarItem) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.label}
                        className={cn(
                          "relative flex items-center gap-3 px-3 h-10 rounded-xl text-sm font-medium transition-all duration-150 group",
                          "group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center",
                          isActive
                            ? "bg-primary/10 text-primary font-semibold ring-1 ring-primary/20 shadow-xs dark:bg-primary/20 dark:text-primary dark:ring-primary/40"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        )}
                      >
                        <Link
                          href={item.href}
                          onClick={handleNavigate}
                          className="flex items-center w-full"
                        >
                          <item.icon
                            className={cn(
                              "size-5 shrink-0 transition-transform duration-150 group-hover:scale-105",
                              isActive
                                ? "text-primary"
                                : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground"
                            )}
                          />
                          <span
                            className={cn(
                              "truncate ml-3 flex-1 transition-opacity duration-150",
                              "group-data-[collapsible=icon]:hidden"
                            )}
                          >
                            {item.label}
                          </span>
                          {item.badge && (
                            <span
                              className={cn(
                                "ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary",
                                "group-data-[collapsible=icon]:hidden"
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="bg-sidebar p-2 border-t border-sidebar-border/60">
        <DashboardSidebarFooter />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

