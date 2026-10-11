"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import type { AdminService } from "@/lib/types/services";

export type ServiceSortField =
  | "name"
  | "category"
  | "durationMinutes"
  | "price"
  | "doctorCount"
  | "isActive";

export type SortOrder = "asc" | "desc";
export type StatusFilter = "all" | "active" | "inactive";

export interface ServicesContextType {
  // Raw data
  services: AdminService[];
  categories: { id: string; name: string }[];

  // Filtering state
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (categoryId: string) => void;
  selectedStatus: StatusFilter;
  setSelectedStatus: (status: StatusFilter) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;

  // Sorting state
  sortField: ServiceSortField;
  sortOrder: SortOrder;
  handleSort: (field: ServiceSortField) => void;

  // Pagination & computed collections
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalPages: number;
  filteredServices: AdminService[];
  paginatedServices: AdminService[];
  totalFilteredCount: number;

  // Modal dialog states
  formOpen: boolean;
  setFormOpen: (open: boolean) => void;
  editingService: AdminService | null;
  openCreateDialog: () => void;
  openEditDialog: (service: AdminService) => void;
  closeFormDialog: () => void;

  deleteOpen: boolean;
  setDeleteOpen: (open: boolean) => void;
  deletingService: AdminService | null;
  openDeleteDialog: (service: AdminService) => void;
  closeDeleteDialog: () => void;

  importOpen: boolean;
  setImportOpen: (open: boolean) => void;
}

const ServicesContext = createContext<ServicesContextType | undefined>(
  undefined,
);

interface ServicesProviderProps {
  children: ReactNode;
  initialServices: AdminService[];
  categories: { id: string; name: string }[];
}

export function ServicesProvider({
  children,
  initialServices,
  categories,
}: ServicesProviderProps) {
  // Filter state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("all");

  // Sorting state
  const [sortField, setSortField] = useState<ServiceSortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Dialog state
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<AdminService | null>(
    null,
  );
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [deletingService, setDeletingService] = useState<AdminService | null>(
    null,
  );
  const [importOpen, setImportOpen] = useState<boolean>(false);

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim().length > 0 ||
      selectedCategory !== "all" ||
      selectedStatus !== "all"
    );
  }, [searchQuery, selectedCategory, selectedStatus]);

  // Reset filters helper
  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setCurrentPage(1);
  }, []);

  // Sort toggle handler
  const handleSort = useCallback((field: ServiceSortField) => {
    setSortField((prevField) => {
      if (prevField === field) {
        setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
        return field;
      }
      setSortOrder("asc");
      return field;
    });
    setCurrentPage(1);
  }, []);

  // Filter and sort services
  const filteredServices = useMemo(() => {
    let result = [...initialServices];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (service) =>
          service.name.toLowerCase().includes(query) ||
          (service.description &&
            service.description.toLowerCase().includes(query)) ||
          (service.category &&
            service.category.name.toLowerCase().includes(query)),
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter(
        (service) => service.category?.id === selectedCategory,
      );
    }

    // Filter by status
    if (selectedStatus === "active") {
      result = result.filter((service) => service.isActive);
    } else if (selectedStatus === "inactive") {
      result = result.filter((service) => !service.isActive);
    }

    // Sort result
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "category": {
          const catA = a.category?.name ?? "";
          const catB = b.category?.name ?? "";
          comparison = catA.localeCompare(catB);
          break;
        }
        case "durationMinutes":
          comparison = a.durationMinutes - b.durationMinutes;
          break;
        case "price":
          comparison = a.price - b.price;
          break;
        case "doctorCount":
          comparison = a.doctorCount - b.doctorCount;
          break;
        case "isActive":
          comparison = Number(a.isActive) - Number(b.isActive);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [
    initialServices,
    searchQuery,
    selectedCategory,
    selectedStatus,
    sortField,
    sortOrder,
  ]);

  // Pagination calculation
  const totalFilteredCount = filteredServices.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / pageSize));

  // Ensure current page is valid when filter changes
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedServices = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * pageSize;
    return filteredServices.slice(startIndex, startIndex + pageSize);
  }, [filteredServices, validCurrentPage, pageSize]);

  // Dialog controls
  const openCreateDialog = useCallback(() => {
    setEditingService(null);
    setFormOpen(true);
  }, []);

  const openEditDialog = useCallback((service: AdminService) => {
    setEditingService(service);
    setFormOpen(true);
  }, []);

  const closeFormDialog = useCallback(() => {
    setFormOpen(false);
    setEditingService(null);
  }, []);

  const openDeleteDialog = useCallback((service: AdminService) => {
    setDeletingService(service);
    setDeleteOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteOpen(false);
    setDeletingService(null);
  }, []);

  const contextValue: ServicesContextType = {
    services: initialServices,
    categories,
    searchQuery,
    setSearchQuery: (query) => {
      setSearchQuery(query);
      setCurrentPage(1);
    },
    selectedCategory,
    setSelectedCategory: (categoryId) => {
      setSelectedCategory(categoryId);
      setCurrentPage(1);
    },
    selectedStatus,
    setSelectedStatus: (status) => {
      setSelectedStatus(status);
      setCurrentPage(1);
    },
    resetFilters,
    hasActiveFilters,
    sortField,
    sortOrder,
    handleSort,
    currentPage: validCurrentPage,
    setCurrentPage,
    pageSize,
    setPageSize: (size) => {
      setPageSize(size);
      setCurrentPage(1);
    },
    totalPages,
    filteredServices,
    paginatedServices,
    totalFilteredCount,
    formOpen,
    setFormOpen,
    editingService,
    openCreateDialog,
    openEditDialog,
    closeFormDialog,
    deleteOpen,
    setDeleteOpen,
    deletingService,
    openDeleteDialog,
    closeDeleteDialog,
    importOpen,
    setImportOpen,
  };

  return (
    <ServicesContext.Provider value={contextValue}>
      {children}
    </ServicesContext.Provider>
  );
}

export function useServices(): ServicesContextType {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error("useServices must be used within a ServicesProvider");
  }
  return context;
}
