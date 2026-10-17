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
  Clock,
} from "lucide-react";
import type { Permission } from "@/lib/rbac";

export type DashboardNavSection =
  | "Overview"
  | "Clinical"
  | "Services"
  | "Communication"
  | "Account";

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: string[];
  requiredPermission?: Permission;
  section: DashboardNavSection;
  badge?: string | number;
}

export const DASHBOARD_SECTIONS: { id: DashboardNavSection; label: string }[] = [
  { id: "Overview", label: "Overview" },
  { id: "Clinical", label: "Clinical Care" },
  { id: "Services", label: "Services & Records" },
  { id: "Communication", label: "Communication" },
  { id: "Account", label: "Account" },
];

export const SIDEBAR_NAVS: SidebarItem[] = [
  // Dashboard Home
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["patient", "doctor"],
    section: "Overview",
  },
  // Clinical Operations
  {
    label: "Schedule",
    href: "/dashboard/schedule",
    icon: Clock,
    roles: ["doctor"],
    requiredPermission: "appointments:read",
    section: "Clinical",
  },
  {
    label: "Appointments",
    href: "/dashboard/appointments",
    icon: Calendar,
    roles: ["doctor"],
    requiredPermission: "appointments:read",
    section: "Clinical",
  },
  {
    label: "Patients",
    href: "/dashboard/patients",
    icon: Users,
    roles: ["doctor"],
    requiredPermission: "medical_records:read",
    section: "Clinical",
  },
  {
    label: "Lab Results",
    href: "/dashboard/labs",
    icon: FlaskConical,
    roles: ["patient"],
    requiredPermission: "medical_records:read",
    section: "Services",
  },
  {
    label: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
    roles: ["patient"],
    requiredPermission: "billing:read",
    section: "Services",
  },
  {
    label: "Messages",
    href: "/dashboard/messages",
    icon: MessageSquare,
    roles: ["doctor", "patient"],
    section: "Communication",
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: User,
    roles: ["patient", "doctor"],
    section: "Account",
  },
  // Admin Routes (for fallback or testing if accessed in dashboard context)
  {
    label: "Audit Logs",
    href: "/admin/audit-logs",
    icon: ShieldCheck,
    roles: ["admin"],
    section: "Clinical",
  },
  {
    label: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
    roles: ["admin"],
    section: "Clinical",
  },
  {
    label: "Health Metrics",
    href: "/admin/metrics",
    icon: Activity,
    roles: ["admin"],
    section: "Clinical",
  },
  {
    label: "Services",
    href: "/admin/services",
    icon: Settings,
    roles: ["admin"],
    section: "Services",
  },
];

