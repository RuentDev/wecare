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
} from "lucide-react";

export interface SidebarItem {
  label: string;
  href: string;
  icon: any;
  roles: string[];
}

export const SIDEBAR_NAVS: SidebarItem[] = [
  // Doctor Routes
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["doctor"],
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
    roles: ["doctor"],
  },
  {
    label: "Audit Logs",
    href: "/dashboard/audit-logs",
    icon: ShieldCheck,
    roles: ["doctor"],
  },
  {
    label: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3,
    roles: ["doctor"],
  },
  {
    label: "Health Metrics",
    href: "/dashboard/metrics",
    icon: Activity,
    roles: ["doctor"],
  },
  // Patient Routes
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
    roles: ["patient"],
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
    roles: ["patient"],
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: User,
    roles: ["patient", "doctor"],
  },
];
