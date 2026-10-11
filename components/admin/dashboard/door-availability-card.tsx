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
  Stethoscope,
  Coffee,
  CheckCircle,
  DoorOpen,
  ArrowUpRight,
  User,
  MapPin,
  CalendarCheck,
} from "lucide-react";
import type {
  PhysicianDoorStatus,
  PhysicianDutyStatus,
} from "@/lib/types/admin-dashboard";

interface DoorAvailabilityCardProps {
  physicians: PhysicianDoorStatus[];
}

type FilterType = "all" | PhysicianDutyStatus;

export function DoorAvailabilityCard({ physicians }: DoorAvailabilityCardProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const onDutyCount = physicians.filter((p) => p.status === "ON_DUTY").length;
  const onBreakCount = physicians.filter((p) => p.status === "ON_BREAK").length;
  const finishedCount = physicians.filter((p) => p.status === "FINISHED").length;

  const filteredPhysicians = physicians.filter((p) => {
    if (activeFilter === "all") return true;
    return p.status === activeFilter;
  });

  const getDutyBadge = (status: PhysicianDutyStatus) => {
    switch (status) {
      case "ON_DUTY":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-700 border-emerald-300 dark:border-emerald-800 dark:text-emerald-400 gap-1.5 font-medium"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            On-Duty
          </Badge>
        );
      case "ON_BREAK":
        return (
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-700 border-amber-300 dark:border-amber-800 dark:text-amber-400 gap-1.5 font-medium"
          >
            <Coffee className="w-3 h-3 text-amber-600" />
            On Break
          </Badge>
        );
      case "FINISHED":
        return (
          <Badge
            variant="outline"
            className="bg-slate-500/10 text-slate-700 border-slate-300 dark:border-slate-700 dark:text-slate-400 gap-1.5 font-medium"
          >
            <CheckCircle className="w-3 h-3 text-slate-500" />
            Finished
          </Badge>
        );
    }
  };

  return (
    <Card className="flex flex-col h-full shadow-sm hover:shadow transition-shadow duration-200">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                <DoorOpen className="w-5 h-5" />
              </div>
              <CardTitle className="text-xl font-bold">Door & Physician Availability</CardTitle>
            </div>
            <CardDescription className="mt-1">
              Live consultation room status and physician shift presence.
            </CardDescription>
          </div>

          <Link href="/admin/users/doctors">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              Doctor Management
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Live Status Indicators */}
        <div className="grid grid-cols-3 gap-2.5 pt-3">
          <div
            onClick={() => setActiveFilter("ON_DUTY")}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              activeFilter === "ON_DUTY"
                ? "bg-emerald-50/80 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800 shadow-xs"
                : "bg-card hover:bg-muted/40 border-border"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">On-Duty</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {onDutyCount}
            </p>
          </div>

          <div
            onClick={() => setActiveFilter("ON_BREAK")}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              activeFilter === "ON_BREAK"
                ? "bg-amber-50/80 border-amber-300 dark:bg-amber-950/40 dark:border-amber-800 shadow-xs"
                : "bg-card hover:bg-muted/40 border-border"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">On Break</span>
              <Coffee className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {onBreakCount}
            </p>
          </div>

          <div
            onClick={() => setActiveFilter("FINISHED")}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              activeFilter === "FINISHED"
                ? "bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-700 shadow-xs"
                : "bg-card hover:bg-muted/40 border-border"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Finished</span>
              <CheckCircle className="w-3.5 h-3.5 text-slate-600" />
            </div>
            <p className="text-2xl font-bold text-slate-700 dark:text-slate-300 mt-1">
              {finishedCount}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 flex-1 flex flex-col">
        {/* Filter bar */}
        <div className="flex items-center gap-1.5 pb-3 text-xs flex-wrap">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeFilter === "all"
                ? "bg-primary text-primary-foreground font-semibold"
                : "bg-muted hover:bg-muted/80 text-foreground"
            }`}
          >
            All Doctors ({physicians.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("ON_DUTY")}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeFilter === "ON_DUTY"
                ? "bg-emerald-600 text-white font-semibold"
                : "bg-muted hover:bg-muted/80 text-foreground"
            }`}
          >
            On-Duty ({onDutyCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("ON_BREAK")}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeFilter === "ON_BREAK"
                ? "bg-amber-600 text-white font-semibold"
                : "bg-muted hover:bg-muted/80 text-foreground"
            }`}
          >
            On Break ({onBreakCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("FINISHED")}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeFilter === "FINISHED"
                ? "bg-slate-700 text-white font-semibold"
                : "bg-muted hover:bg-muted/80 text-foreground"
            }`}
          >
            Finished ({finishedCount})
          </button>
        </div>

        {/* Doctors Grid / List */}
        {filteredPhysicians.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center border rounded-xl border-dashed border-border/80 bg-muted/20 my-auto">
            <Stethoscope className="w-8 h-8 text-muted-foreground/60 mb-2" />
            <p className="text-sm font-semibold text-foreground">No physicians found</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Doctors matching this filter will show their live availability here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 overflow-y-auto max-h-[380px] pr-1">
            {filteredPhysicians.map((physician: PhysicianDoorStatus) => (
              <div
                key={physician.id}
                className="p-3.5 rounded-xl border border-border/70 hover:border-border hover:bg-muted/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 font-semibold text-sm border border-emerald-500/20">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {physician.name}
                      </p>
                      {physician.specialization && (
                        <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4 font-normal">
                          {physician.specialization}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-muted-foreground/80" />
                        {physician.locationName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <CalendarCheck className="w-3 h-3 text-muted-foreground/80" />
                        {physician.todayAppointmentsCount} scheduled today
                      </span>
                    </div>

                    {physician.currentPatientName && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                        In consultation with: {physician.currentPatientName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center sm:self-center shrink-0">
                  {getDutyBadge(physician.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
