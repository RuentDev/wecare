import { AppointmentsClient } from "@/components/admin/appointments/appointments-client";
import { DoctorLeavesClient } from "@/components/admin/appointments/doctor-leaves-client";
import { getAppointments } from "@/lib/actions/appointments";
import { getAdminLeaveRequests } from "@/lib/actions/doctor-leaves";
import { Suspense } from "react";
import { Loader2, Calendar, CalendarOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const revalidate = 60; // ISR: Revalidate every 60 seconds

export default async function AppointmentsManagement() {
  const [appointments, leaveRequestsRes] = await Promise.all([
    getAppointments(),
    getAdminLeaveRequests("all"),
  ]);

  const pendingLeavesCount = (leaveRequestsRes.data || []).filter(
    (r) => r.status === "pending",
  ).length;

  return (
    <main className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
              <Calendar className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Appointments & Doctor Leaves
            </h1>
          </div>
          <p className="text-muted-foreground text-sm font-medium">
            Monitor patient appointments across all clinic locations and review doctor absence requests.
          </p>
        </div>

        <Badge
          variant="outline"
          className="w-fit bg-primary/5 text-primary border-primary/20 px-4 py-1.5 rounded-xl shadow-xs"
        >
          Live Updates Enabled (ISR)
        </Badge>
      </div>

      <Tabs defaultValue="appointments" className="space-y-6">
        <TabsList className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 h-11 p-1">
          <TabsTrigger
            value="appointments"
            className="cursor-pointer px-5 h-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all gap-2 rounded-xl text-sm font-semibold"
          >
            <Calendar className="h-4 w-4" />
            Patient Appointments
          </TabsTrigger>
          <TabsTrigger
            value="leaves"
            className="cursor-pointer px-5 h-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all gap-2 rounded-xl text-sm font-semibold"
          >
            <CalendarOff className="h-4 w-4" />
            Doctor Leaves
            {pendingLeavesCount > 0 && (
              <Badge className="ml-1 bg-amber-500 text-white border-none text-[10px] h-4 px-1.5 min-w-4 flex justify-center">
                {pendingLeavesCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appointments">
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
            <AppointmentsClient initialAppointments={appointments} />
          </Suspense>
        </TabsContent>

        <TabsContent value="leaves">
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium animate-pulse">
                  Loading doctor leave requests...
                </p>
              </div>
            }
          >
            <DoctorLeavesClient
              initialLeaveRequests={leaveRequestsRes.data || []}
            />
          </Suspense>
        </TabsContent>
      </Tabs>
    </main>
  );
}
