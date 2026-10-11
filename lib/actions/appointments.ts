"use server";

import prisma from "@/lib/prisma-db";
import { revalidatePath } from "next/cache";
import { serializePrisma } from "@/lib/utils";

export async function getAppointments() {
  try {
    const appointments = await prisma.appointments.findMany({
      include: {
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            is_guest: true,
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
        services: true,
        locations: true,
      },
      orderBy: {
        appointment_date: "desc",
      },
    });

    return serializePrisma(appointments);
  } catch (error) {
    console.error("[GET_APPOINTMENTS]", error);
    return [];
  }
}

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "cancelled"
  | "no_show";

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
) {
  try {
    await prisma.appointments.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/admin/appointments");
    revalidatePath("/dashboard/appointments");
    revalidatePath("/dashboard/schedule");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[UPDATE_APPOINTMENT_STATUS]", error);
    return { success: false, error: "Failed to update status" };
  }
}

export async function getDoctorAppointments(doctorId: string) {
  try {
    const appointments = await prisma.appointments.findMany({
      where: {
        doctor_id: doctorId,
      },
      include: {
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
            is_guest: true,
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
        services: true,
        locations: true,
      },
      orderBy: {
        appointment_date: "desc",
      },
    });

    return serializePrisma(appointments);
  } catch (error) {
    console.error("[GET_DOCTOR_APPOINTMENTS]", error);
    return [];
  }
}

export async function getAppointmentByNumber(
  appointmentNumber: string,
  doctorId?: string
) {
  try {
    const appointment = await prisma.appointments.findFirst({
      where: {
        appointment_number: appointmentNumber,
        ...(doctorId ? { doctor_id: doctorId } : {}),
      },
      include: {
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
            gender: true,
            date_of_birth: true,
            is_guest: true,
            avatar_url: true,
          },
        },
        doctors: {
          include: {
            users: {
              select: {
                first_name: true,
                last_name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        services: true,
        locations: true,
        medical_records: {
          orderBy: {
            created_at: "desc",
          },
        },
      },
    });

    if (!appointment) return null;
    return serializePrisma(appointment);
  } catch (error) {
    console.error("[GET_APPOINTMENT_BY_NUMBER]", error);
    return null;
  }
}
export async function getPatientAppointments(patientId: string) {
  try {
    const appointments = await prisma.appointments.findMany({
      where: {
        patient_id: patientId,
      },
      include: {
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
        services: true,
      },
      orderBy: {
        appointment_date: "desc",
      },
    });

    return { success: true, data: serializePrisma(appointments) };
  } catch (error) {
    console.error("[GET_PATIENT_APPOINTMENTS]", error);
    return { success: false, error: "Failed to fetch appointments" };
  }
}
