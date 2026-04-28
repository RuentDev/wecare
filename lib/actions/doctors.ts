"use server";

import { prisma } from "@/lib/prisma-db";
import { getCurrentUser } from "../auth";
import { requirePermission } from "../rbac";
import { serializePrisma } from "../utils";

/**
 * Fetches a single user by ID with their roles.
 */
export async function getDoctorById(doctorId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");
  await requirePermission(currentUser.id, "users:view");

  return serializePrisma(
    await prisma.doctors.findUnique({
      where: { id: doctorId },
      include: {
        appointments: true,
        users: true,
        medical_records: true,
        doctor_services: true,
        time_slots: true,
        locations: true,
      },
    })
  );
}

export async function getDoctorByUserId(userId: string) {
  return serializePrisma(
    await prisma.doctors.findUnique({
      where: { user_id: userId },
      include: {
        users: true,
      },
    })
  );
}

export async function getDoctors() {
  try {
    const doctors = await prisma.doctors.findMany({
      include: {
        users: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
            avatar_url: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return { success: true, data: serializePrisma(doctors) };
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return { success: false, error: "Failed to fetch doctors" };
  }
}

export async function getDoctorStats() {
  try {
    const [total, available, specializations] = await Promise.all([
      prisma.doctors.count(),
      prisma.doctors.count({ where: { is_available: true } }),
      prisma.doctors.groupBy({
        by: ["specialization"],
        _count: {
          id: true,
        },
      }),
    ]);

    // Get the most common specialization
    const topSpecialization =
      specializations.sort((a, b) => (b._count.id || 0) - (a._count.id || 0))[0]
        ?.specialization || "N/A";

    return {
      success: true,
      data: {
        total,
        available,
        topSpecialization,
        specializationsCount: specializations.length,
      },
    };
  } catch (error) {
    console.error("Error fetching doctor stats:", error);
    return { success: false, error: "Failed to fetch doctor stats" };
  }
}

/**
 * Fetches data for the main doctor dashboard overview.
 */
export async function getDoctorDashboardData(doctorId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  // No explicit permission check here as this is the doctor's own dashboard

  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    const [doctor, todayAppointments, pendingCount, unreadMessages] = await Promise.all([
      prisma.doctors.findUnique({
        where: { id: doctorId },
        include: { users: true },
      }),
      prisma.appointments.findMany({
        where: {
          doctor_id: doctorId,
          appointment_date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          users: {
            select: {
              first_name: true,
              last_name: true,
              email: true,
              phone: true,
              avatar_url: true,
            },
          },
          services: true,
          locations: true,
        },
        orderBy: { start_time: "asc" },
      }),
      prisma.appointments.count({
        where: {
          doctor_id: doctorId,
          status: "pending",
        },
      }),
      prisma.notification_logs.count({
        where: {
          user_id: user.id,
          status: "pending",
        },
      }),
    ]);

    return serializePrisma({
      doctor,
      stats: {
        todayPatients: todayAppointments.length,
        pendingAppointments: pendingCount,
        unreadMessages: unreadMessages,
      },
      recentAppointments: todayAppointments,
    });
  } catch (error) {
    console.error("[GET_DOCTOR_DASHBOARD_DATA]", error);
    throw new Error("Failed to fetch dashboard data");
  }
}

/**
 * Fetches full schedule data for a doctor.
 */
export async function getDoctorScheduleData(doctorId: string) {
  try {
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));

    const [todayAppointments, upcomingAppointments, timeSlots] = await Promise.all([
      prisma.appointments.findMany({
        where: {
          doctor_id: doctorId,
          appointment_date: {
            gte: startOfToday,
            lte: new Date(now.setHours(23, 59, 59, 999)),
          },
        },
        include: {
          users: {
            select: {
              first_name: true,
              last_name: true,
              email: true,
              phone: true,
              avatar_url: true,
            },
          },
          services: true,
          locations: true,
        },
        orderBy: { start_time: "asc" },
      }),
      prisma.appointments.findMany({
        where: {
          doctor_id: doctorId,
          appointment_date: {
            gt: new Date(now.setHours(23, 59, 59, 999)),
          },
        },
        include: {
          users: {
            select: {
              first_name: true,
              last_name: true,
              email: true,
              phone: true,
              avatar_url: true,
            },
          },
          services: true,
          locations: true,
        },
        orderBy: { appointment_date: "asc" },
        take: 20,
      }),
      prisma.time_slots.findMany({
        where: { doctor_id: doctorId },
        orderBy: { day_of_week: "asc" },
      }),
    ]);

    return serializePrisma({
      todayAppointments,
      upcomingAppointments,
      timeSlots,
    });
  } catch (error) {
    console.error("[GET_DOCTOR_SCHEDULE_DATA]", error);
    throw new Error("Failed to fetch schedule data");
  }
}

/**
 * Fetches the EMR for a specific patient from a doctor's perspective.
 */
export async function getDoctorPatientEMR(doctorId: string, patientId: string) {
  try {
    const [patient, history, vitals] = await Promise.all([
      prisma.users.findUnique({
        where: { id: patientId },
        include: {
          _count: { select: { appointments: true } },
        },
      }),
      prisma.medical_records.findMany({
        where: { patient_id: patientId },
        include: {
          doctors: {
            include: { users: { select: { first_name: true, last_name: true } } },
          },
          appointments: {
            select: {
              appointment_date: true,
              services: { select: { name: true } },
            },
          },
        },
        orderBy: { created_at: "desc" },
      }),
      prisma.vitals.findFirst({
        where: { patient_id: patientId },
        orderBy: { created_at: "desc" },
      }),
    ]);

    return serializePrisma({ patient, history, vitals });
  } catch (error) {
    console.error("[GET_DOCTOR_PATIENT_EMR]", error);
    throw new Error("Failed to fetch patient EMR");
  }
}
