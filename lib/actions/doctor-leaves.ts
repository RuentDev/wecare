"use server";

import { prisma } from "@/lib/prisma-db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { serializePrisma } from "@/lib/utils";
import { sendDoctorUnavailableNotice } from "@/lib/email";
import type {
  DoctorLeaveRequest,
  CreateLeaveRequestInput,
  ConflictingAppointment,
} from "@/lib/types/leave-requests";

function formatTimeUTC(dateValue: string | Date): string {
  const d = new Date(dateValue);
  const h = d.getUTCHours();
  const m = d.getUTCMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
}

export async function createDoctorLeaveRequest(input: CreateLeaveRequestInput) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "doctor" && user.role !== "admin")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const startDate = new Date(`${input.startDate}T00:00:00Z`);
    const endDate = new Date(`${input.endDate}T00:00:00Z`);

    if (startDate > endDate) {
      return { success: false, error: "Start date must be before or equal to end date" };
    }

    const startTime = !input.isFullDay && input.startTime
      ? new Date(`1970-01-01T${input.startTime}:00Z`)
      : null;
    const endTime = !input.isFullDay && input.endTime
      ? new Date(`1970-01-01T${input.endTime}:00Z`)
      : null;

    const leaveRequest = await prisma.doctor_leave_requests.create({
      data: {
        doctor_id: input.doctorId,
        start_date: startDate,
        end_date: endDate,
        is_full_day: input.isFullDay,
        start_time: startTime,
        end_time: endTime,
        reason: input.reason,
        status: "pending",
      },
    });

    revalidatePath("/dashboard/schedule");
    revalidatePath("/admin/appointments");
    return { success: true, data: serializePrisma(leaveRequest) };
  } catch (error) {
    console.error("[CREATE_DOCTOR_LEAVE_REQUEST]", error);
    return { success: false, error: "Failed to submit leave request" };
  }
}

export async function getDoctorLeaveRequests(
  doctorId: string,
): Promise<{ success: boolean; data: DoctorLeaveRequest[]; error?: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, data: [], error: "Unauthorized" };
  }

  try {
    const requests = await prisma.doctor_leave_requests.findMany({
      where: { doctor_id: doctorId },
      include: {
        reviewer: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    const serialized: DoctorLeaveRequest[] = requests.map((req) => ({
      id: req.id,
      doctor_id: req.doctor_id,
      start_date: req.start_date.toISOString().split("T")[0],
      end_date: req.end_date.toISOString().split("T")[0],
      is_full_day: req.is_full_day,
      start_time: req.start_time ? req.start_time.toISOString() : null,
      end_time: req.end_time ? req.end_time.toISOString() : null,
      reason: req.reason,
      status: req.status,
      rejection_reason: req.rejection_reason,
      reviewed_by: req.reviewed_by,
      reviewed_at: req.reviewed_at ? req.reviewed_at.toISOString() : null,
      created_at: req.created_at ? req.created_at.toISOString() : "",
      updated_at: req.updated_at ? req.updated_at.toISOString() : "",
      reviewer: req.reviewer,
    }));

    return { success: true, data: serialized };
  } catch (error) {
    console.error("[GET_DOCTOR_LEAVE_REQUESTS]", error);
    return { success: false, data: [], error: "Failed to fetch leave requests" };
  }
}

export async function cancelDoctorLeaveRequest(requestId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const existing = await prisma.doctor_leave_requests.findUnique({
      where: { id: requestId },
    });

    if (!existing) {
      return { success: false, error: "Leave request not found" };
    }

    if (existing.status !== "pending") {
      return { success: false, error: "Only pending leave requests can be cancelled" };
    }

    await prisma.doctor_leave_requests.update({
      where: { id: requestId },
      data: { status: "cancelled" },
    });

    revalidatePath("/dashboard/schedule");
    revalidatePath("/admin/appointments");
    return { success: true };
  } catch (error) {
    console.error("[CANCEL_DOCTOR_LEAVE_REQUEST]", error);
    return { success: false, error: "Failed to cancel leave request" };
  }
}

export async function getAdminLeaveRequests(
  statusFilter?: string,
): Promise<{ success: boolean; data: DoctorLeaveRequest[]; error?: string }> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return { success: false, data: [], error: "Unauthorized" };
  }

  try {
    const whereClause: { status?: "pending" | "approved" | "rejected" | "cancelled" } = {};
    if (statusFilter && statusFilter !== "all") {
      whereClause.status = statusFilter as "pending" | "approved" | "rejected" | "cancelled";
    }

    const requests = await prisma.doctor_leave_requests.findMany({
      where: whereClause,
      include: {
        doctors: {
          select: {
            id: true,
            specialization: true,
            users: {
              select: {
                first_name: true,
                last_name: true,
                email: true,
                avatar_url: true,
              },
            },
          },
        },
        reviewer: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
      orderBy: [
        { status: "asc" },
        { start_date: "asc" },
      ],
    });

    // Count conflicting appointments for each leave request
    const results: DoctorLeaveRequest[] = await Promise.all(
      requests.map(async (req) => {
        const conflictCount = await prisma.appointments.count({
          where: {
            doctor_id: req.doctor_id,
            appointment_date: {
              gte: req.start_date,
              lte: req.end_date,
            },
            status: { in: ["pending", "confirmed", "checked_in"] },
          },
        });

        return {
          id: req.id,
          doctor_id: req.doctor_id,
          start_date: req.start_date.toISOString().split("T")[0],
          end_date: req.end_date.toISOString().split("T")[0],
          is_full_day: req.is_full_day,
          start_time: req.start_time ? req.start_time.toISOString() : null,
          end_time: req.end_time ? req.end_time.toISOString() : null,
          reason: req.reason,
          status: req.status,
          rejection_reason: req.rejection_reason,
          reviewed_by: req.reviewed_by,
          reviewed_at: req.reviewed_at ? req.reviewed_at.toISOString() : null,
          created_at: req.created_at ? req.created_at.toISOString() : "",
          updated_at: req.updated_at ? req.updated_at.toISOString() : "",
          doctors: req.doctors,
          reviewer: req.reviewer,
          conflictingAppointmentsCount: conflictCount,
        };
      }),
    );

    return { success: true, data: results };
  } catch (error) {
    console.error("[GET_ADMIN_LEAVE_REQUESTS]", error);
    return { success: false, data: [], error: "Failed to load leave requests" };
  }
}

export async function getConflictingAppointments(
  doctorId: string,
  startDateStr: string,
  endDateStr: string,
): Promise<{ success: boolean; data: ConflictingAppointment[]; error?: string }> {
  try {
    const startDate = new Date(`${startDateStr}T00:00:00Z`);
    const endDate = new Date(`${endDateStr}T23:59:59Z`);

    const appointments = await prisma.appointments.findMany({
      where: {
        doctor_id: doctorId,
        appointment_date: {
          gte: startDate,
          lte: endDate,
        },
        status: { in: ["pending", "confirmed", "checked_in"] },
      },
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
      orderBy: [
        { appointment_date: "asc" },
        { start_time: "asc" },
      ],
    });

    const serialized: ConflictingAppointment[] = appointments.map((apt) => ({
      id: apt.id,
      appointment_number: apt.appointment_number,
      appointment_date: apt.appointment_date.toISOString().split("T")[0],
      start_time: apt.start_time ? formatTimeUTC(apt.start_time) : "N/A",
      end_time: apt.end_time ? formatTimeUTC(apt.end_time) : "N/A",
      patient_name: apt.users ? `${apt.users.first_name} ${apt.users.last_name}` : "Patient",
      patient_email: apt.users?.email || "",
      service_name: apt.services?.name || "Consultation",
    }));

    return { success: true, data: serialized };
  } catch (error) {
    console.error("[GET_CONFLICTING_APPOINTMENTS]", error);
    return { success: false, data: [], error: "Failed to query conflicts" };
  }
}

export async function approveLeaveRequest(requestId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const leaveRequest = await prisma.doctor_leave_requests.findUnique({
      where: { id: requestId },
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
      },
    });

    if (!leaveRequest) {
      return { success: false, error: "Leave request not found" };
    }

    if (leaveRequest.status !== "pending") {
      return { success: false, error: "Only pending leave requests can be approved" };
    }

    const doctorName = leaveRequest.doctors?.users
      ? `Dr. ${leaveRequest.doctors.users.first_name} ${leaveRequest.doctors.users.last_name}`
      : "Doctor";

    // 1. Find conflicting appointments during this leave window
    const conflictingAppointments = await prisma.appointments.findMany({
      where: {
        doctor_id: leaveRequest.doctor_id,
        appointment_date: {
          gte: leaveRequest.start_date,
          lte: leaveRequest.end_date,
        },
        status: { in: ["pending", "confirmed", "checked_in"] },
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
        services: {
          select: {
            name: true,
          },
        },
      },
    });

    // 2. Generate schedule exception date records for each day in range
    const curDate = new Date(leaveRequest.start_date);
    const endDate = new Date(leaveRequest.end_date);
    const exceptionDates: Date[] = [];

    while (curDate <= endDate) {
      exceptionDates.push(new Date(curDate));
      curDate.setDate(curDate.getDate() + 1);
    }

    // 3. Database mutations in transaction
    await prisma.$transaction(async (tx) => {
      // Mark leave request as approved
      await tx.doctor_leave_requests.update({
        where: { id: requestId },
        data: {
          status: "approved",
          reviewed_by: user.id,
          reviewed_at: new Date(),
        },
      });

      // Create schedule exceptions for each day in range
      for (const dateItem of exceptionDates) {
        await tx.schedule_exceptions.create({
          data: {
            doctor_id: leaveRequest.doctor_id,
            date: dateItem,
            is_full_day: leaveRequest.is_full_day,
            start_time: leaveRequest.start_time,
            end_time: leaveRequest.end_time,
            reason: leaveRequest.reason || "Approved Clinical Leave",
          },
        });
      }

      // Cancel conflicting appointments
      if (conflictingAppointments.length > 0) {
        await tx.appointments.updateMany({
          where: {
            id: { in: conflictingAppointments.map((a) => a.id) },
          },
          data: {
            status: "cancelled",
          },
        });
      }
    });

    // 4. Dispatch Email Notifications and log to notification_logs for affected patients
    for (const apt of conflictingAppointments) {
      if (apt.users?.email) {
        try {
          const aptDateFormatted = apt.appointment_date.toISOString().split("T")[0];
          const aptTimeFormatted = apt.start_time ? formatTimeUTC(apt.start_time) : "Scheduled Time";

          await sendDoctorUnavailableNotice(apt.users.email, {
            patientName: `${apt.users.first_name} ${apt.users.last_name}`.trim(),
            doctorName,
            appointmentDate: aptDateFormatted,
            appointmentTime: aptTimeFormatted,
            serviceName: apt.services?.name || "Consultation",
          });

          // Record in notification_logs
          await prisma.notification_logs.create({
            data: {
              user_id: apt.users.id,
              appointment_id: apt.id,
              notification_type: "doctor_unavailable_cancellation",
              channel: "email",
              recipient: apt.users.email,
              subject: `Notice: Doctor Schedule Change for Appointment on ${aptDateFormatted}`,
              status: "sent",
              sent_at: new Date(),
            },
          });
        } catch (emailErr) {
          console.error(`[LEAVE_APPROVAL_EMAIL_FAIL] Patient: ${apt.users.email}`, emailErr);
        }
      }
    }

    revalidatePath("/admin/appointments");
    revalidatePath("/dashboard/schedule");
    revalidatePath("/dashboard/appointments");
    revalidatePath("/admin/users");

    return {
      success: true,
      affectedAppointmentsCount: conflictingAppointments.length,
    };
  } catch (error) {
    console.error("[APPROVE_LEAVE_REQUEST]", error);
    return { success: false, error: "Failed to approve leave request" };
  }
}

export async function rejectLeaveRequest(requestId: string, reason: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const existing = await prisma.doctor_leave_requests.findUnique({
      where: { id: requestId },
    });

    if (!existing) {
      return { success: false, error: "Leave request not found" };
    }

    if (existing.status !== "pending") {
      return { success: false, error: "Only pending leave requests can be rejected" };
    }

    await prisma.doctor_leave_requests.update({
      where: { id: requestId },
      data: {
        status: "rejected",
        rejection_reason: reason || "Declined by clinic administration",
        reviewed_by: user.id,
        reviewed_at: new Date(),
      },
    });

    revalidatePath("/admin/appointments");
    revalidatePath("/dashboard/schedule");
    return { success: true };
  } catch (error) {
    console.error("[REJECT_LEAVE_REQUEST]", error);
    return { success: false, error: "Failed to reject leave request" };
  }
}
