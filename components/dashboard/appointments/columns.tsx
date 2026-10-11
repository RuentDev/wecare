"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  MoreHorizontal,
  CheckCircle2,
  CalendarCheck,
  XCircle,
  ExternalLink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import type {
  DoctorAppointmentRecord,
  DoctorAppointmentColumn,
} from "@/contexts/doctor-appointments-context";
import type { AppointmentStatus } from "@/lib/actions/appointments";

export const getColumns = (
  onView: (appointment: DoctorAppointmentRecord) => void,
  onUpdateStatus: (id: string, status: AppointmentStatus) => void
): ColumnDef<DoctorAppointmentColumn>[] => [
  {
    accessorKey: "patientName",
    header: "Patient",
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">
            {row.getValue("patientName")}
          </span>
          {row.original.isGuest && (
            <Badge
              variant="outline"
              className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 h-5 px-1.5 font-bold uppercase tracking-tighter"
            >
              Guest
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          {row.original.appointment_number}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "serviceName",
    header: "Service",
    cell: ({ row }) => (
      <span className="font-medium text-foreground">
        {row.getValue("serviceName")}
      </span>
    ),
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
          className={`${
            statusColors[status] || "bg-gray-100 text-gray-700"
          } capitalize px-3 py-1 rounded-full border shadow-xs font-medium`}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original;
      const status = item.status;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-primary/10 transition-colors"
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 glassmorphism border-border/80 shadow-xl"
          >
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            
            <DropdownMenuItem
              onClick={() => onView(item.raw)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-muted-foreground" />
              Quick View
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href={`/dashboard/appointments/${item.appointment_number}`}
                className="flex items-center gap-2 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                Open Details Page
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {status === "pending" && (
              <DropdownMenuItem
                onClick={() => onUpdateStatus(item.id, "confirmed")}
                className="flex items-center gap-2 cursor-pointer text-blue-600 focus:text-blue-700 focus:bg-blue-50"
              >
                <CalendarCheck className="w-4 h-4" />
                Confirm
              </DropdownMenuItem>
            )}

            {status === "confirmed" && (
              <DropdownMenuItem
                onClick={() => onUpdateStatus(item.id, "completed")}
                className="flex items-center gap-2 cursor-pointer text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                Complete
              </DropdownMenuItem>
            )}

            {status !== "cancelled" && status !== "completed" && (
              <DropdownMenuItem
                onClick={() => onUpdateStatus(item.id, "cancelled")}
                className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <XCircle className="w-4 h-4" />
                Cancel
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
