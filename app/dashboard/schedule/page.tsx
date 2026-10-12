import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { AccessDenied } from "@/components/dashboard/access-denied";
import { getDoctorByUserId, getDoctorScheduleData } from "@/lib/actions/doctors";
import { getDoctorLeaveRequests } from "@/lib/actions/doctor-leaves";
import { ScheduleClient } from "@/components/dashboard/schedule/schedule-client";
import { redirect } from "next/navigation";

export default async function SchedulePage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "doctor") redirect("/dashboard");

  const canView = await hasPermission(user.id, "appointments:read");
  if (!canView) {
    return (
      <AccessDenied
        title="Schedule Access Restricted"
        description="Your doctor account currently does not have privileges to view clinical schedule and shifts."
        permission="appointments:read"
      />
    );
  }

  const doctor = await getDoctorByUserId(user.id);
  if (!doctor) redirect("/dashboard");

  const [scheduleData, leaveRequestsRes] = await Promise.all([
    getDoctorScheduleData(doctor.id),
    getDoctorLeaveRequests(doctor.id),
  ]);

  return (
    <ScheduleClient
      initialAppointments={scheduleData.appointments}
      initialLeaveRequests={leaveRequestsRes.data || []}
      doctorId={doctor.id}
    />
  );
}
