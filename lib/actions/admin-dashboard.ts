"use server";

import { prisma } from "@/lib/prisma-db";
import { getCurrentUser } from "@/lib/auth";
import { requirePermission } from "@/lib/rbac";
import type {
  AdminDashboardData,
  DashboardKPIStats,
  QueuedPatient,
  PatientQueueSummary,
  PhysicianDoorStatus,
  PhysicianDutyStatus,
  ActiveStaffSession,
  RBACSummary,
  QueueStage,
  StaffRole,
} from "@/lib/types/admin-dashboard";

function formatTimeString(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function parseDeviceName(userAgent: string | null): string {
  if (!userAgent) return "Unknown Device";
  if (userAgent.includes("Mobile")) return "Mobile Browser";
  if (userAgent.includes("Macintosh")) return "macOS Desktop";
  if (userAgent.includes("Windows")) return "Windows Desktop";
  if (userAgent.includes("Linux")) return "Linux Desktop";
  return "Web Browser";
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  // Ensure user has basic admin or staff viewing access
  await requirePermission(currentUser.id, "appointments:view");

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // Parallel database queries for high performance
  const [
    todayAppointments,
    pendingAppointmentsCount,
    totalPatientsCount,
    paidPayments,
    paidInvoices,
    doctorsList,
    activeSessions,
    rolesWithCounts,
    permissionsCount,
  ] = await Promise.all([
    prisma.appointments.findMany({
      where: {
        appointment_date: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
      include: {
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        doctors: {
          include: {
            users: {
              select: {
                first_name: true,
                last_name: true,
              },
            },
          },
        },
        services: {
          select: {
            name: true,
          },
        },
        locations: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        start_time: "asc",
      },
    }),
    prisma.appointments.count({
      where: { status: "pending" },
    }),
    prisma.users.count({
      where: { role: "patient" },
    }),
    prisma.payments.aggregate({
      where: {
        status: "paid",
        created_at: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    }),
    prisma.invoices.aggregate({
      where: {
        status: "PAID",
        created_at: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    }),
    prisma.doctors.findMany({
      include: {
        users: {
          select: {
            first_name: true,
            last_name: true,
            avatar_url: true,
          },
        },
        locations: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        created_at: "asc",
      },
    }),
    prisma.sessions.findMany({
      where: {
        expires_at: { gt: now },
        users: {
          role: { in: ["admin", "doctor", "nurse", "staff"] },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true,
            avatar_url: true,
            last_login_at: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      take: 15,
    }),
    prisma.roles.findMany({
      include: {
        _count: {
          select: {
            user_roles: true,
            role_permissions: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.permissions.count(),
  ]);

  // Calculate Monthly Revenue (Payments + Paid Invoices)
  const monthlyRevenue =
    Number(paidPayments._sum.amount || 0) + Number(paidInvoices._sum.amount || 0);

  const stats: DashboardKPIStats = {
    todayAppointments: todayAppointments.length,
    pendingAppointments: pendingAppointmentsCount,
    totalPatients: totalPatientsCount,
    monthlyRevenue,
  };

  // Helper to determine if appointment is currently active
  const curTotalMin = now.getHours() * 60 + now.getMinutes();

  const isAppointmentOngoing = (startTime: Date, endTime: Date): boolean => {
    const startMin = startTime.getHours() * 60 + startTime.getMinutes();
    const endMin = endTime.getHours() * 60 + endTime.getMinutes();
    return curTotalMin >= startMin && curTotalMin <= endMin;
  };

  // Patient Queue Aggregation
  let waitingCount = 0;
  let inConsultationCount = 0;
  let checkedOutCount = 0;

  const queue: QueuedPatient[] = todayAppointments.map((apt) => {
    let queueStage: QueueStage = "waiting";

    if (apt.status === "completed") {
      queueStage = "checked_out";
      checkedOutCount++;
    } else if (apt.status === "checked_in") {
      if (isAppointmentOngoing(apt.start_time, apt.end_time)) {
        queueStage = "in_consultation";
        inConsultationCount++;
      } else {
        queueStage = "waiting";
        waitingCount++;
      }
    } else if (apt.status === "confirmed" && isAppointmentOngoing(apt.start_time, apt.end_time)) {
      queueStage = "in_consultation";
      inConsultationCount++;
    } else {
      queueStage = "waiting";
      waitingCount++;
    }

    const patientName = apt.users
      ? `${apt.users.first_name} ${apt.users.last_name}`
      : "Unknown Patient";
    const doctorName = apt.doctors?.users
      ? `Dr. ${apt.doctors.users.first_name} ${apt.doctors.users.last_name}`
      : "Unassigned Doctor";

    return {
      id: apt.id,
      patientId: apt.patient_id,
      patientName,
      patientEmail: apt.users?.email || "",
      doctorName,
      serviceName: apt.services?.name || "General Consultation",
      timeSlot: `${formatTimeString(apt.start_time)} - ${formatTimeString(apt.end_time)}`,
      status: (apt.status || "pending") as QueuedPatient["status"],
      queueStage,
    };
  });

  const queueSummary: PatientQueueSummary = {
    waitingCount,
    inConsultationCount,
    checkedOutCount,
    totalTodayCount: todayAppointments.length,
    queue,
  };

  // Physician Door Availability Aggregation
  const physicians: PhysicianDoorStatus[] = doctorsList.map((doc) => {
    let dutyStatus: PhysicianDutyStatus = "FINISHED";
    if (doc.is_on_shift && doc.is_available) {
      dutyStatus = "ON_DUTY";
    } else if (doc.is_on_shift && !doc.is_available) {
      dutyStatus = "ON_BREAK";
    } else {
      dutyStatus = "FINISHED";
    }

    const activeApt = todayAppointments.find(
      (apt) =>
        apt.doctor_id === doc.id &&
        (apt.status === "checked_in" || apt.status === "confirmed") &&
        isAppointmentOngoing(apt.start_time, apt.end_time)
    );

    const docName = doc.users
      ? `Dr. ${doc.users.first_name} ${doc.users.last_name}`
      : "Physician";

    return {
      id: doc.id,
      name: docName,
      specialization: doc.specialization,
      avatarUrl: doc.users?.avatar_url || null,
      locationName: doc.locations?.name || "Consultation Room",
      status: dutyStatus,
      currentPatientName: activeApt?.users
        ? `${activeApt.users.first_name} ${activeApt.users.last_name}`
        : null,
      todayAppointmentsCount: todayAppointments.filter((apt) => apt.doctor_id === doc.id).length,
    };
  });

  // Active Staff Sessions Aggregation
  const activeStaff: ActiveStaffSession[] = activeSessions.map((s) => {
    const userRole = (s.users?.role || "staff") as StaffRole;
    const name = s.users
      ? `${s.users.first_name} ${s.users.last_name}`
      : "Staff Member";

    return {
      id: s.id,
      userId: s.user_id,
      name,
      email: s.users?.email || "",
      role: userRole,
      avatarUrl: s.users?.avatar_url || null,
      ipAddress: s.ip_address || "127.0.0.1",
      device: parseDeviceName(s.user_agent),
      lastActiveAt: s.users?.last_login_at
        ? new Date(s.users.last_login_at).toISOString()
        : new Date(s.created_at || now).toISOString(),
    };
  });

  // RBAC Summary Aggregation
  const rbac: RBACSummary = {
    totalRoles: rolesWithCounts.length,
    totalPermissions: permissionsCount,
    roles: rolesWithCounts.map((r) => ({
      id: r.id,
      name: r.name,
      usersCount: r._count.user_roles,
      permsCount: r._count.role_permissions,
    })),
  };

  return {
    stats,
    queue: queueSummary,
    physicians,
    activeStaff,
    rbac,
  };
}
