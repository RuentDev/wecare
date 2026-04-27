import {
  LayoutDashboard,
  Calendar,
  Users,
  MapPin,
  Tag,
  FileText,
  Settings,
  CreditCard,
  Shield,
  UserCog,
  Stethoscope,
} from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: any;
  children?: { name: string; href: string; icon: any }[];
  allowedRoles: string[];
}

export const NAVIGATIONS: NavItem[] = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    allowedRoles: ["admin", "staff"],
  },
  {
    name: "Appointments",
    href: "/admin/appointments",
    icon: Calendar,
    allowedRoles: ["admin", "staff"],
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: UserCog,
    children: [
      { name: "Users", href: "/admin/users", icon: UserCog },
      { name: "Doctors", href: "/admin/users/doctors", icon: Stethoscope },
      { name: "Patients", href: "/admin/users/patients", icon: Users },
    ],
    allowedRoles: ["admin", "staff"],
  },
  {
    name: "Services",
    href: "/admin/services",
    icon: Tag,
    allowedRoles: ["admin", "staff"],
  },
  {
    name: "Locations",
    href: "/admin/locations",
    icon: MapPin,
    allowedRoles: ["admin", "staff"],
  },
  {
    name: "Promotions",
    href: "/admin/promotions",
    icon: Tag,
    allowedRoles: ["admin", "staff"],
  },
  {
    name: "Articles",
    href: "/admin/articles",
    icon: FileText,
    allowedRoles: ["admin", "staff"],
  },
  {
    name: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
    allowedRoles: ["admin", "staff"],
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
    allowedRoles: ["admin"],
    children: [
      { name: "General", href: "/admin/settings", icon: Settings },
      { name: "RBAC Roles", href: "/admin/settings/roles", icon: Shield },
    ],
  },
];
