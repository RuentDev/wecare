"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Calendar,
  MessageSquare,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Video,
  FlaskConical,
  Activity,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import { useTransition } from "react";
import { updateDoctorShiftStatus } from "@/lib/actions/doctors";
import { updateAppointmentStatus } from "@/lib/actions/appointments";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface DoctorOverviewProps {
  data: any;
}

export function DoctorOverview({ data }: DoctorOverviewProps) {
  const { stats, recentAppointments, doctor } = data;
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleToggleShift = () => {
    const newStatus = !doctor.is_on_shift;
    startTransition(async () => {
      const result = await updateDoctorShiftStatus(doctor.id, newStatus);
      if (result.success) {
        toast.success(
          newStatus
            ? "Shift started! You are now active."
            : "Shift ended. Have a great rest!",
        );
      } else {
        toast.error(result.error || "Failed to update shift status");
      }
    });
  };

  const handleCheckIn = (appointmentId: string) => {
    startTransition(async () => {
      const result = await updateAppointmentStatus(appointmentId, "checked_in");
      if (result.success) {
        toast.success("Patient checked in successfully!");
      } else {
        toast.error(result.error || "Failed to check in patient");
      }
    });
  };

  return (
    <div className="space-y-8 animate-in-fade">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, Dr. {doctor.users.first_name}
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            You have {stats.todayPatients} patients scheduled for today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/schedule">
            <Button
              variant="outline"
              className="rounded-xl gap-2 border-slate-200"
            >
              <Calendar className="w-4 h-4" /> View Schedule
            </Button>
          </Link>
          {!doctor.is_on_shift && (
            <Button
              className="rounded-xl gap-2 shadow-lg shadow-primary/20 transition-all"
              onClick={handleToggleShift}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
              Start Shift
            </Button>
          )}
          {doctor.is_on_shift && (
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 px-4 py-2 rounded-xl text-sm font-bold animate-in-fade slide-in-from-right-4">
              <Activity className="w-4 h-4 mr-2 animate-pulse" />
              Shift Active
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center transition-transform group-hover:scale-110">
                <Users className="w-6 h-6" />
              </div>
              <Badge
                variant="outline"
                className="bg-blue-50/50 text-blue-700 border-blue-100 font-bold"
              >
                Today
              </Badge>
            </div>
            <p className="text-sm font-medium text-slate-500">
              Scheduled Patients
            </p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">
              {stats.todayPatients}
            </h3>
            <div className="flex items-center gap-1 mt-4 text-xs font-bold text-blue-600 uppercase tracking-wider">
              <span>View details</span>
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center transition-transform group-hover:scale-110">
                <Calendar className="w-6 h-6" />
              </div>
              <Badge
                variant="outline"
                className="bg-amber-50/50 text-amber-700 border-amber-100 font-bold"
              >
                Action Required
              </Badge>
            </div>
            <p className="text-sm font-medium text-slate-500">
              Pending Approvals
            </p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">
              {stats.pendingAppointments}
            </h3>
            <div className="flex items-center gap-1 mt-4 text-xs font-bold text-amber-600 uppercase tracking-wider">
              <span>Review list</span>
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center transition-transform group-hover:scale-110">
                <MessageSquare className="w-6 h-6" />
              </div>
              <Badge
                variant="outline"
                className="bg-emerald-50/50 text-emerald-700 border-emerald-100 font-bold"
              >
                New
              </Badge>
            </div>
            <p className="text-sm font-medium text-slate-500">
              Unread Messages
            </p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">
              {stats.unreadMessages}
            </h3>
            <div className="flex items-center gap-1 mt-4 text-xs font-bold text-emerald-600 uppercase tracking-wider">
              <span>Open inbox</span>
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Schedule */}
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
            {recentAppointments.length === 0 ? (
              <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 shadow-none">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Calendar className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">
                    No appointments today
                  </h3>
                  <p className="text-slate-500 mt-1">
                    Enjoy your free time or check upcoming days.
                  </p>
                </CardContent>
              </Card>
            ) : (
              recentAppointments.map((apt: any) => (
                <Card
                  key={apt.id}
                  className="border-none shadow-sm bg-white hover:shadow-md transition-all group overflow-hidden cursor-pointer"
                  onClick={() => router.push(`/dashboard/schedule/${apt.id}`)}
                >
                  <CardContent className="p-0 flex">
                    <div className="w-2 bg-primary/20 group-hover:bg-primary transition-colors"></div>
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
                          <h4 className="font-bold text-slate-900 leading-tight">
                            {apt.users.first_name} {apt.users.last_name}
                          </h4>
                          <p className="text-sm text-slate-500 font-medium">
                            {apt.services.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {apt.status === "confirmed" && (
                          <Badge className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-50">
                            Confirmed
                          </Badge>
                        )}
                        {apt.status === "checked_in" && (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50">
                            Checked In
                          </Badge>
                        )}
                        <Link href={`/dashboard/patients/${apt.patient_id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl border-slate-200 font-bold"
                            asChild
                          >
                            Open EMR
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          className={`rounded-xl shadow-sm font-bold transition-all ${
                            apt.status === "checked_in"
                              ? "bg-slate-100 text-slate-500 hover:bg-slate-100"
                              : "bg-primary hover:bg-primary/90"
                          }`}
                          onClick={() => handleCheckIn(apt.id)}
                          disabled={isPending || apt.status === "checked_in"}
                        >
                          {isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : apt.status === "checked_in" ? (
                            "Checked In"
                          ) : (
                            "Check In"
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Quick Tools Sidebar */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Clinical
                Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-12 rounded-xl text-slate-700 hover:bg-slate-50"
                asChild
              >
                <Link href="/dashboard/labs">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <FlaskConical className="w-4 h-4" />
                  </div>
                  <span className="font-bold">Review Lab Results</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-12 rounded-xl text-slate-700 hover:bg-slate-50"
                asChild
              >
                <Link href="/dashboard/metrics">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span className="font-bold">Patient Health Metrics</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-12 rounded-xl text-slate-700 hover:bg-slate-50"
                asChild
              >
                <Link href="/dashboard/reports">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <span className="font-bold">Performance Reports</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-primary text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Video className="w-24 h-24" />
            </div>
            <CardContent className="p-6 relative z-10">
              <h3 className="text-xl font-black">Telemedicine</h3>
              <p className="text-primary-foreground/80 text-sm mt-1 font-bold">
                Connect with patients remotely. You have 2 scheduled video
                visits today.
              </p>
              <Button className="w-full mt-6 bg-white text-primary hover:bg-slate-100 font-black rounded-xl">
                Open Telemed Portal
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
