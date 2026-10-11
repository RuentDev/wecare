"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
} from "react";
import type { AdminLocation, LocationStats } from "@/lib/types/locations";

export interface LocationsContextType {
  // Raw data & stats
  locations: AdminLocation[];
  stats: LocationStats;

  // Filter State
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: "all" | "active" | "inactive";
  setStatusFilter: (status: "all" | "active" | "inactive") => void;
  filteredLocations: AdminLocation[];
  totalFilteredCount: number;
  hasActiveFilters: boolean;
  resetFilters: () => void;

  // Form Sheet State
  formOpen: boolean;
  setFormOpen: (open: boolean) => void;
  editingLocation: AdminLocation | null;
  openCreate: () => void;
  openEdit: (location: AdminLocation) => void;
  closeForm: () => void;

  // Delete Dialog State
  deleteOpen: boolean;
  setDeleteOpen: (open: boolean) => void;
  deletingLocation: AdminLocation | null;
  openDelete: (location: AdminLocation) => void;
  closeDelete: () => void;
}

const LocationsContext = createContext<LocationsContextType | undefined>(
  undefined,
);

interface LocationsProviderProps {
  children: ReactNode;
  locations: AdminLocation[];
  stats: LocationStats;
}

export function LocationsProvider({
  children,
  locations,
  stats,
}: LocationsProviderProps) {
  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  // Form sheet state
  const [formOpen, setFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<AdminLocation | null>(
    null,
  );

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingLocation, setDeletingLocation] =
    useState<AdminLocation | null>(null);

  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && loc.is_active) ||
        (statusFilter === "inactive" && !loc.is_active);

      const search = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !search ||
        loc.name.toLowerCase().includes(search) ||
        (loc.address && loc.address.toLowerCase().includes(search)) ||
        (loc.city && loc.city.toLowerCase().includes(search));

      return matchesStatus && matchesSearch;
    });
  }, [locations, searchQuery, statusFilter]);

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all";

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const openCreate = () => {
    setEditingLocation(null);
    setFormOpen(true);
  };

  const openEdit = (location: AdminLocation) => {
    setEditingLocation(location);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingLocation(null);
  };

  const openDelete = (location: AdminLocation) => {
    setDeletingLocation(location);
    setDeleteOpen(true);
  };

  const closeDelete = () => {
    setDeleteOpen(false);
    setDeletingLocation(null);
  };

  const value: LocationsContextType = {
    locations,
    stats,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    filteredLocations,
    totalFilteredCount: filteredLocations.length,
    hasActiveFilters,
    resetFilters,
    formOpen,
    setFormOpen,
    editingLocation,
    openCreate,
    openEdit,
    closeForm,
    deleteOpen,
    setDeleteOpen,
    deletingLocation,
    openDelete,
    closeDelete,
  };

  return (
    <LocationsContext.Provider value={value}>
      {children}
    </LocationsContext.Provider>
  );
}

export function useLocations(): LocationsContextType {
  const context = useContext(LocationsContext);
  if (!context) {
    throw new Error("useLocations must be used within a LocationsProvider");
  }
  return context;
}
