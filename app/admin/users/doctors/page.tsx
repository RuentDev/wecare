import { getDoctors, getDoctorStats } from "@/lib/actions/doctors";
import { DoctorsClient } from "@/components/admin/doctors/doctors-client";
import { DoctorStats } from "@/components/admin/doctors/doctors-stats";

export const metadata = {
  title: "Doctors Management | WeCare Admin",
  description: "View and manage healthcare professionals",
};

export default async function DoctorsPage() {
  const [doctorsResponse, statsResponse] = await Promise.all([
    getDoctors(),
    getDoctorStats(),
  ]);

  const doctors = doctorsResponse.success ? doctorsResponse.data : [];
  const stats = statsResponse.success
    ? statsResponse.data
    : {
        total: 0,
        available: 0,
        topSpecialization: "N/A",
        specializationsCount: 0,
      };

  return (
    <div className="flex-1 space-y-5">
      <DoctorStats stats={stats as any} />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-neutral-dark">
            Practitioner List
          </h2>
        </div>
        <DoctorsClient initialDoctors={doctors as any} />
      </div>
    </div>
  );
}
