"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, User, Stethoscope, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface AppointmentDetailsModalProps {
  appointment: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AppointmentDetailsModal({
  appointment,
  isOpen,
  onClose,
}: AppointmentDetailsModalProps) {
  if (!appointment) return null;

  const patientName = `${appointment.users?.first_name} ${appointment.users?.last_name}`;
  const doctorName = `${appointment.doctors?.users?.first_name} ${appointment.doctors?.users?.last_name}`;
  
  // Format dates/times
  // appointment_date is a Date object, start_time/end_time are also stored as Time (Date objects in JS)
  const dateStr = format(new Date(appointment.appointment_date), "MMMM do, yyyy");
  const startTimeStr = format(new Date(appointment.start_time), "hh:mm a");
  const endTimeStr = format(new Date(appointment.end_time), "hh:mm a");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl glassmorphism border-none shadow-2xl animate-in-slide-up">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Appointment Details</DialogTitle>
            <Badge className="capitalize px-4 py-1 text-sm">{appointment.status}</Badge>
          </div>
          <DialogDescription>
            ID: {appointment.id}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Patient</p>
                <p className="text-lg font-semibold">{patientName}</p>
                <p className="text-sm text-muted-foreground">{appointment.users?.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Doctor</p>
                <p className="text-lg font-semibold">{doctorName}</p>
                <p className="text-sm text-muted-foreground">{appointment.doctors?.specialization}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent/10 rounded-lg text-accent">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p className="text-lg font-semibold">{appointment.locations?.name}</p>
                <p className="text-sm text-muted-foreground">{appointment.locations?.address}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p className="text-lg font-semibold">{dateStr}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Time</p>
                <p className="text-lg font-semibold">{startTimeStr} - {endTimeStr}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg text-green-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Service</p>
                <p className="text-lg font-semibold">{appointment.services?.name}</p>
                <p className="text-sm text-muted-foreground">₱{appointment.services?.price?.toString()}</p>
              </div>
            </div>
          </div>
        </div>

        {appointment.notes && (
          <>
            <Separator className="my-4 bg-white/20" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Notes</p>
              <div className="p-4 bg-white/30 rounded-xl border border-white/20">
                <p className="text-sm leading-relaxed">{appointment.notes}</p>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
