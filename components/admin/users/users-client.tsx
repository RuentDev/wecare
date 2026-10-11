"use client";

import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { UserPlus, Users } from "lucide-react";
import { getColumns, User, Role } from "./columns";
import { UserRoleModal } from "./user-role-modal";
import { AddUserModal } from "./add-user-modal";
import { DeleteUserModal } from "./delete-user-modal";
import { UsersFilters } from "./users-filters";
import { UsersPagination } from "./users-pagination";
import { UsersProvider, useUsers } from "@/contexts/users-context";

interface UsersClientProps {
  initialUsers: User[];
  roles: Role[];
  currentUserRole?: string;
  currentUserId?: string;
}

function UsersContent() {
  const {
    paginatedUsers,
    pageSize,
    roles,
    currentUserRole,
    currentUserId,
    selectedUser,
    isRoleModalOpen,
    openRoleModal,
    closeRoleModal,
    isAddModalOpen,
    setAddModalOpen,
    userToDelete,
    isDeleting,
    openDeleteModal,
    closeDeleteModal,
    handleToggleStatus,
    handleConfirmDelete,
  } = useUsers();

  const columns = getColumns({
    onAssignRoles: openRoleModal,
    onToggleStatus: handleToggleStatus,
    onDeleteUser: openDeleteModal,
    currentUserRole,
    currentUserId,
  });

  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Users Management
            </h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your clinic&apos;s user accounts, assign RBAC permissions, and monitor active statuses.
          </p>
        </div>

        {currentUserRole !== "doctor" && (
          <Button
            id="add-user-button"
            onClick={() => setAddModalOpen(true)}
            className="gap-2 text-xs font-semibold shadow-xs shrink-0 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add User Account
          </Button>
        )}
      </div>

      {/* Main Table Container with Filter Toolbar & Pagination */}
      <div className="space-y-4">
        <UsersFilters />
        <DataTable columns={columns} data={paginatedUsers} pageSize={pageSize} />
        <UsersPagination />
      </div>

      <UserRoleModal
        user={selectedUser}
        roles={roles}
        isOpen={isRoleModalOpen}
        onClose={closeRoleModal}
      />

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
      />

      <DeleteUserModal
        user={userToDelete}
        isOpen={!!userToDelete}
        isDeleting={isDeleting}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export function UsersClient({
  initialUsers,
  roles,
  currentUserRole,
  currentUserId,
}: UsersClientProps) {
  return (
    <UsersProvider
      initialUsers={initialUsers}
      roles={roles}
      currentUserRole={currentUserRole}
      currentUserId={currentUserId}
    >
      <UsersContent />
    </UsersProvider>
  );
}
