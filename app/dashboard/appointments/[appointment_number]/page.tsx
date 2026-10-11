import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDoctorByUserId } from "@/lib/actions/doctors";
import { getAppointmentByNumber } from "@/lib/actions/appointments";
import { AppointmentDetailsView } from "@/components/dashboard/appointments/appointment-details-view";

interface AppointmentDetailsPageProps {
  params: Promise<{ appointment_number: string }>;
}

export default async function AppointmentDetailsPage({
  params,
}: AppointmentDetailsPageProps) {
  const { appointment_number } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "doctor") {
    redirect("/dashboard");
  }

  const doctor = await getDoctorByUserId(user.id);
  if (!doctor) {
    redirect("/dashboard");
  }

  const appointment = await getAppointmentByNumber(
    appointment_number,
    doctor.id
  );

  if (!appointment) {
    notFound();
  }

  return <AppointmentDetailsView initialAppointment={appointment} />;
}
