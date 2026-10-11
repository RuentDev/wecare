"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  CalendarCheck,
  XCircle,
  Copy,
  Check,
  Building,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils";
import {
  updateAppointmentStatus,
  type AppointmentStatus,
  type getAppointmentByNumber,
} from "@/lib/actions/appointments";

export type AppointmentDetailData = NonNullable<
  Awaited<ReturnType<typeof getAppointmentByNumber>>
>;

interface AppointmentDetailsViewProps {
  initialAppointment: AppointmentDetailData;
  userRole?: "doctor" | "patient" | "admin";
}

export function AppointmentDetailsView({
  initialAppointment,
  userRole = "doctor",
}: AppointmentDetailsViewProps) {
  const [appointment, setAppointment] =
    useState<AppointmentDetailData>(initialAppointment);
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const aptNumber =
    appointment.appointment_number ||
    `APT-${appointment.id.slice(0, 8).toUpperCase()}`;

  const copyAptNumber = () => {
    navigator.clipboard.writeText(aptNumber);
    setCopied(true);
    toast.success("Appointment number copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusChange = (newStatus: AppointmentStatus) => {
    startTransition(async () => {
      const prev = appointment;
      setAppointment({ ...prev, status: newStatus });

      const res = await updateAppointmentStatus(appointment.id, newStatus);
      if (res.success) {
        toast.success(`Appointment status updated to ${newStatus}`);
      } else {
        setAppointment(prev);
        toast.error(res.error || "Failed to update status");
      }
    });
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    confirmed: "bg-blue-100 text-blue-700 border-blue-200",
    completed: "bg-green-100 text-green-700 border-green-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
    no_show: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const patient = appointment.users;
  const doctor = appointment.doctors;
  const service = appointment.services;
  const location = appointment.locations;

  const patientInitials = `${patient?.first_name?.[0] || ""}${
    patient?.last_name?.[0] || ""
  }`.toUpperCase();

  const formattedDate = appointment.appointment_date
    ? format(new Date(appointment.appointment_date), "EEEE, MMMM dd, yyyy")
    : "N/A";

  const formattedStartTime = appointment.start_time
    ? format(new Date(appointment.start_time), "hh:mm a")
    : "N/A";

  const formattedEndTime = appointment.end_time
    ? format(new Date(appointment.end_time), "hh:mm a")
    : "N/A";

  const backLink =
    userRole === "patient" ? "/dashboard" : "/dashboard/appointments";
  const backLabel =
    userRole === "patient" ? "Back to Dashboard" : "Back to Appointments";

  return (
    <div className="space-y-6 pb-12 animate-in-fade max-w-6xl mx-auto">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl gap-1.5 h-9 bg-card border-border/80 shadow-xs"
          >
            <Link href={backLink}>
              <ArrowLeft className="w-4 h-4" />
              {backLabel}
            </Link>
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {userRole !== "patient" && (
            <>
              {appointment.status === "pending" && (
                <Button
                  onClick={() => handleStatusChange("confirmed")}
                  disabled={isPending}
                  size="sm"
                  className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
                >
                  <CalendarCheck className="w-4 h-4" />
                  Confirm Appointment
                </Button>
              )}

              {appointment.status === "confirmed" && (
                <Button
                  onClick={() => handleStatusChange("completed")}
                  disabled={isPending}
                  size="sm"
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark as Completed
                </Button>
              )}
            </>
          )}

          {appointment.status !== "cancelled" &&
            appointment.status !== "completed" && (
              <Button
                onClick={() => handleStatusChange("cancelled")}
                disabled={isPending}
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 rounded-xl shadow-xs"
              >
                <XCircle className="w-4 h-4" />
                {userRole === "patient"
                  ? "Cancel Appointment"
                  : "Cancel Appointment"}
              </Button>
            )}
        </div>
      </div>

      {/* Main Appointment Banner Card */}
      <Card className="rounded-2xl border-border/70 overflow-hidden shadow-xs bg-card">
        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-primary/5 via-primary/2 to-transparent border-b border-border/60">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-mono">
                {aptNumber}
              </h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyAptNumber}
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                title="Copy appointment number"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <Badge
                variant="outline"
                className={`${
                  statusColors[appointment.status || "pending"] ||
                  "bg-gray-100 text-gray-700"
                } capitalize px-3.5 py-1 rounded-full text-xs font-semibold shadow-xs`}
              >
                {appointment.status || "pending"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Created on{" "}
              {appointment.created_at
                ? format(new Date(appointment.created_at), "MMM dd, yyyy")
                : "N/A"}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-background/80 backdrop-blur-xs p-4 rounded-xl border border-border/70">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Visit Schedule
              </p>
              <p className="text-sm font-bold text-foreground">
                {formattedDate}
              </p>
              <p className="text-xs font-medium text-muted-foreground">
                {formattedStartTime} - {formattedEndTime}
              </p>
            </div>
          </div>
        </div>

        <CardContent className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Patient Profile */}
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Patient Profile
                </h3>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border/60">
                  <Avatar className="h-14 w-14 border border-border/70">
                    <AvatarImage
                      src={patient?.avatar_url || ""}
                      alt={patient?.first_name || ""}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                      {patientInitials || "PT"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-bold text-foreground">
                        {patient?.first_name} {patient?.last_name}
                      </h4>
                      {patient?.is_guest && (
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 uppercase font-bold"
                        >
                          Guest Patient
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{patient?.email || "No email provided"}</span>
                    </div>

                    {patient?.phone && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{patient.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Service & Clinical Details */}
              <div>
                <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Clinical Service
                </h3>
                <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {service?.name || "General Consultation"}
                      </p>
                      {service?.duration_minutes && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          Estimated {service.duration_minutes} minutes
                        </p>
                      )}
                    </div>
                    {service?.price && (
                      <Badge
                        variant="secondary"
                        className="font-mono text-xs px-2.5 py-1"
                      >
                        {formatCurrency(Number(service.price))}
                      </Badge>
                    )}
                  </div>

                  {service?.description && (
                    <>
                      <Separator className="bg-border/60" />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {service.description}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Location & Clinical Notes */}
            <div className="space-y-6">
              {/* Location */}
              <div>
                <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Building className="w-4 h-4 text-primary" />
                  Clinic Facility
                </h3>
                <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-2">
                  <p className="text-sm font-bold text-foreground">
                    {location?.name || "Main Clinic Facility"}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-start gap-1.5 leading-relaxed">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                    <span>
                      {location?.address || "Address not provided"}
                      {location?.city ? `, ${location.city}` : ""}
                    </span>
                  </p>
                  {location?.phone && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                      {location.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Patient Notes */}
              <div>
                <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Patient Visit Reason / Notes
                </h3>
                <div className="p-4 rounded-xl bg-muted/30 border border-border/60 min-h-[100px]">
                  {appointment.notes ? (
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                      {appointment.notes}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      No additional notes provided by patient.
                    </p>
                  )}
                </div>
              </div>

              {/* Cancellation Reason if cancelled */}
              {appointment.status === "cancelled" && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 space-y-1">
                  <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Appointment Cancelled
                  </div>
                  <p className="text-xs text-destructive/90">
                    {appointment.cancellation_reason ||
                      "No cancellation reason recorded."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
