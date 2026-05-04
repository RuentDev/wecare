import { getCurrentUser } from "@/lib/auth";
import { getDoctorByUserId, getDoctorPatientEMR } from "@/lib/actions/doctors";
import { PatientEMRClient } from "@/components/dashboard/patients/patient-emr-client";
import { redirect, notFound } from "next/navigation";

interface PatientEMRPageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientEMRPage({ params }: PatientEMRPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "doctor") redirect("/dashboard");

  const doctor = await getDoctorByUserId(user.id);
  if (!doctor) redirect("/dashboard");

  try {
    const emrData = await getDoctorPatientEMR(doctor.id, id);
    if (!emrData.patient) notFound();

    return <PatientEMRClient data={emrData} doctorId={doctor.id} />;
  } catch (error) {
    console.error(error);
    notFound();
  }
}
