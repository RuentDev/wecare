import { getCurrentUser } from "@/lib/auth";
import { getDoctorByUserId } from "@/lib/actions/doctors";
import { AuditLogsClient } from "@/components/dashboard/audit-logs/audit-logs-client";
import { prisma } from "@/lib/prisma-db";
import { redirect } from "next/navigation";

export default async function AuditLogsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "doctor") redirect("/dashboard");

  const doctor = await getDoctorByUserId(user.id);
  if (!doctor) redirect("/dashboard");

  // Fetch audit logs related to this doctor's activity or patients
  // For now, we'll fetch general audit logs to show the UI
  const logs = await prisma.audit_logs.findMany({
    where: {
      user_id: user.id
    },
    include: {
      user: { select: { first_name: true, last_name: true } }
    },
    orderBy: { created_at: "desc" },
    take: 100
  });

  return <AuditLogsClient data={logs} />;
}
