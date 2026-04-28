import { getCurrentUser } from "@/lib/auth";
import { getDoctorByUserId } from "@/lib/actions/doctors";
import { LabResultsClient } from "@/components/dashboard/labs/lab-results-client";
import { prisma } from "@/lib/prisma-db";
import { redirect } from "next/navigation";

export default async function LabResultsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "doctor") redirect("/dashboard");

  const doctor = await getDoctorByUserId(user.id);
  if (!doctor) redirect("/dashboard");

  // Fetch lab results (medical records with lab attachments)
  // In a real app, this would be a dedicated table or a filtered query
  // For now, we'll fetch records where the note or treatment mentions 'lab' or 'test'
  // Or where attachments are present (if we had a way to filter JSON)
  const labRecords = await prisma.medical_records.findMany({
    where: {
      OR: [
        { notes: { contains: "lab", mode: "insensitive" } },
        { treatment: { contains: "test", mode: "insensitive" } },
      ]
    },
    include: {
      users: {
        select: { first_name: true, last_name: true, avatar_url: true }
      },
      doctors: {
        include: { users: { select: { first_name: true, last_name: true } } }
      }
    },
    orderBy: { created_at: "desc" }
  });

  return <LabResultsClient data={labRecords} />;
}
