"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Shield, UserCog, UserMinus, UserCheck } from "lucide-react";
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
};

interface ColumnProps {
  onAssignRoles: (user: User) => void;
  onToggleStatus: (userId: string, currentStatus: boolean | null) => void;
  currentUserRole?: string;
}

export const getColumns = ({
  onAssignRoles,
  onToggleStatus,
  currentUserRole,
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
    header: "System Role (Legacy)",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.getValue("role")}
      </Badge>
    ),
  },
  {
    accessorKey: "user_roles",
    header: "RBAC Roles",
    cell: ({ row }) => {
      const userRoles = row.original.user_roles;
      return (
        <div className="flex flex-wrap gap-1">
          {userRoles.length > 0 ? (
            userRoles.map((ur) => (
              <Badge
                key={ur.roles.id}
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20"
              >
                {ur.roles.name}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-muted-foreground italic">
              No roles assigned
            </span>
          )}
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
            <DropdownMenuItem asChild>
              <Link 
                href={`/admin/users/${user.id}`}
                className="flex items-center w-full cursor-pointer"
              >
                <UserCog className="mr-2 h-4 w-4 text-primary" />
                Edit Profile
              </Link>
            </DropdownMenuItem>
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
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
