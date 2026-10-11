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
  if (!user) {
    redirect("/login");
  }

  let filter: { doctorId?: string; patientId?: string } = {};

  if (user.role === "doctor") {
    const doctor = await getDoctorByUserId(user.id);
    if (!doctor) {
      redirect("/dashboard");
    }
    filter = { doctorId: doctor.id };
  } else if (user.role === "patient") {
    filter = { patientId: user.id };
  } else if (user.role === "admin") {
    // Admin has full view access
    filter = {};
  } else {
    redirect("/dashboard");
  }

  const appointment = await getAppointmentByNumber(appointment_number, filter);

  if (!appointment) {
    notFound();
  }

  return (
    <AppointmentDetailsView
      initialAppointment={appointment}
      userRole={user.role as "doctor" | "patient" | "admin"}
    />
  );
}
