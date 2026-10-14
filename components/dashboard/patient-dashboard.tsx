"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Stethoscope,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  FileText,
  CreditCard,
  Building,
  UserX,
  RefreshCw,
} from "lucide-react";
import type { User as UserType } from "@/lib/auth";
import type {
  PatientDashboardAppointment,
  PatientAppointmentStatus,
} from "@/lib/types/patient-dashboard";
import { getPatientDashboardAppointments } from "@/lib/actions/appointments";
import { formatCurrency } from "@/lib/utils";

interface PatientDashboardProps {
  user: UserType;
  initialAppointments?: PatientDashboardAppointment[];
}

const statusConfig: Record<
  PatientAppointmentStatus,
  {
    label: string;
    badgeStyle: string;
    cardStyle: string;
    icon: typeof CheckCircle;
  }
> = {
  pending: {
    label: "Pending Confirmation",
    badgeStyle:
      "bg-amber-100/90 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700/60 font-semibold",
    cardStyle:
      "bg-amber-50/70 dark:bg-amber-950/20 border-amber-200/90 dark:border-amber-800/40 border-l-4 border-l-amber-500 hover:bg-amber-50/90 dark:hover:bg-amber-950/30 hover:border-amber-300 dark:hover:border-amber-700 shadow-amber-500/5",
    icon: AlertCircle,
  },
  confirmed: {
    label: "Confirmed",
    badgeStyle:
      "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
    cardStyle:
      "bg-card border-border/70 border-l-4 border-l-primary hover:border-primary/50",
    icon: CheckCircle,
  },
  checked_in: {
    label: "Checked In",
    badgeStyle:
      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
    cardStyle:
      "bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/40 border-l-4 border-l-emerald-500 hover:border-emerald-500/60",
    icon: CheckCircle,
  },
  completed: {
    label: "Completed",
    badgeStyle:
      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
    cardStyle:
      "bg-card border-border/70 border-l-4 border-l-emerald-600/80 hover:border-border",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    badgeStyle:
      "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
    cardStyle:
      "bg-card/70 border-border/60 border-l-4 border-l-destructive/60 opacity-80 hover:opacity-100",
    icon: XCircle,
  },
  no_show: {
    label: "No Show (Missed)",
    badgeStyle:
      "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-700",
    cardStyle:
      "bg-card/70 border-border/60 border-l-4 border-l-slate-400 opacity-90 hover:opacity-100",
    icon: UserX,
  },
};

export function PatientDashboard({
  user,
  initialAppointments,
}: PatientDashboardProps) {
  const [appointments, setAppointments] = useState<PatientDashboardAppointment[]>(
    initialAppointments || []
  );
  const [isLoading, setIsLoading] = useState(!initialAppointments);

  useEffect(() => {
    if (!initialAppointments) {
      fetchAppointments();
    }
  }, [initialAppointments]);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const data = await getPatientDashboardAppointments(user.id);
      setAppointments(data);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "N/A";
    if (timeStr.includes("T")) {
      const date = new Date(timeStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      }
    }
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    if (isNaN(hour)) return timeStr;
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const upcomingAppointments = appointments.filter((a) => {
    const aptDate = new Date(a.appointment_date);
    aptDate.setHours(0, 0, 0, 0);
    const isFutureOrToday = aptDate.getTime() >= todayStart.getTime();
    return (
      ["pending", "confirmed", "checked_in"].includes(a.status) &&
      isFutureOrToday
    );
  });

  const pastAppointments = appointments.filter((a) => {
    const aptDate = new Date(a.appointment_date);
    aptDate.setHours(0, 0, 0, 0);
    const isPastDate = aptDate.getTime() < todayStart.getTime();
    return (
      ["completed", "cancelled", "no_show"].includes(a.status) || isPastDate
    );
  });

  const AppointmentCard = ({
    appointment,
  }: {
    appointment: PatientDashboardAppointment;
  }) => {
    const status = statusConfig[appointment.status] || statusConfig.pending;
    const StatusIcon = status.icon;
    const isPending = appointment.status === "pending";

    const doctorInitials = `${appointment.dentist_first_name?.[0] || ""}${
      appointment.dentist_last_name?.[0] || ""
    }`.toUpperCase();

    return (
      <Link
        href={`/dashboard/appointments/${appointment.appointment_number}`}
        className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl h-full"
      >
        <Card
          className={`h-full transition-all duration-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer border flex flex-col justify-between ${status.cardStyle}`}
        >
          <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
            {/* Top: Service Header + Status Badge */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="w-10 h-10 rounded-xl border border-border/60 shrink-0 bg-primary/10">
                    <AvatarImage
                      src={appointment.dentist_avatar_url || ""}
                      alt={`Dr. ${appointment.dentist_first_name}`}
                    />
                    <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold text-xs">
                      {doctorInitials || <Stethoscope className="w-4 h-4 text-primary" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-foreground tracking-tight group-hover:text-primary transition-colors truncate">
                      {appointment.service_name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      Dr. {appointment.dentist_first_name} {appointment.dentist_last_name}
                      {appointment.specialization && ` • ${appointment.specialization.replace("_", " ")}`}
                    </p>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className={`text-[11px] px-2.5 py-0.5 rounded-full border shadow-2xs shrink-0 flex items-center gap-1 ${status.badgeStyle}`}
                >
                  <StatusIcon className="w-3 h-3 shrink-0" />
                  <span>{status.label}</span>
                </Badge>
              </div>

              {/* Clinical Details: Date, Time & Location */}
              <div className="space-y-1.5 pt-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 font-medium text-foreground/90">
                  <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{formatDate(appointment.appointment_date)}</span>
                  <span className="text-muted-foreground/50">•</span>
                  <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>
                    {formatTime(appointment.start_time)}
                    {appointment.duration_minutes ? ` (${appointment.duration_minutes}m)` : ""}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">
                    {appointment.location_name}
                    {appointment.city ? `, ${appointment.city}` : ""}
                  </span>
                </div>

                {appointment.notes && (
                  <p className="text-[11px] italic text-muted-foreground/80 line-clamp-1 pt-0.5">
                    &ldquo;{appointment.notes}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Bar: Price & Action */}
            <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs mt-auto">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <CreditCard className="w-3.5 h-3.5 text-primary" />
                <span>{formatCurrency(appointment.service_price)}</span>
              </div>

              <div className="flex items-center gap-2">
                {appointment.status === "no_show" && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = `/booking?doctor=${appointment.doctor_id || ""}&service=${appointment.service_id || ""}&location=${appointment.location_id || ""}`;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = `/booking?doctor=${appointment.doctor_id || ""}&service=${appointment.service_id || ""}&location=${appointment.location_id || ""}`;
                      }
                    }}
                    className="inline-flex items-center gap-1 font-semibold text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Reschedule
                  </span>
                )}

                <span className="inline-flex items-center gap-1 font-semibold text-primary group-hover:translate-x-0.5 transition-transform text-xs">
                  View Details
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Good Day, {user.first_name}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your upcoming and past dental visits
          </p>
        </div>
        <Button asChild className="rounded-xl shadow-xs">
          <Link href="/booking">
            <Plus className="w-4 h-4 mr-2" />
            Book Appointment
          </Link>
        </Button>
      </div>

      {/* Appointments Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl">
          <TabsTrigger value="upcoming" className="rounded-lg">
            Upcoming ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="rounded-lg">
            Past ({pastAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {isLoading ? (
            <Card className="rounded-2xl border-border/70">
              <CardContent className="p-10 text-center">
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
                <p className="mt-2 text-muted-foreground text-sm font-medium">
                  Loading appointments...
                </p>
              </CardContent>
            </Card>
          ) : upcomingAppointments.length === 0 ? (
            <Card className="rounded-2xl border-border/70 bg-card">
              <CardContent className="p-10 text-center max-w-md mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">
                  No upcoming appointments
                </h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  You don&apos;t have any scheduled appointments right now. Schedule your next dental consultation in minutes.
                </p>
                <Button asChild className="rounded-xl">
                  <Link href="/booking">Book Appointment</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {upcomingAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {isLoading ? (
            <Card className="rounded-2xl border-border/70">
              <CardContent className="p-10 text-center">
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
                <p className="mt-2 text-muted-foreground text-sm font-medium">
                  Loading appointments...
                </p>
              </CardContent>
            </Card>
          ) : pastAppointments.length === 0 ? (
            <Card className="rounded-2xl border-border/70 bg-card">
              <CardContent className="p-10 text-center max-w-md mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">
                  No past appointments
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your appointment history and clinical records will appear here after completion.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {pastAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
