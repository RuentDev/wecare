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

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: string[];
}

export const SIDEBAR_NAVS: SidebarItem[] = [
  // Doctor Routes
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["patients", "doctor"],
  },
  {
    label: "Schedule",
    href: "/dashboard/schedule",
    icon: Calendar,
    roles: ["doctor"],
  },
  {
    label: "Patients",
    href: "/dashboard/patients",
    icon: Users,
    roles: ["doctor"],
  },
  {
    label: "Lab Results",
    href: "/dashboard/labs",
    icon: FlaskConical,
    roles: ["patient"],
  },
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
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["patient"],
  },
  {
    label: "Messages",
    href: "/dashboard/messages",
    icon: MessageSquare,
    roles: ["doctor", "patient"],
  },
  {
    label: "Appointments",
    href: "/dashboard/appointments",
    icon: Calendar,
    roles: ["doctor"],
  },
  {
    label: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
    roles: ["patient"],
  },
  {
    label: "Services",
    href: "/dashboard/services",
    icon: Settings,
    roles: ["doctor"],
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: User,
    roles: ["patient", "doctor"],
  },
];
