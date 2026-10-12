import {
  Calendar,
  Users,
  Activity,
  CreditCard,
  MapPin,
  FileText,
  Tag,
  ShieldCheck,
  Shield,
  type LucideIcon,
} from "lucide-react";
import type {
  CrudAction,
  GroupedResourceModule,
  PermissionRecord,
} from "@/lib/types/rbac";

interface ModuleConfig {
  label: string;
  description: string;
  icon: LucideIcon;
  order: number;
}

const MODULE_CONFIGS: Record<string, ModuleConfig> = {
  appointments: {
    label: "Appointments",
    description: "Patient consultation bookings, schedule slots, and visit status",
    icon: Calendar,
    order: 1,
  },
  users: {
    label: "Users & Directory",
    description: "Doctor, nurse, staff, and patient user accounts and profiles",
    icon: Users,
    order: 2,
  },
  medical_records: {
    label: "Medical Records",
    description: "Patient diagnostic histories, consultation notes, and health charts",
    icon: Activity,
    order: 3,
  },
  billing: {
    label: "Billing & Invoices",
    description: "Invoicing, clinic payment fees, receipts, and payment settlements",
    icon: CreditCard,
    order: 4,
  },
  locations: {
    label: "Locations & Branches",
    description: "Clinic branches, room facilities, and operating address configurations",
    icon: MapPin,
    order: 5,
  },
  articles: {
    label: "Health Articles",
    description: "Clinical educational content, medical articles, and blog publishing",
    icon: FileText,
    order: 6,
  },
  promotions: {
    label: "Promotions & Discounts",
    description: "Promotional campaigns, discount codes, and special clinic offers",
    icon: Tag,
    order: 7,
  },
  roles: {
    label: "Roles & Access Control",
    description: "System administrative roles, privileges, and permission matrices",
    icon: ShieldCheck,
    order: 8,
  },
};

const ACTION_ORDER: Record<string, number> = {
  create: 1,
  read: 2,
  view: 2,
  update: 3,
  edit: 3,
  delete: 4,
  manage: 5,
};

export function parsePermissionAction(name: string): {
  module: string;
  action: CrudAction;
  actionLabel: string;
} {
  const parts = name.split(":");
  const module = parts[0] || "general";
  const rawAction = (parts[1] || "view") as CrudAction;

  let actionLabel = rawAction.toUpperCase();
  switch (rawAction) {
    case "create":
      actionLabel = "Create";
      break;
    case "read":
    case "view":
      actionLabel = "Read / View";
      break;
    case "update":
    case "edit":
      actionLabel = "Update / Edit";
      break;
    case "delete":
      actionLabel = "Delete";
      break;
    case "manage":
      actionLabel = "Full Control";
      break;
  }

  return {
    module,
    action: rawAction,
    actionLabel,
  };
}

export function groupPermissionsByModule(
  permissions: PermissionRecord[],
): GroupedResourceModule[] {
  const map = new Map<string, PermissionRecord[]>();

  for (const perm of permissions) {
    const { module } = parsePermissionAction(perm.name);
    if (!map.has(module)) {
      map.set(module, []);
    }
    map.get(module)!.push(perm);
  }

  const result: GroupedResourceModule[] = [];

  for (const [moduleKey, perms] of map.entries()) {
    const config = MODULE_CONFIGS[moduleKey] || {
      label: moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1).replace(/_/g, " "),
      description: `Access and management controls for ${moduleKey.replace(/_/g, " ")}`,
      icon: Shield,
      order: 99,
    };

    // Sort permissions within module: create -> read -> update -> delete -> manage
    const sortedPerms = [...perms].sort((a, b) => {
      const actionA = a.name.split(":")[1] || "";
      const actionB = b.name.split(":")[1] || "";
      const orderA = ACTION_ORDER[actionA] ?? 50;
      const orderB = ACTION_ORDER[actionB] ?? 50;
      return orderA - orderB;
    });

    result.push({
      key: moduleKey,
      label: config.label,
      description: config.description,
      icon: config.icon,
      permissions: sortedPerms,
    });
  }

  // Sort modules by predefined clinical order
  result.sort((a, b) => {
    const orderA = MODULE_CONFIGS[a.key]?.order ?? 99;
    const orderB = MODULE_CONFIGS[b.key]?.order ?? 99;
    return orderA - orderB;
  });

  return result;
}
