"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { toggleUserStatus, deleteUser } from "@/lib/actions/rbac";
import type { User, Role } from "@/components/admin/users/columns";

export interface UsersContextType {
  // Raw Data & Permissions
  users: User[];
  roles: Role[];
  currentUserRole?: string;
  currentUserId?: string;

  // Filtering State
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  filteredUsers: User[];
  totalFilteredCount: number;
  hasActiveFilters: boolean;
  resetFilters: () => void;

  // Pagination State
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalPages: number;
  paginatedUsers: User[];

  // Role Assignment Modal
  selectedUser: User | null;
  isRoleModalOpen: boolean;
  openRoleModal: (user: User) => void;
  closeRoleModal: () => void;

  // Add User Modal
  isAddModalOpen: boolean;
  setAddModalOpen: (open: boolean) => void;

  // Delete User Modal
  userToDelete: User | null;
  isDeleting: boolean;
  openDeleteModal: (user: User) => void;
  closeDeleteModal: () => void;

  // Actions
  handleToggleStatus: (userId: string, currentStatus: boolean | null) => Promise<void>;
  handleConfirmDelete: (userId: string) => Promise<void>;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

interface UsersProviderProps {
  children: ReactNode;
  initialUsers: User[];
  roles: Role[];
  currentUserRole?: string;
  currentUserId?: string;
}

export function UsersProvider({
  children,
  initialUsers,
  roles,
  currentUserRole,
  currentUserId,
}: UsersProviderProps) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>(initialUsers);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modal states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const search = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !search ||
        user.first_name.toLowerCase().includes(search) ||
        user.last_name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search);

      const matchesRole =
        selectedRole === "all" ||
        user.role?.toLowerCase() === selectedRole.toLowerCase() ||
        user.user_roles.some(
          (ur) => ur.roles.name.toLowerCase() === selectedRole.toLowerCase()
        );

      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "active" && user.is_active) ||
        (selectedStatus === "inactive" && !user.is_active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, selectedRole, selectedStatus]);

  const hasActiveFilters =
    searchQuery !== "" || selectedRole !== "all" || selectedStatus !== "all";

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedRole, selectedStatus]);

  // Pagination calculation
  const totalFilteredCount = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedUsers = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * pageSize;
    return filteredUsers.slice(startIndex, startIndex + pageSize);
  }, [filteredUsers, validCurrentPage, pageSize]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedRole("all");
    setSelectedStatus("all");
    setCurrentPage(1);
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setIsRoleModalOpen(true);
  };

  const closeRoleModal = () => {
    setIsRoleModalOpen(false);
  };

  const openDeleteModal = (user: User) => {
    setUserToDelete(user);
  };

  const closeDeleteModal = () => {
    setUserToDelete(null);
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean | null) => {
    try {
      await toggleUserStatus(userId, !currentStatus);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, is_active: !currentStatus } : u
        )
      );
      toast.success(
        `User ${!currentStatus ? "activated" : "deactivated"} successfully`
      );
      router.refresh();
    } catch {
      toast.error("Failed to update user status");
    }
  };

  const handleConfirmDelete = async (userId: string) => {
    try {
      setIsDeleting(true);
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("User deleted permanently");
      setUserToDelete(null);
      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to delete user";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const value: UsersContextType = {
    users,
    roles,
    currentUserRole,
    currentUserId,
    searchQuery,
    setSearchQuery,
    selectedRole,
    setSelectedRole,
    selectedStatus,
    setSelectedStatus,
    filteredUsers,
    totalFilteredCount,
    hasActiveFilters,
    resetFilters,
    currentPage: validCurrentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    paginatedUsers,
    selectedUser,
    isRoleModalOpen,
    openRoleModal,
    closeRoleModal,
    isAddModalOpen,
    setAddModalOpen: setIsAddModalOpen,
    userToDelete,
    isDeleting,
    openDeleteModal,
    closeDeleteModal,
    handleToggleStatus,
    handleConfirmDelete,
  };

  return (
    <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
  );
}

export function useUsers(): UsersContextType {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error("useUsers must be used within a UsersProvider");
  }
  return context;
}
