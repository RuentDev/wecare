"use client";

import React from "react";
import { Search, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSchedule, TimeframeFilter } from "./schedule-context";

const TIMEFRAME_OPTIONS: { id: TimeframeFilter; label: string }[] = [
  { id: "all", label: "All Visits" },
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
];

export function ScheduleFilters() {
  const {
    searchQuery,
    setSearchQuery,
    selectedTimeframe,
    setSelectedTimeframe,
    selectedStatus,
    setSelectedStatus,
    timeframeCounts,
    hasActiveFilters,
    resetFilters,
  } = useSchedule();

  return (
    <div className="space-y-4">
      {/* Timeframe pill tabs & Quick Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {TIMEFRAME_OPTIONS.map((item) => {
            const count = timeframeCounts[item.id];
            const isActive = selectedTimeframe === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedTimeframe(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span>{item.label}</span>
                <Badge
                  variant={isActive ? "secondary" : "outline"}
                  className={`px-1.5 py-0 text-xs font-bold rounded-lg ${
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground border-transparent"
                      : "bg-background/80 text-muted-foreground"
                  }`}
                >
                  {count}
                </Badge>
              </button>
            );
          })}
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-muted-foreground hover:text-foreground gap-1.5 h-9 rounded-xl font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset filters
          </Button>
        )}
      </div>

      {/* Search Input & Status Filter Dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient name, email, service, or clinic location..."
            className="pl-10 h-11 bg-card rounded-xl border-border/80 focus-visible:ring-primary shadow-2xs text-sm"
          />
        </div>

        {/* Status Dropdown */}
        <div className="w-full sm:w-56">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="h-11 bg-card rounded-xl border-border/80 text-sm shadow-2xs">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border shadow-lg">
              <SelectItem value="all" className="rounded-lg">All Statuses</SelectItem>
              <SelectItem value="confirmed" className="rounded-lg">Confirmed</SelectItem>
              <SelectItem value="checked_in" className="rounded-lg">Checked In</SelectItem>
              <SelectItem value="completed" className="rounded-lg">Completed</SelectItem>
              <SelectItem value="pending" className="rounded-lg">Pending</SelectItem>
              <SelectItem value="cancelled" className="rounded-lg">Cancelled</SelectItem>
              <SelectItem value="no_show" className="rounded-lg">No Show</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
