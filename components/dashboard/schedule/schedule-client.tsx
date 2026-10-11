"use client";

import React from "react";
import { ScheduleProvider } from "./schedule-context";
import { ScheduleFilters } from "./schedule-filters";
import { ScheduleTable } from "./schedule-table";
import { SchedulePagination } from "./schedule-pagination";
import type { DoctorAppointmentView } from "@/lib/types/doctor-dashboard";

interface ScheduleClientProps {
  initialAppointments: DoctorAppointmentView[];
  doctorId: string;
}

export function ScheduleClient({ initialAppointments, doctorId }: ScheduleClientProps) {
  return (
    <ScheduleProvider initialAppointments={initialAppointments} doctorId={doctorId}>
      <div className="space-y-6 animate-in-fade">
        {/* Simplified Header - Clean and Focused */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Appointment & Schedule
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            Manage your clinical visits, view appointments, and monitor patient schedules.
          </p>
        </div>

        {/* Toolbar & Filters */}
        <ScheduleFilters />

        {/* Appointments Table */}
        <ScheduleTable />

        {/* Pagination Controls */}
        <SchedulePagination />
      </div>
    </ScheduleProvider>
  );
}
