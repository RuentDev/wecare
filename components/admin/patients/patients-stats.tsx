"use client";

import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  UserPlus, 
  CalendarCheck, 
  TrendingUp, 
  Activity,
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PatientsStatsProps {
  stats: {
    totalPatients: number;
    newPatientsThisMonth: number;
    totalAppointments: number;
  };
}

export function PatientsStats({ stats }: PatientsStatsProps) {
  const statItems = [
    {
      label: "Total Patients",
      value: stats.totalPatients.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
      trend: "+12% this month",
      trendColor: "text-emerald-600"
    },
    {
      label: "New Registrations",
      value: stats.newPatientsThisMonth.toLocaleString(),
      icon: UserPlus,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-100",
      trend: "Fresh data",
      trendColor: "text-purple-600"
    },
    {
      label: "Total Visits",
      value: stats.totalAppointments.toLocaleString(),
      icon: CalendarCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      trend: "All-time activity",
      trendColor: "text-emerald-600"
    },
    {
      label: "Active Rate",
      value: "84%",
      icon: Activity,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
      trend: "Stable",
      trendColor: "text-amber-600"
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item, index) => (
        <Card key={index} className="glassmorphism border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110", item.bg, item.color)}>
                <item.icon className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <TrendingUp className="w-3 h-3" />
                Live
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground tracking-tight">
                {item.label}
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tighter text-foreground">
                  {item.value}
                </span>
                <div className={cn("flex items-center text-[10px] font-bold", item.trendColor)}>
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  {item.trend}
                </div>
              </div>
            </div>
            
            <div className="mt-4 h-1 w-full bg-muted/30 rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full transition-all duration-1000", item.color.replace('text', 'bg'))}
                style={{ width: index === 0 ? '70%' : index === 1 ? '45%' : index === 2 ? '90%' : '84%' }}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
