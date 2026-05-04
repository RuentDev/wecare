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

export async function updateAppointmentStatus(id: string, status: any) {
  try {
    await prisma.appointments.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/admin/appointments");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("[UPDATE_APPOINTMENT_STATUS]", error);
    return { success: false, error: "Failed to update status" };
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
