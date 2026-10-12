"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  UserCheck,
  ArrowUpRight,
  Shield,
  Stethoscope,
  HeartPulse,
  UserCog,
  Laptop,
  Clock,
  User,
} from "lucide-react";
import type {
  ActiveStaffSession,
  StaffRole,
} from "@/lib/types/admin-dashboard";

interface ActiveUserLogsCardProps {
  activeStaff: ActiveStaffSession[];
}

type RoleFilter = "all" | StaffRole;

export function ActiveUserLogsCard({ activeStaff }: ActiveUserLogsCardProps) {
  const [activeFilter, setActiveFilter] = useState<RoleFilter>("all");

  const doctorsCount = activeStaff.filter((s) => s.role === "doctor").length;
  const nursesCount = activeStaff.filter((s) => s.role === "nurse").length;
  const staffCount = activeStaff.filter((s) => s.role === "staff").length;
  const adminsCount = activeStaff.filter((s) => s.role === "admin").length;

  const filteredStaff = activeStaff.filter((s) => {
    if (activeFilter === "all") return true;
    return s.role === activeFilter;
  });

  const getRoleBadge = (role: StaffRole) => {
    switch (role) {
      case "admin":
        return (
          <Badge
            variant="outline"
            className="bg-purple-500/10 text-purple-700 border-purple-300 dark:border-purple-800 dark:text-purple-400 gap-1 font-medium"
          >
            <Shield className="w-3 h-3 text-purple-600" />
            Admin
          </Badge>
        );
      case "doctor":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-700 border-emerald-300 dark:border-emerald-800 dark:text-emerald-400 gap-1 font-medium"
          >
            <Stethoscope className="w-3 h-3 text-emerald-600" />
            Doctor
          </Badge>
        );
      case "nurse":
        return (
          <Badge
            variant="outline"
            className="bg-cyan-500/10 text-cyan-700 border-cyan-300 dark:border-cyan-800 dark:text-cyan-400 gap-1 font-medium"
          >
            <HeartPulse className="w-3 h-3 text-cyan-600" />
            Nurse
          </Badge>
        );
      case "staff":
        return (
          <Badge
            variant="outline"
            className="bg-blue-500/10 text-blue-700 border-blue-300 dark:border-blue-800 dark:text-blue-400 gap-1 font-medium"
          >
            <UserCog className="w-3 h-3 text-blue-600" />
            Receptionist / Staff
          </Badge>
        );
    }
  };

  const formatActivityTime = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(date);
    } catch {
      return "Recently";
    }
  };

  return (
    <Card className="flex flex-col h-full shadow-sm hover:shadow transition-shadow duration-200">
      <CardHeader className="pt-5 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                <UserCheck className="w-5 h-5" />
              </div>
              <CardTitle className="text-xl font-bold">Active User Logs</CardTitle>
            </div>
            <CardDescription className="mt-1">
              Live authenticated session presence across clinical and admin staff.
            </CardDescription>
          </div>

          <Link href="/admin/users">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              User Directory
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Staff Role Online Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
          <div
            onClick={() => setActiveFilter("doctor")}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${activeFilter === "doctor"
                ? "bg-emerald-50/80 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800 shadow-xs"
                : "bg-card hover:bg-muted/40 border-border"
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">Doctors</span>
              <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {doctorsCount}
            </p>
          </div>

          <div
            onClick={() => setActiveFilter("nurse")}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${activeFilter === "nurse"
                ? "bg-cyan-50/80 border-cyan-300 dark:bg-cyan-950/40 dark:border-cyan-800 shadow-xs"
                : "bg-card hover:bg-muted/40 border-border"
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">Nurses</span>
              <HeartPulse className="w-3.5 h-3.5 text-cyan-600" />
            </div>
            <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">
              {nursesCount}
            </p>
          </div>

          <div
            onClick={() => setActiveFilter("staff")}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${activeFilter === "staff"
                ? "bg-blue-50/80 border-blue-300 dark:bg-blue-950/40 dark:border-blue-800 shadow-xs"
                : "bg-card hover:bg-muted/40 border-border"
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">Receptionists</span>
              <UserCog className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">
              {staffCount}
            </p>
          </div>

          <div
            onClick={() => setActiveFilter("admin")}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${activeFilter === "admin"
                ? "bg-purple-50/80 border-purple-300 dark:bg-purple-950/40 dark:border-purple-800 shadow-xs"
                : "bg-card hover:bg-muted/40 border-border"
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">Admins</span>
              <Shield className="w-3 h-3 text-purple-600" />
            </div>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-0.5">
              {adminsCount}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-10 flex-1 flex flex-col">
        {/* Role Filters bar */}
        <div className="flex items-center gap-1.5 pb-3 text-xs flex-wrap">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-2.5 py-1 rounded-md transition-colors ${activeFilter === "all"
                ? "bg-primary text-primary-foreground font-semibold"
                : "bg-muted hover:bg-muted/80 text-foreground"
              }`}
          >
            All Active ({activeStaff.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("doctor")}
            className={`px-2.5 py-1 rounded-md transition-colors ${activeFilter === "doctor"
                ? "bg-emerald-600 text-white font-semibold"
                : "bg-muted hover:bg-muted/80 text-foreground"
              }`}
          >
            Doctors ({doctorsCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("nurse")}
            className={`px-2.5 py-1 rounded-md transition-colors ${activeFilter === "nurse"
                ? "bg-cyan-600 text-white font-semibold"
                : "bg-muted hover:bg-muted/80 text-foreground"
              }`}
          >
            Nurses ({nursesCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("staff")}
            className={`px-2.5 py-1 rounded-md transition-colors ${activeFilter === "staff"
                ? "bg-blue-600 text-white font-semibold"
                : "bg-muted hover:bg-muted/80 text-foreground"
              }`}
          >
            Receptionists ({staffCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("admin")}
            className={`px-2.5 py-1 rounded-md transition-colors ${activeFilter === "admin"
                ? "bg-purple-600 text-white font-semibold"
                : "bg-muted hover:bg-muted/80 text-foreground"
              }`}
          >
            Admins ({adminsCount})
          </button>
        </div>

        {/* Sessions Feed */}
        {filteredStaff.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center border rounded-xl border-dashed border-border/80 bg-muted/20 my-auto">
            <UserCheck className="w-8 h-8 text-muted-foreground/60 mb-2" />
            <p className="text-sm font-semibold text-foreground">No active sessions in this role</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Active logged-in staff members will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 overflow-y-auto max-h-[380px] pr-1">
            {filteredStaff.map((session: ActiveStaffSession) => (
              <div
                key={session.id}
                className="p-3 rounded-xl border border-border/70 hover:border-border hover:bg-muted/30 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {session.name}
                      </p>
                      {getRoleBadge(session.role)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Laptop className="w-3 h-3 text-muted-foreground/80" />
                        {session.device}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[11px]">{session.ipAddress}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0 font-mono">
                  <Clock className="w-3 h-3 text-muted-foreground/80" />
                  {formatActivityTime(session.lastActiveAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
