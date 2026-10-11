"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
  useTransition,
} from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  getDoctorAppointments,
  updateAppointmentStatus,
  type AppointmentStatus,
} from "@/lib/actions/appointments";

export type DoctorAppointmentRecord = Awaited<
  ReturnType<typeof getDoctorAppointments>
>[number];

export interface DoctorAppointmentColumn {
  id: string;
  appointment_number: string;
  patientName: string;
  patientEmail: string;
  serviceName: string;
  date: string;
  time: string;
  status: string;
  isGuest: boolean;
  raw: DoctorAppointmentRecord;
}

export interface DoctorAppointmentsContextType {
  // Data
  appointments: DoctorAppointmentRecord[];
  formattedData: DoctorAppointmentColumn[];
  filteredData: DoctorAppointmentColumn[];
  totalFilteredCount: number;

  // Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  hasActiveFilters: boolean;
  resetFilters: () => void;

  // Actions
  isUpdating: boolean;
  updateStatus: (id: string, status: AppointmentStatus) => Promise<void>;

  // Modal
  selectedAppointment: DoctorAppointmentRecord | null;
  isModalOpen: boolean;
  openViewModal: (appointment: DoctorAppointmentRecord) => void;
  closeViewModal: () => void;
}

const DoctorAppointmentsContext = createContext<
  DoctorAppointmentsContextType | undefined
>(undefined);

interface DoctorAppointmentsProviderProps {
  children: ReactNode;
  initialAppointments: DoctorAppointmentRecord[];
}

export function DoctorAppointmentsProvider({
  children,
  initialAppointments,
}: DoctorAppointmentsProviderProps) {
  const [appointments, setAppointments] =
    useState<DoctorAppointmentRecord[]>(initialAppointments);
  const [selectedAppointment, setSelectedAppointment] =
    useState<DoctorAppointmentRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const formattedData: DoctorAppointmentColumn[] = useMemo(() => {
    return appointments.map((apt) => ({
      id: apt.id,
      appointment_number:
        apt.appointment_number || `APT-${apt.id.slice(0, 8).toUpperCase()}`,
      patientName:
        `${apt.users?.first_name || ""} ${apt.users?.last_name || ""}`.trim() ||
        "N/A",
      patientEmail: apt.users?.email || "N/A",
      serviceName: apt.services?.name || "N/A",
      date: apt.appointment_date
        ? format(new Date(apt.appointment_date), "MMM dd, yyyy")
        : "N/A",
      time: apt.start_time
        ? format(new Date(apt.start_time), "hh:mm a")
        : "N/A",
      status: apt.status || "pending",
      isGuest: apt.users?.is_guest || false,
      raw: apt,
    }));
  }, [appointments]);

  const filteredData = useMemo(() => {
    return formattedData.filter((item) => {
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      const search = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !search ||
        item.patientName.toLowerCase().includes(search) ||
        item.patientEmail.toLowerCase().includes(search) ||
        item.serviceName.toLowerCase().includes(search) ||
        item.appointment_number.toLowerCase().includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [formattedData, statusFilter, searchQuery]);

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all";

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const openViewModal = (appointment: DoctorAppointmentRecord) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const closeViewModal = () => {
    setIsModalOpen(false);
  };

  const updateStatus = async (id: string, newStatus: AppointmentStatus) => {
    startTransition(async () => {
      const previousAppointments = appointments;
      // Optimistic update
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
      );

      const result = await updateAppointmentStatus(id, newStatus);
      if (result.success) {
        toast.success(`Appointment marked as ${newStatus}`);
      } else {
        setAppointments(previousAppointments);
        toast.error(result.error || "Failed to update appointment status");
      }
    });
  };

  const value: DoctorAppointmentsContextType = {
    appointments,
    formattedData,
    filteredData,
    totalFilteredCount: filteredData.length,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    hasActiveFilters,
    resetFilters,
    isUpdating: isPending,
    updateStatus,
    selectedAppointment,
    isModalOpen,
    openViewModal,
    closeViewModal,
  };

  return (
    <DoctorAppointmentsContext.Provider value={value}>
      {children}
    </DoctorAppointmentsContext.Provider>
  );
}

export function useDoctorAppointments(): DoctorAppointmentsContextType {
  const context = useContext(DoctorAppointmentsContext);
  if (!context) {
    throw new Error(
      "useDoctorAppointments must be used within a DoctorAppointmentsProvider"
    );
  }
  return context;
}
