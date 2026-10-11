"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  Video,
  Activity,
  Loader2,
  Sparkles,
  LogOut,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import { useTransition } from "react";
import { updateDoctorShiftStatus } from "@/lib/actions/doctors";
import { updateAppointmentStatus } from "@/lib/actions/appointments";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { DoctorDashboardData } from "@/lib/types/doctor-dashboard";
import { StartShiftDialog } from "@/components/dashboard/start-shift-dialog";

interface DoctorDashboardProps {
  data: DoctorDashboardData;
}

export function DoctorDashboard({ data }: DoctorDashboardProps) {
  const { stats, recentAppointments, doctor } = data;
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!doctor) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Doctor Profile Not Found</h2>
        <p className="text-slate-500 mt-2">
          Unable to locate a matching clinical profile. Please contact clinic administration.
        </p>
      </div>
    );
  }

  const handleToggleShift = () => {
    const newStatus = !doctor.is_on_shift;
    startTransition(async () => {
      const result = await updateDoctorShiftStatus(doctor.id, newStatus);
      if (result.success) {
        toast.success(
          newStatus
            ? "Shift started! You are now active and receiving patients."
            : "Shift ended. Have a great rest!",
        );
      } else {
        toast.error(result.error || "Failed to update shift status");
      }
    });
  };

  const handleStartSession = (appointmentId: string) => {
    startTransition(async () => {
      const result = await updateAppointmentStatus(appointmentId, "checked_in");
      if (result.success) {
        toast.success("Patient session started!");
      } else {
        toast.error(result.error || "Failed to start patient session");
      }
    });
  };

  const handleEndSession = (appointmentId: string) => {
    startTransition(async () => {
      const result = await updateAppointmentStatus(appointmentId, "completed");
      if (result.success) {
        toast.success("Consultation session ended successfully.");
      } else {
        toast.error(result.error || "Failed to complete appointment session");
      }
    });
  };

  // Filter out completed and cancelled appointments so only active & waiting queue appear
  const activeAndQueuedAppointments = (recentAppointments || []).filter(
    (apt) => apt.status !== "completed" && apt.status !== "cancelled"
  );

  // Single-patient concurrency: find the active patient session (first checked_in patient)
  const activeAppointment = activeAndQueuedAppointments.find(
    (apt) => apt.status === "checked_in"
  );
  const hasActiveSession = Boolean(activeAppointment);

  return (
    <div className="space-y-8 animate-in-fade">
      {/* Shift Prompt Modal (SRP) */}
      <StartShiftDialog
        doctorId={doctor.id}
        doctorName={doctor.users?.first_name || "Doctor"}
        isOnShift={Boolean(doctor.is_on_shift)}
      />

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, Dr. {doctor.users?.first_name || "Doctor"}
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            You have {stats.todayPatients} patients scheduled for today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!doctor.is_on_shift ? (
            <Button
              className="rounded-xl gap-2 shadow-lg shadow-primary/20 transition-all font-bold bg-primary hover:bg-primary/90"
              onClick={handleToggleShift}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Start Shift
            </Button>
          ) : (
            <Button
              variant="outline"
              className="rounded-xl gap-2 border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 font-bold transition-all"
              onClick={handleToggleShift}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4 text-rose-600" />
              )}
              End Shift
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Today's Schedule Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Today's Timeline
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary font-bold hover:bg-primary/5 rounded-lg"
              asChild
            >
              <Link href="/dashboard/schedule">View Full Schedule</Link>
            </Button>
          </div>

          <div className="space-y-4">
            {activeAndQueuedAppointments.length === 0 ? (
              <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 shadow-none">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">
                    All caught up!
                  </h3>
                  <p className="text-slate-500 mt-1">
                    No active or waiting appointments remaining in your queue today.
                  </p>
                </CardContent>
              </Card>
            ) : (
              activeAndQueuedAppointments.map((apt, index) => {
                const isActive = apt.id === activeAppointment?.id;
                const isFirstInQueue = index === 0;

                return (
                  <Card
                    key={apt.id}
                    className={`transition-all overflow-hidden cursor-pointer ${
                      isActive
                        ? "border-2 border-emerald-500 shadow-md ring-2 ring-emerald-500/20 bg-emerald-50/15"
                        : "border-none shadow-sm bg-white hover:shadow-md"
                    }`}
                    onClick={() => router.push(`/dashboard/schedule/${apt.id}`)}
                  >
                    <CardContent className="p-0 flex">
                      <div
                        className={`w-2 transition-colors ${
                          isActive
                            ? "bg-emerald-500"
                            : "bg-primary/20 group-hover:bg-primary"
                        }`}
                      />
                      <div className="p-5 flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="text-center min-w-[60px]">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">
                              {format(new Date(apt.start_time), "aaa")}
                            </p>
                            <p className="text-xl font-black text-slate-900 leading-none">
                              {format(new Date(apt.start_time), "hh:mm")}
                            </p>
                          </div>
                          <div className="h-10 w-px bg-slate-100"></div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 leading-tight">
                                {apt.users.first_name} {apt.users.last_name}
                              </h4>
                              {isActive && (
                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs font-bold px-2 py-0.5 flex items-center gap-1">
                                  <Activity className="w-3 h-3 text-emerald-600 animate-pulse" />
                                  Active Session
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-500 font-medium mt-0.5">
                              {apt.services.name}
                            </p>
                          </div>
                        </div>

                        <div
                          className="flex items-center gap-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {!isActive && (
                            <>
                              {apt.status === "confirmed" && (
                                <Badge className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-50">
                                  Confirmed
                                </Badge>
                              )}
                              {apt.status === "pending" && (
                                <Badge className="bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-50">
                                  Pending
                                </Badge>
                              )}
                            </>
                          )}

                          <Link href={`/dashboard/patients/${apt.patient_id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-xl border-slate-200 font-bold"
                            >
                              Open EMR
                            </Button>
                          </Link>

                          {isActive ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              className="rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                              onClick={() => handleEndSession(apt.id)}
                              disabled={isPending}
                            >
                              {isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                "End Session"
                              )}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className={`rounded-xl shadow-sm font-bold transition-all ${
                                !hasActiveSession && isFirstInQueue
                                  ? "bg-primary hover:bg-primary/90 text-white"
                                  : "bg-slate-100 text-slate-400 hover:bg-slate-100 cursor-not-allowed"
                              }`}
                              onClick={() => handleStartSession(apt.id)}
                              disabled={isPending || hasActiveSession}
                            >
                              {isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : hasActiveSession ? (
                                "Doctor with Patient"
                              ) : isFirstInQueue ? (
                                "Start Session"
                              ) : (
                                "In Queue"
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Telemedicine Card Sidebar */}
        <div className="space-y-6">
          <Card className="border-none shadow-md bg-gradient-to-br from-primary to-[#164a6b] text-white overflow-hidden relative rounded-2xl">
            <div className="absolute top-0 right-0 p-4 opacity-15">
              <Video className="w-28 h-28" />
            </div>
            <CardContent className="p-6 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4 backdrop-blur-sm">
                <Video className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-black">Telemedicine</h3>
              <p className="text-primary-foreground/80 text-sm mt-1.5 font-medium leading-relaxed">
                Connect with patients remotely. Launch your secure virtual room for
                scheduled video consultations.
              </p>
              <Button className="w-full mt-6 bg-white text-primary hover:bg-slate-100 font-bold rounded-xl shadow-sm transition-all">
                Open Telemed Portal
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
