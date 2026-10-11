"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import type { DoctorAppointmentView } from "@/lib/types/doctor-dashboard";
import { isToday, isFuture, isPast, parseISO } from "date-fns";

export type TimeframeFilter = "all" | "today" | "upcoming" | "past";
export type ScheduleSortField = "date" | "patient" | "service" | "location" | "status";
export type SortOrder = "asc" | "desc";

export interface ScheduleContextType {
  // Raw data
  appointments: DoctorAppointmentView[];
  doctorId: string;

  // Filter state
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTimeframe: TimeframeFilter;
  setSelectedTimeframe: (timeframe: TimeframeFilter) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;

  // Sorting state
  sortField: ScheduleSortField;
  sortOrder: SortOrder;
  handleSort: (field: ScheduleSortField) => void;

  // Pagination & computed data
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalPages: number;
  filteredAppointments: DoctorAppointmentView[];
  paginatedAppointments: DoctorAppointmentView[];
  totalFilteredCount: number;

  // Timeframe statistics
  timeframeCounts: {
    all: number;
    today: number;
    upcoming: number;
    past: number;
  };
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

interface ScheduleProviderProps {
  children: ReactNode;
  initialAppointments: DoctorAppointmentView[];
  doctorId: string;
}

export function ScheduleProvider({
  children,
  initialAppointments,
  doctorId,
}: ScheduleProviderProps) {
  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeFilter>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Sorting
  const [sortField, setSortField] = useState<ScheduleSortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Timeframe counts across all appointments
  const timeframeCounts = useMemo(() => {
    let today = 0;
    let upcoming = 0;
    let past = 0;

    initialAppointments.forEach((apt) => {
      const date = typeof apt.appointment_date === "string" 
        ? parseISO(apt.appointment_date) 
        : new Date(apt.appointment_date);

      if (isToday(date)) {
        today++;
      } else if (isFuture(date)) {
        upcoming++;
      } else if (isPast(date)) {
        past++;
      }
    });

    return {
      all: initialAppointments.length,
      today,
      upcoming,
      past,
    };
  }, [initialAppointments]);

  // Check if any filter is actively deviating from default
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim().length > 0 ||
      selectedTimeframe !== "all" ||
      selectedStatus !== "all"
    );
  }, [searchQuery, selectedTimeframe, selectedStatus]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedTimeframe("all");
    setSelectedStatus("all");
    setCurrentPage(1);
  }, []);

  // Handle Sort Toggle
  const handleSort = useCallback(
    (field: ScheduleSortField) => {
      if (sortField === field) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortOrder(field === "date" ? "desc" : "asc");
      }
      setCurrentPage(1);
    },
    [sortField]
  );

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return initialAppointments.filter((apt) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const patientName = `${apt.users.first_name || ""} ${apt.users.last_name || ""}`.toLowerCase();
        const email = (apt.users.email || "").toLowerCase();
        const phone = (apt.users.phone || "").toLowerCase();
        const serviceName = (apt.services?.name || "").toLowerCase();
        const locationName = (apt.locations?.name || "").toLowerCase();

        const matchesSearch =
          patientName.includes(query) ||
          email.includes(query) ||
          phone.includes(query) ||
          serviceName.includes(query) ||
          locationName.includes(query);

        if (!matchesSearch) return false;
      }

      // 2. Status Filter
      if (selectedStatus !== "all") {
        if (apt.status !== selectedStatus) {
          return false;
        }
      }

      // 3. Timeframe Filter
      if (selectedTimeframe !== "all") {
        const date = typeof apt.appointment_date === "string"
          ? parseISO(apt.appointment_date)
          : new Date(apt.appointment_date);

        if (selectedTimeframe === "today" && !isToday(date)) {
          return false;
        }
        if (selectedTimeframe === "upcoming" && (!isFuture(date) || isToday(date))) {
          return false;
        }
        if (selectedTimeframe === "past" && (!isPast(date) || isToday(date))) {
          return false;
        }
      }

      return true;
    });
  }, [initialAppointments, searchQuery, selectedStatus, selectedTimeframe]);

  // Sorted appointments
  const sortedAppointments = useMemo(() => {
    const list = [...filteredAppointments];

    list.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "date": {
          const dateA = new Date(a.appointment_date).getTime();
          const dateB = new Date(b.appointment_date).getTime();
          if (dateA !== dateB) {
            comparison = dateA - dateB;
          } else {
            const timeA = new Date(a.start_time).getTime();
            const timeB = new Date(b.start_time).getTime();
            comparison = timeA - timeB;
          }
          break;
        }
        case "patient": {
          const nameA = `${a.users.last_name} ${a.users.first_name}`.toLowerCase();
          const nameB = `${b.users.last_name} ${b.users.first_name}`.toLowerCase();
          comparison = nameA.localeCompare(nameB);
          break;
        }
        case "service": {
          const serviceA = (a.services?.name || "").toLowerCase();
          const serviceB = (b.services?.name || "").toLowerCase();
          comparison = serviceA.localeCompare(serviceB);
          break;
        }
        case "location": {
          const locA = (a.locations?.name || "").toLowerCase();
          const locB = (b.locations?.name || "").toLowerCase();
          comparison = locA.localeCompare(locB);
          break;
        }
        case "status": {
          const statusA = (a.status || "").toLowerCase();
          const statusB = (b.status || "").toLowerCase();
          comparison = statusA.localeCompare(statusB);
          break;
        }
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return list;
  }, [filteredAppointments, sortField, sortOrder]);

  // Pagination calculation
  const totalFilteredCount = sortedAppointments.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / pageSize));

  // Auto-clamp current page if filtered results change
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedAppointments = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * pageSize;
    return sortedAppointments.slice(startIndex, startIndex + pageSize);
  }, [sortedAppointments, validCurrentPage, pageSize]);

  return (
    <ScheduleContext.Provider
      value={{
        appointments: initialAppointments,
        doctorId,
        searchQuery,
        setSearchQuery,
        selectedTimeframe,
        setSelectedTimeframe,
        selectedStatus,
        setSelectedStatus,
        resetFilters,
        hasActiveFilters,
        sortField,
        sortOrder,
        handleSort,
        currentPage: validCurrentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        totalPages,
        filteredAppointments: sortedAppointments,
        paginatedAppointments,
        totalFilteredCount,
        timeframeCounts,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule(): ScheduleContextType {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error("useSchedule must be used within a ScheduleProvider");
  }
  return context;
}
