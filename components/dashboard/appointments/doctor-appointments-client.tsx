"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { AppointmentsFilters } from "./appointments-filters";
import { AppointmentDetailsModal } from "@/components/admin/appointments/appointment-details-modal";
import {
  DoctorAppointmentsProvider,
  useDoctorAppointments,
  type DoctorAppointmentRecord,
  type DoctorAppointmentColumn,
} from "@/contexts/doctor-appointments-context";
import type { AdminAppointmentRecord } from "@/components/admin/appointments/columns";

interface DoctorAppointmentsClientProps {
  initialAppointments: DoctorAppointmentRecord[];
}

function AppointmentsContent() {
  const router = useRouter();
  const {
    filteredData,
    selectedAppointment,
    isModalOpen,
    openViewModal,
    closeViewModal,
    updateStatus,
  } = useDoctorAppointments();

  const columns = getColumns(openViewModal, updateStatus);

  const handleRowClick = (row: DoctorAppointmentColumn) => {
    router.push(`/dashboard/appointments/${row.appointment_number}`);
  };

  return (
    <div className="space-y-4 pb-10">
      <AppointmentsFilters />
      <DataTable
        columns={columns}
        data={filteredData}
        onRowClick={handleRowClick}
      />
      <AppointmentDetailsModal
        appointment={selectedAppointment as unknown as AdminAppointmentRecord}
        isOpen={isModalOpen}
        onClose={closeViewModal}
      />
    </div>
  );
}

export function DoctorAppointmentsClient({
  initialAppointments,
}: DoctorAppointmentsClientProps) {
  return (
    <DoctorAppointmentsProvider initialAppointments={initialAppointments}>
      <AppointmentsContent />
    </DoctorAppointmentsProvider>
  );
}
