import { getCurrentUser } from "@/lib/auth";
import { getDoctorByUserId } from "@/lib/actions/doctors";
import { ReportsClient } from "@/components/dashboard/reports/reports-client";
import { prisma } from "@/lib/prisma-db";
import { redirect } from "next/navigation";

export default async function ReportsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "doctor") redirect("/dashboard");

  const doctor = await getDoctorByUserId(user.id);
  if (!doctor) redirect("/dashboard");

  // Fetch billing data (invoices related to doctor's appointments)
  const invoices = await prisma.invoices.findMany({
    where: {
      appointment: {
        doctor_id: doctor.id
      }
    },
    include: {
      patient: { select: { first_name: true, last_name: true } },
      appointment: { select: { appointment_date: true } }
    },
    orderBy: { created_at: "desc" }
  });

  // Calculate volume stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfDay = new Date(now.setHours(0,0,0,0));

  const [todayCount, monthCount, totalCount] = await Promise.all([
    prisma.appointments.count({ where: { doctor_id: doctor.id, appointment_date: { gte: startOfDay } } }),
    prisma.appointments.count({ where: { doctor_id: doctor.id, appointment_date: { gte: startOfMonth } } }),
    prisma.appointments.count({ where: { doctor_id: doctor.id } })
  ]);

  const volumeStats = {
    today: todayCount,
    thisMonth: monthCount,
    total: totalCount,
    // Mock trend for chart
    trend: Array.from({ length: 7 }, (_, i) => ({
      date: format(new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000), "EEE"),
      count: Math.floor(Math.random() * 10) + 5
    }))
  };

  return <ReportsClient invoices={invoices} stats={volumeStats} />;
}

import { format } from "date-fns";
