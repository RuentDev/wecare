import { getCurrentUser } from "@/lib/auth";
import { getDoctorByUserId, getDoctorScheduleData } from "@/lib/actions/doctors";
import { getDoctorLeaveRequests } from "@/lib/actions/doctor-leaves";
import { ScheduleClient } from "@/components/dashboard/schedule/schedule-client";
import { redirect } from "next/navigation";

export default async function SchedulePage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "doctor") redirect("/dashboard");

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
