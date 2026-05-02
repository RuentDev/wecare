"use server";

import { prisma } from "@/lib/prisma-db";
import { getCurrentUser } from "../auth";
import { requirePermission } from "../rbac";
import { serializePrisma } from "../utils";
import { revalidatePath, revalidateTag } from "next/cache";

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
        appointments: {
          include: {
            users: {
              select: {
                first_name: true,
                last_name: true,
                email: true,
              },
            },
            services: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            appointment_date: "desc",
          },
        },
        users: true,
        medical_records: true,
        doctor_services: {
          include: {
            services: true,
          },
        },
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

/**
 * Updates a doctor's profile and associated user account.
 */
export async function updateDoctor(doctorId: string, userId: string, data: any) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("Unauthorized");
    await requirePermission(currentUser.id, "users:edit");

    const updatedDoctor = await prisma.$transaction(async (tx) => {
      // 1. Update User info
      await tx.users.update({
        where: { id: userId },
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone || null,
          is_active: data.is_active,
        },
      });

      // 2. Update Doctor info
      return await tx.doctors.update({
        where: { id: doctorId },
        data: {
          specialization: data.specialization || null,
          license_number: data.license_number || null,
          bio: data.bio || null,
          years_of_experience: Number(data.years_of_experience) || 0,
          consultation_fee: Number(data.consultation_fee) || 0,
          location_id: data.location_id || null,
          is_available: data.is_available,
        },
        include: {
          users: true,
          locations: true,
        },
      });
    });

    revalidatePath("/admin/users/doctors");
    revalidatePath(`/admin/users/doctors/${doctorId}`);
    revalidateTag("doctors", "default");

    return { success: true, data: serializePrisma(updatedDoctor) };
  } catch (error: any) {
    console.error("[UPDATE_DOCTOR]", error);
    return { success: false, error: error.message || "Failed to update doctor profile" };
  }
}

/**
 * Updates the services offered by a doctor.
 */
export async function updateDoctorServices(doctorId: string, serviceIds: string[]) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");
  await requirePermission(currentUser.id, "users:edit");

  try {
    await prisma.$transaction([
      // Remove all current services
      prisma.doctor_services.deleteMany({
        where: { doctor_id: doctorId },
      }),
      // Add new services
      prisma.doctor_services.createMany({
        data: serviceIds.map((serviceId) => ({
          doctor_id: doctorId,
          service_id: serviceId,
        })),
      }),
    ]);

    revalidatePath(`/admin/users/doctors/${doctorId}`);
    revalidateTag("doctors", "default");

    return { success: true };
  } catch (error) {
    console.error("[UPDATE_DOCTOR_SERVICES]", error);
    return { success: false, error: "Failed to update doctor services" };
  }
}

/**
 * Creates a new doctor and associated user account.
 */
export async function createDoctor(data: any) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("Unauthorized");
    await requirePermission(currentUser.id, "users:edit");

    const result = await prisma.$transaction(async (tx) => {
      // 1. Check if user already exists
      const existingUser = await tx.users.findUnique({
        where: { email: data.email.toLowerCase() },
      });

      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // 2. Create User account
      const tempPassword = data.password || "Temporary123!"; 
      const { hashPassword } = await import("@/lib/auth");
      const passwordHash = await hashPassword(tempPassword);

      const newUser = await tx.users.create({
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email.toLowerCase(),
          phone: data.phone || null,
          password_hash: passwordHash,
          role: "doctor",
          is_active: data.is_active ?? true,
        },
      });

      // 3. Create Doctor profile
      return await tx.doctors.create({
        data: {
          user_id: newUser.id,
          specialization: data.specialization || null,
          license_number: data.license_number || null,
          bio: data.bio || null,
          years_of_experience: Number(data.years_of_experience) || 0,
          consultation_fee: Number(data.consultation_fee) || 0,
          location_id: data.location_id || null,
          is_available: data.is_available ?? true,
        },
        include: {
          users: true,
          locations: true,
        },
      });
    });

    revalidatePath("/admin/users/doctors");
    revalidateTag("doctors", "default");

    return { success: true, data: serializePrisma(result) };
  } catch (error: any) {
    console.error("[CREATE_DOCTOR]", error);
    return { success: false, error: error.message || "Failed to create doctor profile" };
  }
}
