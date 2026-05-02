"use client";

import { useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Calendar } from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { appointmentColumns, type AppointmentColumn } from "./appointment-columns";

interface DoctorAppointmentsProps {
  appointments: any[];
}

export function DoctorAppointments({ appointments }: DoctorAppointmentsProps) {
  const formattedData = useMemo(() => {
    return (appointments || []).map((apt) => ({
      id: apt.id,
      patientName: `${apt.users?.first_name} ${apt.users?.last_name}`,
      patientEmail: apt.users?.email,
      serviceName: apt.services?.name || "General Consultation",
      date: new Date(apt.appointment_date),
      startTime: new Date(apt.start_time),
      endTime: new Date(apt.end_time),
      status: apt.status,
    })) as AppointmentColumn[];
  }, [appointments]);

  if (!appointments || appointments.length === 0) {
    return (
      <Empty className="border-none py-12">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Calendar className="h-6 w-6" />
          </EmptyMedia>
          <EmptyTitle>No appointments found</EmptyTitle>
          <EmptyDescription>
            This doctor doesn't have any appointments scheduled yet.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      <DataTable 
        columns={appointmentColumns} 
        data={formattedData} 
        searchKey="patientName"
      />
    </div>
  );
}
