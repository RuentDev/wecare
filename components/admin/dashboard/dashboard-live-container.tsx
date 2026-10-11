"use client";

import { useState, useEffect, useTransition } from "react";
import Stats from "@/components/admin/stats";
import { OperationalMetrics } from "@/components/admin/dashboard/operational-metrics";
import { StaffManagement } from "@/components/admin/dashboard/staff-management";
import { getAdminDashboardData } from "@/lib/actions/admin-dashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCw, Activity } from "lucide-react";
import { toast } from "sonner";
import type { AdminDashboardData } from "@/lib/types/admin-dashboard";

interface DashboardLiveContainerProps {
  initialData: AdminDashboardData;
}

export function DashboardLiveContainer({ initialData }: DashboardLiveContainerProps) {
  const [data, setData] = useState<AdminDashboardData>(initialData);
  const [isPending, startTransition] = useTransition();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [secondsAgo, setSecondsAgo] = useState<number>(0);

  // Background ticker to calculate relative "seconds ago"
  useEffect(() => {
    const timer = setInterval(() => {
      const diffSec = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
      setSecondsAgo(diffSec);
    }, 1000);

    return () => clearInterval(timer);
  }, [lastUpdated]);

  // 30-second silent background polling
  useEffect(() => {
    const pollInterval = setInterval(() => {
      startTransition(async () => {
        try {
          const freshData = await getAdminDashboardData();
          setData(freshData);
          setLastUpdated(new Date());
        } catch (error) {
          console.error("Background dashboard poll failed:", error);
        }
      });
    }, 30000); // 30 seconds

    return () => clearInterval(pollInterval);
  }, []);

  // Manual refresh trigger
  const handleManualRefresh = () => {
    startTransition(async () => {
      try {
        const freshData = await getAdminDashboardData();
        setData(freshData);
        setLastUpdated(new Date());
        toast.success("Dashboard metrics refreshed!");
      } catch (error) {
        console.error("Manual dashboard refresh failed:", error);
        toast.error("Failed to refresh dashboard data");
      }
    });
  };

  const formatRelativeTime = (seconds: number): string => {
    if (seconds < 5) return "Updated just now";
    if (seconds < 60) return `Updated ${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `Updated ${minutes}m ago`;
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header with Title and Live Refresh Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Clinic Operations Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Real-time patient queue metrics, physician door availability, active staff logs, and access control.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 px-3 py-1.5 rounded-xl shadow-xs gap-2 font-medium"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            Live Polling: 30s
          </Badge>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono hidden md:inline-block">
              {formatRelativeTime(secondsAgo)}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isPending}
              className="gap-2 text-xs font-semibold shadow-xs hover:bg-muted"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isPending ? "animate-spin text-primary" : ""}`} />
              {isPending ? "Syncing..." : "Refresh"}
            </Button>
          </div>
        </div>
      </div>

      {/* Top Summary Metrics Cards */}
      <Stats stats={data.stats} />

      {/* Operational & Appointment Metrics: Patient Queue & Physician Door Availability */}
      <OperationalMetrics queue={data.queue} physicians={data.physicians} />

      {/* Staff & Role Management: Active User Logs & RBAC Shortcuts */}
      <StaffManagement activeStaff={data.activeStaff} rbac={data.rbac} />
    </div>
  );
}
