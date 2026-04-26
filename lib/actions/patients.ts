"use server";

import prisma from "@/lib/prisma-db";
import { revalidatePath } from "next/cache";

export async function getPatients() {
  try {
    const patients = await prisma.users.findMany({
      where: {
        role: "patient",
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        created_at: true,
        avatar_url: true,
        _count: {
          select: { appointments: true },
        },
        appointments: {
          orderBy: {
            appointment_date: "desc",
          },
          take: 1,
          select: {
            appointment_date: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return patients.map((patient) => ({
      ...patient,
      appointment_count: patient._count.appointments,
      last_appointment: patient.appointments[0]?.appointment_date || null,
    }));
  } catch (error) {
    console.error("[GET_PATIENTS]", error);
    return [];
  }
}

export async function getPatientStats() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalPatients, newPatientsThisMonth, totalAppointments] = await Promise.all([
      prisma.users.count({ where: { role: "patient" } }),
      prisma.users.count({
        where: {
          role: "patient",
          created_at: { gte: startOfMonth },
        },
      }),
      prisma.appointments.count(),
    ]);

    return {
      totalPatients,
      newPatientsThisMonth,
      totalAppointments,
    };
  } catch (error) {
    console.error("[GET_PATIENT_STATS]", error);
    return {
      totalPatients: 0,
      newPatientsThisMonth: 0,
      totalAppointments: 0,
    };
  }
}
