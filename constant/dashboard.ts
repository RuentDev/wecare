import {
  LayoutDashboard,
  Calendar,
  Users,
  FlaskConical,
  MessageSquare,
  ShieldCheck,
  BarChart3,
  Activity,
  User,
  CreditCard,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { Permission } from "@/lib/rbac";

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: string[];
  requiredPermission?: Permission;
}

export const SIDEBAR_NAVS: SidebarItem[] = [
  // Dashboard Home
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["patient", "doctor"],
  },
  // Clinical Operations
  {
    label: "Schedule",
    href: "/dashboard/schedule",
    icon: Calendar,
    roles: ["doctor"],
    requiredPermission: "appointments:read",
  },
  {
    label: "Appointments",
    href: "/dashboard/appointments",
    icon: Calendar,
    roles: ["doctor"],
    requiredPermission: "appointments:read",
  },
  {
    label: "Patients",
    href: "/dashboard/patients",
    icon: Users,
    roles: ["doctor"],
    requiredPermission: "medical_records:read",
  },
  {
    label: "Lab Results",
    href: "/dashboard/labs",
    icon: FlaskConical,
    roles: ["patient"],
    requiredPermission: "medical_records:read",
  },
  {
    label: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
    roles: ["patient"],
    requiredPermission: "billing:read",
  },
  {
    label: "Messages",
    href: "/dashboard/messages",
    icon: MessageSquare,
    roles: ["doctor", "patient"],
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: User,
    roles: ["patient", "doctor"],
  },
  // Admin Routes (for fallback or testing if accessed in dashboard context)
  {
    label: "Audit Logs",
    href: "/admin/audit-logs",
    icon: ShieldCheck,
    roles: ["admin"],
  },
  {
    label: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
    roles: ["admin"],
  },
  {
    label: "Health Metrics",
    href: "/admin/metrics",
    icon: Activity,
    roles: ["admin"],
  },
  {
    label: "Services",
    href: "/admin/services",
    icon: Settings,
    roles: ["admin"],
  },
];

