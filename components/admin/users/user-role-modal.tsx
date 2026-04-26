"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { updateUserRoles } from "@/lib/actions/rbac";
import { toast } from "sonner";
import { User, Role } from "./columns";

interface UserRoleModalProps {
  user: User | null;
  roles: Role[];
  isOpen: boolean;
  onClose: () => void;
}

export function UserRoleModal({
  user,
  roles,
  isOpen,
  onClose,
}: UserRoleModalProps) {
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (user) {
      setSelectedRoleIds(user.user_roles.map((ur) => ur.role_id));
    }
  }, [user]);

  async function handleUpdateRoles() {
    if (!user) return;

    startTransition(async () => {
      try {
        await updateUserRoles(user.id, selectedRoleIds);
        toast.success("User roles updated successfully");
        onClose();
      } catch (error) {
        toast.error("Failed to update roles");
      }
    });
  }

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Roles</DialogTitle>
          <DialogDescription>
            Assign one or more roles to {user?.first_name}. These
            roles determine the user's permissions.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {roles.map((role) => (
            <div
              key={role.id}
              className="flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-neutral-light transition-colors cursor-pointer"
              onClick={() => toggleRole(role.id)}
            >
              <Checkbox
                checked={selectedRoleIds.includes(role.id)}
                onCheckedChange={() => toggleRole(role.id)}
              />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold capitalize leading-none">
                  {role.name}
                </span>
                <span className="text-xs text-muted-foreground italic">
                  {role.description}
                </span>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpdateRoles} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
