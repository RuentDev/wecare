"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type AppointmentColumn = {
  id: string;
  patientName: string;
  doctorName: string;
  serviceName: string;
  date: string;
  time: string;
  status: string;
  isGuest: boolean;
  raw: any; // Keep the raw object for the modal
};

export const getColumns = (onView: (appointment: any) => void): ColumnDef<AppointmentColumn>[] => [
  {
    accessorKey: "patientName",
    header: "Patient",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="font-medium">{row.getValue("patientName")}</span>
        {row.original.isGuest && (
          <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 h-5 px-1.5 font-bold uppercase tracking-tighter">
            Guest
          </Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "doctorName",
    header: "Doctor",
  },
  {
    accessorKey: "serviceName",
    header: "Service",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "time",
    header: "Time",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusColors: Record<string, string> = {
        pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
        confirmed: "bg-blue-100 text-blue-700 border-blue-200",
        completed: "bg-green-100 text-green-700 border-green-200",
        cancelled: "bg-red-100 text-red-700 border-red-200",
        no_show: "bg-gray-100 text-gray-700 border-gray-200",
      };

      return (
        <Badge 
          variant="outline" 
          className={`${statusColors[status] || "bg-gray-100 text-gray-700"} capitalize px-3 py-1 rounded-full border shadow-sm font-medium`}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const appointment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10 transition-colors">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glassmorphism border-none shadow-xl">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem 
              onClick={() => onView(appointment.raw)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
