import { getPatientById, getLatestVitals } from "@/lib/actions/patients";
import { notFound } from "next/navigation";
import { PatientClinicalDashboard } from "@/components/admin/patients/profile/patient-clinical-dashboard";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

interface PatientPageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientPage({ params }: PatientPageProps) {
  const { id } = await params;
  
  const [patient, vitals] = await Promise.all([
    getPatientById(id),
    getLatestVitals(id)
  ]);

  if (!patient) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50/30">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
            <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Loading Clinical Data</p>
          </div>
        }
      >
        <PatientClinicalDashboard patient={patient} vitals={vitals} />
      </Suspense>
    </main>
  );
}
