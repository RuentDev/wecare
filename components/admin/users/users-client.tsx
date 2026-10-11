"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toggleUserStatus, deleteUser } from "@/lib/actions/rbac";
import { toast } from "sonner";
import { getColumns, User, Role } from "./columns";
import { UserRoleModal } from "./user-role-modal";
import { UserPlus } from "lucide-react";
import { AddUserModal } from "./add-user-modal";
import { DeleteUserModal } from "./delete-user-modal";
import { Button } from "@/components/ui/button";

interface UsersClientProps {
  initialUsers: User[];
  roles: Role[];
  currentUserRole?: string;
  currentUserId?: string;
}

export function UsersClient({
  initialUsers,
  roles,
  currentUserRole,
  currentUserId,
}: UsersClientProps) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  async function handleToggleStatus(userId: string, currentStatus: boolean | null) {
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
  }

  function handleOpenRoleModal(user: User) {
    setSelectedUser(user);
    setIsRoleModalOpen(true);
  }

  function handleOpenDeleteModal(user: User) {
    setUserToDelete(user);
  }

  async function handleConfirmDelete(userId: string) {
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
  }

  const columns = getColumns({
    onAssignRoles: handleOpenRoleModal,
    onToggleStatus: handleToggleStatus,
    onDeleteUser: handleOpenDeleteModal,
    currentUserRole: currentUserRole,
    currentUserId: currentUserId,
  });

  return (
    <div className="space-y-6">
      <Card className="glassmorphism border-none shadow-xl">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <Badge variant="secondary" className="px-3 py-1">
              {users.length} total users
            </Badge>

            {currentUserRole !== "doctor" && (
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 shadow-lg shadow-primary/20 flex items-center gap-2 group transition-all active:scale-95"
              >
                <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Add User Account
              </Button>
            )}
          </div>

          <DataTable 
            columns={columns} 
            data={users} 
            searchKey="user" 
          />
        </CardContent>
      </Card>

      <UserRoleModal
        user={selectedUser}
        roles={roles}
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />

      <AddUserModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <DeleteUserModal
        user={userToDelete}
        isOpen={!!userToDelete}
        isDeleting={isDeleting}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
