"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toggleUserStatus } from "@/lib/actions/rbac";
import { toast } from "sonner";
import { getColumns, User, Role } from "./columns";
import { UserRoleModal } from "./user-role-modal";
import { UserPlus } from "lucide-react";
import { AddUserModal } from "./add-user-modal";
import { Button } from "@/components/ui/button";

interface UsersClientProps {
  initialUsers: User[];
  roles: Role[];
}

export function UsersClient({ initialUsers, roles }: UsersClientProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  async function handleToggleStatus(userId: string, currentStatus: boolean | null) {
    try {
      await toggleUserStatus(userId, !currentStatus);
      toast.success(
        `User ${!currentStatus ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      toast.error("Failed to update user status");
    }
  }

  function handleOpenRoleModal(user: User) {
    setSelectedUser(user);
    setIsRoleModalOpen(true);
  }

  const columns = getColumns({
    onAssignRoles: handleOpenRoleModal,
    onToggleStatus: handleToggleStatus,
  });

  return (
    <div className="space-y-6">
      <Card className="glassmorphism border-none shadow-xl">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <Badge variant="secondary" className="px-3 py-1">
              {initialUsers.length} total users
            </Badge>

            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 shadow-lg shadow-primary/20 flex items-center gap-2 group transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Add User Account
            </Button>
          </div>

          <DataTable 
            columns={columns} 
            data={initialUsers} 
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
    </div>
  );
}
