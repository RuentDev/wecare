"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
} from "react";
import { format } from "date-fns";
import type {
  AdminAppointmentRecord,
  AppointmentColumn,
} from "@/components/admin/appointments/columns";

export interface AppointmentsContextType {
  // Raw and Formatted Data
  initialAppointments: AdminAppointmentRecord[];
  formattedData: AppointmentColumn[];
  filteredData: AppointmentColumn[];
  totalFilteredCount: number;

  // Filter State
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  hasActiveFilters: boolean;
  resetFilters: () => void;

  // Modal State
  selectedAppointment: AdminAppointmentRecord | null;
  isModalOpen: boolean;
  openViewModal: (appointment: AdminAppointmentRecord) => void;
  closeViewModal: () => void;
}

const AppointmentsContext = createContext<AppointmentsContextType | undefined>(
  undefined,
);

interface AppointmentsProviderProps {
  children: ReactNode;
  initialAppointments: AdminAppointmentRecord[];
}

export function AppointmentsProvider({
  children,
  initialAppointments,
}: AppointmentsProviderProps) {
  const [selectedAppointment, setSelectedAppointment] =
    useState<AdminAppointmentRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const formattedData: AppointmentColumn[] = useMemo(() => {
    return initialAppointments.map((apt) => ({
      id: apt.id,
      patientName:
        `${apt.users?.first_name || ""} ${apt.users?.last_name || ""}`.trim() ||
        "N/A",
      doctorName:
        `${apt.doctors?.users?.first_name || ""} ${apt.doctors?.users?.last_name || ""}`.trim() ||
        "N/A",
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
  }, [initialAppointments]);

  const filteredData = useMemo(() => {
    return formattedData.filter((item) => {
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      const search = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !search ||
        item.patientName.toLowerCase().includes(search) ||
        item.doctorName.toLowerCase().includes(search) ||
        item.id.toLowerCase().includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [formattedData, statusFilter, searchQuery]);

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all";

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const openViewModal = (appointment: AdminAppointmentRecord) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const closeViewModal = () => {
    setIsModalOpen(false);
  };

  const value: AppointmentsContextType = {
    initialAppointments,
    formattedData,
    filteredData,
    totalFilteredCount: filteredData.length,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    hasActiveFilters,
    resetFilters,
    selectedAppointment,
    isModalOpen,
    openViewModal,
    closeViewModal,
  };

  return (
    <AppointmentsContext.Provider value={value}>
      {children}
    </AppointmentsContext.Provider>
  );
}

export function useAppointments(): AppointmentsContextType {
  const context = useContext(AppointmentsContext);
  if (!context) {
    throw new Error(
      "useAppointments must be used within an AppointmentsProvider",
    );
  }
  return context;
}
