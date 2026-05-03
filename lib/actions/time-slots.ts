"use server";

import { prisma } from "@/lib/prisma-db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createTimeSlot(data: {
  doctorId: string;
  locationId: string;
  dayOfWeek: number;
  startTime: string; // Raw "HH:mm" string (e.g. "07:00")
  endTime: string; // Raw "HH:mm" string (e.g. "12:00")
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "doctor") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Build UTC dates from raw HH:mm to avoid timezone shifts.
    // Using "1970-01-01T{HH:mm}:00Z" ensures the time stored in
    // the @db.Time(6) column is exactly what the doctor entered.
    const startTimeUTC = new Date(`1970-01-01T${data.startTime}:00Z`);
    const endTimeUTC = new Date(`1970-01-01T${data.endTime}:00Z`);

    const timeSlot = await prisma.time_slots.create({
      data: {
        doctor_id: data.doctorId,
        location_id: data.locationId,
        day_of_week: data.dayOfWeek,
        start_time: startTimeUTC,
        end_time: endTimeUTC,
        is_available: true,
      },
    });

    revalidatePath("/dashboard/schedule");
    return { success: true, data: timeSlot };
  } catch (error) {
    console.error("[CREATE_TIME_SLOT]", error);
    return { success: false, error: "Failed to create time slot" };
  }
}

export async function deleteTimeSlot(slotId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "doctor") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.time_slots.delete({
      where: { id: slotId },
    });

    revalidatePath("/dashboard/schedule");
    return { success: true };
  } catch (error) {
    console.error("[DELETE_TIME_SLOT]", error);
    return { success: false, error: "Failed to delete time slot" };
  }
}

export async function blockTimeSlot(data: {
  doctorId: string;
  date: Date;
  startTime?: string | null; // Raw "HH:mm" string (e.g. "09:00")
  endTime?: string | null; // Raw "HH:mm" string (e.g. "17:00")
  isFullDay: boolean;
  reason?: string;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "doctor") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Build UTC dates from raw HH:mm to avoid timezone shifts
    const startTimeUTC = data.startTime
      ? new Date(`1970-01-01T${data.startTime}:00Z`)
      : null;
    const endTimeUTC = data.endTime
      ? new Date(`1970-01-01T${data.endTime}:00Z`)
      : null;

    const exception = await prisma.schedule_exceptions.create({
      data: {
        doctor_id: data.doctorId,
        date: data.date,
        start_time: startTimeUTC,
        end_time: endTimeUTC,
        is_full_day: data.isFullDay,
        reason: data.reason,
      },
    });

    revalidatePath("/dashboard/schedule");
    return { success: true, data: exception };
  } catch (error) {
    console.error("[BLOCK_TIME_SLOT]", error);
    return { success: false, error: "Failed to block time" };
  }
}

export async function deleteBlockedTime(exceptionId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "doctor") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.schedule_exceptions.delete({
      where: { id: exceptionId },
    });

    revalidatePath("/dashboard/schedule");
    return { success: true };
  } catch (error) {
    console.error("[DELETE_BLOCKED_TIME]", error);
    return { success: false, error: "Failed to delete blocked time" };
  }
}

export async function getDoctorMonthlyStats(doctorId: string, year: number, month: number) {
  const user = await getCurrentUser();
  if (!user || user.role !== "doctor") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const [appointments, exceptions, timeSlots] = await Promise.all([
      prisma.appointments.findMany({
        where: {
          doctor_id: doctorId,
          appointment_date: {
            gte: startDate,
            lte: endDate,
          },
          status: { notIn: ["cancelled"] },
        },
        select: {
          appointment_date: true,
          start_time: true,
          end_time: true,
        },
      }),
      prisma.schedule_exceptions.findMany({
        where: {
          doctor_id: doctorId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
      prisma.time_slots.findMany({
        where: { doctor_id: doctorId },
      }),
    ]);

    // Format the response for easier client-side consumption
    const serializedAppointments = appointments.map((apt) => ({
      ...apt,
      appointment_date: apt.appointment_date.toISOString(),
      start_time: apt.start_time.toISOString(),
      end_time: apt.end_time.toISOString(),
    }));

    const serializedExceptions = exceptions.map((exc) => ({
      ...exc,
      date: exc.date.toISOString(),
      start_time: exc.start_time?.toISOString() || null,
      end_time: exc.end_time?.toISOString() || null,
    }));

    return { 
      success: true, 
      data: {
        appointments: serializedAppointments,
        exceptions: serializedExceptions,
        timeSlots,
      }
    };
  } catch (error) {
    console.error("[GET_DOCTOR_MONTHLY_STATS]", error);
    return { success: false, error: "Failed to fetch stats" };
  }
}
