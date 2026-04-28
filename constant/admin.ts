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
  Eye,
  Trash2,
  Pencil,
} from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: any;
  children?: {
    name: string;
    href: string;
    icon: any;
    allowedRoles: string[];
  }[];
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
      {
        name: "Users",
        href: "/admin/users",
        icon: UserCog,
        allowedRoles: ["admin", "staff"],
      },
      {
        name: "Doctors",
        href: "/admin/users/doctors",
        icon: Stethoscope,
        allowedRoles: ["admin", "staff", "doctor"],
      },
      {
        name: "Patients",
        href: "/admin/users/patients",
        icon: Users,
        allowedRoles: ["admin", "staff", "doctor"],
      },
    ],
    allowedRoles: ["admin", "staff", "doctor"],
  },
  {
    name: "Services",
    href: "/admin/services",
    icon: Tag,
    allowedRoles: ["admin", "staff", "doctor"],
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
    allowedRoles: ["admin", "doctor"],
    children: [
      {
        name: "General",
        href: "/admin/settings",
        icon: Settings,
        allowedRoles: ["admin", "doctor"],
      },
      {
        name: "RBAC Roles",
        href: "/admin/settings/roles",
        icon: Shield,
        allowedRoles: ["admin"],
      },
    ],
  },
];

export interface TableAction {
  action: string;
  icon: any;
  href?: (id: string) => string;
  allowedRoles: string[];
  className: string;
  onClick?: (id?: string) => void;
}

export const USER_TABLE_ACTIONS: TableAction[] = [
  {
    action: "View Details",
    icon: Eye,
    href: (id: string) => `/admin/users/doctors/${id}`,
    allowedRoles: ["admin", "staff", "doctor"],
    className: "hover:bg-primary/5 focus:bg-primary/5 focus:text-primary",
    onClick: undefined,
  },
  {
    action: "Edit Profile",
    icon: Pencil,
    href: (id: string) => `/admin/users/doctors/${id}?edit=true`,
    allowedRoles: ["admin"],
    className: "hover:bg-primary/5 focus:bg-primary/5 focus:text-primary",
    onClick: undefined,
  },
  {
    action: "Remove",
    icon: Trash2,
    href: undefined,
    allowedRoles: ["admin"],
    className: "hover:bg-red-500 focus:bg-red-500 focus:text-white",
    onClick: undefined,
  },
];
