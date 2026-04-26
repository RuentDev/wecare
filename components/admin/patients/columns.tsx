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
import { 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Calendar, 
  User, 
  History, 
  MessageSquare,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type Patient = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  created_at: Date | null;
  avatar_url: string | null;
  appointment_count: number;
  last_appointment: Date | null;
};

interface GetColumnsProps {
  onViewProfile: (patient: Patient) => void;
  onViewHistory: (patient: Patient) => void;
  onSendMessage: (patient: Patient) => void;
  onQuickView: (patient: Patient) => void;
}

export const getColumns = ({
  onViewProfile,
  onViewHistory,
  onSendMessage,
  onQuickView,
}: GetColumnsProps): ColumnDef<Patient>[] => [
  {
    accessorKey: "name",
    header: "Patient",
    cell: ({ row }) => {
      const patient = row.original;
      const initials = `${patient.first_name?.[0] || ""}${patient.last_name?.[0] || ""}`.toUpperCase();

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-primary/10 shadow-sm">
            <AvatarImage src={patient.avatar_url || ""} />
            <AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold">
              {initials || <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight text-foreground">
              {patient.first_name} {patient.last_name}
            </span>
            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
              ID: {patient.id.slice(0, 8)}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Contact Details",
    cell: ({ row }) => {
      const patient = row.original;
      return (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground group">
            <div className="p-1 rounded-md bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <Mail className="h-3 w-3" />
            </div>
            <span className="truncate max-w-[180px]">{patient.email}</span>
          </div>
          {patient.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground group">
              <div className="p-1 rounded-md bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Phone className="h-3 w-3" />
              </div>
              <span>{patient.phone}</span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Registration",
    cell: ({ row }) => {
      const date = row.getValue("created_at") as Date;
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">
            {date ? format(new Date(date), "MMM dd, yyyy") : "N/A"}
          </span>
          <span className="text-xs text-muted-foreground">
            Joined {date ? format(new Date(date), "HH:mm a") : ""}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "appointment_count",
    header: () => <div className="text-center">Activity</div>,
    cell: ({ row }) => {
      const count = row.getValue("appointment_count") as number;
      return (
        <div className="flex flex-col items-center gap-1">
          <Badge 
            variant="secondary" 
            className="bg-primary/5 text-primary border-primary/10 font-bold px-2.5"
          >
            {count} {count === 1 ? "Visit" : "Visits"}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "last_appointment",
    header: "Last Visit",
    cell: ({ row }) => {
      const lastVisit = row.getValue("last_appointment") as Date | null;
      if (!lastVisit) {
        return <span className="text-sm text-muted-foreground/50 italic">No visits yet</span>;
      }
      return (
        <div className="flex items-center gap-2 text-sm">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <div className="flex flex-col">
            <span className="font-medium">{format(new Date(lastVisit), "MMM dd, yyyy")}</span>
            <span className="text-[10px] text-muted-foreground uppercase">{format(new Date(lastVisit), "eeee")}</span>
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const patient = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/5">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl shadow-xl border-primary/5">
            <DropdownMenuLabel className="text-xs font-semibold uppercase text-muted-foreground px-2 py-1.5">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuItem 
              className="flex items-center gap-2 rounded-lg cursor-pointer"
              onClick={() => onViewProfile(patient)}
            >
              <User className="h-4 w-4 text-primary" />
              <span>View Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2 rounded-lg cursor-pointer"
              onClick={() => onViewHistory(patient)}
            >
              <History className="h-4 w-4 text-primary" />
              <span>Medical History</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2 rounded-lg cursor-pointer"
              onClick={() => onSendMessage(patient)}
            >
              <MessageSquare className="h-4 w-4 text-primary" />
              <span>Send Message</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-primary/5" />
            <DropdownMenuItem 
              className="flex items-center justify-between gap-2 rounded-lg cursor-pointer text-primary font-medium"
              onClick={() => onQuickView(patient)}
            >
              <span>Quick View</span>
              <ChevronRight className="h-4 w-4" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
