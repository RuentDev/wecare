"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Shield, UserCog, UserMinus, UserCheck, Trash2, Stethoscope } from "lucide-react";
import Link from "next/link";

export type Role = {
  id: string;
  name: string;
  description: string | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
};

export type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string | null;
  is_active: boolean | null;
  user_roles: {
    role_id: string;
    roles: {
      id: string;
      name: string;
    };
  }[];
  doctors?: {
    id: string;
  } | null;
};

interface ColumnProps {
  onAssignRoles: (user: User) => void;
  onToggleStatus: (userId: string, currentStatus: boolean | null) => void;
  onDeleteUser: (user: User) => void;
  currentUserRole?: string;
  currentUserId?: string;
}

export const getColumns = ({
  onAssignRoles,
  onToggleStatus,
  onDeleteUser,
  currentUserRole,
  currentUserId,
}: ColumnProps): ColumnDef<User>[] => [
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-bold text-neutral-dark">
            {user.first_name} {user.last_name}
          </span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>
      );
    },
    // Custom filter function to search in both name and email
    filterFn: (row, id, filterValue) => {
      const user = row.original;
      const search = filterValue.toLowerCase();
      return (
        user.first_name.toLowerCase().includes(search) ||
        user.last_name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const user = row.original;
      const primaryRole = user.role?.toLowerCase() || "patient";
      const additionalRoles = user.user_roles
        .map((ur) => ur.roles.name)
        .filter((name) => name.toLowerCase() !== primaryRole);

      const getRoleBadgeClass = (role: string) => {
        switch (role) {
          case "admin":
            return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800";
          case "doctor":
            return "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800";
          case "nurse":
            return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800";
          case "staff":
            return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800";
          case "patient":
          default:
            return "bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700";
        }
      };

      return (
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            variant="outline"
            className={cn("capitalize font-medium shadow-2xs", getRoleBadgeClass(primaryRole))}
          >
            {primaryRole}
          </Badge>
          {additionalRoles.map((roleName) => (
            <Badge
              key={roleName}
              variant="secondary"
              className="text-xs py-0 px-1.5 bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 capitalize"
            >
              +{roleName}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("is_active") as boolean;
      return isActive ? (
        <Badge className="bg-success/20 text-success border-success/30">
          Active
        </Badge>
      ) : (
        <Badge
          variant="destructive"
          className="bg-destructive/20 text-destructive border-destructive/30"
        >
          Inactive
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      if (currentUserRole === "doctor") {
        return null;
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-white/50">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Management</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user.role === "doctor" && user.doctors?.id ? (
              <DropdownMenuItem asChild>
                <Link 
                  href={`/admin/users/doctors/${user.doctors.id}?edit=true`}
                  className="flex items-center w-full cursor-pointer text-primary font-medium"
                >
                  <Stethoscope className="mr-2 h-4 w-4 text-primary" />
                  Manage Doctor Profile
                </Link>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem asChild>
                <Link 
                  href={`/admin/users/${user.id}`}
                  className="flex items-center w-full cursor-pointer"
                >
                  <UserCog className="mr-2 h-4 w-4 text-primary" />
                  Edit Profile
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onAssignRoles(user)}>
              <Shield className="mr-2 h-4 w-4 text-primary" />
              Assign Roles
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onToggleStatus(user.id, user.is_active)}
            >
              {user.is_active ? (
                <>
                  <UserMinus className="mr-2 h-4 w-4 text-destructive" />
                  Deactivate
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4 text-success" />
                  Activate
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <UserCog className="mr-2 h-4 w-4" />
              Force Password Reset
            </DropdownMenuItem>
            {currentUserRole === "admin" && user.id !== currentUserId && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDeleteUser(user)}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete User
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
