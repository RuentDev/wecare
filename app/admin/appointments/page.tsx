import { AppointmentsClient } from "@/components/admin/appointments/appointments-client";
import { getAppointments } from "@/lib/actions/appointments";
import { Suspense } from "react";
import { Loader2, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const revalidate = 60; // ISR: Revalidate every 60 seconds

export default async function AppointmentsManagement() {
  const appointments = await getAppointments();

  return (
    <main className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
              <Calendar className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          </div>
          <p className="text-muted-foreground">
            Monitor and manage patient appointments across all clinic locations.
          </p>
        </div>
        
        <Badge variant="outline" className="w-fit bg-primary/5 text-primary border-primary/20 px-4 py-1.5 rounded-xl shadow-sm">
          Live Updates Enabled (ISR)
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
            <p className="text-muted-foreground font-medium animate-pulse">Loading appointments...</p>
          </div>
        }
      >
        <AppointmentsClient initialAppointments={appointments} />
      </Suspense>
    </main>
  );
}
