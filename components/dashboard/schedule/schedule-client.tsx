"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ScheduleProvider } from "./schedule-context";
import { ScheduleFilters } from "./schedule-filters";
import { ScheduleTable } from "./schedule-table";
import { SchedulePagination } from "./schedule-pagination";
import { DoctorLeaveModal } from "./doctor-leave-modal";
import { DoctorLeaveHistory } from "./doctor-leave-history";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, CalendarOff, Plus } from "lucide-react";
import { getDoctorLeaveRequests } from "@/lib/actions/doctor-leaves";
import type { DoctorAppointmentView } from "@/lib/types/doctor-dashboard";
import type { DoctorLeaveRequest } from "@/lib/types/leave-requests";

interface ScheduleClientProps {
  initialAppointments: DoctorAppointmentView[];
  initialLeaveRequests?: DoctorLeaveRequest[];
  doctorId: string;
}

export function ScheduleClient({
  initialAppointments,
  initialLeaveRequests = [],
  doctorId,
}: ScheduleClientProps) {
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveRequests, setLeaveRequests] =
    useState<DoctorLeaveRequest[]>(initialLeaveRequests);

  const refreshLeaves = useCallback(async () => {
    const res = await getDoctorLeaveRequests(doctorId);
    if (res.success && res.data) {
      setLeaveRequests(res.data);
    }
  }, [doctorId]);

  useEffect(() => {
    refreshLeaves();
  }, [refreshLeaves]);

  const pendingLeavesCount = leaveRequests.filter(
    (r) => r.status === "pending",
  ).length;

  return (
    <ScheduleProvider
      initialAppointments={initialAppointments}
      doctorId={doctorId}
    >
      <div className="space-y-6 animate-in-fade">
        {/* Header with Title and Quick Request Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Appointment & Schedule
            </h1>
            <p className="text-muted-foreground mt-1 text-sm font-medium">
              Manage clinical visits, review appointments, and apply for scheduled leave.
            </p>
          </div>

          <Button
            onClick={() => setIsLeaveModalOpen(true)}
            className="rounded-xl font-semibold gap-2 shadow-sm cursor-pointer self-start sm:self-center"
          >
            <CalendarOff className="w-4 h-4" /> Request Time Off
          </Button>
        </div>

        {/* Schedule & Leave Tabs */}
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 h-11 p-1">
            <TabsTrigger
              value="appointments"
              className="cursor-pointer px-5 h-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all gap-2 rounded-xl text-sm font-semibold"
            >
              <CalendarDays className="h-4 w-4" />
              Patient Appointments
            </TabsTrigger>
            <TabsTrigger
              value="leaves"
              className="cursor-pointer px-5 h-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all gap-2 rounded-xl text-sm font-semibold"
            >
              <CalendarOff className="h-4 w-4" />
              My Leave Requests
              {pendingLeavesCount > 0 && (
                <Badge className="ml-1 bg-amber-500 text-white border-none text-[10px] h-4 px-1.5 min-w-4 flex justify-center">
                  {pendingLeavesCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-6">
            {/* Toolbar & Filters */}
            <ScheduleFilters />

            {/* Appointments Table */}
            <ScheduleTable />

            {/* Pagination Controls */}
            <SchedulePagination />
          </TabsContent>

          <TabsContent value="leaves" className="space-y-6">
            <DoctorLeaveHistory
              requests={leaveRequests}
              onRefresh={refreshLeaves}
              onRequestNew={() => setIsLeaveModalOpen(true)}
            />
          </TabsContent>
        </Tabs>

        {/* Doctor Leave Submission Dialog */}
        <DoctorLeaveModal
          isOpen={isLeaveModalOpen}
          onOpenChange={setIsLeaveModalOpen}
          doctorId={doctorId}
          onSuccess={refreshLeaves}
        />
      </div>
    </ScheduleProvider>
  );
}
