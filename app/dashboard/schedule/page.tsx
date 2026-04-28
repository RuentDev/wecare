import { getCurrentUser } from "@/lib/auth";
import { getDoctorByUserId, getDoctorScheduleData } from "@/lib/actions/doctors";
import { ScheduleClient } from "@/components/dashboard/schedule/schedule-client";
import { redirect } from "next/navigation";

export default async function SchedulePage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "doctor") redirect("/dashboard");

  const doctor = await getDoctorByUserId(user.id);
  if (!doctor) redirect("/dashboard");

  const scheduleData = await getDoctorScheduleData(doctor.id);

  return <ScheduleClient data={scheduleData} doctorId={doctor.id} />;
}
