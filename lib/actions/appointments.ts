"use server";

import prisma from "@/lib/prisma-db";
import { revalidatePath } from "next/cache";

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

    return appointments;
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
    return { success: true };
  } catch (error) {
    console.error("[UPDATE_APPOINTMENT_STATUS]", error);
    return { success: false, error: "Failed to update status" };
  }
}
