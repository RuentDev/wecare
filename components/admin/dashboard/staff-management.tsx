import React from "react";
import { ActiveUserLogsCard } from "./active-user-logs-card";
import { RBACShortcutsCard } from "./rbac-shortcuts-card";
import type {
  ActiveStaffSession,
  RBACSummary,
} from "@/lib/types/admin-dashboard";

interface StaffManagementProps {
  activeStaff: ActiveStaffSession[];
  rbac: RBACSummary;
}

export function StaffManagement({
  activeStaff,
  rbac,
}: StaffManagementProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Staff &amp; Role Management
          </h2>
          <p className="text-sm text-muted-foreground">
            Monitor active staff accounts and manage system privileges and access controls.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <ActiveUserLogsCard activeStaff={activeStaff} />
        <RBACShortcutsCard rbac={rbac} />
      </div>
    </section>
  );
}
