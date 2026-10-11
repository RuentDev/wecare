import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Loader2, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/auth";
import { getDoctorByUserId } from "@/lib/actions/doctors";
import { getDoctorAppointments } from "@/lib/actions/appointments";
import { DoctorAppointmentsClient } from "@/components/dashboard/appointments/doctor-appointments-client";

export const revalidate = 0; // Dynamic data for authenticated doctor dashboard

export default async function DoctorAppointmentsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "doctor") {
    redirect("/dashboard");
  }

  const doctor = await getDoctorByUserId(user.id);
  if (!doctor) {
    return (
      <div className="p-8 text-center bg-card rounded-xl border border-border/70 my-6">
        <h1 className="text-2xl font-bold text-foreground">Doctor Profile Not Found</h1>
        <p className="text-muted-foreground mt-2">
          Please contact administration to set up your clinical profile.
        </p>
      </div>
    );
  }

  const appointments = await getDoctorAppointments(doctor.id);

  return (
    <main className="space-y-6 animate-in-fade">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
              <Calendar className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          </div>
          <p className="text-muted-foreground text-sm font-medium">
            Monitor and manage your scheduled patient visits and clinical appointments.
          </p>
        </div>

        <Badge
          variant="outline"
          className="w-fit bg-primary/5 text-primary border-primary/20 px-4 py-1.5 rounded-xl shadow-xs"
        >
          My Clinic Appointments
        </Badge>
      </div>

      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-4 w-4 bg-primary/20 rounded-full animate-pulse" />
              </div>
            </div>
            <p className="text-muted-foreground font-medium animate-pulse">
              Loading appointments...
            </p>
          </div>
        }
      >
        <DoctorAppointmentsClient initialAppointments={appointments} />
      </Suspense>
    </main>
  );
}
