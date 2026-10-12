import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { getDoctorByUserId, getDoctorDashboardData } from "@/lib/actions/doctors";
import { getPatientDashboardAppointments } from "@/lib/actions/appointments";
import { PatientDashboard } from "@/components/dashboard/patient-dashboard";
import { DoctorDashboard } from "@/components/dashboard/doctor-dashboard";
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
    const canViewAppointments = await hasPermission(user.id, "appointments:read");
    const dashboardData = await getDoctorDashboardData(doctor.id, canViewAppointments);
    return (
      <DoctorDashboard
        data={dashboardData}
        canViewAppointments={canViewAppointments}
      />
    );
  }

  // Default to patient dashboard
  const patientAppointments = await getPatientDashboardAppointments(user.id);
  return <PatientDashboard user={user} initialAppointments={patientAppointments} />;
}
