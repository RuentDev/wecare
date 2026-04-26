import { Suspense } from "react";
import { Users, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PatientsClient } from "@/components/admin/patients/patients-client";
import { PatientsStats } from "@/components/admin/patients/patients-stats";
import { getPatients, getPatientStats } from "@/lib/actions/patients";

export const revalidate = 60; // ISR: Revalidate every 60 seconds

export default async function PatientsPage() {
  const [patients, stats] = await Promise.all([
    getPatients(),
    getPatientStats(),
  ]);

  return (
    <main className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-xl text-primary shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Patients
            </h1>
          </div>
          <p className="text-muted-foreground font-medium">
            Manage your clinic's patient records, history, and engagement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge 
            variant="outline" 
            className="bg-emerald-500/5 text-emerald-600 border-emerald-500/20 px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 group hover:bg-emerald-500/10 transition-colors"
          >
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold tracking-tight">Live Directory</span>
          </Badge>
          
          <Badge 
            variant="outline" 
            className="bg-primary/5 text-primary border-primary/20 px-4 py-2 rounded-xl shadow-sm font-bold"
          >
            ISR Active (60s)
          </Badge>
        </div>
      </div>

      <PatientsStats stats={stats} />

      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-32 space-y-4 glassmorphism rounded-3xl border-none shadow-xl">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-foreground font-bold text-lg tracking-tight">Loading Patient Records</p>
              <p className="text-muted-foreground text-sm font-medium animate-pulse">Syncing with medical database...</p>
            </div>
          </div>
        }
      >
        <PatientsClient initialPatients={patients} />
      </Suspense>
    </main>
  );
}
