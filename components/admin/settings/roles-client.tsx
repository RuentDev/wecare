"use client";

import { useState, useTransition } from "react";
import { updateRolePermissions } from "@/lib/actions/rbac";
import { toast } from "sonner";
import { RolesHeader } from "@/components/admin/settings/roles-header";
import { RoleCard } from "@/components/admin/settings/role-card";
import { RBACNote } from "@/components/admin/settings/rbac-note";

interface RolesClientProps {
  initialRoles: any[];
  initialPermissions: any[];
}

export function RolesClient({
  initialRoles,
  initialPermissions,
}: RolesClientProps) {
  const [isPending, startTransition] = useTransition();
  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);

  // Local state for the matrix to allow "Save" button approach
  const [matrix, setMatrix] = useState<Record<string, string[]>>(() => {
    const initialMatrix: Record<string, string[]> = {};
    initialRoles.forEach((role: any) => {
      initialMatrix[role.id] = role.role_permissions.map(
        (rp: any) => rp.permission_id,
      );
    });
    return initialMatrix;
  });

  function togglePermission(roleId: string, permId: string) {
    setMatrix((prev) => {
      const current = prev[roleId] || [];
      const updated = current.includes(permId)
        ? current.filter((id) => id !== permId)
        : [...current, permId];
      return { ...prev, [roleId]: updated };
    });
  }

  async function handleSave(roleId: string) {
    return new Promise<void>((resolve, reject) => {
      setSavingRoleId(roleId);
      startTransition(async () => {
        try {
          await updateRolePermissions(roleId, matrix[roleId]);
          toast.success("Permissions updated successfully");
          setSavingRoleId(null);
          resolve();
        } catch (error) {
          toast.error("Failed to update permissions");
          setSavingRoleId(null);
          reject(error);
        }
      });
    });
  }

  return (
    <main className="flex flex-col gap-5 animate-in-fade">
      <div className="grid gap-5">
        {initialRoles.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            permissions={initialPermissions}
            matrix={matrix}
            onToggle={togglePermission}
            onSave={handleSave}
            isSaving={savingRoleId === role.id}
          />
        ))}
      </div>

      <RBACNote />
    </main>
  );
}
