"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, Clock, User, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export type AppointmentColumn = {
  id: string;
  patientName: string;
  patientEmail: string;
  serviceName: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  status: string;
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "confirmed":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "completed":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "cancelled":
      return "bg-rose-100 text-rose-700 border-rose-200";
    default:
      return "bg-neutral-100 text-neutral-700 border-neutral-200";
  }
};

export const appointmentColumns: ColumnDef<AppointmentColumn>[] = [
  {
    accessorKey: "patientName",
    header: "Patient",
    cell: ({ row }) => {
      const { patientName, patientEmail } = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-sm">{patientName}</p>
            <p className="text-[10px] text-muted-foreground">{patientEmail}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "serviceName",
    header: "Service",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Activity className="h-3 w-3 text-primary/70" />
        <span className="text-sm font-medium">{row.original.serviceName}</span>
      </div>
    ),
  },
  {
    accessorKey: "date",
    header: "Date & Time",
    cell: ({ row }) => {
      const { date, startTime, endTime } = row.original;
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            {format(new Date(date), "MMM d, yyyy")}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            {format(new Date(startTime), "hh:mm a")} - {format(new Date(endTime), "hh:mm a")}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge 
        variant="outline" 
        className={cn(
          "capitalize px-2 py-0.5 rounded-lg text-[10px] font-bold border", 
          getStatusColor(row.original.status)
        )}
      >
        {row.original.status}
      </Badge>
    ),
  },
];
