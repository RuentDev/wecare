"use client";

import { useState, useTransition } from "react";
import { updateRolePermissions } from "@/lib/actions/rbac";
import { toast } from "sonner";
import { RoleCard } from "@/components/admin/settings/role-card";
import { RBACNote } from "@/components/admin/settings/rbac-note";
import type {
  PermissionRecord,
  RoleWithPermissions,
} from "@/lib/types/rbac";

interface RolesClientProps {
  initialRoles: RoleWithPermissions[];
  initialPermissions: PermissionRecord[];
}

export function RolesClient({
  initialRoles,
  initialPermissions,
}: RolesClientProps) {
  const [, startTransition] = useTransition();
  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);

  // Local state for the matrix to allow "Save" button approach
  const [matrix, setMatrix] = useState<Record<string, string[]>>(() => {
    const initialMatrix: Record<string, string[]> = {};
    initialRoles.forEach((role) => {
      initialMatrix[role.id] = role.role_permissions.map(
        (rp) => rp.permission_id,
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

  function toggleModulePermissions(
    roleId: string,
    permIds: string[],
    selectAll: boolean,
  ) {
    setMatrix((prev) => {
      const current = new Set(prev[roleId] || []);
      if (selectAll) {
        permIds.forEach((id) => current.add(id));
      } else {
        permIds.forEach((id) => current.delete(id));
      }
      return { ...prev, [roleId]: Array.from(current) };
    });
  }

  function setRoleAllPermissions(roleId: string, selectAll: boolean) {
    setMatrix((prev) => {
      return {
        ...prev,
        [roleId]: selectAll ? initialPermissions.map((p) => p.id) : [],
      };
    });
  }

  async function handleSave(roleId: string) {
    return new Promise<void>((resolve, reject) => {
      setSavingRoleId(roleId);
      startTransition(async () => {
        try {
          await updateRolePermissions(roleId, matrix[roleId] || []);
          toast.success("Role permissions updated successfully");
          setSavingRoleId(null);
          resolve();
        } catch (error) {
          toast.error("Failed to update role permissions");
          setSavingRoleId(null);
          reject(error);
        }
      });
    });
  }

  return (
    <main className="flex flex-col gap-6 animate-in-fade">
      <div className="grid gap-3.5">
        {initialRoles.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            permissions={initialPermissions}
            matrix={matrix}
            onToggle={togglePermission}
            onToggleModule={toggleModulePermissions}
            onSetRoleAll={setRoleAllPermissions}
            onSave={handleSave}
            isSaving={savingRoleId === role.id}
            defaultExpanded={false}
          />
        ))}
      </div>

      <RBACNote />
    </main>
  );
}
