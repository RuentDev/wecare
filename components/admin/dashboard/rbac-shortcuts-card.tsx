"use client";

import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Key,
  Users,
  Stethoscope,
  ChevronRight,
  Sliders,
  Shield,
  MapPin,
} from "lucide-react";
import type { RBACSummary } from "@/lib/types/admin-dashboard";

interface RBACShortcutsCardProps {
  rbac: RBACSummary;
}

export function RBACShortcutsCard({ rbac }: RBACShortcutsCardProps) {
  const shortcuts = [
    {
      title: "Permissions Matrix",
      description: "Manage granular read/write permissions mapped to roles.",
      href: "/admin/settings/roles",
      icon: Key,
      colorClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      badgeText: `${rbac.totalPermissions} Permissions`,
    },
    {
      title: "User Role Assignments",
      description: "Assign roles, toggle user status, and manage staff credentials.",
      href: "/admin/users",
      icon: Users,
      colorClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      badgeText: "Staff & Patients",
    },
    {
      title: "Doctor Shift & Roster Controls",
      description: "Oversee active shift status, clinic rooms, and doctor bios.",
      href: "/admin/users/doctors",
      icon: Stethoscope,
      colorClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      badgeText: "Shift Schedules",
    },
    {
      title: "Clinic & Facility Locations",
      description: "Configure clinic branches, consultation rooms, and doors.",
      href: "/admin/locations",
      icon: MapPin,
      colorClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      badgeText: "Room Doors",
    },
  ];

  return (
    <Card className="flex flex-col h-full shadow-sm hover:shadow transition-shadow duration-200">
      <CardHeader className="pt-5 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <CardTitle className="text-xl font-bold">Role-Based Access Control (RBAC)</CardTitle>
            </div>
            <CardDescription className="mt-1">
              Shortcuts to configure system permissions, staff shifts, and user credentials.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-purple-500/5 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-800">
              {rbac.totalRoles} Active Roles
            </Badge>
            <Badge variant="outline" className="bg-blue-500/5 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800">
              {rbac.totalPermissions} Permissions
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-10 flex-1 flex flex-col justify-between space-y-4">
        {/* Quick Shortcuts List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {shortcuts.map((shortcut) => {
            const Icon = shortcut.icon;
            return (
              <Link
                key={shortcut.title}
                href={shortcut.href}
                className="group p-3.5 rounded-xl border border-border/80 hover:border-primary/50 hover:bg-muted/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg border ${shortcut.colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-normal py-0 px-2">
                      {shortcut.badgeText}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                    {shortcut.title}
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-primary" />
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {shortcut.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Roles Distribution Pills */}
        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-muted-foreground" />
              Configured System Roles
            </span>
            <Link
              href="/admin/settings/roles"
              className="text-xs text-primary hover:underline font-medium"
            >
              Configure Matrix
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            {rbac.roles.map((role) => (
              <div
                key={role.id}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-background border border-border/70 text-xs"
              >
                <Shield className="w-3 h-3 text-muted-foreground" />
                <span className="font-semibold text-foreground capitalize">{role.name}</span>
                <span className="text-muted-foreground text-[10px]">
                  ({role.usersCount} users • {role.permsCount} perms)
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
