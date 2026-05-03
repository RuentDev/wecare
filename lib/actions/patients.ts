"use server";

import prisma from "@/lib/prisma-db";
import { revalidatePath } from "next/cache";
import { serializePrisma } from "../utils";

type GetPatientsArgs = {
  doctorId?: string;
};
type GetPatientsStatsArgs = {
  doctorId?: string;
};

export async function getPatients(args?: GetPatientsArgs) {
  try {
    const patients = await prisma.users.findMany({
      where: {
        role: "patient",
        ...(args?.doctorId && {
          doctors: {
            id: {
              equals: args?.doctorId,
            },
          },
        }),
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        created_at: true,
        avatar_url: true,
        is_guest: true,
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

    return serializePrisma(
      patients.map((patient) => ({
        ...patient,
        appointment_count: patient._count.appointments,
        last_appointment: patient.appointments[0]?.appointment_date || null,
      })),
    );
  } catch (error) {
    console.error("[GET_PATIENTS]", error);
    return [];
  }
}

export async function getPatientStats(args?: GetPatientsStatsArgs) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalPatients, newPatientsThisMonth, totalAppointments] =
      await Promise.all([
        prisma.users.count({
          where: {
            role: "patient",
            ...(args?.doctorId && {
              doctors: {
                id: {
                  equals: args?.doctorId,
                },
              },
            }),
          },
        }),
        prisma.users.count({
          where: {
            role: "patient",
            created_at: { gte: startOfMonth },
            ...(args?.doctorId && {
              doctors: {
                id: {
                  equals: args?.doctorId,
                },
              },
            }),
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

export async function getPatientById(id: string) {
  try {
    const patient = await prisma.users.findUnique({
      where: { id, role: "patient" },
      include: {
        appointments: {
          orderBy: { appointment_date: "desc" },
          take: 5,
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
        },
        medical_records: {
          orderBy: { created_at: "desc" },
          take: 5,
        },
        _count: {
          select: { appointments: true },
        },
      },
    });

    if (!patient) return null;

    return serializePrisma(patient);
  } catch (error) {
    console.error("[GET_PATIENT_BY_ID]", error);
    return null;
  }
}

export async function getPatientMedicalHistory(patientId: string) {
  try {
    const history = await prisma.medical_records.findMany({
      where: { patient_id: patientId },
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
        appointments: {
          select: {
            appointment_date: true,
            services: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return history;
  } catch (error) {
    console.error("[GET_PATIENT_MEDICAL_HISTORY]", error);
    return [];
  }
}

export async function sendPatientNotification(data: {
  userId: string;
  subject: string;
  content: string;
  type: string;
}) {
  try {
    const user = await prisma.users.findUnique({
      where: { id: data.userId },
      select: { email: true },
    });

    if (!user) throw new Error("User not found");

    await prisma.notification_logs.create({
      data: {
        user_id: data.userId,
        notification_type: data.type,
        recipient: user.email,
        subject: data.subject,
        content: data.content,
        status: "sent",
        sent_at: new Date(),
      },
    });

    revalidatePath("/admin/users/patients");
    return { success: true };
  } catch (error) {
    console.error("[SEND_PATIENT_NOTIFICATION]", error);
    return { success: false, error: "Failed to send notification" };
  }
}

export async function getVitalsHistory(patientId: string) {
  try {
    const history = await prisma.vitals.findMany({
      where: { patient_id: patientId },
      orderBy: { created_at: "desc" },
    });
    return history;
  } catch (error) {
    console.error("[GET_VITALS_HISTORY]", error);
    return [];
  }
}

export async function updatePatientAvatar(patientId: string, avatarUrl: string) {
  try {
    await prisma.users.update({
      where: { id: patientId },
      data: { avatar_url: avatarUrl },
    });
    revalidatePath(`/admin/users/patients/${patientId}`);
    return { success: true };
  } catch (error) {
    console.error("[UPDATE_PATIENT_AVATAR]", error);
    return { success: false, error: "Failed to update avatar" };
  }
}

export async function getLatestVitals(patientId: string) {
  try {
    const latestVitals = await prisma.vitals.findFirst({
      where: { patient_id: patientId },
      orderBy: { created_at: "desc" },
    });
    return latestVitals;
  } catch (error) {
    console.error("[GET_LATEST_VITALS]", error);
    return null;
  }
}

export async function updateVitals(patientId: string, data: any) {
  try {
    await prisma.vitals.create({
      data: {
        patient_id: patientId,
        ...data,
      },
    });
    revalidatePath(`/admin/users/patients/${patientId}`);
    return { success: true };
  } catch (error) {
    console.error("[UPDATE_VITALS]", error);
    return { success: false, error: "Failed to update vitals" };
  }
}

export async function saveClinicalRecord(patientId: string, data: any) {
  try {
    await prisma.medical_records.create({
      data: {
        patient_id: patientId,
        diagnosis: data.diagnosis,
        treatment: data.treatment,
        prescription: data.prescription,
        notes: data.notes,
        follow_up_date: data.followUpDate ? new Date(data.followUpDate) : null,
        attachments: data.raw_data || null,
      },
    });
    revalidatePath(`/admin/users/patients/${patientId}`);
    return { success: true };
  } catch (error) {
    console.error("[SAVE_CLINICAL_RECORD]", error);
    return { success: false, error: "Failed to save clinical record" };
  }
}
