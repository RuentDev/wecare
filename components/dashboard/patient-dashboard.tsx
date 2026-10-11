"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import type { User as UserType } from "@/lib/auth";
import type {
  PatientDashboardAppointment,
  PatientAppointmentStatus,
} from "@/lib/types/patient-dashboard";
import { getPatientDashboardAppointments } from "@/lib/actions/appointments";

interface PatientDashboardProps {
  user: UserType;
  initialAppointments?: PatientDashboardAppointment[];
}

const statusConfig: Record<
  PatientAppointmentStatus,
  {
    label: string;
    color: string;
    icon: typeof CheckCircle;
  }
> = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
    icon: AlertCircle,
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800",
    icon: CheckCircle,
  },
  checked_in: {
    label: "Checked In",
    color: "bg-emerald-100 text-emerald-800",
    icon: CheckCircle,
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
  no_show: {
    label: "No Show",
    color: "bg-gray-100 text-gray-800",
    icon: XCircle,
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

    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">
                    {appointment.service_name}
                  </h3>
                  {appointment.appointment_number && (
                    <Badge variant="outline" className="font-mono text-xs">
                      {appointment.appointment_number}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Dr. {appointment.dentist_first_name}{" "}
                  {appointment.dentist_last_name}
                </p>
              </div>
            </div>
            <Badge className={status.color}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {status.label}
            </Badge>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {formatDate(appointment.appointment_date)}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              {formatTime(appointment.start_time)}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {appointment.location_name}
            </div>
          </div>
        </CardContent>
      </Card>
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
            Quick view of your appointments
          </p>
        </div>
        <Button asChild>
          <Link href="/booking">
            <Plus className="w-4 h-4 mr-2" />
            Book Appointment
          </Link>
        </Button>
      </div>

      {/* Appointments Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">
                  Loading appointments...
                </p>
              </CardContent>
            </Card>
          ) : upcomingAppointments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-foreground mb-2">
                  No upcoming appointments
                </h3>
                <p className="text-muted-foreground mb-4">
                  Schedule your next dental visit today
                </p>
                <Button asChild>
                  <Link href="/booking">Book Appointment</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
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
            <Card>
              <CardContent className="p-8 text-center">
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">
                  Loading appointments...
                </p>
              </CardContent>
            </Card>
          ) : pastAppointments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-foreground mb-2">
                  No past appointments
                </h3>
                <p className="text-muted-foreground">
                  Your appointment history will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
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
