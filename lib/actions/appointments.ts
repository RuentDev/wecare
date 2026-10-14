"use server";

import prisma from "@/lib/prisma-db";
import { revalidatePath } from "next/cache";
import { serializePrisma } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";
import { sendPatientNoShowNotice } from "@/lib/email";
import { format } from "date-fns";
import type {
  PatientAppointmentStatus,
  PatientDashboardAppointment,
} from "@/lib/types/patient-dashboard";

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
  if (status === "no_show") {
    return markAppointmentAsNoShow(id);
  }

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

export async function markAppointmentAsNoShow(
  id: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const currentUser = await getCurrentUser();

    const appointment = await prisma.appointments.findUnique({
      where: { id },
      include: {
        users: true,
        doctors: {
          include: {
            users: true,
          },
        },
        services: true,
        locations: true,
      },
    });

    if (!appointment) {
      return { success: false, error: "Appointment not found" };
    }

    const oldStatus = appointment.status;
    const finalReason = notes?.trim() || "Patient did not attend (No Show)";

    // Update appointment status to no_show
    await prisma.appointments.update({
      where: { id },
      data: {
        status: "no_show",
        cancellation_reason: finalReason,
      },
    });

    // Record in audit_logs
    try {
      await prisma.audit_logs.create({
        data: {
          user_id: currentUser?.id ?? null,
          table_name: "appointments",
          record_id: appointment.id,
          action: "UPDATE_STATUS_NO_SHOW",
          old_values: { status: oldStatus },
          new_values: {
            status: "no_show",
            reason: finalReason,
          },
        },
      });
    } catch (auditErr) {
      console.error("[NO_SHOW_AUDIT_LOG_ERROR]", auditErr);
    }

    // Send "We Missed You" notice to patient if email exists
    if (appointment.users?.email) {
      try {
        const aptDateFormatted = format(
          new Date(appointment.appointment_date),
          "EEEE, MMMM dd, yyyy"
        );
        const aptTimeFormatted = format(
          new Date(appointment.start_time),
          "hh:mm a"
        );

        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL || "https://wecare.clinic";
        const rescheduleUrl = `${baseUrl}/booking?doctor=${appointment.doctor_id}&service=${appointment.service_id}&location=${appointment.location_id}`;

        const doctorName = appointment.doctors?.users
          ? `${appointment.doctors.users.first_name} ${appointment.doctors.users.last_name}`.trim()
          : "your doctor";

        await sendPatientNoShowNotice(appointment.users.email, {
          patientName:
            `${appointment.users.first_name || ""} ${appointment.users.last_name || ""}`.trim() ||
            "Valued Patient",
          doctorName,
          appointmentNumber:
            appointment.appointment_number ||
            `APT-${appointment.id.slice(0, 8).toUpperCase()}`,
          appointmentDate: aptDateFormatted,
          appointmentTime: aptTimeFormatted,
          serviceName: appointment.services?.name || "Consultation",
          locationName: appointment.locations?.name || "Clinic",
          rescheduleUrl,
        });

        // Record in notification_logs
        await prisma.notification_logs.create({
          data: {
            user_id: appointment.users.id,
            appointment_id: appointment.id,
            notification_type: "appointment_no_show",
            channel: "email",
            recipient: appointment.users.email,
            subject: `We Missed You Today — Appointment ${appointment.appointment_number || appointment.id.slice(0, 8).toUpperCase()}`,
            status: "sent",
            sent_at: new Date(),
          },
        });
      } catch (emailErr) {
        console.error("[NO_SHOW_EMAIL_ERROR]", emailErr);
      }
    }

    revalidatePath("/admin/appointments");
    revalidatePath("/dashboard/appointments");
    revalidatePath("/dashboard/schedule");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("[MARK_APPOINTMENT_AS_NO_SHOW]", error);
    return { success: false, error: "Failed to mark appointment as no-show" };
  }
}

export async function autoFlagStaleAppointments(): Promise<{
  success: boolean;
  reconciledCount: number;
  completedCount: number;
  error?: string;
}> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all past appointments or today's appointments that were never finalized
    const overdueAppointments = await prisma.appointments.findMany({
      where: {
        status: { in: ["pending", "confirmed"] },
        appointment_date: { lte: today },
      },
      include: {
        users: true,
        doctors: {
          include: {
            users: true,
          },
        },
        services: true,
        locations: true,
        medical_records: true,
        payments: true,
      },
    });

    let reconciledCount = 0;
    let completedCount = 0;
    const now = new Date();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wecare.clinic";

    for (const apt of overdueAppointments) {
      const aptDate = new Date(apt.appointment_date);
      aptDate.setHours(0, 0, 0, 0);
      const isPastDay = aptDate.getTime() < today.getTime();

      // If it's today, check if end_time has passed
      if (!isPastDay) {
        const endTime = new Date(apt.end_time);
        const aptEndTimeToday = new Date();
        aptEndTimeToday.setHours(
          endTime.getUTCHours(),
          endTime.getUTCMinutes(),
          0,
          0
        );
        // If appointment end time has not passed yet today, skip
        if (now.getTime() <= aptEndTimeToday.getTime()) {
          continue;
        }
      }

      // Safety guard 1: If medical records exist, patient actually attended
      const hasClinicalNotes =
        apt.medical_records && apt.medical_records.length > 0;
      // Safety guard 2: If payment paid, patient attended
      const hasPaid =
        apt.payments && apt.payments.some((p) => p.status === "paid");

      if (hasClinicalNotes || hasPaid) {
        await prisma.appointments.update({
          where: { id: apt.id },
          data: { status: "completed" },
        });
        completedCount++;
        continue;
      }

      // Genuine No-Show: Mark as no_show
      await prisma.appointments.update({
        where: { id: apt.id },
        data: {
          status: "no_show",
          cancellation_reason:
            "Automated end-of-day reconciliation: Patient did not attend",
        },
      });

      // Audit log
      try {
        await prisma.audit_logs.create({
          data: {
            user_id: null,
            table_name: "appointments",
            record_id: apt.id,
            action: "AUTO_RECONCILE_NO_SHOW",
            old_values: { status: apt.status },
            new_values: {
              status: "no_show",
              reason: "Automated end-of-day reconciliation",
            },
          },
        });
      } catch (auditErr) {
        console.error("[AUTO_RECONCILE_AUDIT_LOG_ERROR]", auditErr);
      }

      // Send email if patient has email
      if (apt.users?.email) {
        try {
          const aptDateFormatted = format(
            new Date(apt.appointment_date),
            "EEEE, MMMM dd, yyyy"
          );
          const aptTimeFormatted = format(new Date(apt.start_time), "hh:mm a");
          const doctorName = apt.doctors?.users
            ? `${apt.doctors.users.first_name} ${apt.doctors.users.last_name}`.trim()
            : "your doctor";

          const rescheduleUrl = `${baseUrl}/booking?doctor=${apt.doctor_id}&service=${apt.service_id}&location=${apt.location_id}`;

          await sendPatientNoShowNotice(apt.users.email, {
            patientName:
              `${apt.users.first_name || ""} ${apt.users.last_name || ""}`.trim() ||
              "Valued Patient",
            doctorName,
            appointmentNumber:
              apt.appointment_number ||
              `APT-${apt.id.slice(0, 8).toUpperCase()}`,
            appointmentDate: aptDateFormatted,
            appointmentTime: aptTimeFormatted,
            serviceName: apt.services?.name || "Consultation",
            locationName: apt.locations?.name || "Clinic",
            rescheduleUrl,
          });

          await prisma.notification_logs.create({
            data: {
              user_id: apt.users.id,
              appointment_id: apt.id,
              notification_type: "appointment_no_show_auto",
              channel: "email",
              recipient: apt.users.email,
              subject: `We Missed You Today — Appointment ${apt.appointment_number || apt.id.slice(0, 8).toUpperCase()}`,
              status: "sent",
              sent_at: new Date(),
            },
          });
        } catch (emailErr) {
          console.error(
            `[AUTO_RECONCILE_EMAIL_ERROR] Patient: ${apt.users.email}`,
            emailErr
          );
        }
      }

      reconciledCount++;
    }

    revalidatePath("/admin/appointments");
    revalidatePath("/dashboard/appointments");
    revalidatePath("/dashboard/schedule");
    revalidatePath("/dashboard");

    return { success: true, reconciledCount, completedCount };
  } catch (error) {
    console.error("[AUTO_FLAG_STALE_APPOINTMENTS]", error);
    return {
      success: false,
      reconciledCount: 0,
      completedCount: 0,
      error: "Failed to reconcile stale appointments",
    };
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
  filter?: { doctorId?: string; patientId?: string }
) {
  try {
    const appointment = await prisma.appointments.findFirst({
      where: {
        appointment_number: appointmentNumber,
        ...(filter?.doctorId ? { doctor_id: filter.doctorId } : {}),
        ...(filter?.patientId ? { patient_id: filter.patientId } : {}),
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
                avatar_url: true,
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
                avatar_url: true,
              },
            },
          },
        },
        services: true,
        locations: true,
      },
      orderBy: [
        { appointment_date: "desc" },
        { start_time: "desc" },
      ],
    });

    return { success: true, data: serializePrisma(appointments) };
  } catch (error) {
    console.error("[GET_PATIENT_APPOINTMENTS]", error);
    return { success: false, error: "Failed to fetch appointments" };
  }
}

export async function getPatientDashboardAppointments(
  patientId: string
): Promise<PatientDashboardAppointment[]> {
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
                avatar_url: true,
              },
            },
          },
        },
        services: true,
        locations: true,
      },
      orderBy: [
        { appointment_date: "desc" },
        { start_time: "desc" },
      ],
    });

    return appointments.map((apt) => ({
      id: apt.id,
      appointment_number:
        apt.appointment_number || `APT-${apt.id.slice(0, 8).toUpperCase()}`,
      appointment_date: apt.appointment_date.toISOString(),
      start_time: apt.start_time.toISOString(),
      end_time: apt.end_time.toISOString(),
      status: (apt.status || "pending") as PatientAppointmentStatus,
      notes: apt.notes,
      service_name: apt.services.name,
      service_price: Number(apt.services.price),
      duration_minutes: apt.services.duration_minutes,
      dentist_first_name: apt.doctors.users?.first_name || "Doctor",
      dentist_last_name: apt.doctors.users?.last_name || "",
      dentist_avatar_url: apt.doctors.users?.avatar_url || null,
      specialization: apt.doctors.specialization || null,
      location_name: apt.locations.name,
      location_address: apt.locations.address,
      city: apt.locations.city || null,
      doctor_id: apt.doctor_id,
      service_id: apt.service_id,
      location_id: apt.location_id,
    }));
  } catch (error) {
    console.error("[GET_PATIENT_DASHBOARD_APPOINTMENTS]", error);
    return [];
  }
}
