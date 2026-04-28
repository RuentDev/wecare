import { getCurrentUser } from "@/lib/auth";
import { getDoctorByUserId, getDoctorDashboardData } from "@/lib/actions/doctors";
import { PatientDashboard } from "@/components/dashboard/patient-dashboard";
import { DoctorOverview } from "@/components/dashboard/doctor-overview";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (user.role === "doctor") {
    const doctor = await getDoctorByUserId(user.id);
    if (!doctor) {
      // Handle case where user has doctor role but no doctor record
      return (
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-800">Doctor Profile Not Found</h1>
          <p className="text-slate-500 mt-2">Please contact administration to set up your clinical profile.</p>
        </div>
      );
    }
    const dashboardData = await getDoctorDashboardData(doctor.id);
    return <DoctorOverview data={dashboardData} />;
  }

  // Default to patient dashboard
  return <PatientDashboard user={user} />;
}
