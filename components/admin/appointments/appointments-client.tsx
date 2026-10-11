"use client";

import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { getColumns, type AdminAppointmentRecord } from "./columns";
import { AppointmentDetailsModal } from "./appointment-details-modal";
import { AppointmentsFilters } from "./appointments-filters";
import {
  AppointmentsProvider,
  useAppointments,
} from "@/contexts/appointments-context";

interface AppointmentsClientProps {
  initialAppointments: AdminAppointmentRecord[];
}

function AppointmentsContent() {
  const { filteredData, selectedAppointment, isModalOpen, openViewModal, closeViewModal } =
    useAppointments();

  const columns = getColumns(openViewModal);

  return (
    <div className="space-y-4 pb-10">
      <AppointmentsFilters />
      <DataTable columns={columns} data={filteredData} />
      <AppointmentDetailsModal
        appointment={selectedAppointment}
        isOpen={isModalOpen}
        onClose={closeViewModal}
      />
    </div>
  );
}

export function AppointmentsClient({
  initialAppointments,
}: AppointmentsClientProps) {
  return (
    <AppointmentsProvider initialAppointments={initialAppointments}>
      <AppointmentsContent />
    </AppointmentsProvider>
  );
}
