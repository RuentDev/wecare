"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Eye, 
  MoreHorizontal, 
  UserCog, 
  Trash2,
  CheckCircle2,
  XCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type DoctorColumn = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  specialization: string;
  experience: number;
  fee: string;
  isAvailable: boolean;
  raw: any;
};

export const getColumns = (
  onView: (doctor: any) => void,
  onEdit: (doctor: any) => void,
  onDelete: (id: string) => void
): ColumnDef<DoctorColumn>[] => [
  {
    accessorKey: "name",
    header: "Doctor",
    cell: ({ row }) => {
      const doctor = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-primary/10 shadow-sm">
            <AvatarImage src={doctor.avatarUrl || ""} alt={doctor.name} />
            <AvatarFallback className="bg-primary/5 text-primary font-bold">
              {doctor.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-neutral-dark">{doctor.name}</span>
            <span className="text-xs text-neutral-gray">{doctor.email}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "specialization",
    header: "Specialization",
    cell: ({ row }) => {
      const spec = row.getValue("specialization") as string;
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium px-3 py-0.5 rounded-full">
          {spec?.replace("_", " ")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "experience",
    header: "Exp. (Years)",
    cell: ({ row }) => <span className="font-medium text-neutral-dark">{row.getValue("experience")} yrs</span>,
  },
  {
    accessorKey: "fee",
    header: "Fee",
    cell: ({ row }) => <span className="font-semibold text-primary">₱{row.getValue("fee")}</span>,
  },
  {
    accessorKey: "isAvailable",
    header: "Status",
    cell: ({ row }) => {
      const isAvailable = row.getValue("isAvailable") as boolean;
      return (
        <div className="flex items-center gap-2">
          {isAvailable ? (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 shadow-sm px-3 py-1 rounded-full gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Available
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-200 shadow-sm px-3 py-1 rounded-full gap-1">
              <XCircle className="w-3.5 h-3.5" />
              Offline
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const doctor = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-8 w-8 p-0 hover:bg-primary/10 rounded-full flex items-center justify-center transition-colors">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glassmorphism border-none shadow-2xl min-w-[160px] animate-in slide-in-from-top-2 duration-200">
            <DropdownMenuLabel className="text-neutral-gray text-xs">Manage Doctor</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-neutral-light" />
            <DropdownMenuItem 
              onClick={() => onView(doctor.raw)}
              className="flex items-center gap-2 cursor-pointer hover:bg-primary/5 focus:bg-primary/5"
            >
              <Eye className="w-4 h-4 text-primary" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onEdit(doctor.raw)}
              className="flex items-center gap-2 cursor-pointer hover:bg-primary/5 focus:bg-primary/5"
            >
              <UserCog className="w-4 h-4 text-primary" />
              Edit Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-neutral-light" />
            <DropdownMenuItem 
              onClick={() => onDelete(doctor.id)}
              className="flex items-center gap-2 cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
