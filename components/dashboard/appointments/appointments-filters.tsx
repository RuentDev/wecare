"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RotateCcw, Filter } from "lucide-react";
import { useDoctorAppointments } from "@/contexts/doctor-appointments-context";

export function AppointmentsFilters() {
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    hasActiveFilters,
    resetFilters,
    totalFilteredCount,
    formattedData,
  } = useDoctorAppointments();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 flex-wrap">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              id="appointment-search-input"
              type="text"
              placeholder="Search patient, service, or APT #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9.5 text-sm bg-background border-border/70 focus-visible:ring-primary/20 shadow-xs"
            />
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-[180px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger
                id="appointment-status-filter"
                className="h-9.5 text-sm bg-background border-border/70 shadow-xs w-full"
              >
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="gap-1.5 text-xs h-9.5 text-muted-foreground hover:text-foreground shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filters
            </Button>
          )}
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
          <Badge
            variant="outline"
            className="text-xs font-medium px-2.5 py-1 bg-muted/40 border-border/70 text-muted-foreground gap-1.5"
          >
            <Filter className="w-3 h-3 text-muted-foreground" />
            Showing{" "}
            <span className="font-semibold text-foreground">
              {totalFilteredCount}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">
              {formattedData.length}
            </span>{" "}
            appointments
          </Badge>
        </div>
      </div>
    </div>
  );
}
