"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CalendarX,
  RotateCcw,
} from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { useRouter } from "next/navigation";
import { format, isToday } from "date-fns";
import { useSchedule, ScheduleSortField } from "./schedule-context";
import type { DoctorAppointmentView } from "@/lib/types/doctor-dashboard";

export function ScheduleTable() {
  const router = useRouter();
  const {
    paginatedAppointments,
    sortField,
    sortOrder,
    handleSort,
    hasActiveFilters,
    resetFilters,
    totalFilteredCount,
  } = useSchedule();

  const handleRowClick = (patientId: string) => {
    router.push(`/dashboard/patients/${patientId}`);
  };

  const renderSortIndicator = (field: ScheduleSortField) => {
    if (sortField !== field) {
      return (
        <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground/60 transition-colors group-hover:text-foreground" />
      );
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-primary font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-primary font-bold" />
    );
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-semibold px-2.5 py-0.5 rounded-full capitalize"
          >
            Confirmed
          </Badge>
        );
      case "checked_in":
        return (
          <Badge
            variant="outline"
            className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 font-semibold px-2.5 py-0.5 rounded-full capitalize"
          >
            Checked In
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20 font-semibold px-2.5 py-0.5 rounded-full capitalize"
          >
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 font-semibold px-2.5 py-0.5 rounded-full capitalize"
          >
            Cancelled
          </Badge>
        );
      case "no_show":
        return (
          <Badge
            variant="outline"
            className="bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20 font-semibold px-2.5 py-0.5 rounded-full capitalize"
          >
            No Show
          </Badge>
        );
      case "pending":
      default:
        return (
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 font-semibold px-2.5 py-0.5 rounded-full capitalize"
          >
            Pending
          </Badge>
        );
    }
  };

  if (totalFilteredCount === 0) {
    return (
      <div className="rounded-2xl border border-border/70 bg-card p-12 shadow-xs">
        <Empty className="py-8">
          <EmptyMedia variant="icon">
            <CalendarX className="w-8 h-8 text-muted-foreground" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>
              {hasActiveFilters
                ? "No matching appointments found"
                : "No appointments scheduled"}
            </EmptyTitle>
            <EmptyDescription>
              {hasActiveFilters
                ? "Try adjusting your search keywords, status filter, or timeframe selection."
                : "There are currently no visits registered for your clinical schedule."}
            </EmptyDescription>
          </EmptyHeader>
          {hasActiveFilters && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="gap-2 rounded-xl"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear Filters
              </Button>
            </div>
          )}
        </Empty>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-xs">
      <Table>
        <TableHeader className="bg-muted/40 border-b border-border/70">
          <TableRow className="hover:bg-transparent">
            {/* Patient */}
            <TableHead className="py-3.5 pl-4 pr-3 text-left">
              <button
                type="button"
                onClick={() => handleSort("patient")}
                className="group flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
              >
                <span>Patient</span>
                {renderSortIndicator("patient")}
              </button>
            </TableHead>

            {/* Date & Time */}
            <TableHead className="py-3.5 px-3 text-left">
              <button
                type="button"
                onClick={() => handleSort("date")}
                className="group flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
              >
                <span>Date & Time</span>
                {renderSortIndicator("date")}
              </button>
            </TableHead>

            {/* Service */}
            <TableHead className="py-3.5 px-3 text-left">
              <button
                type="button"
                onClick={() => handleSort("service")}
                className="group flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
              >
                <span>Service</span>
                {renderSortIndicator("service")}
              </button>
            </TableHead>

            {/* Location */}
            <TableHead className="py-3.5 px-3 text-left">
              <button
                type="button"
                onClick={() => handleSort("location")}
                className="group flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
              >
                <span>Location</span>
                {renderSortIndicator("location")}
              </button>
            </TableHead>

            {/* Status */}
            <TableHead className="py-3.5 px-3 text-left">
              <button
                type="button"
                onClick={() => handleSort("status")}
                className="group flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none"
              >
                <span>Status</span>
                {renderSortIndicator("status")}
              </button>
            </TableHead>

            {/* Action */}
            <TableHead className="py-3.5 pr-4 pl-3 text-right">
              <span className="text-xs font-semibold text-muted-foreground">
                Action
              </span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {paginatedAppointments.map((apt: DoctorAppointmentView) => {
            const aptDate = new Date(apt.appointment_date);
            const isVisitToday = isToday(aptDate);
            const patientInitials = `${apt.users.first_name?.[0] || ""}${apt.users.last_name?.[0] || ""}`.toUpperCase();

            return (
              <TableRow
                key={apt.id}
                onClick={() => handleRowClick(apt.patient_id)}
                className="hover:bg-muted/40 transition-colors border-b border-border/50 group cursor-pointer"
              >
                {/* Patient Information */}
                <TableCell className="py-3.5 pl-4 pr-3 align-middle">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 rounded-full border border-border/60">
                      <AvatarImage
                        src={apt.users.avatar_url || undefined}
                        alt={`${apt.users.first_name} ${apt.users.last_name}`}
                      />
                      <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                        {patientInitials || "PT"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                          {apt.users.first_name} {apt.users.last_name}
                        </span>
                        {apt.users.is_guest && (
                          <Badge
                            variant="secondary"
                            className="text-[9px] font-bold uppercase tracking-tight h-4 px-1 rounded-sm"
                          >
                            Guest
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {apt.users.email || apt.users.phone || "No contact info"}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Date & Time */}
                <TableCell className="py-3.5 px-3 align-middle">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                      <Calendar className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                      <span>{format(aptDate, "MMM dd, yyyy")}</span>
                      {isVisitToday && (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-1.5 py-0 h-4 border-none"
                        >
                          Today
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 text-muted-foreground/70 shrink-0" />
                      <span>
                        {format(new Date(apt.start_time), "hh:mm a")} -{" "}
                        {format(new Date(apt.end_time), "hh:mm a")}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Service */}
                <TableCell className="py-3.5 px-3 align-middle">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-foreground">
                      {apt.services?.name || "Consultation"}
                    </span>
                    {apt.services?.duration_minutes && (
                      <span className="text-xs text-muted-foreground">
                        {apt.services.duration_minutes} mins
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Location */}
                <TableCell className="py-3.5 px-3 align-middle">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                    <span className="font-medium text-foreground truncate max-w-[160px]">
                      {apt.locations?.name || "Main Clinic"}
                    </span>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell className="py-3.5 px-3 align-middle">
                  {getStatusBadge(apt.status)}
                </TableCell>

                {/* Action */}
                <TableCell className="py-3.5 pr-4 pl-3 text-right align-middle">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-lg px-2 text-muted-foreground group-hover:text-primary group-hover:bg-primary/5 transition-colors gap-1 text-xs font-semibold"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRowClick(apt.patient_id);
                    }}
                  >
                    <span>EMR</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
