import type { LucideIcon } from "lucide-react";

export type CrudAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "manage"
  | "view"
  | "edit";

export interface PermissionRecord {
  id: string;
  name: string;
  description: string | null;
  created_at?: Date | string | null;
  updated_at?: Date | string | null;
}

export interface RolePermissionRecord {
  role_id: string;
  permission_id: string;
  permissions?: PermissionRecord;
}

export interface RoleWithPermissions {
  id: string;
  name: string;
  description: string | null;
  created_at?: Date | string | null;
  updated_at?: Date | string | null;
  role_permissions: {
    permission_id: string;
    permissions?: PermissionRecord;
  }[];
}

export interface ResourceModuleConfig {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export interface GroupedResourceModule {
  key: string;
  label: string;
  description: string;
  icon: LucideIcon;
  permissions: PermissionRecord[];
}
