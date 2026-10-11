import { getCurrentUser } from "@/lib/auth";
import { getDoctorByUserId } from "@/lib/actions/doctors";
import { MetricsClient } from "@/components/dashboard/metrics/metrics-client";
import { prisma } from "@/lib/prisma-db";
import { redirect } from "next/navigation";

export default async function MetricsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "doctor") redirect("/dashboard");

  const doctor = await getDoctorByUserId(user.id);
  if (!doctor) redirect("/dashboard");

  // Fetch aggregated vitals for the doctor's patients
  // For now, we'll fetch all vitals to show the trends
  const vitals = await prisma.vitals.findMany({
    take: 100,
    orderBy: { created_at: "desc" },
    include: {
      users: { select: { first_name: true, last_name: true } }
    }
  });

  return <MetricsClient data={vitals} />;
}
